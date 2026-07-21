"""Comprehensive scan for content damage in all MD files"""
import os, re

CONTENT = 'content'
damaged = []
truncated = []  # files that seem truncated (end with heading)
merged_headings = []  # heading-body merged
short_files = []  # suspiciously short files

for root, dirs, files in os.walk(CONTENT):
    dirs[:] = [d for d in dirs if d not in {'graph','indexes','paths','data'}]
    for fn in files:
        if not fn.endswith('.md'):
            continue
        fp = os.path.join(root, fn)
        rel = os.path.relpath(fp, CONTENT)
        
        with open(fp, 'r') as f:
            content = f.read()
            lines = content.split('\n')
        
        # Strip trailing empty lines for accurate end-of-file check
        while lines and lines[-1].strip() == '':
            lines.pop()
        if not lines:
            short_files.append((rel, "文件为空"))
            continue
        
        char_count = len(content)
        
        # 1. Check if file ends with a heading (truncated)
        last_line = lines[-1].strip()
        if re.match(r'^#{1,4} ', last_line):
            truncated.append((rel, f"以标题结尾: '{last_line[:60]}'"))
            continue
        
        # 2. Check if a heading near the end has no content after it
        for i in range(len(lines) - 1, max(len(lines) - 8, -1), -1):
            if re.match(r'^#{1,4} ', lines[i].strip()):
                has_content_after = False
                for j in range(i + 1, len(lines)):
                    t = lines[j].strip()
                    if t and not t.startswith('#'):
                        has_content_after = True
                        break
                if not has_content_after:
                    truncated.append((rel, f"结尾空标题: 第{i+1}行 '{lines[i].strip()[:60]}'"))
                break
        
        # 3. Check for heading-body merging (long heading that looks like heading+body)
        issues = []
        for i, line in enumerate(lines):
            s = line.strip()
            if re.match(r'^## [\u4e00-\u9fff]', s) and len(s) > 35:
                # Exclude QA-style numbered headings like "## 1，巴菲特认为..."
                if not re.match(r'^## \d+[，,、]', s):
                    issues.append(f"标题粘正文: 第{i+1}行 '{s[:60]}'")
        
        # 4. Check for split headings (heading fragment on its own line)
        for i in range(len(lines)):
            s = lines[i].strip()
            prev = lines[i-1].strip() if i > 0 else ''
            prev2 = lines[i-2].strip() if i > 1 else ''
            # Pattern: "## Something" then blank line then fragment that looks like part of heading
            if s and not s.startswith('#') and prev == '' and prev2.startswith('## '):
                if len(prev2) < 30 and len(s) < 30:
                    # Check if s looks like a continuation of prev2
                    combined = prev2[3:] + s
                    if len(combined) < 50:
                        issues.append(f"标题碎片化: '{prev2[:40]}' + '{s[:40]}'")

        if issues:
            for issue in issues:
                merged_headings.append((rel, issue))
        
        # 5. Flag unusually short files for important content types
        # Partnership letters and letters should be substantial
        if ('partnership' in rel or 'letters' in rel) and char_count < 800:
            short_files.append((rel, f"合伙/股东信文件过短: {char_count} 字符"))
        elif 'interviews' in rel and char_count < 300:
            short_files.append((rel, f"访谈文件过短: {char_count} 字符"))
        elif 'qa' in rel and char_count < 500:
            short_files.append((rel, f"QA文件过短: {char_count} 字符"))
        elif 'talks' in rel and char_count < 300:
            short_files.append((rel, f"演讲文件过短: {char_count} 字符"))

# Print results
print("=" * 60)
print("1. 截断文件（以标题结尾或无后续内容）")
print("=" * 60)
if truncated:
    for rel, issue in truncated:
        print(f"  [{rel}]")
        print(f"    {issue}")
else:
    print("  无")
print()

print("=" * 60)
print("2. 标题与正文合并")
print("=" * 60)
if merged_headings:
    for rel, issue in merged_headings:
        print(f"  [{rel}]")
        print(f"    {issue}")
else:
    print("  无")
print()

print("=" * 60)
print("3. 可能内容缺失的短文件")
print("=" * 60)
if short_files:
    for rel, issue in short_files:
        print(f"  [{rel}]")
        print(f"    {issue}")
else:
    print("  无")
print()

total = len(truncated) + len(merged_headings) + len(short_files)
print(f"\n总计: {len(truncated)} 截断 + {len(merged_headings)} 标题合并 + {len(short_files)} 短文件 = {total} 个问题")
