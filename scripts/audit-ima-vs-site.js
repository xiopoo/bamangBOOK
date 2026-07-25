#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'tmp', 'ima-audit');
const RAW_DIR = path.join(OUT_DIR, 'raw');
const IMA_API = '/Users/lucas/.codex/skills/ima-skill/ima_api.cjs';

// These IDs identify the user-selected IMA knowledge base folders.
const KNOWLEDGE_BASE_ID = 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=';
const LETTERS_FOLDER_ID = 'folder_7393936943351122';
const QA_FOLDER_ID = 'folder_7473901059729416';
const STABLE_FOLDER_ID = 'folder_7473759380321344';

function imaApi(apiPath, body) {
  const output = execFileSync(process.execPath, [IMA_API, apiPath, JSON.stringify(body)], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  const response = JSON.parse(output);
  if (response.code !== 0) throw new Error(response.msg || `IMA error ${response.code}`);
  return response.data || {};
}

async function listFolder(folderId) {
  const items = [];
  let cursor = '';
  let isEnd = false;
  while (!isEnd) {
    const data = imaApi('openapi/wiki/v1/get_knowledge_list', {
      knowledge_base_id: KNOWLEDGE_BASE_ID,
      folder_id: folderId,
      cursor,
      limit: 50,
    });
    items.push(...(data.knowledge_list || []));
    isEnd = Boolean(data.is_end);
    cursor = data.next_cursor || '';
  }
  return items;
}

async function walkFolder(folderId, parts = []) {
  const results = [];
  const items = await listFolder(folderId);
  for (const item of items) {
    if (item.media_type === 99) {
      results.push(...await walkFolder(item.media_id, [...parts, item.title]));
    } else {
      results.push({ ...item, relativeFolder: parts.join('/') });
    }
  }
  return results;
}

function safeName(value) {
  return value.replace(/[\0/\\:*?"<>|]/g, '_');
}

async function downloadItem(item, category, index, total) {
  const folder = path.join(RAW_DIR, category, ...item.relativeFolder.split('/').filter(Boolean).map(safeName));
  const filePath = path.join(folder, safeName(item.title));
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
    process.stdout.write(`[${index}/${total}] cached ${category}/${item.relativeFolder ? `${item.relativeFolder}/` : ''}${item.title}\n`);
    return {
      ...item,
      category,
      status: 'downloaded',
      filePath: path.relative(ROOT, filePath),
      byteSize: fs.statSync(filePath).size,
    };
  }

  const data = imaApi('openapi/wiki/v1/get_media_info', { media_id: item.media_id });
  const urlInfo = data.url_info;
  if (!urlInfo || !urlInfo.url) {
    return { ...item, category, status: 'unavailable', mediaType: data.media_type };
  }

  const response = await fetch(urlInfo.url, { headers: urlInfo.headers || {} });
  if (!response.ok) throw new Error(`${item.title}: download HTTP ${response.status}`);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(filePath, Buffer.from(await response.arrayBuffer()));
  process.stdout.write(`[${index}/${total}] ${category}/${item.relativeFolder ? `${item.relativeFolder}/` : ''}${item.title}\n`);
  return {
    ...item,
    category,
    status: 'downloaded',
    mediaType: data.media_type,
    filePath: path.relative(ROOT, filePath),
    byteSize: fs.statSync(filePath).size,
  };
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  if (process.argv.includes('--list-stable')) {
    const items = await walkFolder(STABLE_FOLDER_ID);
    const listPath = path.join(OUT_DIR, 'stable-list.json');
    fs.writeFileSync(listPath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
    const relevant = items.filter((item) => /^(berkshire_|qa_)/i.test(item.title));
    process.stdout.write(`Listed ${items.length} standard Markdown files; ${relevant.length} match shareholder letters or Q&A.\n`);
    return;
  }

  if (process.argv.includes('--download-stable')) {
    const items = await walkFolder(STABLE_FOLDER_ID);
    const manifest = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      try {
        manifest.push(await downloadItem(item, 'stable', i + 1, items.length));
      } catch (error) {
        manifest.push({ ...item, category: 'stable', status: 'error', error: error.message });
        process.stderr.write(`[${i + 1}/${items.length}] ${item.title}: ${error.message}\n`);
      }
    }
    const manifestPath = path.join(OUT_DIR, 'stable-manifest.json');
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    const downloaded = manifest.filter((item) => item.status === 'downloaded').length;
    const unavailable = manifest.filter((item) => item.status === 'unavailable').length;
    const errors = manifest.filter((item) => item.status === 'error').length;
    process.stdout.write(`Stable completed: ${downloaded} downloaded, ${unavailable} unavailable, ${errors} errors.\n`);
    return;
  }

  const [letters, qa] = await Promise.all([
    walkFolder(LETTERS_FOLDER_ID),
    walkFolder(QA_FOLDER_ID),
  ]);
  const all = [
    ...letters.map((item) => ({ item, category: 'letters' })),
    ...qa.map((item) => ({ item, category: 'qa' })),
  ];

  const manifest = [];
  for (let i = 0; i < all.length; i += 1) {
    const { item, category } = all[i];
    try {
      manifest.push(await downloadItem(item, category, i + 1, all.length));
    } catch (error) {
      manifest.push({ ...item, category, status: 'error', error: error.message });
      process.stderr.write(`[${i + 1}/${all.length}] ${item.title}: ${error.message}\n`);
    }
  }

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const downloaded = manifest.filter((item) => item.status === 'downloaded').length;
  const unavailable = manifest.filter((item) => item.status === 'unavailable').length;
  const errors = manifest.filter((item) => item.status === 'error').length;
  process.stdout.write(`Completed: ${downloaded} downloaded, ${unavailable} unavailable, ${errors} errors.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
