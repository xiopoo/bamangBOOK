#!/usr/bin/env python3
"""Fix truncated and glued headings in Berkshire letters."""

import os
import re

LETTERS_DIR = "content/letters"

def fix_file(filepath):
    """Apply fixes to a single file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    lines = content.split('\n')
    
    # Collect all ## heading line indices
    h2_lines = []
    for i, line in enumerate(lines):
        if re.match(r'^## ', line):
            h2_lines.append(i)
    
    # Process each heading and its following body text
    # We need to work from bottom to top to preserve indices
    replacements = []  # (start_idx, old_lines, new_lines)
    
    for i in h2_lines:
        heading_line = lines[i]
        heading_text = heading_line[3:].strip()  # Text after "## "
        
        # Find the body text that follows this heading
        # Skip blank lines
        body_start = i + 1
        while body_start < len(lines) and lines[body_start].strip() == '':
            body_start += 1
        
        if body_start >= len(lines):
            continue
        
        body_line = lines[body_start]
        body_text = body_line.strip()
        
        # Check if heading seems truncated (ends without a proper ending)
        # If the next non-empty line is short and doesn't look like a full sentence start,
        # it might be the remainder of the heading
        
        # Case 1: Heading is truncated, next line continues the heading
        # e.g. "## 伯克希" → next line "尔·哈撒韦再保险集团"
        if len(body_text) < 50 and not body_text.startswith(('这是', '以下', '我们', '首先', '现在', '下表', '自从', '今年', '去年', '各位', '所有', '查理', '先来', '绝', '已经', '位于', '在')):
            # Check if the body text looks like a continuation of the heading
            # (no sentence-level punctuation at start)
            if not re.match(r'^[，。！？、；：""''（）《》\s]', body_text):
                # This is likely a truncated heading continuation
                full_heading = heading_text + body_text
                lines[i] = f'## {full_heading}'
                lines[body_start] = ''
                if body_start < len(lines):
                    # Find the next non-empty line after body_start for actual body text
                    next_body = body_start + 1
                    while next_body < len(lines) and lines[next_body].strip() == '':
                        next_body += 1
                    if next_body < len(lines):
                        lines[body_start] = lines[next_body]
                        lines[next_body] = ''
                continue
    
    # Reconstruct and write
    new_content = '\n'.join(lines)
    
    if new_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {filepath}")
        return True
    return False

if __name__ == '__main__':
    fixed_count = 0
    for fname in sorted(os.listdir(LETTERS_DIR)):
        if fname.endswith('.md'):
            fpath = os.path.join(LETTERS_DIR, fname)
            if fix_file(fpath):
                fixed_count += 1
    print(f"\nTotal files fixed: {fixed_count}")
