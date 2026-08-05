#!/usr/bin/env python3
"""适配稿 -> 公众号连载 HTML 生成器（ebook-split skill 配套）

用法:
  python3 gen_article_html.py --default defaults.json --src 适配稿.md --outdir OUT --meta meta.json [--total N]

- defaults.json: 见 references/defaults.json（book/brand/cover/QUOTE_MAP/ARCHIVE_SRC/about_html）
- meta.json: 每章由 convert_book.py 生成，含 chapter_label 与 pieces[{no,h1,segs}]
- 适配稿: 全章各片按 `## 第 N 篇 · 篇名` 排布，文末 `**本篇资料来源**` + `- ` 列表
"""
import re, os, json, argparse, subprocess

CSS = {
    "wrap": "margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#151515;line-height:1.85;font-size:16px;",
    "brand": "margin:0 0 22px;padding:14px 18px;background:#FAF8F4;border-left:4px solid #AB1942;border-radius:0 10px 10px 0;",
    "brand_title": "margin:0;font-size:14px;font-weight:800;color:#AB1942;letter-spacing:1px;",
    "brand_sub": "margin:6px 0 0;font-size:13px;color:#8A8A8A;",
    "h1": "margin:0 0 14px;font-size:23px;font-weight:800;color:#151515;line-height:1.4;",
    "intro": "margin:0 0 24px;padding:12px 16px;background:#F4F1EC;border-radius:10px;font-size:14px;color:#454545;line-height:1.8;",
    "h2": "margin:28px 0 12px;font-size:19px;font-weight:800;color:#AB1942;border-bottom:2px solid #E7E3DF;padding-bottom:6px;",
    "p": "margin:0 0 16px;text-align:justify;",
    "quote": "margin:0 0 18px;padding:12px 16px;background:#F4F1EC;border-left:3px solid #AB1942;border-radius:0 8px 8px 0;",
    "quote_text": "margin:0;font-size:15px;color:#151515;line-height:1.8;",
    "quote_src": "margin:8px 0 0;font-size:12px;color:#8A8A8A;text-align:right;",
    "card": "margin:0 0 18px;padding:12px 16px;background:#F4F1EC;border-left:3px solid #AB1942;border-radius:0 8px 8px 0;",
    "card_title": "margin:0 0 8px;font-size:15px;font-weight:700;color:#AB1942;",
    "card_text": "margin:0 0 8px;font-size:15px;color:#151515;line-height:1.8;",
    "ol": "margin:0;padding-left:22px;font-size:15px;color:#151515;line-height:1.9;",
    "ul": "margin:0 0 16px;padding-left:22px;font-size:16px;color:#151515;line-height:1.85;",
    "source": "margin:24px 0 8px;padding:12px 16px;background:#FAF8F4;border:1px solid #E7E3DF;border-radius:10px;font-size:13px;color:#454545;line-height:1.8;",
    "source_title": "margin:0 0 6px;font-weight:700;color:#AB1942;",
    "footer": "margin:18px 0 0;font-size:13px;color:#8A8A8A;text-align:center;",
    "table": "margin:0 0 16px;overflow-x:auto;",
}

def md_inline(s):
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    return s

def quote_source(text, qmap):
    for k, v in qmap:
        if k in text:
            return v
    return ''

