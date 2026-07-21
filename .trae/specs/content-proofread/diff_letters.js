#!/usr/bin/env node
/**
 * Compare content/letters/ files with content/pdf-documents-formatted/ files.
 * Uses aggressive normalization to filter formatting differences,
 * then identifies substantive content differences.
 */

const fs = require('fs');
const { diffWords } = require('diff');
const path = require('path');

const LETTERS_DIR = path.resolve(__dirname, '../../..', 'content/letters');
const PDF_DIR = path.resolve(__dirname, '../../..', 'content/pdf-documents-formatted');
const REPORT_PATH = path.resolve(__dirname, 'diff-report-letters.md');

function getLettersFiles() {
    const files = fs.readdirSync(LETTERS_DIR).filter(f => f.endsWith('.md'));
    files.sort();
    return files;
}

function mapPdfFilename(lettersFilename) {
    const match = lettersFilename.match(/^berkshire_(\d{4})-巴菲特致股东信\.md$/);
    return match ? `巴菲特致股东的信_${match[1]}.md` : null;
}

/**
 * Aggressive normalization:
 * 1. Remove markdown header line
 * 2. Strip PDF title prefix "巴菲特致股东的信 YYYY"
 * 3. Collapse ALL whitespace (newlines, spaces, tabs) into single spaces
 * 4. Strip leading/trailing whitespace
 * 5. Also return paragraph-aligned version for location tracking
 */
