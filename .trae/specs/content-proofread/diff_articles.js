#!/usr/bin/env node
/**
 * Compare content/articles/ files with content/pdf-documents-formatted/ files
 * and generate a difference report.
 * 
 * Uses paragraph-level comparison to detect:
 *   - Extra content in articles version
 *   - Missing content in articles version
 *   - Rewritten/summarized content
 *   - Table format issues
 */

const fs = require('fs');
const path = require('path');
const { diffLines } = require('diff');

const ARTICLES_DIR = path.resolve(__dirname, '../../..', 'content/articles');
const PDF_DIR = path.resolve(__dirname, '../../..', 'content/pdf-documents-formatted');
const REPORT_PATH = path.resolve(__dirname, 'diff-report-articles.md');

function getArticlesFiles() {
    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
    files.sort();
    return files;
}

/**
 * Normalize text:
 * - Strip trailing whitespace from each line
 * - Collapse multiple blank lines into one
 * - Remove leading/trailing blank lines
 */
function normalizeText(text) {
    let lines = text.split('\n');
    lines = lines.map(l => l.trimEnd());
    
    // Remove leading empty lines
    while (lines.length > 0 && lines[0] === '') lines.shift();
    // Remove trailing empty lines
    while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    
    const result = [];
    let prevEmpty = false;
    for (const line of lines) {
        if (line === '') {
            if (prevEmpty) continue;
            prevEmpty = true;
        } else {
            prevEmpty = false;
        }
        result.push(line);
    }
    return result.join('\n');
}

/**
 * Extract paragraphs (blocks separated by blank lines).
 */
function extractParagraphs(text) {
    const norm = normalizeText(text);
    const paragraphs = norm.split(/\n\s*\n/);
    return paragraphs.filter(p => p.trim().length > 0).map(p => p.trim());
}

/**
 * Detect table format issues.
 */
function detectTableIssues(webText, pdfText) {
    const issues = [];

    // Extract table blocks
    const extractTables = (text) => {
        const tables = [];
        let inTable = false;
        let current = [];
        for (const line of text.split('\n')) {
            const s = line.trim();
            if (s.startsWith('|')) {
                current.push(s);
                inTable = true;
            } else {
                if (inTable && current.length > 0) {
                    tables.push(current);
                    current = [];
                }
                inTable = false;
            }
        }
        if (inTable && current.length > 0) tables.push(current);
        return tables;
    };

    const webTables = extractTables(webText);
    const pdfTables = extractTables(pdfText);

    // Check for repeated headers in web tables
    for (let ti = 0; ti < webTables.length; ti++) {
        const table = webTables[ti];
        if (table.length >= 4) {
            const header = table[0];
            // Normalize header for comparison
            const normHeader = header.replace(/\s+/g, ' ').trim();
            let repeatCount = 0;
            for (let ri = 1; ri < table.length; ri++) {
                if (table[ri].replace(/\s+/g, ' ').trim() === normHeader) {
                    repeatCount++;
                }
            }
            if (repeatCount >= 2) {
                issues.push(`表格 ${ti + 1}: 表头行被重复了 ${repeatCount + 1} 次`);
            }
        }
    }

    return issues;
}

/**
 * Check if a diff block is purely formatting (whitespace, etc.)
 */
