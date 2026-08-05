#!/usr/bin/env python3
"""出版正文 -> 公众号连载适配稿 + meta.json（ebook-split skill 配套）

功能（沉淀自《所有者的眼光》第一章拆分经验）：
- 解析章目 `# 第N章 标题`
- 解析章末 `## 注释` 得到脚注 -> (引文署名, 资料来源)
- 跨章锚点 `{#...}` 去除，行内链接 `[文字](#锚)` -> `文字`
- 引文块 `> ` 末尾脚注 -> 内联 ` —— 署名`；脚注统一汇入文末「本篇资料来源」
- 档案块 `> #### 档案案例` -> 保留为 `> ` 块（生成器识别为档案卡片），去脚注
- Markdown 表格 -> HTML <table> raw 块
- 按 `## ` 自然分节切篇（单篇 ~4800 字，绝不劈段落/小节）
- 文末自动汇总本篇资料来源

用法:
  python3 convert_book.py --src 出版分章/02_第二章xxx.md --default defaults.json --out OUT [--build]
  python3 convert_book.py --all --bookdir 出版分章 --default defaults.json --out OUT [--build]
"""
import re, os, json, argparse, subprocess

TARGET = 4800      # 单篇目标字数
MAXPIECE = 6000    # 单篇上限（超出则独立成篇，不劈分小节）

def load_defaults(path):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

# ---------- 脚注解析 ----------
def parse_notes(lines, default_author='巴菲特'):
    """返回 {bid: (attr, src)}，取自 `## 注释` 段。处理「同上」指代上一条真实出处。"""
    m = {}
    in_notes = False
    last = None
    for ln in lines:
        if ln.strip().startswith('## 注释'):
            in_notes = True; continue
        if in_notes and ln.strip().startswith('## '):
            break
        if in_notes:
            mm = re.match(r'\[\^([A-Za-z0-9]+)\]:\s*(.*)$', ln.strip())
            if mm:
                bid, deftext = mm.group(1), mm.group(2)
                if deftext.strip().startswith('同上'):
                    entry = last if last else parse_cite(deftext, default_author)
                else:
                    entry = parse_cite(deftext, default_author)
                    last = entry
                m[bid] = entry
    return m

def parse_cite(deftext, default_author='巴菲特'):
    fm = re.search(r'`([^`]+)`', deftext)
    if not fm:
        t = deftext.strip().rstrip('。').strip()
        return (t, t)
    url = fm.group(1)
    fn = url.split('/')[-1].replace('.md', '')
    low = url.lower()
    # 智能署名：引用明显指向另一位作者时覆盖默认署名
    if 'munger' in low or 'charlie' in low or '芒格' in fn:
        author = '芒格'
    elif 'buffett' in low or 'poor-charlies' in low or 'poor_charlies' in low or 'owner' in low:
        author = '巴菲特'
    else:
        author = default_author
    year = ''; title = fn
    mm = re.match(r'.*?(\d{4})[-_](.+)$', fn)
    if mm:
        year, title = mm.group(1), mm.group(2)
    else:
        mm2 = re.match(r'(.+?)[-_](\d{4})$', fn)
        if mm2:
            title, year = mm2.group(1), mm2.group(2)
    title = title.replace('巴菲特', '').replace('芒格', '').strip('_- ').strip()
    title = re.sub(r'^[：:，,\s]+', '', title)
    if year:
        attr = f"{author}，{year}年{title}" if title else f"{author}，{year}年"
        src = f"{author}，{year}年《{title}》" if title else f"{author}，{year}年"
    else:
        attr = f"{author}，《{title}》" if title else author
        src = attr
    return (attr, src)

# ---------- 行级适配 ----------
def strip_anchor(line):
    line = re.sub(r'\{#[^\}]+\}', '', line)
    line = re.sub(r'\[([^\]]+)\]\(#[^)]*\)', r'\1', line)
    return line

def strip_foot(text, notes, sources):
    found = []
    def repl(m):
        bid = m.group(1); found.append(bid)
        if bid in notes:
            sources.add(notes[bid][1])
        return ''
    return re.sub(r'\[\^([A-Za-z0-9]+)\]', repl, text), found

def is_table_start(lines, i):
    if not (lines[i].strip().startswith('|') and lines[i].strip().endswith('|')):
        return False
    if i + 1 >= len(lines):
        return False
    nxt = lines[i+1].strip()
    return nxt.startswith('|') and re.search(r':?-{2,}:?', nxt) is not None and nxt.count('|') >= 2

