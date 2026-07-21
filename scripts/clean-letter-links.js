/**
 * clean-letter-links.js
 *
 * Processes all Markdown files in content/letters/ and content/partnership/
 * to remove external links, source citations, and reference information.
 *
 * Operations (in order):
 * 1. Remove source citation line: > 来源：https://learnbuffett.com/...
 * 2. Remove original article link: 原文链接：https://learnbuffett.com/...
 * 3. Convert inline entity links to plain text: [text](url) -> text
 * 4. Remove data source footnotes: _数据来源：..., _资料来源：..., > (2) 来源：...
 * 5. Remove category label lines: standalone 股东信 or 合伙人信
 * 6. Remove SEO description subtitles: lines starting with year + letter description (non-heading)
 * 7. Remove HTML title residue: lines containing — 巴菲特知识库
 * 8. Fix excessive blank lines (3+ -> 2 max, max 1 blank between H1 and body)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIRS = [
  path.join(ROOT, 'content', 'letters'),
  path.join(ROOT, 'content', 'partnership'),
];

// ---- Stats ----
const stats = {
  filesProcessed: 0,
  sourceCitationLines: 0,
  originalLinks: 0,
  inlineLinks: 0,
  dataSourceFootnotes: 0,
  categoryLabels: 0,
  seoSubtitles: 0,
  htmlTitleResidue: 0,
  blankLineFixes: 0,
};

// ---- Utility: collapse blank lines ----
function collapseBlankLines(text) {
  // 1. Collapse 3+ consecutive blank lines into at most 2 blank lines
  const before = text;
  text = text.replace(/\n{3,}/g, '\n\n');

  // 2. Ensure at most 1 blank line between H1 (# heading) and body content
  // H1 at line start, then possibly blank lines, then body content
  text = text.replace(/^(# .+\n)\n{2,}/gm, '$1\n');

  if (text !== before) {
    // Count the difference
    const beforeCount = (before.match(/\n{3,}/g) || []).length;
    const afterCount = (text.match(/\n{3,}/g) || []).length;
    stats.blankLineFixes += Math.max(0, beforeCount - afterCount);
  }

  return text;
}

// ---- Main processing ----
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let changes = [];

  // ----- Step 1: Remove source citation line -----
  // Matches: > 来源：https://learnbuffett.com/...
  const sourceRegex = /^> 来源：https:\/\/learnbuffett\.com\/.*$/gm;
  const sourceMatches = content.match(sourceRegex);
  if (sourceMatches) {
    stats.sourceCitationLines += sourceMatches.length;
    changes.push(`source citation lines: ${sourceMatches.length}`);
  }
  content = content.replace(sourceRegex, '');

  // ----- Step 2: Remove original article link -----
  // Matches: 原文链接：https://learnbuffett.com/...
  const linkRegex = /^原文链接：https:\/\/learnbuffett\.com\/.*$/gm;
  const linkMatches = content.match(linkRegex);
  if (linkMatches) {
    stats.originalLinks += linkMatches.length;
    changes.push(`original article links: ${linkMatches.length}`);
  }
  content = content.replace(linkRegex, '');

  // ----- Step 3: Convert inline entity links to plain text -----
  // Matches: [text](https://learnbuffett.com/...) -> text
  let inlineCount = 0;

  // First, handle Cloudflare email protection links: [[email protected]](url)
  // These have double brackets and need special handling
  const emailLinkRegex = /\[\[email[^\]]*\]\]\(https?:\/\/learnbuffett\.com\/[^\)]*\)/g;
  const emailMatches = content.match(emailLinkRegex);
  if (emailMatches) {
    inlineCount += emailMatches.length;
    content = content.replace(emailLinkRegex, '');
  }

  // Then handle standard inline links: [text](https://learnbuffett.com/...)
  const inlineRegex = /\[([^\]]*?)\]\(https?:\/\/learnbuffett\.com\/[^\)]*\)/g;
  content = content.replace(inlineRegex, (match, text) => {
    inlineCount++;
    return text;
  });

  if (inlineCount > 0) {
    stats.inlineLinks += inlineCount;
    changes.push(`inline links converted: ${inlineCount}`);
  }

  // ----- Step 4: Remove data source footnotes -----
  // Patterns:
  //   _数据来源：...
  //   _资料来源：...
  //   > (2) 来源：...  (or any number in parentheses)
  //   [^数字]:  ...  (footnote definitions)
  let footnoteCount = 0;

  const footnoteRegex1 = /^_数据来源：.*$/gm;
  const m1 = content.match(footnoteRegex1);
  if (m1) footnoteCount += m1.length;
  content = content.replace(footnoteRegex1, '');

  const footnoteRegex2 = /^_资料来源：.*$/gm;
  const m2 = content.match(footnoteRegex2);
  if (m2) footnoteCount += m2.length;
  content = content.replace(footnoteRegex2, '');

  const footnoteRegex3 = /^> \(\d+\) 来源：.*$/gm;
  const m3 = content.match(footnoteRegex3);
  if (m3) footnoteCount += m3.length;
  content = content.replace(footnoteRegex3, '');

  // Also handle footnote definition lines like [^1]: text
  const footnoteRegex4 = /^\[\^\d+\]:.*$/gm;
  const m4 = content.match(footnoteRegex4);
  if (m4) footnoteCount += m4.length;
  content = content.replace(footnoteRegex4, '');

  if (footnoteCount > 0) {
    stats.dataSourceFootnotes += footnoteCount;
    changes.push(`data source footnotes removed: ${footnoteCount}`);
  }

  // ----- Step 5: Remove category label lines -----
  // Standalone lines containing only 股东信 or 合伙人信 (with optional whitespace)
  let catCount = 0;
  content = content.replace(/^\s*股东信\s*$/gm, () => { catCount++; return ''; });
  content = content.replace(/^\s*合伙人信\s*$/gm, () => { catCount++; return ''; });
  if (catCount > 0) {
    stats.categoryLabels += catCount;
    changes.push(`category labels removed: ${catCount}`);
  }

  // ----- Step 6: Remove SEO description subtitles -----
  // Lines between H1 and body content that start with a 4-digit year followed by
  // descriptive text about the letter (not a heading, not a blockquote).
  // Examples:
  //   2024 巴菲特致股东信：94 岁巴菲特最后一封股东信...
  //   1960 巴菲特致合伙人信：道指 -6.3%...
  //   1956 有限合伙协议：巴菲特职业生涯起点...
  //   1962年12月 巴菲特致合伙人信：年末税务说明短信...
  const seoRegex = /^\d{4}(?:年\d{1,2}月)?\s+.*[：:].*$/gm;
  // But we must NOT match lines that are headings (# ...)
  // and NOT match lines inside blockquotes (> ...)
  // We'll process line by line to be safe
  let seoCount = 0;
  const lines = content.split('\n');
  let cleanedLines = [];

  // Find where the H1 heading ends - the body content usually starts after H1 + blank lines
  // We only want to target SEO subtitle lines that appear early in the file,
  // near the top section, between heading area and body content.
  // A safe heuristic: only consider lines before the first ## heading (H2) or
  // before a significant body content marker.
  const firstH2Index = lines.findIndex(l => l.startsWith('## '));
  // If no H2, use first blank line after H1 area as cutoff
  let cutoffLine = firstH2Index > 0 ? firstH2Index : 15; // reasonably early in file

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only check lines before cutoff
    if (i < cutoffLine && !line.startsWith('#') && !line.startsWith('>') && !line.startsWith('|') && !line.startsWith('*')) {
      // Check if line matches SEO pattern: starts with 4-digit year followed by descriptive text
      if (/^\d{4}(?:年\d{1,2}月)?\s+.*[：:].*$/.test(line.trim())) {
        // Additional check: the line should contain the letter title pattern (巴菲特致...)
        if (/巴菲特致|有限合伙/.test(line)) {
          seoCount++;
          continue; // Skip this line (remove it)
        }
      }
    }
    cleanedLines.push(line);
  }

  if (seoCount > 0) {
    stats.seoSubtitles += seoCount;
    changes.push(`SEO description subtitles removed: ${seoCount}`);
  }
  content = cleanedLines.join('\n');

  // ----- Step 7: Remove HTML title residue -----
  // Lines containing — 巴菲特知识库
  const htmlRegex = /^.*— 巴菲特知识库.*$/gm;
  const htmlMatches = content.match(htmlRegex);
  if (htmlMatches) {
    stats.htmlTitleResidue += htmlMatches.length;
    changes.push(`HTML title residues removed: ${htmlMatches.length}`);
  }
  content = content.replace(htmlRegex, '');

  // ----- Step 8: Fix excessive blank lines -----
  content = collapseBlankLines(content);

  // ----- Final cleanup: remove leading/trailing blank lines from file -----
  content = content.replace(/^\n+/, '');       // leading blank lines
  content = content.replace(/\n+$/, '\n');     // trailing blank lines (keep 1 newline at end)

  // ----- Write if changed -----
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    const relPath = path.relative(ROOT, filePath);
    if (changes.length > 0) {
      console.log(`  ✓ ${relPath}: ${changes.join('; ')}`);
    } else {
      console.log(`  ✓ ${relPath}: cleaned (minor adjustments)`);
    }
  } else {
    const relPath = path.relative(ROOT, filePath);
    console.log(`  - ${relPath}: no changes`);
  }

  stats.filesProcessed++;
}

// ---- Collect all files ----
let allFiles = [];
for (const dir of DIRS) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f));
    allFiles = allFiles.concat(files);
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
}

console.log(`Found ${allFiles.length} Markdown files to process.\n`);

// ---- Process each file ----
for (const filePath of allFiles.sort()) {
  processFile(filePath);
}

// ---- Summary ----
console.log('\n========== 清理统计 ==========');
console.log(`处理的文件数:     ${stats.filesProcessed}`);
console.log(`来源引用行:       ${stats.sourceCitationLines}`);
console.log(`原文链接:         ${stats.originalLinks}`);
console.log(`内联链接转换:     ${stats.inlineLinks}`);
console.log(`数据源脚注:       ${stats.dataSourceFootnotes}`);
console.log(`分类标签:         ${stats.categoryLabels}`);
console.log(`SEO描述副标题:    ${stats.seoSubtitles}`);
console.log(`HTML标题残留:     ${stats.htmlTitleResidue}`);
console.log(`空白行修复:       ${stats.blankLineFixes}`);
console.log('===============================');
