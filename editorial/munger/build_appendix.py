#!/usr/bin/env python3
"""Build the 芒格股东会讲话精选 appendix from 25 source files."""

import re
import os

BASE_DIR = "/Users/lucas/Documents/bamangB/bamangBOOK/editorial/munger"
OUTPUT_DIR = os.path.join(BASE_DIR, "manuscript", "附录")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "芒格之道_股东会讲话精选.md")

# 西科金融 files (1987-2010)
XIKE_YEARS = [1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1997, 1998, 1999, 2000, 2003, 2007, 2010]

# 每日期刊 files (2014-2022)
MEIRI_YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]


def clean_line(line):
    """Clean a single line of text, handling nested bracket artifacts."""
    # Repeat until no more changes (handles nested brackets like [outer [inner]{.italic} text]{.red})
    max_iterations = 10
    for _ in range(max_iterations):
        old = line
        # Replace [text]{.red} with just text
        line = re.sub(r'\[([^\]]+)\]\{\.red\}', r'\1', line)
        # Replace [text]{.italic} with just text
        line = re.sub(r'\[([^\]]+)\]\{\.italic\}', r'\1', line)
        # Replace [text]{.bold} with just text
        line = re.sub(r'\[([^\]]+)\]\{\.bold\}', r'\1', line)
        # Replace [text]{.bgred} with just text
        line = re.sub(r'\[([^\]]+)\]\{\.bgred\}', r'\1', line)
        # Replace [text]{.kaiti} with just text
        line = re.sub(r'\[([^\]]+)\]\{\.kaiti\}', r'\1', line)
        if line == old:
            break
    
    # Remove leftover standalone artifacts
    line = re.sub(r'\{\.image-single[^}]*\}', '', line)
    
    # Remove footnote artifacts like []{#chapter01.xhtml_note_1}
    line = re.sub(r'\[\]\{#chapter\d+\.xhtml_note_\d+\}', '', line)
    line = re.sub(r'\{\#chapter\d+\.xhtml_noteBack_\d+\}\^', '', line)
    line = re.sub(r'\{\#chapter\d+\.xhtml_note_\d+\}', '', line)
    
    # Remove chapter markers like []{#chapter02.xhtml}, []{#chapter17.xhtml}, []{#copyright.xhtml}, []{#part2.xhtml}
    line = re.sub(r'\[\]\{#chapter\d+\.xhtml\}', '', line)
    line = re.sub(r'\[\]\{#copyright\.xhtml\}', '', line)
    line = re.sub(r'\[\]\{#part\d+\.xhtml\}', '', line)
    line = re.sub(r'\[\]\{#index\.xhtml\}', '', line)
    
    # Remove inline footnote references like ^[\[1\]](#chapter01.xhtml_note_1)
    line = re.sub(r'\^\[\\\[\d+\\\]\]\(#chapter\d+\.xhtml_note_\d+\)', '', line)
    line = re.sub(r'\^\[\\\[\d+\\\]\]\(#chapter\d+\.xhtml_noteBack_\d+\)', '', line)
    
    # Remove XML artifacts
    line = re.sub(r'`<!--\?xml[^`]*-->`\{=html\}', '', line)
    line = re.sub(r'\{=html\}', '', line)
    
    # Remove image references
    if re.match(r'^\s*!\[.*\]\(.*\)', line):
        return None
    
    # Remove standalone ::: markers
    if re.match(r'^\s*:::\s*$', line):
        return None
    
    # Remove note lines inside image blocks (注1：...)
    if re.match(r'^\s*注\d+[：:]', line):
        return None
    
    return line


