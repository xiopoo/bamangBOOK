#!/usr/bin/env python3
"""内容级去重 + 极短帖过滤（仅作用于回填的 qa_xq 集，移入备份归档，可还原）。

1. 内容去重：对全部 qa 正文做 md5，相同正文归一组，每组保留 1 份（优先保留非 qa_xq；
   否则保留文件名最小者），其余移入 archive_dupes/。
2. 极短过滤：剩余 qa_xq 中，归一化（去标点/空白/---）长度 <=4 的极短 junk 移入 archive_short/。
"""
import glob, re, os, hashlib, shutil

ROOT = "content/duanyongping/qa"
DUP_DIR = "editorial/duanyongping/archive_dupes"
SHORT_DIR = "editorial/duanyongping/archive_short"
os.makedirs(DUP_DIR, exist_ok=True)
os.makedirs(SHORT_DIR, exist_ok=True)

META_PREFIX = ('source:', 'id:', 'date:', 'title:', 'url:', 'author:',
               'year:', 'index:', 'platform:', 'category:')

def body(p):
    t = open(p, encoding='utf-8', errors='ignore').read()
    t = re.sub(r'^---\n.*?\n---\n', '', t, flags=re.S)
    lines = [ln for ln in t.splitlines() if not ln.startswith(META_PREFIX)]
    return '\n'.join(lines).strip()

def norm(b):
    return re.sub(r'[^\u4e00-\u9fffA-Za-z0-9]', '', b)

files = glob.glob(os.path.join(ROOT, '**', '*.md'), recursive=True)
print('qa 文件总数:', len(files))

# ---- 1. 内容去重 ----
hashes = {}
for f in files:
    h = hashlib.md5(body(f).encode()).hexdigest()
    hashes.setdefault(h, []).append(f)

moved_dup = 0
for h, group in hashes.items():
    if len(group) < 2:
        continue
    # 保留：优先非 qa_xq，否则文件名最小
    def key(f):
        base = os.path.basename(f)
        is_xq = 'qa_xq_' in base
        m = re.search(r'(\d+)', base)
        num = int(m.group(1)) if m else 0
        return (is_xq, num)
    keep = sorted(group, key=key)[0]
    for f in group:
        if f == keep:
            continue
        dst = os.path.join(DUP_DIR, os.path.basename(f))
        if os.path.exists(dst):
            dst = dst + '.dup'
        shutil.move(f, dst)
        moved_dup += 1
print('内容去重移出:', moved_dup)

# ---- 2. 极短过滤（仅 qa_xq）----
moved_short = 0
for f in glob.glob(os.path.join(ROOT, '**', 'qa_xq_*.md'), recursive=True):
    if len(norm(body(f))) <= 4:
        dst = os.path.join(SHORT_DIR, os.path.basename(f))
        if os.path.exists(dst):
            dst = dst + '.dup'
        shutil.move(f, dst)
        moved_short += 1
print('极短过滤移出:', moved_short)

remaining = len(glob.glob(os.path.join(ROOT, '**', '*.md'), recursive=True))
print('qa 剩余文件数:', remaining)