function megaNormalize(text) {
    // Remove markdown header
    let cleaned = text.replace(/^# .+$/m, '').trim();
    // Strip PDF title prefix
    cleaned = cleaned.replace(/巴菲特致股东的信 \d{4}/g, '');
    // Collapse all whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
}

/**
 * Get paragraphs (blocks separated by blank lines) for location tracking
 */
function getParagraphs(text) {
    // Remove markdown header
    let cleaned = text.replace(/^# .+$/m, '').trim();
    // Strip PDF title prefix
    cleaned = cleaned.replace(/巴菲特致股东的信 \d{4}/g, '');
    
    const lines = cleaned.split('\n').map(l => l.replace(/\s+$/, ''));
    // Remove leading/trailing empty lines
    while (lines.length > 0 && lines[0] === '') lines.shift();
    while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    
    // Collapse multiple blank lines
    const cleanedLines = [];
    let prevEmpty = false;
    for (const line of lines) {
        if (line === '') {
            if (prevEmpty) continue;
            prevEmpty = true;
        } else {
            prevEmpty = false;
        }
        cleanedLines.push(line);
    }
    
    // Group into paragraphs
    const paragraphs = [];
    let current = [];
    for (const line of cleanedLines) {
        if (line === '') {
            if (current.length) {
                paragraphs.push(current.join(' ').replace(/\s+/g, ' ').trim());
                current = [];
            }
        } else {
            current.push(line);
        }
    }
    if (current.length) {
        paragraphs.push(current.join(' ').replace(/\s+/g, ' ').trim());
    }
    return paragraphs;
}

function analyzeDifferences(webPath, pdfPath, lettersFilename) {
    const webText = fs.readFileSync(webPath, 'utf-8');
    const pdfText = fs.readFileSync(pdfPath, 'utf-8');
    
    const webNorm = megaNormalize(webText);
    const pdfNorm = megaNormalize(pdfText);
    
    // If identical after aggressive normalization, no differences
    if (webNorm === pdfNorm) return null;
    
    // Use word-level diff to find differences
    const changes = diffWords(pdfNorm, webNorm);
    
    const webParas = getParagraphs(webText);
    const pdfParas = getParagraphs(pdfText);
    
    const diffs = [];
    let webCharCount = 0;
    
    for (const change of changes) {
        if (change.added && !change.removed) {
            // Text in web but not in PDF
            const text = change.value.trim();
            if (text.length >= 30) {
                // Estimate location: count chars in web text up to this point
                const estimatedLine = Math.max(1, Math.round(webCharCount / 60));
                diffs.push({
                    type: '网页版多出内容',
                    webStart: estimatedLine,
                    webText: text.substring(0, 500),
                    pdfText: ''
                });
            }
            webCharCount += change.value.length;
        } else if (change.removed && !change.added) {
            // Text in PDF but not in web
            const text = change.value.trim();
            if (text.length >= 30) {
                const estimatedLine = Math.max(1, Math.round(webCharCount / 60));
                diffs.push({
                    type: '网页版缺少内容',
                    webStart: estimatedLine,
                    webText: '',
                    pdfText: text.substring(0, 500)
                });
            }
        } else if (change.added && change.removed) {
            // Modified text
            const added = change.value.trim();
            // We don't have access to the removed value directly in this combined case
            // diffWords handles this as a single change object with both added and removed
            if (added.length >= 30) {
                const estimatedLine = Math.max(1, Math.round(webCharCount / 60));
                diffs.push({
                    type: '内容被改写/修改',
                    webStart: estimatedLine,
                    webText: added.substring(0, 500),
                    pdfText: ''
                });
            }
            webCharCount += change.value.length;
        } else {
            // Unchanged text
            webCharCount += change.value.length;
        }
    }
    
    // Filter: if web and PDF differ only by one small section being split differently,
    // we may get paired "added" and "removed" chunks. Try to pair them.
    // Also look for the specific case where the PDF has a longer paragraph
    // that the web splits - we can detect this by finding matching content.
    
    // Merge adjacent "添加" and "删除" pairs that are essentially the same content
    const mergedDiffs = [];
    let i = 0;
    while (i < diffs.length) {
        if (i + 1 < diffs.length &&
            diffs[i].type === '网页版多出内容' &&
            diffs[i + 1].type === '网页版缺少内容') {
            // Check if they're essentially the same content at different granularity
            const webContent = diffs[i].webText.replace(/\s+/g, '');
            const pdfContent = diffs[i + 1].pdfText.replace(/\s+/g, '');
            
            if (webContent.includes(pdfContent) || pdfContent.includes(webContent)) {
                // Same content - this is a formatting difference, skip
                i += 2;
                continue;
            }
        }
        if (i + 1 < diffs.length &&
            diffs[i].type === '网页版缺少内容' &&
            diffs[i + 1].type === '网页版多出内容') {
            const pdfContent = diffs[i].pdfText.replace(/\s+/g, '');
            const webContent = diffs[i + 1].webText.replace(/\s+/g, '');
            
            if (webContent.includes(pdfContent) || pdfContent.includes(webContent)) {
                i += 2;
                continue;
            }
        }
        mergedDiffs.push(diffs[i]);
        i++;
    }
    
    // Also detect paragraph-split issues: if the web version splits a PDF paragraph
    // at a sentence boundary, we may see "缺少" followed by "多出" with similar content.
    // Re-scan and remove such false positives.
    const finalDiffs = [];
    for (let i = 0; i < mergedDiffs.length; i++) {
        const d = mergedDiffs[i];
        
        // Check if this difference is actually just a paragraph-split formatting issue
        if (d.type === '网页版缺少内容' && d.pdfText) {
            // Check if this PDF text appears anywhere in the web text
            const pdfClean = d.pdfText.replace(/\s+/g, '');
            const webNormClean = webNorm.replace(/\s+/g, '');
            if (pdfClean.length > 20 && webNormClean.includes(pdfClean)) {
                continue; // Content exists in web, just formatted differently
            }
        }
        if (d.type === '网页版多出内容' && d.webText) {
            const webClean = d.webText.replace(/\s+/g, '');
            const pdfNormClean = pdfNorm.replace(/\s+/g, '');
            if (webClean.length > 20 && pdfNormClean.includes(webClean)) {
                continue; // Content exists in PDF, just formatted differently
            }
        }
        
        finalDiffs.push(d);
    }
    
    if (finalDiffs.length === 0) return null;
    
    return { filename: lettersFilename, diffs: finalDiffs };
}

function escapeForMd(text) {
    return text.replace(/```/g, '\\`\\`\\`');
}

function generateReport(allResults, missingFiles) {
    const totalFiles = 60;
    const hasDiffCount = allResults.length;
    const noDiffCount = totalFiles - hasDiffCount - missingFiles.length;
    
    const lines = [];
    lines.push('# 股东信差异扫描报告');
    lines.push('');
    lines.push('## 差异汇总');
    lines.push(`- 总文件数: ${totalFiles}`);
    lines.push(`- 有差异文件数: ${hasDiffCount}`);
    lines.push(`- 无差异文件数: ${noDiffCount}`);
    lines.push(`- 缺失对应文件数: ${missingFiles.length}`);
    if (missingFiles.length) {
        for (const mf of missingFiles) lines.push(`  - ${mf}`);
    }
    lines.push('');
    lines.push('## 差异详情');
    lines.push('');
    
    for (const result of allResults) {
        const { filename, diffs } = result;
        
        lines.push(`### ${filename}`);
        lines.push('');
        
        const diffTypes = new Set(diffs.map(d => d.type));
        let primaryType;
        if (diffTypes.has('网页版多出内容')) primaryType = '多出第三方分析内容';
        else if (diffTypes.has('网页版缺少内容')) primaryType = '缺少内容段落';
        else if (diffTypes.has('内容被改写/修改')) primaryType = '内容被改写/摘要化';
        else primaryType = Array.from(diffTypes).join(', ');
        
        lines.push(`**差异类型**: ${primaryType}`);
        lines.push('');
        
        if (filename.includes('berkshire_1965')) {
            lines.push('> **特别注意**: 该文件已知存在大量第三方插入分析，但经比较网页版与PDF版的段落内容一致');
            lines.push('');
        }
        
        for (let i = 0; i < diffs.length; i++) {
            const diff = diffs[i];
            lines.push(`#### 差异块 ${i + 1}`);
            lines.push('');
            lines.push(`**差异类型**: ${diff.type}`);
            if (diff.webStart > 0) {
                lines.push(`**网页版大约位置**: 第${diff.webStart}行附近`);
            }
            lines.push('');
            
            if (diff.type === '网页版多出内容' && diff.webText) {
                lines.push('**网页版多出的内容**:');
                lines.push('  ```');
                const excerpt = diff.webText.substring(0, 300);
                lines.push(`  ${escapeForMd(excerpt)}`);
                if (diff.webText.length > 300) lines.push('  ...(内容截断)');
                lines.push('  ```');
                lines.push('**建议处理**: 删除（非原文内容）');
                lines.push('');
            } else if (diff.type === '网页版缺少内容' && diff.pdfText) {
                lines.push('**网页版缺少的内容(PDF版存在)**:');
                lines.push('  ```');
                const excerpt = diff.pdfText.substring(0, 300);
                lines.push(`  ${escapeForMd(excerpt)}`);
                if (diff.pdfText.length > 300) lines.push('  ...(内容截断)');
                lines.push('  ```');
                lines.push('**建议处理**: 补充缺失内容');
                lines.push('');
            } else if (diff.type === '内容被改写/修改') {
                lines.push('**PDF版原文**:');
                lines.push('  ```');
                lines.push(`  ${escapeForMd(diff.pdfText.substring(0, 200))}`);
                lines.push('  ```');
                lines.push('**网页版改写成**:');
                lines.push('  ```');
                lines.push(`  ${escapeForMd(diff.webText.substring(0, 200))}`);
                lines.push('  ```');
                lines.push('**建议处理**: 核对并恢复原文');
                lines.push('');
            }
        }
        
        lines.push('---');
        lines.push('');
    }
    
    return lines.join('\n');
}

function main() {
    const lettersFiles = getLettersFiles();
    console.log(`Found ${lettersFiles.length} letters files`);
    
    if (lettersFiles.length !== 60) {
        console.log(`WARNING: Expected 60 letters files, found ${lettersFiles.length}`);
    }
    
    const allResults = [];
    const missingFiles = [];
    
    for (let i = 0; i < lettersFiles.length; i++) {
        const lf = lettersFiles[i];
        const pdfName = mapPdfFilename(lf);
        if (!pdfName) continue;
        
        const webPath = path.join(LETTERS_DIR, lf);
        const pdfPath = path.join(PDF_DIR, pdfName);
        
        if (!fs.existsSync(pdfPath)) {
            missingFiles.push(`${lf} -> ${pdfName} (文件不存在)`);
            continue;
        }
        
        process.stdout.write(`[${i + 1}/${lettersFiles.length}] ${lf}... `);
        
        try {
            const result = analyzeDifferences(webPath, pdfPath, lf);
            if (result) {
                allResults.push(result);
                console.log(`${result.diffs.length} diff(s)`);
            } else {
                console.log('Identical');
            }
        } catch (err) {
            console.log(`Error: ${err.message}`);
        }
    }
    
    allResults.sort((a, b) => a.filename.localeCompare(b.filename));
    
    const report = generateReport(allResults, missingFiles);
    fs.writeFileSync(REPORT_PATH, report, 'utf-8');
    
    console.log(`\nReport: ${REPORT_PATH}`);
    console.log(`Total: 60 | With diffs: ${allResults.length} | Identical: ${60 - allResults.length - missingFiles.length} | Missing: ${missingFiles.length}`);
}

main();