def parse_blocks(lines, qmap, archive_src):
    blocks = []
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        if line.strip() == '':
            i += 1; continue
        if line.strip() in ('---', '***', '___'):
            i += 1; continue
        if line.strip().startswith('<table'):
            buf = []
            while i < n and '</table>' not in lines[i]:
                buf.append(lines[i]); i += 1
            if i < n:
                buf.append(lines[i]); i += 1
            blocks.append(('raw', '\n'.join(buf)))
            continue
        if re.match(r'^### ', line):
            blocks.append(('h2', line[4:].strip())); i += 1; continue
        if line.startswith('>'):
            buf = []
            while i < n and lines[i].startswith('>'):
                stripped = lines[i][1:].lstrip(' ')
                buf.append(stripped if stripped != '' else '\n')
                i += 1
            text = '\n'.join(buf).strip()
            if text.startswith('#### 档案摘编') or text.startswith('#### 档案案例'):
                kw = '档案摘编' if text.startswith('#### 档案摘编') else '档案案例'
                parts = text.split('\n', 1)
                title = parts[0].replace('#### ' + kw, '').lstrip('：:').strip()
                body = parts[1].strip() if len(parts) > 1 else ''
                blocks.append(('archive', (title, body)))
            elif text.startswith('### 卡片'):
                parts = text.split('\n', 1)
                title = parts[0].replace('### 卡片', '').lstrip('：:').strip()
                body = parts[1].strip() if len(parts) > 1 else ''
                blocks.append(('card', (title, body)))
            else:
                blocks.append(('quote', text))
            continue
        if line.strip().startswith('**本篇资料来源'):
            items = []; i += 1
            while i < n and lines[i].strip().startswith('- '):
                items.append(lines[i].strip()[2:].strip()); i += 1
            blocks.append(('source', items)); continue
        if line.strip().startswith('《所有者的眼光》公众号连载'):
            i += 1; continue
        if line.strip().startswith('- '):
            buf = []
            while i < n and lines[i].strip().startswith('- '):
                buf.append(lines[i].strip()[2:].strip()); i += 1
            blocks.append(('list', buf)); continue
        blocks.append(('p', line.strip())); i += 1
    return blocks

def parse_segment(lines):
    seg_title = re.match(r'^## 第 \d+ 篇 · (.+)$', lines[0])
    seg_title = seg_title.group(1) if seg_title else lines[0]
    rest = lines[1:]
    j = 0
    while j < len(rest) and rest[j].strip() == '':
        j += 1
    intro_buf = []
    if j < len(rest) and rest[j].startswith('>'):
        while j < len(rest) and rest[j].startswith('>'):
            intro_buf.append(rest[j][1:].lstrip(' ')); j += 1
    intro_text = '\n'.join(intro_buf)
    desc = intro_text.split('\n\n', 1)[1].strip() if '\n\n' in intro_text else ''
    return seg_title, desc, parse_blocks(rest[j:], None, '')

def render_card_body(body):
    raw = re.split(r'\n{2,}', body)
    parts = [p.replace('\n', '') for p in raw if p.strip() != '']
    out = []; i = 0
    while i < len(parts):
        p = parts[i]
        if re.match(r'^\d+\.\s', p):
            items = []
            while i < len(parts) and re.match(r'^\d+\.\s', parts[i]):
                mm = re.match(r'^\d+\.\s(.*)$', parts[i])
                items.append(f'<li style="margin:0 0 6px;">{md_inline(mm.group(1))}</li>'); i += 1
            out.append(f'<ol style="{CSS["ol"]}">{"".join(items)}</ol>')
        else:
            out.append(f'<p style="{CSS["card_text"]}">{md_inline(p)}</p>'); i += 1
    return ''.join(out)

def render_block(b, qmap, archive_src):
    t, c = b[0], b[1]
    if t == 'h2':
        return f'<h2 style="{CSS["h2"]}">{md_inline(c)}</h2>'
    if t == 'p':
        return f'<p style="{CSS["p"]}">{md_inline(c)}</p>'
    if t == 'raw':
        return f'<div style="{CSS["table"]}">{c}</div>'
    if t == 'quote':
        src = quote_source(c, qmap)
        html = f'<section style="{CSS["quote"]}"><p style="{CSS["quote_text"]}">{md_inline(c)}</p>'
        if src and '——' not in c:
            html += f'<p style="{CSS["quote_src"]}">——{src}</p>'
        return html + '</section>'
    if t == 'card':
        title, body = c
        return (f'<section style="{CSS["card"]}"><p style="{CSS["card_title"]}">{md_inline(title)}</p>'
                + render_card_body(body) + '</section>')
    if t == 'archive':
        title, body = c
        return (f'<section style="{CSS["card"]}"><p style="{CSS["card_title"]}">档案摘编 · {md_inline(title)}</p>'
                + render_card_body(body)
                + f'<p style="{CSS["quote_src"]}">{archive_src}</p>' + '</section>')
    if t == 'list':
        items = ''.join(f'<li style="margin:0 0 6px;">{md_inline(x)}</li>' for x in c)
        return f'<ul style="{CSS["ul"]}">{items}</ul>'
    return ''

