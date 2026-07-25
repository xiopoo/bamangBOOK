#!/usr/bin/env python3
"""Fix ## headings embedded within body paragraphs."""
import os
import re

LETTERS_DIR = "content/letters"

def fix_embedded_headings(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix pattern: body text followed by ## heading (with or without blank lines in between)
    # This handles: "text.## heading" -> "text.\n\n## heading"
    # We need to be careful not to break intentional inline stuff
    
    # Replace cases where ## heading appears mid-line (after non-newline text)
    # Pattern: non-whitespace character followed by ## (not followed by another #)
    new_content = re.sub(r'(\S)\.?(## [^#\n][^\n]*)', r'\1\n\n\2', content)
    
    # Fix specific case: "* * *## heading" -> "* * *\n\n## heading"
    new_content = re.sub(r'\* \* \*(## [^#\n][^\n]*)', r'* * *\n\n\1', new_content)
    
    if new_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

if __name__ == '__main__':
    fixed = 0
    for fname in sorted(os.listdir(LETTERS_DIR)):
        if fname.endswith('.md'):
            fpath = os.path.join(LETTERS_DIR, fname)
            if fix_embedded_headings(fpath):
                print(f"Fixed embedded headings in: {fname}")
                fixed += 1
    print(f"\nTotal files with embedded headings fixed: {fixed}")