def md_table_to_html(rows):
    def cells(r):
        return [c.strip() for c in r.strip().strip('|').split('|')]
    header = cells(rows[0])
    body_rows = [cells(r) for r in rows[2:] if r.strip().startswith('|')]
    th = ''.join(f'<th style="border:1px solid #E0D8D0;padding:6px 10px;text-align:left;background:#F4F1EC;font-size:14px;white-space:nowrap;">{md_inline(c)}</th>' for c in header)
    trs = ''
    for row in body_rows:
        tds = ''.join(f'<td style="border:1px solid #E0D8D0;padding:6px 10px;font-size:13px;vertical-align:top;">{md_inline(c)}</td>' for c in row)
        trs += f'<tr>{tds}</tr>'
    return f'<table style="border-collapse:collapse;width:100%;margin:0;">{th}{trs}</table>'

def md_inline(s):
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)

def consume_quote(lines, i, notes, sources):
    block = []; bids = []
    while i < len(lines) and lines[i].startswith('>'):
        raw = lines[i][1:].lstrip(' ')
        raw, found = strip_foot(raw, notes, sources)
        bids += found
        block.append(raw)
        i += 1
    joined = '\n'.join(block)
    if any(k in joined for k in ('所属篇', '核心问题', '核心命题', '本篇核心', '【', '所属篇目')):
        return [], i  # 章首元数据块，跳过
    is_arch = any('#### 档案' in b for b in block)
    if not is_arch and bids:
        attr = notes.get(bids[0], ('', ''))[0]
        if attr:
            for k in range(len(block) - 1, -1, -1):
                if block[k].strip() != '':
                    block[k] = block[k] + ' —— ' + attr
                    break
    out = ['> ' + b if b != '' else '>' for b in block]
    return out, i

def consume_table(lines, i):
    rows = []
    while i < len(lines) and lines[i].strip().startswith('|') and lines[i].strip().endswith('|'):
        rows.append(lines[i].strip()); i += 1
    return md_table_to_html(rows), i

# ---------- 章节切分 ----------
def convert_chapter(path, notes):
    lines = open(path, encoding='utf-8').read().split('\n')
    # 章目：章号取文件名阿拉伯数字；标题取首行 `# 第X章 …` 并去除锚点
    ch_no = 0
    mfn = re.match(r'^(\d+)_', os.path.basename(path))
    if mfn:
        ch_no = int(mfn.group(1))
    ch_title = os.path.splitext(os.path.basename(path))[0]
    for ln in lines:
        m = re.match(r'^#\s*第.+?章\s*(.*)$', ln)
        if m:
            ch_title = strip_anchor(m.group(1)).strip()
            break

    sections = []  # {heading, lines}
    cur = {'heading': None, 'lines': []}
    sources = set()
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        if line.startswith('# '):
            i += 1; continue
        if line.strip().startswith('## 注释'):
            break
        if line.startswith('## ') and not line.strip().startswith('## 注释'):
            sections.append(cur)
            cur = {'heading': line[3:].strip(), 'lines': []}
            i += 1; continue
        if line.startswith('>'):
            out, i = consume_quote(lines, i, notes, sources)
            cur['lines'].extend(out); continue
        if is_table_start(lines, i):
            tbl, i = consume_table(lines, i)
            cur['lines'].append(tbl); continue
        t = strip_anchor(line)
        t, _ = strip_foot(t, notes, sources)
        if t.strip() != '' or line.strip() == '':
            cur['lines'].append(t)
        i += 1
    sections.append(cur)

    # 去掉空 section
    sections = [s for s in sections if s['lines'] or s['heading']]
    def sec_size(s):
        return len(re.findall(r'[一-鿿]', '\n'.join(s['lines'])))
    # 打包成篇（贪心：单篇尽量接近 TARGET，绝不劈分小节）
    packs = []; curp = []; cur_sz = 0
    for idx, s in enumerate(sections):
        sz = sec_size(s)
        if curp and cur_sz + sz > TARGET:
            packs.append(curp); curp = [idx]; cur_sz = sz
        else:
            curp.append(idx); cur_sz += sz
    if curp:
        packs.append(curp)
    # 合并过小的篇到前一篇，避免末尾碎片（同时控制不超过 6200）
    merged = []
    for pk in packs:
        sz = sum(sec_size(sections[i]) for i in pk)
        if merged:
            prev_sz = sum(sec_size(sections[i]) for i in merged[-1])
            if sz < 2600 and prev_sz + sz <= 6200:
                merged[-1] = merged[-1] + pk
                continue
        merged.append(pk)
    packs = merged

    chapter_label = f"第{ch_no}章 {ch_title}"
    out = []
    pieces = []
    summaries = []
    for p, sec_idxs in enumerate(packs, start=1):
        first = sections[sec_idxs[0]]
        marker_title = first['heading'] or '开篇'
        out.append(f'## 第 {p} 篇 · {marker_title}')
        piece_text_parts = []
        for si in sec_idxs:
            sec = sections[si]
            if sec is first:
                out.extend(sec['lines'])
            else:
                if sec['heading']:
                    out.append('### ' + sec['heading'])
                out.extend(sec['lines'])
            piece_text_parts.append('\n'.join(sec['lines']))
        h1 = f"{ch_title}（第{p}篇）"
        pieces.append({"no": p, "h1": h1, "segs": [p]})
        # 摘要：取本篇首段非标题/引文文本
        summaries.append(make_summary('\n'.join(piece_text_parts)))

    # 文末资料来源（归入最后一篇，split_segments 会把其并入最后一篇）
    if sources:
        out.append('')
        out.append('**本篇资料来源**')
        for s in sorted(sources):
            out.append('- ' + s)

    meta = {
        "chapter_no": ch_no,
        "chapter_title": ch_title,
        "chapter_label": chapter_label,
        "cover_tag": f"公众号连载 · {chapter_label}",
        "pieces": pieces,
        "summaries": summaries,
        "total": len(pieces),
    }
    return ch_no, ch_title, chapter_label, '\n'.join(out), meta