def process_file(filepath):
    """Process a single shareholder meeting file and return cleaned content."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    result_lines = []
    in_editor_note = False
    editor_note_content = []
    skip_until_next_section = False
    in_footnotes = False
    in_copyright = False
    skip_part2 = False  # Skip the 每日期刊 preamble in 2010 file
    in_index = False  # Skip the glossary/index section
    
    for line in lines:
        # Detect index/glossary section
        if re.match(r'^#\s*索引\s*$', line):
            in_index = True
            continue
        
        if in_index:
            continue
        
        # Detect part divider - skip everything after it (每日期刊 preamble in 2010 file)
        if re.match(r'^\s*\[\]\{#part2\.xhtml\}', line):
            skip_part2 = True
            continue
        
        if skip_part2:
            continue
        
        # Detect footnote section (after --- divider at end of file)
        if re.match(r'^\s*-{20,}\s*$', line):
            in_footnotes = True
            continue
        
        if in_footnotes:
            continue
        
        # Detect copyright section
        if re.match(r'^#\s*版权信息', line):
            in_copyright = True
            continue
        
        if in_copyright:
            continue
        
        # Detect image block start
        if re.match(r'^\s*:::\s*\{\.image-single', line):
            skip_until_next_section = True
            continue
        
        if skip_until_next_section:
            if re.match(r'^\s*:::\s*$', line):
                skip_until_next_section = False
            continue
        
        # Clean the line
        cleaned = clean_line(line)
        if cleaned is None:
            continue
        
        # Skip original # title lines (e.g., "# 1987年 西科金融股东会讲话")
        if re.match(r'^#\s*\d{4}年\s+(西科金融|每日期刊)股东会讲话', cleaned):
            continue
        
        # Skip empty lines that are just whitespace after cleaning
        if cleaned.strip() == '':
            result_lines.append('')
            continue
        
        # Handle ### 编者按 section
        if re.match(r'^###\s+编者按\s*$', cleaned):
            in_editor_note = True
            editor_note_content = []
            continue
        
        # Check if we're exiting editor note section (next ### or #### heading)
        if in_editor_note:
            if re.match(r'^#{2,4}\s+', cleaned) and not re.match(r'^###\s+编者按', cleaned):
                # End of editor note, flush it
                in_editor_note = False
                if editor_note_content:
                    content_start = 0
                    while content_start < len(editor_note_content) and editor_note_content[content_start].strip() == '':
                        content_start += 1
                    
                    if content_start < len(editor_note_content):
                        first_para = editor_note_content[content_start].strip()
                        result_lines.append(f'> **编者按**：{first_para}')
                        for para in editor_note_content[content_start + 1:]:
                            para = para.strip()
                            if para:
                                result_lines.append(f'> ')
                                result_lines.append(f'> {para}')
                    result_lines.append('')  # blank line after editor note
                # Process the current heading line
                result_lines.append(cleaned.rstrip())
                continue
            else:
                # Still in editor note, collect content
                editor_note_content.append(cleaned.rstrip())
                continue
        
        result_lines.append(cleaned.rstrip())
    
    # Handle case where editor note is at the end of file
    if in_editor_note and editor_note_content:
        content_start = 0
        while content_start < len(editor_note_content) and editor_note_content[content_start].strip() == '':
            content_start += 1
        if content_start < len(editor_note_content):
            first_para = editor_note_content[content_start].strip()
            result_lines.append(f'> **编者按**：{first_para}')
            for para in editor_note_content[content_start + 1:]:
                para = para.strip()
                if para:
                    result_lines.append(f'> ')
                    result_lines.append(f'> {para}')
    
    return result_lines


def collapse_blank_lines(lines):
    """Collapse multiple consecutive blank lines into at most 1."""
    result = []
    prev_blank = False
    for line in lines:
        is_blank = line.strip() == ''
        if is_blank and prev_blank:
            continue
        result.append(line)
        prev_blank = is_blank
    return result


def remove_trailing_metadata(lines):
    """Remove trailing metadata like 译者, ISBN, 出版时间, etc."""
    metadata_patterns = [
        r'^书名[：:]',
        r'^著者[：:]',
        r'^编者[：:]',
        r'^译者[：:]',
        r'^出版时间[：:]',
        r'^ISBN[：:]',
        r'^中信出版集团',
        r'^版权所有',
        r'^出版社[：:]',
    ]
    
    cutoff = len(lines)
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i].strip()
        for pat in metadata_patterns:
            if re.match(pat, line):
                cutoff = i
                break
        else:
            continue
        break
    
    while cutoff > 0 and lines[cutoff - 1].strip() == '':
        cutoff -= 1
    
    return lines[:cutoff]


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    output = []
    
    # Header
    output.append('# 附录：芒格股东会讲话精选（1987-2022）')
    output.append('')
    output.append('> 内容身份：芒格在西科金融（1987-2010）和每日期刊（2014-2022）股东会上的讲话，RanRan译，选自《芒格之道》（中信出版社，芒格书院编）。以下按年份保留芒格原话，编者按提供年度背景。')
    output.append('')
    
    # 上编：西科金融
    output.append('## 上编：西科金融股东会讲话（1987-2010）')
    output.append('')
    
    for year in XIKE_YEARS:
        filename = f"{year}_西科金融股东会讲话.md"
        filepath = os.path.join(BASE_DIR, filename)
        print(f"Processing: {filename}")
        
        if not os.path.exists(filepath):
            print(f"  WARNING: File not found: {filepath}")
            continue
        
        lines = process_file(filepath)
        lines = remove_trailing_metadata(lines)
        lines = collapse_blank_lines(lines)
        
        output.append(f'### {year}年')
        output.append('')
        output.extend(lines)
        output.append('')
        output.append('')
    
    # 下编：每日期刊
    output.append('## 下编：每日期刊股东会讲话（2014-2022）')
    output.append('')
    
    for year in MEIRI_YEARS:
        filename = f"{year}_每日期刊股东会讲话.md"
        filepath = os.path.join(BASE_DIR, filename)
        print(f"Processing: {filename}")
        
        if not os.path.exists(filepath):
            print(f"  WARNING: File not found: {filepath}")
            continue
        
        lines = process_file(filepath)
        lines = remove_trailing_metadata(lines)
        lines = collapse_blank_lines(lines)
        
        output.append(f'### {year}年')
        output.append('')
        output.extend(lines)
        output.append('')
        output.append('')
    
    # 来源说明
    output.append('## 来源说明')
    output.append('')
    output.append('本附录内容选自《芒格之道：查理·芒格股东会讲话 1987-2022》（中信出版社），RanRan译，芒格书院编。仅作内部研究参考。')
    
    # Write output
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))
    
    print(f"\nDone! Output written to: {OUTPUT_FILE}")
    print(f"Total lines: {len(output)}")


if __name__ == '__main__':
    main()