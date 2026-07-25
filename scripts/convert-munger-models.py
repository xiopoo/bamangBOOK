#!/usr/bin/env python3
"""
mungermodels.com 模型页 HTML → Markdown 转换脚本

输入：
  tmp/mungermodels/all.html            全量索引页（含学科/场景/重要度元数据）
  tmp/mungermodels/raw-html/{slug}.html 231 个模型详情页

输出：
  content/models/{slug}.md             带 frontmatter 的正文
  content/models-index.json            列表页/搜索用索引

转换规则：
  - article.prose 内的引言 div + 各 section 依序转为 Markdown
  - section 标题 → ## 标题
  - 内链 /models/xxx → /model/xxx（站内路由）
  - 实践检查清单 → GFM 任务列表 (- [ ] ...)
  - blockquote / ul / ol / strong / em / hr 常规转换
"""

import json
import os
import re
import sys

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = os.path.join(os.path.dirname(__file__), '..')
ALL_HTML = os.path.join(ROOT, 'tmp', 'mungermodels', 'all.html')
RAW_DIR = os.path.join(ROOT, 'tmp', 'mungermodels', 'raw-html')
OUT_DIR = os.path.join(ROOT, 'content', 'models')
INDEX_OUT = os.path.join(ROOT, 'content', 'models-index.json')

DISC_NAMES = {
    'meta': '元认知与思维方法论', 'psych': '心理学', 'math': '数学与统计学',
    'econ': '微观经济学', 'physics': '物理学与化学', 'bio': '生物学与进化论',
    'eng': '工程学', 'complex': '复杂系统与决策科学', 'mgmt': '管理学与商业',
    'invest': '投资学与金融学', 'accounting': '会计学', 'law': '法学与政治学',
    'history': '历史学与哲学', 'decision': '投资原则与品格',
}
SCENE_NAMES = {
    's1': '投资决策与资产评估', 's2': '企业竞争力与商业模式分析', 's3': '团队管理与组织决策',
    's4': '风险识别与系统韧性', 's5': '个人重大决策与人生规划', 's6': '商业创新与竞争战略',
    's7': '谈判、说服与人际影响', 's8': '市场趋势与宏观判断', 's9': '学习、复盘与认知提升',
}


def parse_index():
    """从 /all 页提取 232 个模型的元数据。"""
    soup = BeautifulSoup(open(ALL_HTML, encoding='utf-8').read(), 'html.parser')
    models = {}
    for row in soup.select('a.tbl__row'):
        slug = row.get('data-id', '')
        if not slug:
            continue
        name_el = row.select_one('.col-name .wl')
        en_el = row.select_one('.tbl__en')
        models[slug] = {
            'slug': slug,
            'title': name_el.get_text(strip=True) if name_el else slug,
            'english': en_el.get_text(strip=True) if en_el else '',
            'discipline': row.get('data-disc', ''),
            'disciplineName': DISC_NAMES.get(row.get('data-disc', ''), ''),
            'importance': int(row.get('data-imp', '0') or 0),
            'scenarios': [SCENE_NAMES[s] for s in (row.get('data-sce') or '').split(',') if s in SCENE_NAMES],
        }
    return models


def inline_md(node):
    """行内元素 → Markdown 文本。"""
    parts = []
    for child in node.children:
        if isinstance(child, NavigableString):
            parts.append(str(child))
        elif isinstance(child, Tag):
            if child.name == 'a':
                href = child.get('href', '')
                text = inline_md(child)
                m = re.match(r'^/models/([a-z0-9-]+)/?$', href)
                if m:
                    parts.append(f'[{text}](/model/{m.group(1)})')
                elif href.startswith('http'):
                    parts.append(f'[{text}]({href})')
                else:
                    parts.append(text)
            elif child.name in ('strong', 'b'):
                parts.append(f'**{inline_md(child)}**')
            elif child.name in ('em', 'i'):
                parts.append(f'*{inline_md(child)}*')
            elif child.name == 'code':
                parts.append(f'`{child.get_text()}`')
            elif child.name == 'br':
                parts.append('\n')
            elif child.name in ('button',):
                continue  # 跳过“重置本清单”等交互按钮
            else:
                parts.append(inline_md(child))
    return ''.join(parts).strip()