function isFormattingOnly(block) {
    const additions = [];
    const deletions = [];

    for (const line of block) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
            additions.push(line.slice(1).trim());
        } else if (line.startsWith('-') && !line.startsWith('---')) {
            deletions.push(line.slice(1).trim());
        }
    }

    for (const a of additions) {
        if (!a) continue;
        const aClean = a.replace(/\s+/g, '');
        let found = false;
        for (const d of deletions) {
            const dClean = d.replace(/\s+/g, '');
            if (aClean === dClean) {
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

/**
 * Classify the diff block.
 */
function classifyDiff(block) {
    const additions = [];
    const deletions = [];

    for (const line of block) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
            additions.push(line.slice(1));
        } else if (line.startsWith('-') && !line.startsWith('---')) {
            deletions.push(line.slice(1));
        }
    }

    const headerMatch = block[0].match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
    const pdfStart = headerMatch ? parseInt(headerMatch[1]) : 0;
    const webStart = headerMatch ? parseInt(headerMatch[3]) : 0;

    const webText = additions.join('\n');
    const pdfText = deletions.join('\n');

    let diffType;
    if (additions.length > 0 && deletions.length === 0) {
        diffType = '网页版多出内容';
    } else if (deletions.length > 0 && additions.length === 0) {
        diffType = '网页版缺少内容';
    } else if (additions.length > 0 && deletions.length > 0) {
        diffType = '内容被改写/修改';
    } else {
        diffType = '其他';
    }

    return { type: diffType, webStart, pdfStart, webText, pdfText, additions, deletions };
}

/**
 * Check if two texts are substantively the same (ignoring formatting).
 */
function isSubstantivelySame(text1, text2) {
    const norm = (t) => {
        return t.replace(/\s+/g, ' ').trim()
            .replace(/\|\s*-+\s*\|/g, '|---|');
    };
    return norm(text1) === norm(text2);
}

/**
 * Analyze differences between a pair of files.
 */
function analyzeDifferences(webPath, pdfPath, filename) {
    const webText = fs.readFileSync(webPath, 'utf-8');
    const pdfText = fs.readFileSync(pdfPath, 'utf-8');

    const webNorm = normalizeText(webText);
    const pdfNorm = normalizeText(pdfText);

    // If normalized texts are identical, no significant differences
    if (webNorm === pdfNorm) return null;

    const webParas = extractParagraphs(webText);
    const pdfParas = extractParagraphs(pdfText);

    // Detect table format issues
    const tableIssues = detectTableIssues(webText, pdfText);

    // Use line-level diff on normalized text
    const diffResult = diffLines(pdfNorm, webNorm);

    // Parse diff result into blocks
    const blocks = [];
    let currentBlock = null;

    for (const part of diffResult) {
        if (part.added || part.removed) {
            // Create a fake unified-diff-like block
            if (!currentBlock) {
                currentBlock = ['@@ -0 +0 @@'];
            }
            const prefix = part.added ? '+' : '-';
            const lines = part.value.split('\n');
            for (const line of lines) {
                if (line.length > 0) {
                    currentBlock.push(prefix + line);
                }
            }
        } else if (currentBlock) {
            blocks.push(currentBlock);
            currentBlock = null;
        }
    }
    if (currentBlock) blocks.push(currentBlock);

    // Analyze each block
    const significantDiffs = [];

    for (const block of blocks) {
        if (isFormattingOnly(block)) continue;

        const info = classifyDiff(block);

        // Skip very small differences (< 15 chars of content change)
        const webContent = info.webText.trim();
        const pdfContent = info.pdfText.trim();
        const totalChars = webContent.length + pdfContent.length;

        if (totalChars < 15) {
            const webClean = webContent.replace(/\s+/g, '').replace(/[，。、；：！？""''（）【】\[\]{}《》\.,;:!?\(\)\[\]\{\}]/g, '');
            const pdfClean = pdfContent.replace(/\s+/g, '').replace(/[，。、；：！？""''（）【】\[\]{}《》\.,;:!?\(\)\[\]\{\}]/g, '');
            if (webClean === pdfClean) continue;
        }

        significantDiffs.push(info);
    }

    if (significantDiffs.length === 0 && tableIssues.length === 0) return null;

    const webLineCount = webNorm.split('\n').length;
    const pdfLineCount = pdfNorm.split('\n').length;

    return {
        filename,
        diffs: significantDiffs,
        tableIssues,
        webLineCount,
        pdfLineCount,
        webParaCount: webParas.length,
        pdfParaCount: pdfParas.length,
    };
}

/**
 * Generate the markdown report.
 */
function generateReport(results, missingInPdf) {
    const allFiles = getArticlesFiles();
    const total = allFiles.length;
    const matched = total - missingInPdf.length;
    const hasDiff = results.length;
    const noDiff = matched - hasDiff;

    const lines = [];

    lines.push('# 文章差异扫描报告');
    lines.push('');
    lines.push('## 差异汇总');
    lines.push(`- **扫描时间**: 2026-06-30`);
    lines.push(`- **文章目录**: \`content/articles/\` (${total} 个文件)`);
    lines.push(`- **对照目录**: \`content/pdf-documents-formatted/\``);
    lines.push(`- **成功匹配文件数**: ${matched}`);
    lines.push(`- **有差异文件数**: ${hasDiff}`);
    lines.push(`- **无差异文件数**: ${noDiff}`);
    lines.push(`- **缺失对应PDF文件数**: ${missingInPdf.length}`);
    if (missingInPdf.length > 0) {
        lines.push('');
        lines.push('**在 articles 中存在但 pdf-documents-formatted 中缺失的文件**:');
        for (const mf of missingInPdf.sort()) {
            lines.push(`  - \`${mf}\``);
        }
    }
    lines.push('');
    lines.push('## 差异详情');
    lines.push('');

    for (const result of results) {
        const { filename, diffs, tableIssues } = result;

        lines.push(`### ${filename}`);
        lines.push('');

        // Determine primary difference type
        const diffTypes = new Set(diffs.map(d => d.type));
        const typeLabels = [];
        if (diffTypes.has('网页版多出内容')) typeLabels.push('多出内容');
        if (diffTypes.has('网页版缺少内容')) typeLabels.push('缺少内容');
        if (diffTypes.has('内容被改写/修改')) typeLabels.push('内容被改写');
        if (tableIssues && tableIssues.length > 0) {
            for (const ti of tableIssues) typeLabels.push(ti);
        }
        if (typeLabels.length === 0) typeLabels.push('其他格式差异');

        lines.push(`**差异类型**: ${typeLabels.join('；')}`);
        lines.push('');
        lines.push(`**文章段落数**: ${result.webParaCount} | **PDF段落数**: ${result.pdfParaCount}`);
        lines.push('');

        for (let i = 0; i < diffs.length; i++) {
            const diff = diffs[i];
            lines.push(`#### 差异块 ${i + 1}`);
            lines.push('');
            lines.push(`**差异类型**: ${diff.type}`);
            if (diff.webStart > 0) lines.push(`**文章版大约位置**: 第${diff.webStart}行附近`);
            if (diff.pdfStart > 0) lines.push(`**PDF版大约位置**: 第${diff.pdfStart}行附近`);
            lines.push('');

            if (diff.type === '网页版多出内容' && diff.webText) {
                lines.push('**文章版多出的内容**:');
                const excerpt = diff.webText.slice(0, 500);
                lines.push('  ```');
                lines.push(`  ${excerpt}`);
                if (diff.webText.length > 500) lines.push('  ...(内容截断)');
                lines.push('  ```');
                lines.push('**建议处理**: 确认是否为额外编者分析，若是则删除或标注');
                lines.push('');
            } else if (diff.type === '网页版缺少内容' && diff.pdfText) {
                lines.push('**文章版缺少的内容（PDF版存在）**:');
                const excerpt = diff.pdfText.slice(0, 500);
                lines.push('  ```');
                lines.push(`  ${excerpt}`);
                if (diff.pdfText.length > 500) lines.push('  ...(内容截断)');
                lines.push('  ```');
                lines.push('**建议处理**: 补充缺失内容');
                lines.push('');
            } else if (diff.type === '内容被改写/修改') {
                if (diff.pdfText) {
                    lines.push('**PDF版原文**:');
                    lines.push('  ```');
                    lines.push(`  ${diff.pdfText.slice(0, 300)}`);
                    if (diff.pdfText.length > 300) lines.push('  ...(内容截断)');
                    lines.push('  ```');
                }
                if (diff.webText) {
                    lines.push('**文章版改写成**:');
                    lines.push('  ```');
                    lines.push(`  ${diff.webText.slice(0, 300)}`);
                    if (diff.webText.length > 300) lines.push('  ...(内容截断)');
                    lines.push('  ```');
                }
                if (diff.webText.length < diff.pdfText.length * 0.5) {
                    lines.push('**建议处理**: 疑似摘要化，建议核对并恢复原文');
                } else {
                    lines.push('**建议处理**: 核对内容准确性');
                }
                lines.push('');
            }
        }

        if (tableIssues && tableIssues.length > 0) {
            lines.push('#### 表格格式问题');
            lines.push('');
            for (const ti of tableIssues) {
                lines.push(`- ${ti}`);
            }
            lines.push('');
        }

        lines.push('---');
        lines.push('');
    }

    return lines.join('\n');
}

function main() {
    const articlesFiles = getArticlesFiles();
    console.log(`Found ${articlesFiles.length} article files`);

    const results = [];
    const missingInPdf = [];

    for (let i = 0; i < articlesFiles.length; i++) {
        const af = articlesFiles[i];
        const pdfPath = path.join(PDF_DIR, af);

        if (!fs.existsSync(pdfPath)) {
            missingInPdf.push(af);
            console.log(`[${i + 1}/${articlesFiles.length}] ${af} -> 缺失对应PDF文件`);
            continue;
        }

        process.stdout.write(`[${i + 1}/${articlesFiles.length}] Comparing ${af}... `);

        try {
            const webPath = path.join(ARTICLES_DIR, af);
            const result = analyzeDifferences(webPath, pdfPath, af);
            if (result) {
                results.push(result);
                const diffCount = result.diffs.length;
                const tableCount = (result.tableIssues || []).length;
                console.log(`✓ 发现 ${diffCount} 处内容差异, ${tableCount} 个表格问题`);
            } else {
                console.log('✓ 无显著差异');
            }
        } catch (e) {
            console.log(`✗ 错误: ${e.message}`);
        }
    }

    results.sort((a, b) => a.filename.localeCompare(b.filename));

    const report = generateReport(results, missingInPdf);

    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(REPORT_PATH, report, 'utf-8');

    const matched = articlesFiles.length - missingInPdf.length;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`报告已生成: ${REPORT_PATH}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`文章总数: ${articlesFiles.length}`);
    console.log(`成功匹配: ${matched}`);
    console.log(`有差异文件: ${results.length}`);
    console.log(`无差异文件: ${matched - results.length}`);
    console.log(`缺失PDF文件: ${missingInPdf.length}`);
    if (missingInPdf.length > 0) {
        console.log('缺失列表:');
        for (const mf of missingInPdf.sort()) {
            console.log(`  - ${mf}`);
        }
    }
}

main();
