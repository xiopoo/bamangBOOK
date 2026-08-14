#!/usr/bin/env python3
"""扫描 out/ 静态产物中的内部链接断链（临时诊断脚本）"""
import os, re, sys, html as htmlmod
from html.parser import HTMLParser
from urllib.parse import unquote

OUT = os.path.join(os.path.dirname(__file__), '..', 'out')

class LinkCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        href = d.get('href')
        src = d.get('src')
        if href and not href.startswith(('http:', 'https:', 'mailto:', 'tel:', 'javascript:', '#', 'data:')):
            self.links.append(('a', href))
        if src and not src.startswith(('http:', 'https:', 'data:')):
            self.links.append(('src', src))

def file_for_url(url, base_dir, current_dir=None):
    """把 URL 映射到静态文件：绝对路径以 out/ 为基准，相对路径以当前 html 所在目录为基准"""
    if url.startswith('/'):
        p = os.path.normpath(os.path.join(base_dir, url.lstrip('/')))
    else:
        p = os.path.normpath(os.path.join(current_dir or base_dir, url))
    cands = [p, p + '.html', os.path.join(p, 'index.html')]
    for c in cands:
        if os.path.isfile(c):
            return c
    return None

broken = []
checked = 0
for root, dirs, files in os.walk(OUT):
    for f in files:
        if not f.endswith('.html'):
            continue
        path = os.path.join(root, f)
        html = open(path, encoding='utf-8', errors='ignore').read()
        parser = LinkCollector()
        try:
            parser.feed(html)
        except Exception:
            continue
        for tag, url in parser.links:
            decoded = unquote(htmlmod.unescape(url)).split('#')[0].split('?')[0]
            if not decoded or decoded.startswith('/api/'):
                continue
            checked += 1
            if file_for_url(decoded, OUT, os.path.dirname(path)) is None:
                # 排除 next 静态资源（/_next/）
                if decoded.startswith('/_next/'):
                    continue
                broken.append((os.path.relpath(path, OUT), tag, decoded))

print(f'检查链接数: {checked}')
print(f'断链数: {len(broken)}')
# 按类别聚合
from collections import Counter
cats = Counter()
for src, tag, url in broken:
    if url.startswith('/duanyongping/qa/year'):
        cats['duanyongping-qa-分页'] += 1
    elif 'attachments/' in url or url.startswith('attachments'):
        cats['duanyongping-milestones-附件图片'] += 1
    elif url.endswith('.md'):
        cats['指向源文件.md'] += 1
    elif url.startswith('/') and tag == 'src':
        cats['src-资源'] += 1
    else:
        cats['其他'] += 1
for k, v in cats.most_common():
    print(f'  {k}: {v}')
print('--- 其他类明细 ---')
seen = set()
for src, tag, url in broken:
    key = (tag, url)
    if key in seen:
        continue
    seen.add(key)
    if url.startswith('/duanyongping/qa/year') or 'attachments/' in url or url.startswith('attachments') or url.endswith('.md'):
        continue
    print(f'  [{tag}] {url}   (来自 {src})')