def block_md(container):
    """块级容器 → Markdown 段落列表。"""
    out = []
    for el in container.children:
        if isinstance(el, NavigableString):
            t = str(el).strip()
            if t:
                out.append(t)
            continue
        if not isinstance(el, Tag):
            continue
        if el.name == 'p':
            t = inline_md(el)
            if t:
                out.append(t)
        elif el.name == 'blockquote':
            inner = block_md(el)
            out.append('\n'.join(f'> {line}' for para in inner for line in para.split('\n')))
        elif el.name in ('ul', 'ol'):
            is_check = 'checklist' in (el.get('class') or [])
            items = []
            for idx, li in enumerate(el.find_all('li', recursive=False)):
                if 'check-li--reset' in (li.get('class') or []):
                    continue
                text = inline_md(li)
                if not text:
                    continue
                if is_check:
                    items.append(f'- [ ] {text}')
                elif el.name == 'ol':
                    items.append(f'{len(items) + 1}. {text}')
                else:
                    items.append(f'- {text}')
            if items:
                out.append('\n'.join(items))
        elif el.name == 'hr':
            out.append('---')
        elif el.name in ('h3', 'h4'):
            out.append(f'### {inline_md(el)}')
        elif el.name in ('div', 'section', 'label', 'span'):
            out.extend(block_md(el))
    return out


def convert_article(html, meta):
    soup = BeautifulSoup(html, 'html.parser')
    article = soup.find('article')
    if article is None:
        return None

    blocks = []
    # 1. 引言（article 下第一个非 section 的 div）
    for child in article.children:
        if isinstance(child, Tag) and child.name == 'div':
            intro = block_md(child)
            # 去掉开头的英文名引用块（> Inversion）
            if intro and intro[0].startswith('> ') and len(intro[0]) < 80 and re.match(r'^> [A-Za-z0-9 ,\'\-&()/]+$', intro[0]):
                intro = intro[1:]
            blocks.extend(intro)
            break

    # 2. 各 section
    for sec in article.find_all('section', recursive=False):
        title_el = sec.find('h2')
        if title_el:
            blocks.append(f'## {title_el.get_text(strip=True)}')
        for child in sec.children:
            if isinstance(child, Tag) and child.name == 'div' and 'sec__ord' not in (child.get('class') or []) \
                    and 'sec__rule' not in (child.get('class') or []):
                blocks.extend(block_md(child))

    # 描述取 meta description
    desc_el = soup.find('meta', attrs={'name': 'description'})
    description = desc_el.get('content', '').strip() if desc_el else ''

    body = '\n\n'.join(b for b in blocks if b.strip())
    # 清理多余空行与 '---' 相邻重复
    body = re.sub(r'\n{3,}', '\n\n', body)

    def esc(v):
        return str(v).replace('"', '\\"')

    fm_lines = [
        '---',
        f'title: "{esc(meta["title"])}"',
        f'english: "{esc(meta["english"])}"',
        f'slug: "{meta["slug"]}"',
        f'discipline: "{meta["discipline"]}"',
        f'disciplineName: "{esc(meta["disciplineName"])}"',
        f'importance: {meta["importance"]}',
        'scenarios:',
    ]
    fm_lines += [f'  - "{esc(s)}"' for s in meta['scenarios']]
    fm_lines += [
        f'description: "{esc(description)}"',
        'source: "mungermodels.com"',
        f'sourceUrl: "https://mungermodels.com/models/{meta["slug"]}"',
        '---',
    ]
    return '\n'.join(fm_lines) + '\n\n' + f'# {meta["title"]}\n\n' + body + '\n'


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    index = parse_index()
    print(f'索引模型数: {len(index)}')

    files = sorted(f for f in os.listdir(RAW_DIR) if f.endswith('.html'))
    ok, failed = 0, []
    out_index = []
    for f in files:
        slug = f[:-5]
        meta = index.get(slug)
        if meta is None:
            meta = {'slug': slug, 'title': slug, 'english': '', 'discipline': '',
                    'disciplineName': '', 'importance': 0, 'scenarios': []}
        html = open(os.path.join(RAW_DIR, f), encoding='utf-8').read()
        md = convert_article(html, meta)
        if md is None or len(md) < 500:
            failed.append(slug)
            continue
        with open(os.path.join(OUT_DIR, f'{slug}.md'), 'w', encoding='utf-8') as fh:
            fh.write(md)
        desc_m = re.search(r'description: "(.*)"', md)
        out_index.append({**meta, 'description': desc_m.group(1) if desc_m else ''})
        ok += 1

    out_index.sort(key=lambda m: (-m['importance'], m['slug']))
    with open(INDEX_OUT, 'w', encoding='utf-8') as fh:
        json.dump(out_index, fh, ensure_ascii=False, indent=2)

    print(f'转换成功: {ok} 份，失败: {len(failed)} 份')
    if failed:
        print('失败清单:', ', '.join(failed))
        sys.exit(1)


if __name__ == '__main__':
    main()
