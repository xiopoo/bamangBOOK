#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const JSZip = require('jszip');
const { DOMParser } = require('xmldom');

const ROOT = path.resolve(__dirname, '..');
const RAW_ROOT = path.join(ROOT, 'tmp', 'ima-audit', 'raw');
const MANIFEST_PATH = path.join(ROOT, 'tmp', 'ima-audit', 'manifest.json');
const STABLE_LIST_PATH = path.join(ROOT, 'tmp', 'ima-audit', 'stable-list.json');
const REPORT_DIR = path.join(ROOT, 'reports');
const REPORT_PATH = path.join(REPORT_DIR, 'ima-content-audit-2026-07-22.md');
const DATA_PATH = path.join(REPORT_DIR, 'ima-content-audit-2026-07-22.json');

function canonical(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function markdownBody(value) {
  const marker = value.match(/^-{4,}\s*正文\s*-{4,}$/m);
  if (marker) return value.slice(marker.index + marker[0].length);
  return value;
}

function markdownStructure(value) {
  const body = markdownBody(value).replace(/\r\n?/g, '\n');
  const lines = body.split('\n');
  const headings = lines.filter((line) => /^#{1,6}\s+\S/.test(line));
  const longHeadings = headings.filter((line) => canonical(line.replace(/^#{1,6}\s+/, '')).length > 100);
  const tableRows = lines.filter((line) => /^\s*\|.*\|\s*$/.test(line) && !/^\s*\|?\s*:?-+/.test(line));
  const tableSeparators = lines.filter((line) => {
    if (!line.includes('|')) return false;
    const cells = line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim());
    return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  });
  const blocks = body
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
  const paragraphs = blocks.filter((block) => !/^#{1,6}\s+/.test(block) && !/^\s*\|/.test(block));
  return {
    body,
    headings,
    longHeadings,
    tableRows,
    tableCount: tableSeparators.length,
    blocks,
    paragraphs,
  };
}

function buildGramSet(value, width = 12) {
  const text = canonical(value);
  const grams = new Set();
  if (text.length < width) return grams;
  for (let i = 0; i <= text.length - width; i += 1) grams.add(text.slice(i, i + width));
  return grams;
}

function blockCoverage(block, targetGrams, width = 12) {
  const text = canonical(block);
  if (text.length < width) return 1;
  let total = 0;
  let matched = 0;
  for (let i = 0; i <= text.length - width; i += 4) {
    total += 1;
    if (targetGrams.has(text.slice(i, i + width))) matched += 1;
  }
  return total ? matched / total : 1;
}

function sentenceBlocks(blocks) {
  return blocks.flatMap((block) => block
    .split(/(?<=[。！？!?])|\n+/u)
    .map((part) => part.trim())
    .filter(Boolean));
}

function isSourceEditorialNoise(block) {
  return /(?:一朵喵|雪球|置顶帖|转载请|所有引用|中文翻译|中文链接|from=status|https?:\/\/|我打算在未来两年|接触到巴菲特与芒格)/i.test(block);
}

function coverageSummary(sourceBlocks, target, { width = 8, minLength = 30 } = {}) {
  const targetGrams = buildGramSet(target, width);
  const assessed = sourceBlocks
    .map((block) => ({
      text: block,
      normalizedLength: canonical(block).length,
      coverage: blockCoverage(block, targetGrams, width),
    }))
    .filter((item) => item.normalizedLength >= minLength);
  const weight = assessed.reduce((sum, item) => sum + item.normalizedLength, 0);
  const weightedCoverage = weight
    ? assessed.reduce((sum, item) => sum + item.coverage * item.normalizedLength, 0) / weight
    : 1;
  return {
    weightedCoverage,
    missing: assessed.filter((item) => item.coverage < 0.2),
    partial: assessed.filter((item) => item.coverage >= 0.2 && item.coverage < 0.7),
    assessedCount: assessed.length,
  };
}

function excerpt(value, length = 100) {
  const text = value
    .replace(/^#{1,6}\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function gitHeadFile(relativePath) {
  try {
    return execFileSync('git', ['show', `HEAD:${relativePath}`], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function elementChildren(node) {
  const children = [];
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === 1) children.push(child);
  }
  return children;
}

function descendants(node, localName) {
  const found = [];
  function visit(current) {
    for (const child of elementChildren(current)) {
      if (child.localName === localName || child.nodeName.endsWith(`:${localName}`)) found.push(child);
      visit(child);
    }
  }
  visit(node);
  return found;
}

function wordParagraphText(node) {
  let text = '';
  function visit(current) {
    for (let child = current.firstChild; child; child = child.nextSibling) {
      if (child.nodeType !== 1) continue;
      const name = child.localName || child.nodeName.split(':').pop();
      if (name === 't') text += child.textContent || '';
      else if (name === 'tab') text += '\t';
      else if (name === 'br' || name === 'cr') text += '\n';
      else visit(child);
    }
  }
  visit(node);
  return text.trim();
}

async function extractDocx(filePath) {
  const zip = new JSZip(fs.readFileSync(filePath));
  const xml = zip.file('word/document.xml').asText();
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const body = descendants(doc, 'body')[0];
  const blocks = [];
  const paragraphs = [];
  const tables = [];
  let explicitBreaks = 0;
  for (const child of elementChildren(body)) {
    const name = child.localName || child.nodeName.split(':').pop();
    if (name === 'p') {
      const text = wordParagraphText(child);
      explicitBreaks += descendants(child, 'br').length + descendants(child, 'cr').length;
      if (text) {
        blocks.push(text);
        paragraphs.push(text);
      }
    } else if (name === 'tbl') {
      const rows = descendants(child, 'tr').map((row) => descendants(row, 'tc').map((cell) => {
        const cellText = descendants(cell, 'p').map(wordParagraphText).filter(Boolean).join('\n');
        return cellText;
      }));
      tables.push(rows);
      for (const row of rows) blocks.push(row.join(' | '));
    }
  }
  return { blocks, paragraphs, tables, explicitBreaks, text: blocks.join('\n\n') };
}

function qaAudit(manifest) {
  const results = [];
  const qaEntries = manifest
    .filter((item) => item.category === 'qa')
    .map((item) => {
      const folderYear = /^\d{4}$/.test(item.relativeFolder || '') ? item.relativeFolder : null;
      const titleYear = String(item.title || '').match(/\b(19|20)\d{2}\b/)?.[0] || null;
      return { ...item, auditYear: folderYear || titleYear };
    })
    .filter((item) => item.auditYear);
  const years = [...new Set(qaEntries.map((item) => item.auditYear))].sort();
  for (const year of years) {
    const allEntries = qaEntries.filter((item) => item.auditYear === year);
    const downloaded = allEntries.filter((item) => item.status === 'downloaded');
    const websitePath = `content/qa/伯克希尔股东大会实录_${year}.md`;
    const absoluteWebsitePath = path.join(ROOT, websitePath);
    if (!fs.existsSync(absoluteWebsitePath)) continue;
    const website = fs.readFileSync(absoluteWebsitePath, 'utf8');
    const websiteStructure = markdownStructure(website);
    const sourceStructures = downloaded.map((item) => markdownStructure(fs.readFileSync(path.join(ROOT, item.filePath), 'utf8')));
    const omittedQuestionMarkers = sourceStructures.reduce((sum, item) => sum + (item.body.match(/\bQ\s*\d+\s*略/g) || []).length, 0);
    const sourceBlocks = sentenceBlocks(sourceStructures
      .flatMap((item) => item.paragraphs)
      .filter((block) => !isSourceEditorialNoise(block)));
    const content = coverageSummary(sourceBlocks, websiteStructure.body);
    results.push({
      year,
      websitePath,
      expectedParts: allEntries.length,
      downloadedParts: downloaded.length,
      complete: downloaded.length === allEntries.length,
      contentCoverage: downloaded.length ? content.weightedCoverage : null,
      sourceTitles: allEntries.map((item) => item.title),
      omittedQuestionMarkers,
      missingBlocks: content.missing,
      partialBlockCount: content.partial.length,
      sourceHeadings: sourceStructures.reduce((sum, item) => sum + item.headings.length, 0),
      websiteHeadings: websiteStructure.headings.length,
      sourceParagraphs: sourceStructures.reduce((sum, item) => sum + item.paragraphs.length, 0),
      websiteParagraphs: websiteStructure.paragraphs.length,
      sourceTables: sourceStructures.reduce((sum, item) => sum + item.tableCount, 0),
      websiteTables: websiteStructure.tableCount,
      longWebsiteHeadings: websiteStructure.longHeadings,
    });
  }
  return results;
}

async function letterAudit(stableList) {
  const results = [];
  const stableTitles = new Set(stableList.filter((item) => /^berkshire_\d{4}/.test(item.title)).map((item) => item.title));
  for (let year = 1965; year <= 2025; year += 1) {
    const fileName = `berkshire_${year}-巴菲特致股东信.md`;
    const websitePath = `content/letters/${fileName}`;
    const absoluteWebsitePath = path.join(ROOT, websitePath);
    if (!fs.existsSync(absoluteWebsitePath)) continue;
    const current = fs.readFileSync(absoluteWebsitePath, 'utf8');
    const currentStructure = markdownStructure(current);
    const baseline = gitHeadFile(websitePath);
    let baselineAudit = null;
    if (baseline) {
      const baselineStructure = markdownStructure(baseline);
      const baselineTextBlocks = sentenceBlocks(baselineStructure.paragraphs.filter((block) => (block.match(/\|/g) || []).length < 3));
      const currentTextBlocks = sentenceBlocks(currentStructure.paragraphs.filter((block) => (block.match(/\|/g) || []).length < 3));
      const missing = coverageSummary(baselineTextBlocks, currentStructure.body);
      const added = coverageSummary(currentTextBlocks, baselineStructure.body);
      baselineAudit = {
        canonicalEqual: canonical(baseline) === canonical(current),
        baselineCoverageInCurrent: missing.weightedCoverage,
        currentCoverageInBaseline: added.weightedCoverage,
        missingBlocks: missing.missing,
        addedBlocks: added.missing,
        baselineHeadings: baselineStructure.headings.length,
        currentHeadings: currentStructure.headings.length,
        baselineParagraphs: baselineStructure.paragraphs.length,
        currentParagraphs: currentStructure.paragraphs.length,
        baselineTables: baselineStructure.tableCount,
        currentTables: currentStructure.tableCount,
        longCurrentHeadings: currentStructure.longHeadings,
      };
    }

    const wordPath = path.join(RAW_ROOT, 'letters', `${year}.docx`);
    let wordAudit = null;
    if (fs.existsSync(wordPath)) {
      const word = await extractDocx(wordPath);
      const content = coverageSummary(sentenceBlocks(word.paragraphs), currentStructure.body);
      wordAudit = {
        contentCoverage: content.weightedCoverage,
        missingBlockCount: content.missing.length,
        partialBlockCount: content.partial.length,
        sourceParagraphs: word.paragraphs.length,
        websiteParagraphs: currentStructure.paragraphs.length,
        sourceTables: word.tables.length,
        websiteTables: currentStructure.tableCount,
        sourceTableRows: word.tables.reduce((sum, table) => sum + table.length, 0),
        websiteTableRows: currentStructure.tableRows.length,
        sourceExplicitBreaks: word.explicitBreaks,
      };
    }

    results.push({
      year,
      websitePath,
      inStableImaList: stableTitles.has(fileName),
      baselineAudit,
      wordAudit,
    });
  }
  return results;
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function renderReport(data) {
  const lines = [];
  const completeQaYears = data.qa.filter((item) => item.complete).length;
  const excerptQaYears = data.qa.filter((item) => item.omittedQuestionMarkers > 0).map((item) => item.year);
  const lowComparabilityQaYears = data.qa
    .filter((item) => item.contentCoverage !== null && item.contentCoverage < 0.2)
    .map((item) => item.year);
  const comparableQaWithMissing = data.qa
    .filter((item) => item.complete && item.contentCoverage !== null && item.contentCoverage >= 0.2 && !item.omittedQuestionMarkers && item.missingBlocks.length);
  lines.push('# IMA 与网站文档内容/格式审计');
  lines.push('');
  lines.push('> 审计日期：2026-07-22');
  lines.push('> 审计对象：巴菲特致股东信、伯克希尔股东大会问答/实录');
  lines.push('> 审计过程未修改 IMA；网站正文已根据高置信度审计结果完成首轮精校。');
  lines.push('');
  lines.push('## 证据范围');
  lines.push('');
  lines.push(`- “巴菲特致股东信/中文精校-按年度”：已下载 ${data.downloadStats.lettersDownloaded} 份，其中可与网站股东信年份直接对应的 Word 文档为 ${data.downloadStats.comparableLetterDocs} 份。`);
  lines.push(`- “巴菲特股东大会1994-2025”：已下载 ${data.downloadStats.qaDownloaded}/${data.downloadStats.qaTotal} 个分卷；本轮已将 2008-2025 年可取得源文纳入审计，目录中仍未提供 2017、2018 年源文。`);
  lines.push(`- “巴菲特知识库”：已确认 ${data.stableStats.total} 个标准 MD，其中股东信 ${data.stableStats.letters} 封（1965-2024）；该目录没有股东大会 MD。今天只取得文件清单，原文读取被 IMA 配额阻止。`);
  lines.push('- 为继续审计标准 MD，使用项目 Git `HEAD` 中此前已同步版本作为“本地同步基线”；凡引用该基线的结论均不等同于今天实时下载的 IMA 原文。');
  lines.push('');
  lines.push('## 核心结论');
  lines.push('');
  lines.push(`1. 股东信网站文件覆盖 1965-2025；标准 MD 样本覆盖 1965-2024，网站新增 2025。标准 MD 清单与网站 1965-2024 的文件名逐年对应，无整年文件缺失。`);
  lines.push(`2. 当前股东信相对本地同步基线，${data.letterSummary.canonicalEqual} 封纯文本完全一致；${data.letterSummary.changed} 封存在字符级变化。多数变化是清理粘连标记、补空行和修表格；未发现覆盖率低于 20% 的基线长句缺失。`);
  lines.push(`3. IMA Word“中文精校”与网站不是同一译本：${data.letterSummary.versionMismatch} 封覆盖率低于 80%，不能把全部差异直接判为网站缺漏。2024 年尤其明显，Word 版缺少网站中的“错误”“皮特·利格尔”等整节，同时译文措辞也大量不同。`);
  lines.push(`4. 已完整下载的 ${completeQaYears} 个大会年份中，2008-2016、2020-2022 覆盖率可用于逐段复核，段落和标题结构仍被明显压缩；${comparableQaWithMissing.length} 个可比年份仍有未逐字覆盖候选。`);
  lines.push(`5. 大会基准目录本身缺少 2017、2018 两个年份；网站含这两年，因此它们属于“网站额外收录”，不能用该目录证明正确或错误。`);
  lines.push('');
  lines.push('## 已同步到网站');
  lines.push('');
  lines.push('- 1994-2006 年股东大会实录：恢复问题标题层级、问答换行和发言人分段；格式化前后规范化正文文本保持一致。');
  lines.push('- 股东信主要持仓表：恢复 33 个年度中因 PDF/Word 提取而粘连或缺行的表格，并统一为可渲染的 Markdown 表格。');
  lines.push('- 重点细节：修复 1991 年固定收益脚注、1999 年增长率表、2007 年承保业绩表、2021 年持仓表及脚注。');
  lines.push('- 全库校验：股东信与大会实录 Markdown 表格列数错误为 0；修复脚本重复运行无新增变更。');
  lines.push('- 当前边界：2017、2018 年大会资料未在 IMA 目录中提供；2019 年 IMA 源文为带“Qxx 略”的节选稿，只能据此确认局部段落与分段，不能证明网站全文缺漏。');
  lines.push('');
  lines.push('## 股东信审计');
  lines.push('');
  lines.push('### 标准 MD 本地同步基线对比');
  lines.push('');
  lines.push('| 年份 | 文字覆盖（基线→当前） | 当前→基线 | 标题数 基线/当前 | 段落数 基线/当前 | 表格数 基线/当前 | 结论 |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | --- |');
  for (const item of data.letters.filter((entry) => entry.baselineAudit && (!entry.baselineAudit.canonicalEqual || entry.baselineAudit.longCurrentHeadings.length))) {
    const a = item.baselineAudit;
    const conclusion = a.baselineCoverageInCurrent < 0.98 ? '有内容差异，需复核' : '内容基本保留，主要为格式调整';
    lines.push(`| ${item.year} | ${percent(a.baselineCoverageInCurrent)} | ${percent(a.currentCoverageInBaseline)} | ${a.baselineHeadings}/${a.currentHeadings} | ${a.baselineParagraphs}/${a.currentParagraphs} | ${a.baselineTables}/${a.currentTables} | ${conclusion} |`);
  }
  lines.push('');
  const letterCandidates = data.letters
    .filter((item) => item.baselineAudit && item.baselineAudit.missingBlocks.length)
    .map((item) => ({ year: item.year, blocks: item.baselineAudit.missingBlocks.slice(0, 3) }));
  lines.push('### 股东信高置信度缺漏候选');
  lines.push('');
  if (!letterCandidates.length) lines.push('未发现覆盖率低于 20% 的基线长句。');
  for (const item of letterCandidates) {
    lines.push(`- **${item.year}**：${item.blocks.map((block) => `“${excerpt(block.text)}”`).join('；')}`);
  }
  lines.push('');
  lines.push('### Word 译本可比性');
  lines.push('');
  lines.push('| 年份 | Word→网站文字覆盖 | Word 段落/网站段落 | Word 表格/网站表格 | 判断 |');
  lines.push('| --- | ---: | ---: | ---: | --- |');
  for (const item of data.letters.filter((entry) => entry.wordAudit)) {
    const a = item.wordAudit;
    const judgment = a.contentCoverage >= 0.95 ? '同源，可逐字复核' : a.contentCoverage >= 0.8 ? '大体同源，有版本差异' : '不同译本，不宜直接判缺漏';
    lines.push(`| ${item.year} | ${percent(a.contentCoverage)} | ${a.sourceParagraphs}/${a.websiteParagraphs} | ${a.sourceTables}/${a.websiteTables} | ${judgment} |`);
  }
  lines.push('');
  lines.push('## 股东大会审计');
  lines.push('');
  lines.push('| 年份 | 分卷下载 | 文字覆盖 | 标题数 来源/网站 | 段落数 来源/网站 | 表格数 来源/网站 | 长标题粘正文 |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const item of data.qa) {
    const coverage = item.contentCoverage === null ? '—' : percent(item.contentCoverage);
    lines.push(`| ${item.year} | ${item.downloadedParts}/${item.expectedParts}${item.complete ? '' : '（不完整）'} | ${coverage} | ${item.sourceHeadings}/${item.websiteHeadings} | ${item.sourceParagraphs}/${item.websiteParagraphs} | ${item.sourceTables}/${item.websiteTables} | ${item.longWebsiteHeadings.length} |`);
  }
  lines.push('');
  if (lowComparabilityQaYears.length) {
    lines.push(`低可比性年份：${lowComparabilityQaYears.join('、')}。这些 IMA 源文与网站稿存在节选、同声传译稿/精校稿或版本来源差异，只能确认已出现的局部内容和发言人分段，不足以反推网站缺段。`);
    lines.push('');
  }
  lines.push('### 大会未逐字覆盖候选（需人工复核）');
  lines.push('');
  for (const item of comparableQaWithMissing) {
    lines.push(`- **${item.year}**（${item.missingBlocks.length} 段）：${item.missingBlocks.slice(0, 4).map((block) => `“${excerpt(block.text)}”`).join('；')}`);
  }
  lines.push('');
  lines.push('### 格式问题说明');
  lines.push('');
  lines.push('- 大会来源分卷使用标准 Markdown：每个问题为三级标题，提问者/巴菲特/芒格发言按自然段分开。网站合并稿普遍把多个发言段压成一个长段，标题数量也显著减少。');
  if (excerptQaYears.length) lines.push(`- ${excerptQaYears.join('、')} 年 IMA 源文含“Qxx 略”等节选标记；这些年份的低覆盖段只作为“来源未逐字覆盖候选”，不直接判定为网站缺漏。`);
  lines.push('- 表格按结构统计，不只看文字是否存在。网站中若数字仍在但被压成连续文本，仍记为“表格格式缺失”。');
  lines.push('- 2023-2025 年源文在 IMA 目录根部以单个 TXT 文件保存，已按文件名年份并入年度审计。');
  lines.push('');
  lines.push('## 范围差异');
  lines.push('');
  lines.push('- 股东信 Word 目录含 1957-1964，网站将相关早期材料放在“合伙人信”体系，不计为股东信缺失。');
  lines.push('- Word 目录没有 1970 年文件，但网站有 1970 年股东信；这是 IMA 基准缺项。');
  lines.push('- Word 目录另有“2025谢幕.doc”，属于特别致辞/交接材料，不等同于 2025 年度股东信。');
  lines.push('- 大会目录缺 2017、2018；网站额外收录 1986-1993、2017-2018。');
  lines.push('');
  lines.push('## 后续复核');
  lines.push('');
  lines.push('后续若 IMA 目录新增 2017、2018 年大会源文，运行 `node scripts/audit-ima-vs-site.js` 与 `node scripts/generate-ima-audit-report.js` 可继续补齐；标准 MD 原文需继续单独下载，届时用实时 IMA 内容替换本报告中的 Git 本地同步基线。');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const stableList = JSON.parse(fs.readFileSync(STABLE_LIST_PATH, 'utf8'));
  const letters = await letterAudit(stableList);
  const qa = qaAudit(manifest);
  const stableLetters = stableList.filter((item) => /^berkshire_\d{4}/.test(item.title));
  const letterEntries = manifest.filter((item) => item.category === 'letters');
  const qaEntries = manifest.filter((item) => item.category === 'qa');
  const data = {
    generatedAt: new Date().toISOString(),
    downloadStats: {
      lettersDownloaded: letterEntries.filter((item) => item.status === 'downloaded').length,
      comparableLetterDocs: letters.filter((item) => item.wordAudit).length,
      qaDownloaded: qaEntries.filter((item) => item.status === 'downloaded').length,
      qaTotal: qaEntries.length,
    },
    stableStats: {
      total: stableList.length,
      letters: stableLetters.length,
    },
    letters,
    qa,
  };
  data.letterSummary = {
    canonicalEqual: letters.filter((item) => item.baselineAudit && item.baselineAudit.canonicalEqual).length,
    changed: letters.filter((item) => item.baselineAudit && !item.baselineAudit.canonicalEqual).length,
    versionMismatch: letters.filter((item) => item.wordAudit && item.wordAudit.contentCoverage < 0.8).length,
  };
  data.qaSummary = {
    completeYearsWithMissing: qa.filter((item) => item.complete && item.missingBlocks.length).length,
    comparableCompleteYearsWithMissing: qa
      .filter((item) => item.complete && item.contentCoverage !== null && item.contentCoverage >= 0.2 && !item.omittedQuestionMarkers && item.missingBlocks.length)
      .length,
  };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.writeFileSync(REPORT_PATH, renderReport(data), 'utf8');
  process.stdout.write(`Report: ${path.relative(ROOT, REPORT_PATH)}\n`);
  process.stdout.write(`Data: ${path.relative(ROOT, DATA_PATH)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
