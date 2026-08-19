#!/usr/bin/env python3
"""生成「仅正式正文」的打印版 Markdown（剔除审计/结构说明/附录/元信息），供转 PDF。"""
import os, re, csv, json, glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAN = os.path.join(BASE, "editorial/duanyongping/manifest")
OUTDIR = os.path.join(BASE, "build_books/dyp_themed")
os.makedirs(OUTDIR, exist_ok=True)

MAIN_TYPES = {"blog", "qa", "talks", "milestones", "speeches", "qa_doc"}
TYPE_ORDER = {"blog": 0, "talks": 1, "milestones": 2, "speeches": 3, "qa": 4, "qa_doc": 5}


def load_csv(name):
    with open(os.path.join(MAN, name), encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ===== 博客评论区噪声过滤（仅打印层，源文件不动）=====
_COMMENT_START = re.compile(r'^\*\*评论区（共 \d+ 条，其中段永平 \d+ 条）\*\*$')
_FLOOR = re.compile(r'^###\s+(\d+)楼\s+(.+?)\s+(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}(?:\s+\d{1,2}:\d{2})?)$')
_BOLD = re.compile(r'^>\s*\*\*(.+?)\*\*')
_DY = {"段永平", "大道无形我有型", "大道"}
_AD = re.compile(r'(微信|加群|荐股|卖课|付费|公众号|微信号|二维码|私聊|代购|引流|加微信)')
_BLESS = re.compile(r'(中秋|新年|国庆|生日|春节|端午|团圆|合家|美美满满|身体健康|家庭幸福|节日快乐|快乐)')
_URL = re.compile(r'https?://\S+')


def _is_substantive(content):
    c = re.sub(r'\s+', '', content)
    cjk = re.sub(r'[^\u4e00-\u9fff]', '', c)
    if len(cjk) < 16:
        return False
    if _AD.search(c):
        return False
    if _BLESS.search(c) and len(cjk) < 40:
        return False
    if _URL.search(c) and len(cjk) < 8:
        return False
    if re.fullmatch(r'https?://\S+', c):
        return False
    return True


def _keep_block(block):
    fl = block[0]
    m = _FLOOR.match(fl)
    author = m.group(2).strip() if m else ""
    has_dy = author in _DY
    if not has_dy:
        for l in block:
            mb = _BOLD.match(l)
            if mb and mb.group(1).strip() in _DY:
                has_dy = True
                break
            if "大道无形我有型" in l:
                has_dy = True
                break
    if has_dy:
        return block
    top = []
    for l in block[1:]:
        if l.lstrip().startswith(">"):
            break
        top.append(l)
    if _is_substantive("\n".join(top)):
        return block
    return []


def _filter_blog_comments(lines):
    out = []
    in_c = False
    cur = None
    for ln in lines:
        if not in_c and _COMMENT_START.match(ln.strip()):
            in_c = True
            out.append("**评论区（精选）**")
            cur = None
            continue
        if in_c:
            if _FLOOR.match(ln):
                if cur is not None:
                    out.extend(_keep_block(cur))
                cur = [ln]
            else:
                if cur is None:
                    out.append(ln)
                else:
                    cur.append(ln)
            continue
        out.append(ln)
    if in_c and cur is not None:
        out.extend(_keep_block(cur))
    return out


def read_body_print(path):
    try:
        t = open(path, encoding="utf-8", errors="ignore").read()
    except Exception:
        return ""
    m = re.match(r"^---\n.*?\n---\n", t, re.S)
    if m:
        t = t[m.end():]
    # 元信息行判定：署名/出处/来源/原文链接/URL/日期署名块
    def is_meta(s):
        if not s:
            return False
        # 段永平本人的署名回复（> **段永平** 回复 @…）必须保留，不当元信息删
        if ("段永平" in s or "大道无形我有型" in s) and s.lstrip().startswith(">"):
            return False
        if s.startswith("source:"):
            return True
        if "原文" in s or "出处" in s or "来源" in s or "网址" in s:
            return True
        if re.search(r"https?://", s):
            return True
        if re.match(r"^>\s*[^>]*(·\s*\d{4}|\d{4}[-/年]\d)", s):
            return True  # 署名行「段永平 · 2006-…」（非段永平本人时）
        if re.match(r"^>\s*转载", s):
            return True
        return False
    # 博客评论区噪声过滤（仅打印层，源文件不动）——必须在 is_meta 之前执行，
    # 否则段永平回复的署名行会被 is_meta 当作元信息整行删掉，后续无法识别并保留。
    lines = _filter_blog_comments(t.splitlines())
    lines = [ln for ln in lines if not is_meta(ln.strip())]
    body = "\n".join(lines).strip()
    # 剥离首行冗余 H1 标题（博客文件自带 # 标题，外层已加 ### 标题）
    blines = body.splitlines()
    if blines and re.match(r"^#\s+\S", blines[0].strip()):
        blines = blines[1:]
    # 剥离首尾噪声：空行 / 空块引用 / 分隔线
    def noise(ln):
        s = ln.strip()
        return s == "" or s == ">" or s in ("---", "***")
    while blines and noise(blines[0]):
        blines = blines[1:]
    while blines and noise(blines[-1]):
        blines = blines[:-1]
    body = "\n".join(blines).strip()
    # 正文内标题降两级，使其始终低于文章的 H3 标题（原 ## 提问→####）
    def demote(ln):
        mm = re.match(r"^(#+)\s+", ln)
        if not mm:
            return ln
        n = min(6, len(mm.group(1)) + 2)
        return "#" * n + " " + ln[mm.end():].lstrip(" ")
    body = "\n".join(demote(ln) for ln in body.splitlines())
    return body


def derive_title(body, fallback):
    for ln in body.splitlines():
        s = ln.strip().lstrip(">#-•·*").strip()
        if len(re.sub(r"\s", "", s)) >= 4 and not re.match(r"^https?://", s):
            s = s[:42]
            return s + ("…" if len(s) >= 42 else "")
    return fallback


def main():
    inv = {r["unit_id"]: r for r in load_csv("01_inventory.csv")}
    hints = {r["unit_id"]: r for r in load_csv("04_classification_hints.csv")}
    taxonomy = json.load(open(os.path.join(MAN, "00_taxonomy.json"), encoding="utf-8"))

    assign = {}
    for uid, r in inv.items():
        if r["source_type"] not in MAIN_TYPES:
            continue
        ch = (hints.get(uid, {}) or {}).get("candidate_chapter", "").strip()
        assign[uid] = ch or "__UNCLASSIFIED__"

    part_of, chap_title = {}, {}
    for p in taxonomy["parts"]:
        for c in p["chapters"]:
            part_of[c["id"]] = p["id"]
            chap_title[c["id"]] = c["title"]
    part_info = {p["id"]: p for p in taxonomy["parts"]}

    buckets = {}
    for uid, ch in assign.items():
        buckets.setdefault(ch, []).append(uid)

    def sort_key(uid):
        r = inv[uid]
        y = r.get("year") or "0000"
        return (TYPE_ORDER.get(r["source_type"], 9), y, uid)

    for ch in buckets:
        buckets[ch].sort(key=sort_key)

    total_articles = sum(len(buckets.get(c["id"], [])) for p in taxonomy["parts"] for c in p["chapters"])

    def clean_title(raw, body):
        if re.match(r"^雪球\s*#?\s*\d+$", raw) or re.match(r"^雪球问答\s*#?\s*\d+$", raw):
            return derive_title(body, raw)
        # 清洗标题内嵌的源链接/日期/媒体署名（转载文献标题常含）
        t = re.sub(r"https?://\S+", "", raw)
        t = re.sub(r"\s+\d{4}年\d{1,2}月\d{1,2}日\s+\d{1,2}:\d{2}\s+.*$", "", t)
        t = re.sub(r"\s*(新浪财经|网易财经|搜狐财经|腾讯财经|华尔街见闻|第一财经|新浪科技|网易|搜狐|腾讯|雪球)\s*$", "", t)
        t = re.sub(r"\s+·\s*$", "", t).strip()
        return t if t else derive_title(body, raw)

    L = []
    # ===== 封面（独占第1页）=====
    L.append('<div class="cover">\n')
    L.append('<p class="booktitle">做对的事情</p>\n')
    L.append('<p class="subtitle">段永平文集 · 主题分类全编</p>\n')
    L.append('<p class="compile">二〇二六年八月 · 汇编</p>\n')
    L.append('</div>\n')

    # ===== 手写目录页（独占第2页起，避开 pandoc 自动 TOC 的分页冲突）=====
    L.append('<nav class="toc-page" role="doc-toc">\n')
    L.append('<h1 class="toc-title">目　　录</h1>\n')
    L.append('<ul class="toc-list">\n')
    for p in taxonomy["parts"]:
        ptitle = p["title"].split("　", 1)[-1]
        chap_li = []
        for c in p["chapters"]:
            members = buckets.get(c["id"], [])
            if not members:
                continue
            ctitle = c["title"].split("　", 1)[-1]
            chap_li.append(f'<li><span class="t-tit">{ctitle}</span><span class="t-dots"></span><span class="t-count">（{len(members)} 篇）</span></li>')
        L.append(f'<li class="part"><span class="t-tit">{ptitle}</span><span class="t-dots"></span><span class="t-count">（{sum(len(buckets.get(c["id"], [])) for c in p["chapters"])} 篇）</span>')
        if chap_li:
            L.append('<ul>')
            L.extend(chap_li)
            L.append('</ul>')
        L.append('</li>')
    L.append('</ul>\n')
    L.append('<p class="toc-foot">共 ' + str(total_articles) + ' 篇</p>\n')
    L.append('</nav>\n')

    for p in taxonomy["parts"]:
        ptitle = p["title"].split("　", 1)[-1]
        L.append(f"\n# {ptitle}\n")
        for c in p["chapters"]:
            ctitle = c["title"].split("　", 1)[-1]
            members = buckets.get(c["id"], [])
            if not members:
                continue
            L.append(f"\n## {ctitle}\n")
            for uid in members:
                r = inv[uid]
                body = read_body_print(r["file_path"])
                title = clean_title(r.get("title") or uid, body)
                L.append(f"\n### {title}\n")
                if body:
                    L.append(body + "\n")
                else:
                    L.append("\n（正文缺失）\n")

    out = os.path.join(OUTDIR, "段永平文集_打印版.md")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(L))
    total = sum(len(buckets.get(c["id"], [])) for p in taxonomy["parts"] for c in p["chapters"])
    print("打印版 Markdown 已生成:", out)
    print("正文篇数:", total)


if __name__ == "__main__":
    main()
