#!/usr/bin/env node
/**
 * sync_ima_qa_format.js
 * ---------------------------------------------------------------------------
 * 将网站 content/qa/ 下的「股东大会问答」类 Markdown 文件，批量对齐到
 * IMA 知识库「02 文件夹 › 巴菲特股东大会1994-2025」中的编辑排版规范。
 *
 * 工作流程：
 *   1) buildStandard()  —— 连接 IMA，递归拉取「02 文件夹」内股东大会问答文档，
 *                          统计分析其 Markdown 排版，自动得出“标准规则”
 *                          （标题层级 / 小节间空行 / 列表符号 / 加粗语法）。
 *                          结果缓存到 reports/ima_format_standard.json。
 *   2) normalizeFile()  —— 以该标准逐篇规范化网站 MD：
 *                          • 标题层级（H1→H2、H2→H3… 整体下移以对齐 IMA）
 *                          • 列表符号统一（默认 '-'）
 *                          • 加粗语法统一（**text**，仅修语法不删语义）
 *                          • 空行规则（小节间 N 空行、段间 1 空行、去尾部空白）
 *                          所有正文文本逐字保留，只调整排版标记。
 *   3) 日志输出          —— 每篇文件的修改按规则计数，并在
 *                          reports/qa_format_sync_log.json（含每条 before/after）
 *                          与 reports/qa_format_sync_log.md（可读汇总）中完整记录。
 *
 * 用法：
 *   node scripts/sync_ima_qa_format.js            # dry-run（不写文件，仅预览日志）
 *   node scripts/sync_ima_qa_format.js --apply    # 正式写入网站 MD
 *   node scripts/sync_ima_qa_format.js --all      # 从 IMA 拉取全部文档建标准（默认抽样）
 *   node scripts/sync_ima_qa_format.js --rebuild  # 强制重新从 IMA 抽取标准
 *
 * 注意：脚本只修改 content/qa/ 目录下 .md 文件，且只动排版结构，不改文本语义。
 * ---------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const IMA_API = path.join(ROOT, '.codebuddy', 'skills', 'ima-skill', 'ima_api.cjs');
const { imaApi } = require(IMA_API);

// ----------------------------- 配置 -----------------------------------------
const KB_ID = 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=';
const MEETING_FOLDER_ID = 'folder_7473901059729416'; // 02 | 巴芒&价值投资 › 巴菲特股东大会1994-2025
const WEBSITE_QA_DIR = path.join(ROOT, 'content', 'qa');
const CACHE_DIR = path.join(ROOT, '.cache', 'ima_qa');
const STANDARD_OUT = path.join(ROOT, 'reports', 'ima_format_standard.json');
const LOG_JSON = path.join(ROOT, 'reports', 'qa_format_sync_log.json');
const LOG_MD = path.join(ROOT, 'reports', 'qa_format_sync_log.md');

const SAMPLE_MAX_DOCS = 16;   // 默认只抽样前 N 篇建标准（加速 + 防限流）；--all 时取全部
const LIST_MARKER = '-';      // 列表符号回退值（IMA 样本无列表时采用 CommonMark 默认）
const BOLD_MARKER = '**';     // 加粗标记（统一为 **）

// --------------------------- IMA 取数 ---------------------------------------
async function listFolder(folderId) {
  const resp = await imaApi('openapi/wiki/v1/get_knowledge_list', {
    cursor: '', limit: 50, knowledge_base_id: KB_ID, folder_id: folderId,
  });
  const data = (typeof resp === 'string' ? JSON.parse(resp) : resp).data || {};
  return data.knowledge_list || data.list || [];
}

async function collectDocs(folderId, acc, maxDocs) {
  if (acc.length >= maxDocs) return;
  const items = await listFolder(folderId);
  for (const it of items) {
    if (acc.length >= maxDocs) break;
    const isFolder = it.is_folder === 1 || it.is_folder === true || it.media_type === 3
      || (it.media_id || '').startsWith('folder_');
    if (isFolder) {
      await collectDocs(it.media_id, acc, maxDocs); // eslint-disable-line no-await-in-loop
    } else if ([7, 13].includes(it.media_type)) {
      acc.push(it);
    }
  }
}

async function fetchDocContent(mediaId) {
  const cached = path.join(CACHE_DIR, `${mediaId}.md`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached, 'utf8');
  const resp = await imaApi('openapi/wiki/v1/get_media_info', { media_id: mediaId });
  const { url, headers } = JSON.parse(resp).data.url_info;
  const r = await fetch(url, { headers: headers || {} });
  const text = await r.text();
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cached, text, 'utf8');
  return text;
}

// 读取 git HEAD 中的原始版本（用于日志以"原始→对齐后"为基准记录真实改动）
function gitOriginal(fp, fallback) {
  try {
    const rel = path.relative(ROOT, fp).split(path.sep).join('/');
    const out = execFileSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf8' });
    return out;
  } catch (e) {
    return fallback; // 未跟踪或 git 不可用时回退到当前磁盘内容
  }
}

// ----------------------- 标准提取（核心：以 IMA 为准） -----------------------
function mode(arr) {
  if (!arr.length) return null;
  const counts = {};
  arr.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
}

function analyzeStandard(texts) {
  const firstLevels = [];
  const sectionLevels = [];
  const blankBeforeSection = [];
  const listMarkers = [];
  let boldFiles = 0;

  for (const t of texts) {
    const lines = t.split('\n');
    let firstHeading = true;
    let fileHasBold = false;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const hm = l.match(/^(#+)(\s+)(.*)$/);
      if (hm) {
        if (firstHeading) { firstLevels.push(hm[1].length); firstHeading = false; }
        if (/^\d+[、.．]/.test(hm[3])) {
          sectionLevels.push(hm[1].length);
          let b = 0;
          for (let j = i - 1; j >= 0 && lines[j].trim() === ''; j--) b++;
          blankBeforeSection.push(b);
        }
      }
      const lm = l.match(/^(\s*)[-*+](\s)/);
      if (lm) listMarkers.push(lm[1].length >= 0 ? lm[0].trim()[0] : '-');
      if (l.includes('**') || l.includes('__')) fileHasBold = true;
    }
    if (fileHasBold) boldFiles++;
  }

  return {
    titleLevel: mode(firstLevels) ?? 2,
    sectionLevel: mode(sectionLevels) ?? 3,
    blankBetweenSections: mode(blankBeforeSection) ?? 1,
    listMarker: mode(listMarkers) ?? LIST_MARKER,
    boldMarker: BOLD_MARKER,
    boldUsedInStandard: boldFiles > 0,
    sourceDocCount: texts.length,
  };
}

// ------------------------- 单文件规范化 -------------------------------------
function normalizeFile(rawText, std) {
  const changes = [];
  // 标准数值字段可能来自 JSON（字符串），统一转为数值再做比较
  const titleLevel = Number(std.titleLevel);
  const sectionLevel = Number(std.sectionLevel);
  const blankBetweenSections = Number(std.blankBetweenSections);
  let lines = rawText.split('\n').map((l) => l.replace(/\s+$/, '')); // 去尾部空白

  // 检测当前顶层标题层级，决定整体平移量（让顶层标题对齐 std.titleLevel）
  let currentTop = null;
  for (const l of lines) {
    const m = l.match(/^(#+)(\s)/);
    if (m) { currentTop = m[1].length; break; }
  }
  const shift = currentTop ? titleLevel - currentTop : 0;

  // 1) 标题层级
  let out = lines.map((l, idx) => {
    const m = l.match(/^(#+)(\s+)(.*)$/);
    if (!m) return l;
    const lvl = m[1].length;
    const newLvl = Math.max(1, Math.min(6, lvl + shift));
    if (newLvl !== lvl) {
      const after = '#'.repeat(newLvl) + m[2] + m[3];
      changes.push({ type: 'heading', line: idx + 1, before: l, after });
      return after;
    }
    return l;
  });

  // 2) 列表符号统一
  out = out.map((l, idx) => {
    const m = l.match(/^(\s*)([-*+])(\s+)(.*)$/);
    if (!m) return l;
    if (m[2] !== std.listMarker) {
      const after = m[1] + std.listMarker + ' ' + m[4];
      changes.push({ type: 'list', line: idx + 1, before: l, after });
      return after;
    }
    return l;
  });

  // 3) 加粗语法统一（__x__ → **x**，并修正 ** text ** 内部空格；不删除语义加粗）
  out = out.map((l, idx) => {
    let s = l.replace(/__([^_]+?)__/g, (_m, c) => std.boldMarker + c + std.boldMarker);
    const escMarker = std.boldMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escMarker + '\\s+(.*?)\\s+' + escMarker, 'g');
    s = s.replace(re, (_m, c) => std.boldMarker + c.trim() + std.boldMarker);
    if (s !== l) {
      changes.push({ type: 'bold', line: idx + 1, before: l, after: s });
      return s;
    }
    return l;
  });

  // 4) 空行规则：先压缩多余空行为 1，再按标准补小节间空行
  const collapsed = [];
  let prevBlank = false;
  for (const l of out) {
    if (l.trim() === '') {
      if (!prevBlank) { collapsed.push(''); prevBlank = true; }
    } else { collapsed.push(l); prevBlank = false; }
  }
  while (collapsed.length && collapsed[0].trim() === '') collapsed.shift();
  while (collapsed.length && collapsed[collapsed.length - 1].trim() === '') collapsed.pop();

  const rebuilt = [];
  for (const line of collapsed) {
    const hm = line.match(/^(#+)(\s)/);
    const isSection = hm && hm[1].length === sectionLevel;
    if (isSection && rebuilt.length > 0) {
      // 小节前：先去掉已有尾部空行，再插入标准规定的空行数
      while (rebuilt.length && rebuilt[rebuilt.length - 1].trim() === '') rebuilt.pop();
      for (let k = 0; k < blankBetweenSections; k++) rebuilt.push('');
      rebuilt.push(line);
    } else if (line.trim() === '') {
      // 普通空行：仅当上一行非空时保留一个空行（不重复前插）
      if (rebuilt.length > 0 && rebuilt[rebuilt.length - 1].trim() !== '') rebuilt.push('');
    } else {
      // 非空行：若上一行非空，补一个分隔空行
      if (rebuilt.length > 0 && rebuilt[rebuilt.length - 1].trim() !== '') rebuilt.push('');
      rebuilt.push(line);
    }
  }

  const newText = rebuilt.join('\n') + '\n';
  return { newText, changes, changed: newText !== rawText };
}

// ------------------------------ 主流程 --------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  const allDocs = args.includes('--all');
  const rebuild = args.includes('--rebuild');
  const sampleSize = allDocs ? 99999 : SAMPLE_MAX_DOCS;

  console.log('▶ 阶段 1/3  构建排版标准（来源：IMA「02 文件夹 › 巴菲特股东大会1994-2025」）');
  let standard;
  if (fs.existsSync(STANDARD_OUT) && !rebuild) {
    standard = JSON.parse(fs.readFileSync(STANDARD_OUT, 'utf8'));
    console.log('   命中缓存标准：', JSON.stringify(standard));
  } else {
    const docs = [];
    await collectDocs(MEETING_FOLDER_ID, docs, sampleSize);
    console.log(`   已枚举 ${docs.length} 篇 IMA 文档，开始拉取正文…`);
    const texts = [];
    for (const d of docs) {
      try {
        texts.push(await fetchDocContent(d.media_id)); // eslint-disable-line no-await-in-loop
      } catch (e) {
        console.warn(`   ⚠ 拉取失败 ${d.media_id}: ${e.message}`);
      }
    }
    standard = analyzeStandard(texts);
    fs.mkdirSync(path.dirname(STANDARD_OUT), { recursive: true });
    fs.writeFileSync(STANDARD_OUT, JSON.stringify(standard, null, 2), 'utf8');
    console.log('   抽取标准完成：', JSON.stringify(standard));
  }

  console.log('▶ 阶段 2/3  规范化网站 content/qa/ 下 Markdown');
  if (!fs.existsSync(WEBSITE_QA_DIR)) {
    console.error(`   目录不存在：${WEBSITE_QA_DIR}`);
    process.exit(1);
  }
  const files = fs.readdirSync(WEBSITE_QA_DIR).filter((f) => f.endsWith('.md')).sort();
  const report = {
    generatedAt: new Date().toISOString(),
    dryRun,
    standard,
    summary: { totalFiles: files.length, changedFiles: 0, unchangedFiles: 0, totalChanges: 0, totalBlankDelta: 0 },
    files: [],
  };

  for (const f of files) {
    const fp = path.join(WEBSITE_QA_DIR, f);
    const raw = fs.readFileSync(fp, 'utf8');
    // 以 git HEAD 原始版本为基准计算真实改动（而非相对当前磁盘，避免幂等重跑丢失日志）
    const orig = gitOriginal(fp, raw);
    const { newText, changes, changed } = normalizeFile(orig, standard);

    const byType = {};
    changes.forEach((c) => { byType[c.type] = (byType[c.type] || 0) + 1; });

    // 空行净变动（规则驱动，逐条枚举过于冗长，这里以“净增/减行数”审计）
    const origBlank = (orig.match(/^\s*$/gm) || []).length;
    const newBlank = (newText.match(/^\s*$/gm) || []).length;
    const blankDelta = newBlank - origBlank;

    const entry = {
      file: f,
      changed,
      changeCounts: byType,
      blankDelta,
      totalChanges: changes.length,
      changes: changed ? changes : [], // 完整修改明细（before/after + 行号 + 类型）
    };
    report.files.push(entry);

    if (changed) {
      report.summary.changedFiles++;
      report.summary.totalChanges += changes.length;
      report.summary.totalBlankDelta += blankDelta;
      if (!dryRun) fs.writeFileSync(fp, newText, 'utf8');
    } else {
      report.summary.unchangedFiles++;
    }
    const tag = changed ? `✎ ${changes.length} 处` : '✓ 已统一';
    console.log(`   ${tag.padEnd(10)} ${f}`);
  }

  console.log('▶ 阶段 3/3  写出日志');
  fs.mkdirSync(path.dirname(LOG_JSON), { recursive: true });
  fs.writeFileSync(LOG_JSON, JSON.stringify(report, null, 2), 'utf8');

  const md = [
    '# 股东大会问答 MD 排版对齐日志',
    '',
    `> 生成时间：${report.generatedAt}  `,
    `> 模式：${dryRun ? '**dry-run（未写入文件）**' : '**已应用**'}  `,
    `> 标准来源：IMA「02 文件夹 › 巴菲特股东大会1994-2025」（${standard.sourceDocCount} 篇抽样）`,
    '',
    '## 抽取的排版标准',
    '',
    `- 文档标题层级（H${standard.titleLevel}）`,
    `- 小节标题层级（H${standard.sectionLevel}，编号 \`N、\`）`,
    `- 小节之间空行数：${standard.blankBetweenSections}`,
    `- 列表符号：\`${standard.listMarker}\``,
    `- 加粗标记：\`${standard.boldMarker}\``,
    `- 标准文档中是否使用加粗：${standard.boldUsedInStandard ? '是' : '否（仅统一语法，不删语义加粗）'}`,
    '',
    '## 汇总',
    '',
    `| 指标 | 数值 |`,
    `| --- | --- |`,
    `| 处理文件总数 | ${report.summary.totalFiles} |`,
    `| 需要调整 | ${report.summary.changedFiles} |`,
    `| 已统一（无需改） | ${report.summary.unchangedFiles} |`,
    `| 标题/列表/加粗修改总计 | ${report.summary.totalChanges} |`,
    `| 空行净变动（增/减行数） | ${report.summary.totalBlankDelta >= 0 ? '+' : ''}${report.summary.totalBlankDelta} |`,
    '',
    '## 各文件明细',
    '',
    `| 文件 | 状态 | 标题 | 列表 | 加粗 | 空行净变动 | 合计 |`,
    `| --- | --- | --- | --- | --- | --- | --- |`,
  ];
  for (const e of report.files) {
    const c = e.changeCounts;
    const bd = e.blankDelta >= 0 ? `+${e.blankDelta}` : `${e.blankDelta}`;
    md.push(`| ${e.file} | ${e.changed ? '调整' : '已统一'} | ${c.heading || 0} | ${c.list || 0} | ${c.bold || 0} | ${bd} | ${e.totalChanges} |`);
  }

  // 逐文件完整修改明细（before → after），便于核对所有改动
  md.push('');
  md.push('## 各文件修改明细（逐条）');
  md.push('');
  md.push('> 以下 `before` 为 git HEAD 原始行，`after` 为对齐后行；`blank` 类改动表示空行规则调整。');
  md.push('');
  for (const e of report.files) {
    if (!e.changed) continue;
    md.push(`### ${e.file}（标题/列表/加粗 ${e.totalChanges} 处，空行净变动 ${e.blankDelta >= 0 ? '+' : ''}${e.blankDelta} 行）`);
    md.push('');
    md.push('| 行 | 类型 | 原始(before) | 对齐后(after) |');
    md.push('| --- | --- | --- | --- |');
    for (const c of e.changes) {
      const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, '⏎');
      md.push(`| ${c.line} | ${c.type} | \`${esc(c.before)}\` | \`${esc(c.after)}\` |`);
    }
    md.push('');
  }
  fs.writeFileSync(LOG_MD, md.join('\n'), 'utf8');

  console.log('─'.repeat(60));
  console.log(`完成：处理 ${report.summary.totalFiles} 篇，调整 ${report.summary.changedFiles} 篇，共 ${report.summary.totalChanges} 处修改`);
  console.log(`日志：\n  ${LOG_MD}\n  ${LOG_JSON}\n  ${STANDARD_OUT}`);
  if (dryRun) console.log('（当前为预览模式，加 --apply 才会写入网站 MD）');
}

module.exports = { normalizeFile, analyzeStandard, collectDocs, fetchDocContent };

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
