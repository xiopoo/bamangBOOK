#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Compare content/articles/ files with content/pdf-documents-formatted/ files
and generate a difference report.

Uses paragraph-level comparison (splitting by blank lines) to detect:
  - Extra content in articles version
  - Missing content in articles version
  - Rewritten/summarized content
  - Table format issues
"""

import os
import re
import difflib

ARTICLES_DIR = r"c:\Users\小囤囤\Documents\trae_projects\bamangBOOK\content\articles"
PDF_DIR = r"c:\Users\小囤囤\Documents\trae_projects\bamangBOOK\content\pdf-documents-formatted"
REPORT_PATH = r"c:\Users\小囤囤\Documents\trae_projects\bamangBOOK\.trae\specs\content-proofread\diff-report-articles.md"


def get_articles_files():
    """Get all articles .md files sorted by name."""
    files = [f for f in os.listdir(ARTICLES_DIR) if f.endswith('.md')]
    files.sort()
    return files


def normalize_text(text):
    """
    Normalize text for comparison:
    - Strip leading/trailing whitespace per line
    - Collapse multiple consecutive blank lines into one
    - Remove leading/trailing blank lines
    """
    lines = text.split('\n')
    lines = [line.rstrip() for line in lines]
    while lines and lines[0] == '':
        lines.pop(0)
    while lines and lines[-1] == '':
        lines.pop()
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


def is_substantive_diff(web_para, pdf_para):
    """
    Check if two paragraphs are substantively different (not just formatting).
    Returns True if there's a real content difference.
    """
    # Normalize both: strip whitespace, collapse internal spaces
    def normalize_para(p):
        p = re.sub(r'\s+', ' ', p).strip()
        # Remove markdown table formatting artifacts (extra pipes)
        p = re.sub(r'\|\s*\|\s*\|', '| | |', p)
        return p

    w_norm = normalize_para(web_para)
    p_norm = normalize_para(pdf_para)

    if w_norm == p_norm:
        return False

    # Check if the difference is only in table separators (| --- | vs |---|)
    w_no_table = re.sub(r'\|\s*-+\s*\|', '|---|', w_norm)
    p_no_table = re.sub(r'\|\s*-+\s*\|', '|---|', p_norm)
    if w_no_table == p_no_table:
        return False

    return True


def extract_paragraphs(text):
    """Split text into paragraphs (blocks separated by blank lines)."""
    # Normalize first
    text = normalize_text(text)
    # Split by blank lines (one or more empty lines)
    paragraphs = re.split(r'\n\s*\n', text)
    # Filter out empty paragraphs
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    return paragraphs


def detect_table_format_issues(web_text, pdf_text):
    """
    Detect table-specific format issues:
    - Repeated table headers
    - Misaligned table columns
    - Missing table separators
    Returns list of issue descriptions.
    """
    issues = []

    # Extract table blocks (lines starting with |)
    web_tables = []
    in_table = False
    current_table = []
    for line in web_text.split('\n'):
        stripped = line.strip()
        if stripped.startswith('|'):
            current_table.append(stripped)
            in_table = True
        else:
            if in_table and current_table:
                web_tables.append(current_table)
                current_table = []
            in_table = False
    if in_table and current_table:
        web_tables.append(current_table)

    pdf_tables = []
    in_table = False
    current_table = []
    for line in pdf_text.split('\n'):
        stripped = line.strip()
        if stripped.startswith('|'):
            current_table.append(stripped)
            in_table = True
        else:
            if in_table and current_table:
                pdf_tables.append(current_table)
                current_table = []
            in_table = False
    if in_table and current_table:
        pdf_tables.append(current_table)

    # Check for repeated headers in web tables
    for ti, table in enumerate(web_tables):
        if len(table) >= 4:
            # Check if first row (header) is repeated later
            header = table[0]
            repeat_count = sum(1 for row in table[1:] if row == header)
            if repeat_count >= 2:
                issues.append(f"表格 {ti+1}: 表头行被重复了 {repeat_count+1} 次")

    return issues


def classify_paragraph_diff(web_paras, pdf_paras, block_lines):
    """
    Classify a diff block into a specific type.
    """
    web_additions = []
    pdf_additions = []

    for line in block_lines:
        if line.startswith('+') and not line.startswith('+++'):
            web_additions.append(line[1:])
        elif line.startswith('-') and not line.startswith('---'):
            pdf_additions.append(line[1:])

    header_match = re.match(r'@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@', block_lines[0])
    if header_match:
        pdf_start = int(header_match.group(1))
        web_start = int(header_match.group(3))
    else:
        pdf_start = 0
        web_start = 0

    # Get paragraph-level context
    pdf_start_para = max(0, min(pdf_start - 1, len(pdf_paras) - 1))
    web_start_para = max(0, min(web_start - 1, len(web_paras) - 1))

    web_text = '\n'.join(web_additions)
    pdf_text = '\n'.join(pdf_additions)

    # Classify the type
    if web_additions and not pdf_additions:
        diff_type = "网页版多出内容"
    elif pdf_additions and not web_additions:
        diff_type = "网页版缺少内容"
    elif web_additions and pdf_additions:
        diff_type = "内容被改写/修改"
    else:
        diff_type = "其他"

    return {
        'type': diff_type,
        'web_start': web_start,
        'pdf_start': pdf_start,
        'web_text': web_text,
        'pdf_text': pdf_text,
        'web_additions': web_additions,
        'pdf_additions': pdf_additions,
    }


def is_purely_formatting_diff(block_lines):
    """
    Check if a diff block is purely formatting/whitespace changes.
    """
    additions = []
    deletions = []

    for line in block_lines:
        if line.startswith('+') and not line.startswith('+++'):
            additions.append(line[1:].strip())
        elif line.startswith('-') and not line.startswith('---'):
            deletions.append(line[1:].strip())

    # If all additions have a matching deletion (ignoring whitespace), it's formatting
    for a in additions:
        if a and a not in deletions:
            # Check if it's just a punctuation/space difference
            a_clean = re.sub(r'\s+', '', a)
            found = False
            for d in deletions:
                d_clean = re.sub(r'\s+', '', d)
                if a_clean == d_clean:
                    found = True
                    break
            if not found:
                return False
    return True


def analyze_differences(web_path, pdf_path, filename):
    """
    Analyze differences between articles version and PDF-documents-formatted version.
    """
    with open(web_path, 'r', encoding='utf-8') as f:
        web_text = f.read()
    with open(pdf_path, 'r', encoding='utf-8') as f:
        pdf_text = f.read()

    web_paras = extract_paragraphs(web_text)
    pdf_paras = extract_paragraphs(pdf_text)

    web_norm = normalize_text(web_text)
    pdf_norm = normalize_text(pdf_text)

    # If normalized texts are identical, no differences
    if web_norm == pdf_norm:
        return None

    # Detect table format issues
    table_issues = detect_table_format_issues(web_text, pdf_text)

    # Use unified diff at paragraph level
    # Convert paragraphs to lines for diff
    web_lines_for_diff = web_norm.split('\n')
    pdf_lines_for_diff = pdf_norm.split('\n')

    diff = list(difflib.unified_diff(
        pdf_lines_for_diff, web_lines_for_diff,
        fromfile='PDF', tofile='Articles',
        lineterm='',
        n=2  # Context lines
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
        if is_purely_formatting_diff(block):
            continue

        info = classify_paragraph_diff(web_paras, pdf_paras, block)

        # Skip very small differences (< 15 chars of actual content change)
        web_content = info['web_text'].strip()
        pdf_content = info['pdf_text'].strip()
        total_chars = len(web_content) + len(pdf_content)
        if total_chars < 15:
            # Check if it's just typo/punctuation fix
            web_clean = re.sub(r'\s+', '', web_content)
            pdf_clean = re.sub(r'\s+', '', pdf_content)
            # Also strip punctuation for comparison
            web_clean = re.sub(r'[，。、；：！？""''（）【】\[\]{}《》\.,;:!?\(\)\[\]\{\}]', '', web_clean)
            pdf_clean = re.sub(r'[，。、；：！？""''（）【】\[\]{}《》\.,;:!?\(\)\[\]\{\}]', '', pdf_clean)
            if web_clean == pdf_clean:
                continue

        significant_diffs.append(info)

    if not significant_diffs and not table_issues:
        return None

    web_line_count = len(web_norm.split('\n'))
    pdf_line_count = len(pdf_norm.split('\n'))

    return {
        'filename': filename,
        'diffs': significant_diffs,
        'table_issues': table_issues,
        'web_line_count': web_line_count,
        'pdf_line_count': pdf_line_count,
        'web_para_count': len(web_paras),
        'pdf_para_count': len(pdf_paras),
    }


def generate_report(all_results, missing_in_pdf, pdf_only_files):
    """Generate the markdown report."""
    total_articles = len(get_articles_files())
    has_diff_count = len(all_results)
    matched_count = total_articles - len(missing_in_pdf)
    no_diff_count = matched_count - has_diff_count

    lines = []
    lines.append("# 文章差异扫描报告")
    lines.append("")
    lines.append("## 差异汇总")
    lines.append(f"- **扫描时间**: 2026-06-30")
    lines.append(f"- **文章目录**: `content/articles/` ({total_articles} 个文件)")
    lines.append(f"- **对照目录**: `content/pdf-documents-formatted/`")
    lines.append(f"- **成功匹配文件数**: {matched_count}")
    lines.append(f"- **有差异文件数**: {has_diff_count}")
    lines.append(f"- **无差异文件数**: {no_diff_count}")
    lines.append(f"- **缺失对应PDF文件数**: {len(missing_in_pdf)}")
    if missing_in_pdf:
        lines.append("")
        lines.append("**在 articles 中存在但 pdf-documents-formatted 中缺失的文件**:")
        for mf in sorted(missing_in_pdf):
            lines.append(f"  - `{mf}`")
    lines.append("")
    lines.append("## 差异详情")
    lines.append("")

    for result in all_results:
        filename = result['filename']
        diffs = result['diffs']
        table_issues = result.get('table_issues', [])

        lines.append(f"### {filename}")
        lines.append("")

        # Determine primary difference type
        diff_types = set(d['type'] for d in diffs)
        type_labels = []
        if '网页版多出内容' in diff_types:
            type_labels.append("多出内容")
        if '网页版缺少内容' in diff_types:
            type_labels.append("缺少内容")
        if '内容被改写/修改' in diff_types:
            type_labels.append("内容被改写")
        if table_issues:
            type_labels.extend(table_issues)
        if not type_labels:
            type_labels.append("其他格式差异")

        primary_type = "；".join(type_labels)
        lines.append(f"**差异类型**: {primary_type}")
        lines.append("")
        lines.append(f"**文章段落数**: {result['web_para_count']} | **PDF段落数**: {result['pdf_para_count']}")
        lines.append("")

        for i, diff in enumerate(diffs):
            lines.append(f"#### 差异块 {i+1}")
            lines.append("")
            lines.append(f"**差异类型**: {diff['type']}")
            if diff['web_start'] > 0:
                lines.append(f"**文章版大约位置**: 第{diff['web_start']}行附近")
            if diff['pdf_start'] > 0:
                lines.append(f"**PDF版大约位置**: 第{diff['pdf_start']}行附近")
            lines.append("")

            if diff['type'] == '网页版多出内容' and diff['web_text']:
                lines.append("**文章版多出的内容**:")
                excerpt = diff['web_text'][:500]
                lines.append("  ```")
                lines.append(f"  {excerpt}")
                if len(diff['web_text']) > 500:
                    lines.append("  ...(内容截断)")
                lines.append("  ```")
                lines.append("**建议处理**: 确认是否为额外编者分析，若是则删除或标注")
                lines.append("")

            elif diff['type'] == '网页版缺少内容' and diff['pdf_text']:
                lines.append("**文章版缺少的内容（PDF版存在）**:")
                excerpt = diff['pdf_text'][:500]
                lines.append("  ```")
                lines.append(f"  {excerpt}")
                if len(diff['pdf_text']) > 500:
                    lines.append("  ...(内容截断)")
                lines.append("  ```")
                lines.append("**建议处理**: 补充缺失内容")
                lines.append("")

            elif diff['type'] == '内容被改写/修改':
                if diff['pdf_text']:
                    lines.append("**PDF版原文**:")
                    lines.append("  ```")
                    lines.append(f"  {diff['pdf_text'][:300]}")
                    if len(diff['pdf_text']) > 300:
                        lines.append("  ...(内容截断)")
                    lines.append("  ```")
                if diff['web_text']:
                    lines.append("**文章版改写成**:")
                    lines.append("  ```")
                    lines.append(f"  {diff['web_text'][:300]}")
                    if len(diff['web_text']) > 300:
                        lines.append("  ...(内容截断)")
                    lines.append("  ```")
                # Determine if it looks like summarization
                if len(diff['web_text']) < len(diff['pdf_text']) * 0.5:
                    lines.append("**建议处理**: 疑似摘要化，建议核对并恢复原文")
                else:
                    lines.append("**建议处理**: 核对内容准确性")
                lines.append("")

        # Also output table issues separately
        if table_issues:
            lines.append("#### 表格格式问题")
            lines.append("")
            for ti in table_issues:
                lines.append(f"- {ti}")
            lines.append("")

        lines.append("---")
        lines.append("")

    return '\n'.join(lines)


def main():
    articles_files = get_articles_files()
    total = len(articles_files)
    print(f"Found {total} article files in {ARTICLES_DIR}")

    all_results = []
    missing_in_pdf = []
    pdf_only_files = []

    # Also collect pdf files to find PDF-only files
    pdf_files = set(f for f in os.listdir(PDF_DIR) if f.endswith('.md'))
    article_files_set = set(articles_files)

    for i, af in enumerate(articles_files):
        pdf_path = os.path.join(PDF_DIR, af)

        if not os.path.exists(pdf_path):
            missing_in_pdf.append(af)
            print(f"[{i+1}/{total}] {af} -> 缺失对应PDF文件")
            continue

        print(f"[{i+1}/{total}] Comparing {af}...", end=" ", flush=True)

        try:
            web_path = os.path.join(ARTICLES_DIR, af)
            result = analyze_differences(web_path, pdf_path, af)
            if result:
                all_results.append(result)
                diff_count = len(result['diffs'])
                table_count = len(result.get('table_issues', []))
                print(f"✓ 发现 {diff_count} 处内容差异, {table_count} 个表格问题")
            else:
                print("✓ 无显著差异")
        except Exception as e:
            print(f"✗ 错误: {e}")

    # Sort results by filename
    all_results.sort(key=lambda r: r['filename'])

    # Generate report
    report = generate_report(all_results, missing_in_pdf, pdf_only_files)

    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(report)

    matched = total - len(missing_in_pdf)
    print(f"\n{'='*60}")
    print(f"报告已生成: {REPORT_PATH}")
    print(f"{'='*60}")
    print(f"文章总数: {total}")
    print(f"成功匹配: {matched}")
    print(f"有差异文件: {len(all_results)}")
    print(f"无差异文件: {matched - len(all_results)}")
    print(f"缺失PDF文件: {len(missing_in_pdf)}")
    if missing_in_pdf:
        print(f"缺失列表:")
        for mf in sorted(missing_in_pdf):
            print(f"  - {mf}")


if __name__ == '__main__':
    main()
