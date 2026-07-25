#!/usr/bin/env python3
"""Fix glued headings where body text immediately follows heading on same ## line."""
import os
import re

LETTERS_DIR = "content/letters"

# Pattern: short heading (2-15 Chinese chars, or 3-25 chars total) 
# immediately followed by sentence-start Chinese text
# We try to find the boundary by looking for common body-start markers

def split_glued_heading(line):
    """Try to split a glued ## heading line into heading + body."""
    # Remove ## prefix
    text = line[3:].strip()
    
    # Try to find a good split point
    # Common: heading is usually 2-10 Chinese chars followed by sentence-like text
    # Body starts often with: 数字, 这, 正, 如, 下, 现, 去, 今, 昨, 在, 到, 我, 伯, 说, 无, 全, 都, 尽, 虽, 从, 那, 公, 它, 一, 是
    
    # Try splitting at positions where a common body-start word appears
    body_starters = [
        '盖可保险', '柯比吸尘器', '波仙珠宝', '内布拉斯加',
        '伯克希尔', '正如', '1973', '1979', '1984', '1989', '1993', '1999', 
        '2001', '2003', '2005', '2008', '2010', '2024', '2020',
        '去年', '今年', '现在', '在我', '这是', '下表', '以下',
        '到今', '这将', '无论', '尽管', '说到', '全部', '都不',
        '不采用', '跟以'
    ]
    
    for starter in body_starters:
        idx = text.find(starter)
        if idx > 1:  # heading must be at least 2 chars
            heading = text[:idx].strip()
            body = text[idx:].strip()
            # Heading should be relatively short
            if 2 <= len(heading) <= 25:
                return f'## {heading}\n\n{body}'
    
    return None

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    lines = content.split('\n')
    modified = False
    
    for i, line in enumerate(lines):
        if line.startswith('## ') and len(line) > 25:
            fixed = split_glued_heading(line)
            if fixed:
                lines[i] = fixed
                modified = True
    
    if modified:
        new_content = '\n'.join(lines)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

if __name__ == '__main__':
    fixed = 0
    for fname in sorted(os.listdir(LETTERS_DIR)):
        if fname.endswith('.md'):
            fpath = os.path.join(LETTERS_DIR, fname)
            if fix_file(fpath):
                print(f"Fixed glued headings in: {fname}")
                fixed += 1
    print(f"\nTotal files with glued headings fixed: {fixed}")