def make_summary(text):
    # 去 markdown / html，取首个有意义句
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[#>*`\-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    # 取前 60 字，断在句号
    cut = text[:60]
    m = re.search(r'[。！？]', cut[20:])
    if m:
        cut = cut[:20 + m.end()]
    return cut + ('…' if len(text) > len(cut) else '')

# ---------- 主流程 ----------
def process(src, default_path, out_root, build=False, gen_html=None, gen_cover=None):
    defaults = load_defaults(default_path)
    default_author = defaults.get('CITE_AUTHOR', '巴菲特')
    lines = open(src, encoding='utf-8').read().split('\n')
    notes = parse_notes(lines, default_author)
    ch_no, ch_title, chapter_label, adapt, meta = convert_chapter(src, notes)
    safe = f"{ch_no:02d}_{ch_title}"
    adapt_dir = os.path.join(out_root, '适配稿')
    chap_dir = os.path.join(out_root, safe)
    os.makedirs(adapt_dir, exist_ok=True)
    os.makedirs(chap_dir, exist_ok=True)
    adapt_path = os.path.join(adapt_dir, f"适配_第{ch_no}章_{ch_title}.md")
    meta_path = os.path.join(chap_dir, 'meta.json')
    open(adapt_path, 'w', encoding='utf-8').write(adapt)
    open(meta_path, 'w', encoding='utf-8').write(json.dumps(meta, ensure_ascii=False, indent=2))

    print(f"[章{ch_no}] {ch_title} → {len(meta['pieces'])} 篇；脚注 {len(notes)} 条")
    print(f"   适配稿: {adapt_path}")
    print(f"   元信息: {meta_path}")

    if build and gen_html and gen_cover:
        html_dir = chap_dir
        subprocess.run(['python3', gen_html, '--default', default_path, '--src', adapt_path,
                        '--outdir', html_dir, '--meta', meta_path], check=True)
        cover_path = os.path.join(chap_dir, f'封面_第{ch_no}章.png')
        subprocess.run(['python3', gen_cover, '--default', default_path, '--out', cover_path,
                        '--chapter-tag', meta['cover_tag']], check=True)
        print(f"   封面: {cover_path}")
    return meta

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default='')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--bookdir', default='')
    ap.add_argument('--default', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--build', action='store_true')
    ap.add_argument('--gen-html', default=os.path.join(os.path.dirname(__file__), 'gen_article_html.py'))
    ap.add_argument('--gen-cover', default=os.path.join(os.path.dirname(__file__), 'gen_cover.py'))
    args = ap.parse_args()

    if args.all:
        files = sorted([os.path.join(args.bookdir, f) for f in os.listdir(args.bookdir)
                        if re.match(r'^\d+_', f) and f.endswith('.md')])
        for src in files:
            process(src, args.default, args.out, args.build, args.gen_html, args.gen_cover)
    elif args.src:
        process(args.src, args.default, args.out, args.build, args.gen_html, args.gen_cover)
    else:
        ap.error('需要 --src 或 --all')

if __name__ == '__main__':
    main()
