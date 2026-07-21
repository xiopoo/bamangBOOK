#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Compare content/letters/ files with content/pdf-documents-formatted/ files
and generate a difference report.
"""

import os
import re
import difflib
import sys

LETTERS_DIR = r"c:\Users\小囤囤\Documents\trae_projects\bamangBOOK\content\letters"
PDF_DIR = r"c:\Users\小囤囤\Documents\trae_projects\bamangBOOK\content\pdf-documents-formatted"
REPORT_PATH = r"c:\Users\小囤囤\Documents\trae_projects\bamangBOOK\.trae\specs\content-proofread\diff-report-letters.md"


def get_letters_files():
    """Get all letters files sorted by year."""
    files = [f for f in os.listdir(LETTERS_DIR) if f.endswith('.md')]
    files.sort()
    return files


def map_pdf_filename(letters_filename):
    """
    Map letters filename to PDF filename.
    berkshire_YYYY-巴菲特致股东信.md -> 巴菲特致股东的信_YYYY.md
    """
    match = re.match(r'berkshire_(\d{4})-巴菲特致股东信\.md', letters_filename)
    if match:
        year = match.group(1)
        return f"巴菲特致股东的信_{year}.md"
    return None


def normalize_text(text):
    """
    Normalize text for comparison: 
    - Remove leading/trailing whitespace per line
    - Collapse multiple blank lines into one
    - Remove pure whitespace-only lines
    """
    lines = text.split('\n')
    # Strip trailing whitespace from each line
    lines = [line.rstrip() for line in lines]
    # Remove leading empty lines
    while lines and lines[0] == '':
        lines.pop(0)
    # Remove trailing empty lines
    while lines and lines[-1] == '':
        lines.pop()
    # Collapse multiple consecutive empty lines to one
    result = []
    prev_empty = False
    for line in lines:
        if line == '':
            if prev_empty:
                continue
            prev_empty = True
        else:
            prev_empty = False
        result.append(line)
    return '\n'.join(result)


def classify_diff_block(block_lines, web_lines, pdf_lines):
    """
    Classify a diff block from unified diff output.
    Returns a dict with type, web_start, pdf_start, web_text, pdf_text.
    """
    web_additions = []
    pdf_additions = []
    
    for line in block_lines:
        if line.startswith('+') and not line.startswith('+++'):
            web_additions.append(line[1:])
        elif line.startswith('-') and not line.startswith('---'):
            pdf_additions.append(line[1:])
    
    # Check if we can determine line numbers from the diff header
    header_match = re.match(r'@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@', block_lines[0])
    if header_match:
        pdf_start = int(header_match.group(1))
        web_start = int(header_match.group(3))
    else:
        pdf_start = 0
        web_start = 0
    
    web_text = '\n'.join(web_additions)
    pdf_text = '\n'.join(pdf_additions)
    
    # Classify the type of difference
    if web_additions and not pdf_additions:
        diff_type = "网页版多出内容"
    elif pdf_additions and not web_additions:
        diff_type = "网页版缺少内容"
    elif web_additions and pdf_additions:
        # Both sides have changes - this is a modification
        diff_type = "内容被改写/修改"
    else:
        diff_type = "其他"
    
    return {
        'type': diff_type,
        'web_start': web_start,
        'web_text': web_text[:500],  # Truncate for report
        'pdf_text': pdf_text[:500],
        'web_additions': web_additions,
        'pdf_additions': pdf_additions,
    }


def is_purely_formatting_diff(block_lines):
    """
    Check if a diff block is purely formatting changes
    (whitespace, blank lines, etc.)
    """
    for line in block_lines:
        if line.startswith('+') and not line.startswith('+++'):
            stripped = line[1:].strip()
            if stripped:  # Has real content
                # Check if the same content exists as a deletion
                content = stripped
                found_match = False
                for line2 in block_lines:
                    if line2.startswith('-') and not line2.startswith('---'):
                        if line2[1:].strip() == content:
                            found_match = True
                            break
                if not found_match:
                    return False
        elif line.startswith('-') and not line.startswith('---'):
            stripped = line[1:].strip()
            if stripped:
                content = stripped
                found_match = False
                for line2 in block_lines:
                    if line2.startswith('+') and not line2.startswith('+++'):
                        if line2[1:].strip() == content:
                            found_match = True
                            break
                if not found_match:
                    return False
    return True


def extract_content_lines(text):
    """Extract non-empty, non-whitespace lines for comparison."""
    lines = text.split('\n')
    return [line for line in lines if line.strip()]


def analyze_differences(web_path, pdf_path, letters_filename):
    """
    Analyze differences between web version and PDF version.
    Returns structured difference information.
    """
    with open(web_path, 'r', encoding='utf-8') as f:
        web_text = f.read()
    with open(pdf_path, 'r', encoding='utf-8') as f:
        pdf_text = f.read()
    
    web_norm = normalize_text(web_text)
    pdf_norm = normalize_text(pdf_text)
    
    web_lines = web_norm.split('\n')
    pdf_lines = pdf_norm.split('\n')
    
    # If the normalized texts are identical, no substantial differences
    if web_norm == pdf_norm:
        return None
    
    # Use unified diff to identify differences
    diff = list(difflib.unified_diff(
        pdf_lines, web_lines,
        fromfile='PDF', tofile='Web',
        lineterm='',
        n=3  # Context lines
    ))
    
    if not diff:
        return None
    
    # Parse diff into blocks
    blocks = []
    current_block = None
    
    for line in diff:
        if line.startswith('@@'):
            if current_block:
                blocks.append(current_block)
            current_block = [line]
        elif current_block is not None:
            current_block.append(line)
    
    if current_block:
        blocks.append(current_block)
    
    # Analyze each block
    significant_diffs = []
    
    for block in blocks:
        # Check if purely formatting
        if is_purely_formatting_diff(block):
            continue
        
        info = classify_diff_block(block, web_lines, pdf_lines)
        
        # Skip very small differences (single word/character changes that are likely formatting)
        total_chars = len(info['web_text']) + len(info['pdf_text'])
        if total_chars < 20:
            # For very small diffs, check if it's just punctuation/whitespace difference
            web_clean = info['web_text'].strip()
            pdf_clean = info['pdf_text'].strip()
            if web_clean == pdf_clean:
                continue
        
        significant_diffs.append(info)
    
    if not significant_diffs:
        return None
    
    return {
        'filename': letters_filename,
        'diffs': significant_diffs,
        'web_line_count': len(web_lines),
        'pdf_line_count': len(pdf_lines),
    }


def generate_report(all_results, missing_files):
    """Generate the markdown report."""
    total_files = 60
    has_diff_count = len(all_results)
    no_diff_count = total_files - has_diff_count - len(missing_files)
    
    lines = []
    lines.append("# 股东信差异扫描报告")
    lines.append("")
    lines.append("## 差异汇总")
    lines.append(f"- 总文件数: {total_files}")
    lines.append(f"- 有差异文件数: {has_diff_count}")
    lines.append(f"- 无差异文件数: {no_diff_count}")
    lines.append(f"- 缺失对应文件数: {len(missing_files)}")
    if missing_files:
        for mf in missing_files:
            lines.append(f"  - {mf}")
    lines.append("")
    lines.append("## 差异详情")
    lines.append("")
    
    for result in all_results:
        filename = result['filename']
        diffs = result['diffs']
        
        lines.append(f"### {filename}")
        lines.append("")
        
        # Determine primary difference type
        diff_types = set(d['type'] for d in diffs)
        if '网页版多出内容' in diff_types:
            primary_type = "多出第三方分析内容"
        elif '网页版缺少内容' in diff_types:
            primary_type = "缺少内容段落"
        elif '内容被改写/修改' in diff_types:
            primary_type = "内容被改写/摘要化"
        else:
            primary_type = ", ".join(diff_types)
        
        lines.append(f"**差异类型**: {primary_type}")
        lines.append("")
        
        # Also flag 1965 specifically
        if 'berkshire_1965' in filename:
            lines.append("> **特别注意**: 该文件已知存在大量第三方插入分析")
            lines.append("")
        
        for i, diff in enumerate(diffs):
            lines.append(f"#### 差异块 {i+1}")
            lines.append("")
            lines.append(f"**差异类型**: {diff['type']}")
            
            if diff['web_start'] > 0:
                lines.append(f"**网页版大约位置**: 第{diff['web_start']}行附近")
            lines.append("")
            
            if diff['type'] == '网页版多出内容' and diff['web_text']:
                lines.append("**网页版多出的内容**:")
                lines.append("  ```")
                # Show a reasonable excerpt
                excerpt = diff['web_text'][:300]
                lines.append(f"  {excerpt}")
                if len(diff['web_text']) > 300:
                    lines.append("  ...(内容截断)")
                lines.append("  ```")
                lines.append("**建议处理**: 删除（非原文内容）" if '1965' in filename or len(diff['web_text']) > 100 else "")
                lines.append("")
            
            elif diff['type'] == '网页版缺少内容' and diff['pdf_text']:
                lines.append("**网页版缺少的内容(PDF版存在)** :")
                lines.append("  ```")
                excerpt = diff['pdf_text'][:300]
                lines.append(f"  {excerpt}")
                if len(diff['pdf_text']) > 300:
                    lines.append("  ...(内容截断)")
                lines.append("  ```")
                lines.append("**建议处理**: 补充缺失内容")
                lines.append("")
            
            elif diff['type'] == '内容被改写/修改':
                if diff['pdf_text']:
                    lines.append("**PDF版原文**:")
                    lines.append("  ```")
                    lines.append(f"  {diff['pdf_text'][:200]}")
                    lines.append("  ```")
                if diff['web_text']:
                    lines.append("**网页版改写成**:")
                    lines.append("  ```")
                    lines.append(f"  {diff['web_text'][:200]}")
                    lines.append("  ```")
                lines.append("**建议处理**: 核对并恢复原文" if len(diff['web_text']) < len(diff['pdf_text']) * 0.5 else "")
                lines.append("")
        
        lines.append("---")
        lines.append("")
    
    return '\n'.join(lines)


def main():
    letters_files = get_letters_files()
    print(f"Found {len(letters_files)} letters files")
    
    # Verify we have 60 files
    if len(letters_files) != 60:
        print(f"WARNING: Expected 60 letters files, found {len(letters_files)}")
    
    all_results = []
    missing_files = []
    
    for i, lf in enumerate(letters_files):
        pdf_name = map_pdf_filename(lf)
        if pdf_name is None:
            print(f"Skipping non-matching file: {lf}")
            continue
        
        web_path = os.path.join(LETTERS_DIR, lf)
        pdf_path = os.path.join(PDF_DIR, pdf_name)
        
        if not os.path.exists(pdf_path):
            missing_files.append(f"{lf} -> {pdf_name} (文件不存在)")
            continue
        
        print(f"[{i+1}/{len(letters_files)}] Comparing {lf} <-> {pdf_name}...", end=" ")
        
        try:
            result = analyze_differences(web_path, pdf_path, lf)
            if result:
                all_results.append(result)
                diff_count = len(result['diffs'])
                print(f"FOUND {diff_count} difference(s)")
            else:
                print("No significant differences")
        except Exception as e:
            print(f"Error: {e}")
    
    # Sort results: 1965 first, then by year
    all_results.sort(key=lambda r: r['filename'])
    
    # Generate report
    report = generate_report(all_results, missing_files)
    
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nReport generated: {REPORT_PATH}")
    print(f"Total files: 60")
    print(f"Files with differences: {len(all_results)}")
    print(f"Files without differences: {60 - len(all_results) - len(missing_files)}")
    print(f"Missing PDF files: {len(missing_files)}")


if __name__ == '__main__':
    main()
