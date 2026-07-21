const https = require('https');
const fs = require('fs');
const path = require('path');

const clientId = '936162feb25c5cb9b8b1762324c54dea';
const apiKey = 'tjXYhdMZmn1iJQt4WD7h1QKbyxAMVxsfHP2+acNu0R9E96adgAakCIgiGp3OOXzRRGgayzmqmg==';

function apiRequest(apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'ima.qq.com',
      path: '/' + apiPath,
      method: 'POST',
      headers: {
        'ima-openapi-clientid': clientId,
        'ima-openapi-apikey': apiKey,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
      }
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const result = Buffer.concat(chunks).toString('utf8');
        try { resolve(JSON.parse(result)); } catch { resolve({ raw: result }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchWithQuery(query) {
  const results = await apiRequest('openapi/wiki/v1/search_knowledge_base', {
    query,
    cursor: 0,
    limit: 50
  });
  return results;
}

async function getFolderContents(folderId, cursor = 0) {
  const result = await apiRequest('openapi/wiki/v1/get_knowledge_list', {
    knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
    parent_id: folderId,
    cursor,
    limit: 50
  });
  return result;
}

async function getMediaInfo(mediaId) {
  const result = await apiRequest('openapi/wiki/v1/get_media_info', {
    media_id: mediaId
  });
  return result;
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function decodeChineseFilename(str) {
  try {
    if (/[\u4e00-\u9fa5]/.test(str)) return str;
    return Buffer.from(str, 'binary').toString('utf8');
  } catch {
    return str;
  }
}

async function main() {
  // Strategy: Search for standardized letter content in the knowledge base
  console.log('=== Searching for 合伙人信 (Partnership Letters) ===');
  const partnerSearch = await searchWithQuery('partnership_');
  console.log('Partnership search result keys:', Object.keys(partnerSearch));
  if (partnerSearch.data && partnerSearch.data.items) {
    console.log(`Found ${partnerSearch.data.items.length} items`);
    partnerSearch.data.items.forEach((item, i) => {
      const title = decodeChineseFilename(item.title || item.name || '');
      console.log(`  [${i}] title=${title}, type=${item.media_type}, id=${item.media_id}`);
    });
  }

  await sleep(2000);

  console.log('\n=== Searching for 致股东信 (Shareholder Letters) ===');
  const letterSearch = await searchWithQuery('berkshire_');
  console.log('Letter search result keys:', Object.keys(letterSearch));
  if (letterSearch.data && letterSearch.data.items) {
    console.log(`Found ${letterSearch.data.items.length} items`);
    letterSearch.data.items.forEach((item, i) => {
      const title = decodeChineseFilename(item.title || item.name || '');
      console.log(`  [${i}] title=${title}, type=${item.media_type}, id=${item.media_id}`);
    });
  }

  await sleep(2000);

  // Also check the specific folders
  console.log('\n=== Checking 巴菲特知识库 folder ===');
  const folder1 = await getFolderContents('folder_7473759380321344');
  console.log('巴菲特知识库 folder keys:', Object.keys(folder1));
  if (folder1.data && folder1.data.items) {
    console.log(`Found ${folder1.data.items.length} items`);
    folder1.data.items.forEach((item, i) => {
      const title = decodeChineseFilename(item.title || item.name || '');
      console.log(`  [${i}] title=${title}, type=${item.media_type}, id=${item.media_id}`);
    });
  }

  await sleep(2000);

  console.log('\n=== Searching for 合伙人信 ===');
  const partnerZh = await searchWithQuery('合伙人信');
  console.log('合伙人信 search result keys:', Object.keys(partnerZh));
  if (partnerZh.data && partnerZh.data.items) {
    console.log(`Found ${partnerZh.data.items.length} items`);
    partnerZh.data.items.forEach((item, i) => {
      const title = decodeChineseFilename(item.title || item.name || '');
      console.log(`  [${i}] title=${title}, type=${item.media_type}, id=${item.media_id}`);
    });
  }
}

main().catch(e => console.error('Error:', e));
