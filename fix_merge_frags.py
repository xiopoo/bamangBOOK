"""Fix split headings: merge title fragments back"""
import os, re

CONTENT = 'content'
fixed = 0

for root, dirs, files in os.walk(CONTENT):
    dirs[:] = [d for d in dirs if d not in {'graph','indexes','paths','data'}]
    for fn in files:
        if not fn.endswith('.md'):
            continue
        fp = os.path.join(root, fn)
        with open(fp) as f:
            c = f.read()
        orig = c
        
        # Merge: '## 一、1960\n\n年股市的整体情况' -> '## 一、1960年股市的整体情况'
        c = re.sub(r'^(## [^\n]{2,25})\n\n(年[^\n]{2,80})$', r'\1\2', c, flags=re.MULTILINE)
        
        # Merge: '## 一、1960\n\n年的业绩' -> '## 一、1960年的业绩'
        c = re.sub(r'^(## [^\n]{2,25})\n\n(年的[^\n]{2,80})$', r'\1\2', c, flags=re.MULTILINE)
        
        # Merge heading fragments: '## 典型案例为了让各位\n\n更清楚地了解' -> merge
        # Pattern: ## heading_with_body\n\ncontinuation
        c = re.sub(r'^(## [^\n]{3,40})\n\n(更[^\n]{2,80})$', r'\1\2', c, flags=re.MULTILINE)
        
        if c != orig:
            with open(fp, 'w') as f:
                f.write(c)
            fixed += 1

print(f'{fixed} files fixed')