def render(blocks, sources, desc, h1, piece_no, total, cfg, chapter_label):
    brand = cfg['brand']; book = cfg['book']
    out = ['<meta charset="UTF-8">',
           '<body style="margin:0;background:#f2f2f2;">',
           '<section style="max-width:680px;margin:0 auto;background:#ffffff;padding:22px 18px;font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Hiragino Sans GB\',\'Microsoft YaHei\',sans-serif;color:#151515;line-height:1.85;font-size:16px;">']
    out.append(f'<section style="{CSS["brand"]}">')
    out.append(f'<p style="{CSS["brand_title"]}">{brand["header"]}</p>')
    out.append(f'<p style="{CSS["brand_sub"]}">{book["series"]} · {chapter_label} 第 {piece_no} 篇 / 共 {total} 篇</p>')
    out.append('</section>')
    out.append(f'<h1 style="{CSS["h1"]}">{h1}</h1>')
    if desc:
        out.append(f'<section style="{CSS["intro"]}"><p style="margin:0;">{md_inline(desc)}</p></section>')
    for b in blocks:
        out.append(render_block(b, cfg['QUOTE_MAP'], cfg['ARCHIVE_SRC']))
    if sources:
        out.append(f'<section style="{CSS["source"]}">')
        out.append(f'<p style="{CSS["source_title"]}">本篇资料来源</p>')
        out.append(f'<p style="margin:0;">{"<br>".join("· " + md_inline(s) for s in sources)}</p>')
        out.append('</section>')
    out.append(f'<p style="{CSS["footer"]}">{book["series"]} · {chapter_label} 第 {piece_no} 篇 / 共 {total} 篇</p>')
    out.append(brand['about_html'])
    out.append('</section></body>')
    return '\n'.join(out)

def split_segments(lines):
    starts = [(i, ln) for i, ln in enumerate(lines) if re.match(r'^## 第 \d+ 篇', ln)]
    segs = []
    for idx, (i, ln) in enumerate(starts):
        j = starts[idx+1][0] if idx+1 < len(starts) else len(lines)
        segs.append(lines[i:j])
    return segs

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--default', required=True)
    ap.add_argument('--src', required=True)
    ap.add_argument('--outdir', required=True)
    ap.add_argument('--meta', default='')
    ap.add_argument('--total', type=int, default=0)
    args = ap.parse_args()

    cfg = json.load(open(args.default, encoding='utf-8'))
    cfg['QUOTE_MAP'] = [tuple(x) for x in cfg['QUOTE_MAP']]

    if args.meta:
        meta = json.load(open(args.meta, encoding='utf-8'))
        pieces = meta['pieces']
        chapter_label = meta['chapter_label']
    else:
        pieces = cfg['pieces']
        chapter_label = cfg['book']['chapter']
    total = args.total or len(pieces)

    text = open(args.src, encoding='utf-8').read()
    segments = split_segments(text.split('\n'))
    assert segments, "适配稿中未发现任何 `## 第 N 篇` 标记"

    os.makedirs(args.outdir, exist_ok=True)
    for pc in pieces:
        segs = [segments[s-1] for s in pc['segs']]
        seg0 = parse_segment(segs[0])
        body = list(seg0[2])
        for s in segs[1:]:
            body += parse_segment(s)[2]
        sources, clean = [], []
        for b in body:
            (sources.extend(b[1]) if b[0] == 'source' else clean.append(b))
        html = render(clean, sources, seg0[1], pc['h1'], pc['no'], total, cfg, chapter_label)
        fn = os.path.join(args.outdir, f'正文_公众号版_第{pc["no"]}篇.html')
        open(fn, 'w', encoding='utf-8').write(html)
        plain = ''.join(str(c) for _, c in clean)
        cn = len(re.findall(r'[一-鿿]', plain))
        print(f'第{pc["no"]}篇 -> {fn}  (中文字数约 {cn})')
    print('done')

if __name__ == '__main__':
    main()
