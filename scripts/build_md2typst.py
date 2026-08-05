#!/usr/bin/env python3
"""巴芒两卷 md → typst 合成生成脚本

流程：
  1. pandoc 将「连续正文 + 附录/索引/典藏层」markdown 转为 typst 原始文本
  2. post_process 后处理：
     - 剥离正文前页（书名页 / 版权信息，直到第一个 `= ` 标题）
     - 锚点修复：`{\#label}` → `<label>`
     - 删除独立成行且含中文的 slug 行（pandoc 生成，会覆盖 heading 的自定义 label）
     - 破折号恢复：`------` → `——`
     - 脚注清理：删除脚注内反引号包裹的 `.md` 文件路径（仅保留注释核心内容）
  3. 按「锚点文本」回插章节插图（figure 块从现有 body.typ 提取，锚点匹配正文行首）
  4. 合成输出 build_books/{vol}_body.typ

用法：
  python3 scripts/build_md2typst.py munger
  python3 scripts/build_md2typst.py buffett
  python3 scripts/build_md2typst.py all

依赖：pandoc（md→typst 转换）、python3。
"""
import argparse
import os
import re
import subprocess
import sys
import unicodedata

BOOK_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD_DIR = os.path.join(BOOK_ROOT, "build_books")

# ---------------- 源文件配置 ----------------
SOURCES = {
    "munger": {
        "main": os.path.join(
            BOOK_ROOT,
            "editorial/munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md",
        ),
        "extras": [
            "editorial/munger/appendices/附录一_模型身份与思想源流对照表.md",
            "editorial/munger/appendices/附录二_双轨判断检查清单5组.md",
            "editorial/munger/appendices/附录三_25种心理倾向速查表.md",
            "editorial/munger/indexes/典藏A_芒格年表1924-2023.md",
            "editorial/munger/indexes/典藏B_关键人物与关键企业索引.md",
            "editorial/munger/indexes/典藏C_概念问题案例三类索引.md",
        ],
        "body": os.path.join(BUILD_DIR, "munger_body.typ"),
    },
    "buffett": {
        "main": os.path.join(
            BOOK_ROOT,
            "editorial/buffett/manuscript/全卷/所有者的眼光_巴菲特卷全卷连续正文.md",
        ),
        "extras": [
            "editorial/buffett/appendices/附录A_斯科特费泽ON会计桥完整档案.md",
            "editorial/buffett/appendices/附录B_读者与复核检查清单.md",
            "editorial/buffett/archives/典藏层_巴菲特思想与伯克希尔制度年表.md",
            "editorial/buffett/archives/典藏层_人物索引.md",
            "editorial/buffett/archives/典藏层_企业索引.md",
            "editorial/buffett/archives/典藏层_概念·问题·案例总索引.md",
        ],
        "body": os.path.join(BUILD_DIR, "buffett_body.typ"),
    },
}


# ---------------- pandoc 转换 ----------------
def pandoc_to_typst(md_path):
    """md → typst 原始转换（gfm + 脚注扩展）"""
    result = subprocess.run(
        ["pandoc", "-f", "gfm+footnotes", "-t", "typst", md_path],
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout


# ---------------- 正文脚注上标编号 ----------------
#   结论（经最小样例 + 像素级实测，Typst 0.15.1）：
#     · Typst 原生 #super[内容] 会把内容缩到 ~10%（字形约 1pt 高，肉眼不可见），
#       不能用于正文上标；且它会被模板中的 `#show super: none` 隐藏。
#     · text(baseline: 长度) 的语义：**正值=下沉**（文字移到基线下方，右下角），
#       **负值=上浮**（标准上标位，右上角）。之前误写 baseline: 4pt（正值）正是
#       用户看到的"脚注编号全部在右下角"的元凶；改用 -6pt 后为右上角。
#     · 正文 mark 的可见编号由 build_books/book_common.typ 中的
#       `show footnote: it => …counter(footnote).at(loc)…` 规则统一自动生成，
#       与页脚编号天然一致，脚本无需再插入任何标记。
#   因此本函数只负责清理旧版脚本插入的显式上标标记（#super[…] / h+text 上标块）。
def clean_old_footnote_markers(typ_text):
    """清理旧版脚本插入的显式脚注上标标记，不再插入新标记。

    编号由模板 show footnote 规则自动生成；这里清除历史残留，
    避免正文出现重复/不可见的上标痕迹。
    """
    # 1) 清除所有 #super[...] 标记（Typst 0.15 渲染不可见，且将被 show super 隐藏）
    typ_text = re.sub(
        r'#super\[[^\]]*\]',
        '', typ_text,
    )
    # 2) 清除旧版遗留的 h+text 上标块（兼容各种 baseline/size 组合）
    typ_text = re.sub(
        r'#h\(0\.0[2-6]em\)#text\(size:\s*[0-9.]+pt,\s*weight:\s*"[^"]*",\s*fill:\s*rgb\("#[^"]*"\),\s*baseline:\s*-?[0-9]+pt,\s*"[0-9]+"\)',
        '', typ_text,
    )
    return typ_text


# ---------------- 脚注清理 ----------------
def clean_footnotes(typ_text):
    """删除 #footnote[...] 内反引号包裹的 .md 文件路径，仅保留注释核心内容。

    用括号配平解析脚注块，避免内容中 `]` 造成的截断；路径删除后顺手清理
    残留的标点与多余空行。
    """
    out = []
    i = 0
    n = len(typ_text)
    marker = "#footnote["
    while True:
        idx = typ_text.find(marker, i)
        if idx == -1:
            out.append(typ_text[i:])
            break
        out.append(typ_text[i:idx])
        depth = 1
        j = idx + len(marker)
        while j < n and depth > 0:
            c = typ_text[j]
            if c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
            j += 1
        inner = typ_text[idx + len(marker): j - 1]
        # 删除反引号包裹的 .md 路径及其后分隔标点
        inner = re.sub(r"`[^`]*\.md`\s*[，,。;；]?\s*", "", inner)
        # 清理因删除产生的连续标点（如 "，。" → "，"）
        inner = re.sub(r"[，,。]\s*[，,。]", lambda m: m.group(0)[0], inner)
        # 清理脚注开头的残留标点
        inner = re.sub(r"^\s*[，,。;；]\s*", "", inner)
        # 压缩多余空行，行尾去空格
        inner = re.sub(r"[ \t]+\n", "\n", inner)
        inner = re.sub(r"\n{2,}", "\n", inner)
        inner = inner.strip()
        out.append(marker + inner + "]")
        i = j
    return "".join(out)


# ---------------- 标点压缩规避 ----------------
def insert_punct_pad(typ_text):
    """句末标点/闭括号后接全角开括号时，用 box 包裹「标点对 + 细空格」，阻断压缩与收缩。

    背景（经最小复现 + PDF 字形层实测，Typst 0.15.1）：
      · Typst 会对相邻全角标点对做半角压缩——「。（」「？（」「）（」等序列中，
        后括号的字体起点仅偏移 6.5pt（正常 13pt），两个字形 bbox 交叠 6.5–8.5pt，
        在表格单元格等窄排版中肉眼可见（如「化。（喜诗糖果」）。
      · 该行为是引擎内建的中文标点调整，无官方开关（lang/font/par 均无效）。
      · 修复必须同时挡住两条通道：
        1) 标点压缩（shaping 阶段，相邻标点对压半宽）——用细空格把两字符隔开；
        2) justify 收缩（行超宽时按 shrinkability 收缩字形）——右对齐标点「。？！；：）」
           会 shrink_left 把整个字框左移，直接吃掉细空格并让括号再度交叠。
      · 实测结论（同段文字、同容器宽度逐方案对比）：
        裸 #h(0.25em) 在强收缩行失败（gap 回到 -2.7 ~ -6.4pt）；
        #box[#h(0.25em)（] 只包括号仍失败（「。」字框被 justify 左移 4.3pt）；
        #box[。] 单独包裹会触发 Typst 双字形渲染 bug（一个字渲染成两个）；
        只有 #box[。#h(0.25em)（] 整对包裹间距精确恒为 0.25em（实测 3.25pt）。
      · 已知代价：box 不可断行，断行时整对可能落到行首（行首为句末标点，违反中文
        禁则）。实测两卷仅 10 处（表格/窄容器为主），且消除交叠优于禁则瑕疵，接受。
    """
    return re.sub(r"([。？！；：）])(（)", r"#box[\1#h(0.25em)\2]", typ_text)


# ---------------- 表格排版优化 ----------------
#   pandoc 把 md 表格转成 `#table(columns: N, …)`：N 表示 N 个等宽 1fr 列，
#   「编号」「主书分级」等短列与「芒格直接证据」这类超长路径列被机械均分，
#   长列挤成多行碎段、短列大量留白。这里按内容字数重新分配列宽：
#     短列（≤14 单位）→ auto（按内容自然宽，收紧不留白）
#     长列（>14 单位）→ fr（按 units^0.5 压缩后的权重分剩余宽度）
#   权重用平方根而非线性占比的原因（经真实表格逐列核算）：
#     · 线性占比会让超长列独占版面（如 200 单位路径 vs 其余 30 单位），
#       中等列被饿死；旧版「上限 40 的线性 fr」则把 41/55/64 单位的长列
#       全部压成 40fr → 又回到机械等分，长文本列被迫折 3 行。
#     · sqrt 单调压缩差值：41/55/64 → 6.4/7.4/8.0，比例接近内容自然宽，
#       又不至于被个别极端列带偏；实测 232 行附录表行高从 3 行压回 2 行。
#   另删除 pandoc 生成的 `table.hline(),`——表头分隔线已由表格网格统一绘制，
#   默认 1pt 黑色 hline 与浅色网格叠加会形成断续深线（详见 book_common.typ）。
#   解析要点（修复历史 bug）：
#     · pandoc 对长单元格会把一个 cell 折成多行（表头/数据行都可能跨行），
#       旧版按「行首以 [ 开头」逐行提取，只取到每行第一个 cell，导致：
#         a) 表头跨行 → 解析失败，整表退回等宽 columns: N；
#         b) 数据行跨行 → 每行只计 1 个 cell，fr 权重按「表头+首片段」误测
#            （如巴菲特卷「估值方法对照表」的 何时列被量成 16fr 而非 40fr）。
#       新版改为：括号配平整块提取，表头与数据行统一用「顶层 [cell]」抽取，
#       再按列数切成行——跨行单元格不再影响列宽统计。
_TABLE_AUTO_UNITS = 14   # 该阈值内的列用 auto（自然宽度）
_TABLE_FR_POW = 0.5      # fr 权重 = units^0.5（压缩长列差值，防独占版面）
_TABLE_AVAIL_PT = 431.0  # 版心宽 ≈ 431pt（A4 − 左右边距 2.9cm×2）


def _eff_units(text):
    """估算文本渲染宽度单位：CJK/全角字符计 2，其余计 1。

    10.5pt 表格字号下 CJK 字宽 ≈10.5pt、ASCII ≈5.25pt，故以 CJK 为 2 单位。
    反引号（代码路径标记）与转义符不计入宽度。
    """
    text = text.replace("`", "").replace("\\", "")
    n = 0
    for ch in text:
        if unicodedata.east_asian_width(ch) in ("W", "F"):
            n += 2
        else:
            n += 1
    return max(n, 1)


def _extract_cells(text):
    """提取字符串中的顶层 `[cell]`（方括号配平，兼容嵌套 `[...]` 与跨行 cell）。"""
    cells = []
    i, n = 0, len(text)
    while i < n:
        if text[i] == "[":
            depth, j = 1, i + 1
            while j < n and depth > 0:
                if text[j] == "[":
                    depth += 1
                elif text[j] == "]":
                    depth -= 1
                j += 1
            cells.append(text[i + 1: j - 1])
            i = j
        else:
            i += 1
    return cells


def _match_table_paren(text, start):
    """从 text[start]（应为 '('）配平到匹配的 ')'，返回其下标；失败返回 -1。

    '[' 与 ']' 之间的 '(' / ')' 不参与配平（单元格内容可能含括号/函数调用），
    但 `columns: (...)`、`align: (...)`、`table.header(...)` 等参数括号正常计数。
    """
    depth = 0
    bd = 0
    n = len(text)
    i = start
    while i < n:
        c = text[i]
        if c == "[":
            bd += 1
        elif c == "]":
            if bd > 0:
                bd -= 1
        elif bd == 0:
            if c == "(":
                depth += 1
            elif c == ")":
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1


def _table_columns_spec(units):
    """按各列最大内容单位生成 `(auto, 1fr, …)` 列宽列表。

    auto：内容短（≤14 单位），按自然宽收紧；fr：权重 = units^0.5，
    单调但不线性，长列仍按字数多寡区分，又不会独占版面。
    """
    cols = []
    for u in units:
        if u <= _TABLE_AUTO_UNITS:
            cols.append("auto")
        else:
            cols.append("%gfr" % round(u ** _TABLE_FR_POW, 1))
    # 护栏：auto 列估算总宽超版心 90% 时，最宽的 auto 列转 fr，防止溢出
    while True:
        auto_pt = sum(u * 5.25 + 12 for u, c in zip(units, cols) if c == "auto")
        if auto_pt <= _TABLE_AVAIL_PT * 0.9:
            break
        widest = max(
            (i for i, c in enumerate(cols) if c == "auto"),
            key=lambda i: units[i], default=None,
        )
        if widest is None:
            break
        cols[widest] = "%gfr" % round(units[widest] ** _TABLE_FR_POW, 1)
    return cols


def optimize_tables(typ_text):
    """表格排版优化：列宽按内容字数分配 + 删除冗余表头分隔线。

    仅处理 pandoc 标准输出结构 `align(center)[#table(columns: N, …)]`；
    解析失败的表格原样保留，绝不破坏排版。
    """
    # 1) 删除 pandoc 生成的表头分隔线（网格已含，双重绘制会变深/断续）
    typ_text = re.sub(r"(?m)^\s*table\.hline\(\),?\s*\n?", "", typ_text)

    # 2) 逐表改写列宽
    out = []
    pos = 0
    marker = "#table("
    while True:
        idx = typ_text.find(marker, pos)
        if idx == -1:
            out.append(typ_text[pos:])
            break
        out.append(typ_text[pos:idx])
        # 括号配平到 #table( 的匹配右括号（[ ] 内的括号不计入，防单元格误判）
        end = _match_table_paren(typ_text, idx + len(marker) - 1)
        if end == -1:
            out.append(typ_text[idx:])
            break
        block = typ_text[idx:end + 1]
        m_cols = re.search(r"columns:\s*(\d+)", block)
        if not m_cols:
            out.append(block)
            pos = end + 1
            continue
        ncols = int(m_cols.group(1))
        # 表头：table.header( ... ) 配平提取（支持跨行表头 cell）
        h_start = block.find("table.header(")
        header = []
        h_end = -1
        if h_start != -1:
            h_paren = h_start + len("table.header(") - 1
            h_end = _match_table_paren(block, h_paren)
            if h_end != -1:
                header = _extract_cells(block[h_paren + 1:h_end])
        # 数据行：表头右括号之后的所有顶层 [cell]（支持跨行 cell），按列数切成行
        row_region = block[h_end + 1:] if h_end != -1 else block
        cells = _extract_cells(row_region)
        if len(header) != ncols or not header:
            out.append(block)
            pos = end + 1
            continue
        if len(cells) % ncols != 0:
            out.append(block)
            pos = end + 1
            continue
        rows = [cells[i:i + ncols] for i in range(0, len(cells), ncols)]
        # 逐列最大内容单位（表头 + 全部数据行）
        units = []
        for k in range(ncols):
            u = max(
                (_eff_units(r[k]) for r in [header] + rows if k < len(r)),
                default=1,
            )
            units.append(u)
        spec = _table_columns_spec(units)
        block = re.sub(
            r"columns:\s*\d+\s*,",
            "columns: (%s)," % ", ".join(spec),
            block, count=1,
        )
        # 列对齐：pandoc 输出 `align: (auto, ...)`，auto 会继承外层
        # `align(center)[#table(...)]` 的居中对齐，导致窄列内折行的行
        # 各自居中、视觉错位；显式改为 left，保证折行各行左对齐。
        block = re.sub(
            r"align:\s*\((?:auto\s*,?\s*)+\)",
            "align: (%s)" % ", ".join("left" for _ in range(ncols)),
            block, count=1,
        )
        out.append(block)
        pos = end + 1
    return "".join(out)


def demote_quote_headings(typ_text):
    """引文块内标题降级为加粗段落文本（保留 label 锚点）。

    背景（真实缺陷，经 PDF 验证）：
      · pandoc 会把块引用内的标题（md `> ## 标题` / `> #### 标题`）原样
        输出为 typst heading（`== 标题` / `==== 标题` 等），使引文里出现
        正式节标题样式的文字，视觉突兀；且巴菲特卷 toc_depth=2，这些泄漏
        的二级标题会进入目录（实测目录里出现「我们做什么」「美国国库券」）。
      · 处理范围：仅 `#quote(block: true)[ ... ]` 块内的 heading 行。
        行外真实章节/小节标题不受影响。
      · 降级规则：`=+ 标题 <label>` → `#strong[标题]` 段落；label 用
        `#metadata(none) <label>` 保留（当前两卷无 #link 引用，保留仅为
        防止未来链接失效）。标题文本内已有的 `\"` 等 pandoc 转义直接保留。
      · 配平失败（内容含未闭合 `[`）时原样保留整块，绝不冒险破坏排版。
    """
    out = []
    pos = 0
    marker = "#quote(block: true)["
    n = len(typ_text)
    while True:
        idx = typ_text.find(marker, pos)
        if idx == -1:
            out.append(typ_text[pos:])
            break
        out.append(typ_text[pos:idx])
        # 括号配平到匹配的 ]（内容中嵌套的 [ ] 计入深度）
        depth = 1
        j = idx + len(marker)
        while j < n and depth > 0:
            c = typ_text[j]
            if c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
            j += 1
        if depth != 0:
            out.append(typ_text[idx:])
            break
        inner = typ_text[idx + len(marker):j - 1]
        new_inner = []
        for ln in inner.split("\n"):
            m = re.match(r"^(\s*)=+\s*(.*)$", ln)
            if not m:
                new_inner.append(ln)
                continue
            indent, body = m.group(1), m.group(2).strip()
            labels = re.findall(r"<([^> ]+)>", body)
            body = re.sub(r"\s*<[^> ]+>", "", body).strip()
            parts = [indent + "#strong[" + body + "]"]
            parts.extend(indent + "#metadata(none) <%s>" % l for l in labels)
            new_inner.append("\n".join(parts))
        out.append(marker + "\n".join(new_inner) + "]")
        pos = j
    return "".join(out)


# ---------------- 后处理 ----------------
def post_process(typ_text, strip_header=True):
    """对单文件 typst 原始文本做统一后处理。"""
    # 1) 剥离前页：正文 md 开头为书名页 / 版权信息，丢弃到第一个正文章节标题
    #    （`= 第` 开头的标题：第X篇 / 第X章；书名标题如「= 理性的格栅——…」不匹配）
    if strip_header:
        m = re.search(r"^= 第", typ_text, re.M)
        if m:
            typ_text = typ_text[m.start():]
    # 2) 锚点修复：{\#label} → <label>；{\#a \#b \#c} → <a> <b> <c>
    #    （正则中 \\# 已消费首个 \#，group(1) 第一项不带前缀，故用 lstrip 去前缀）
    typ_text = re.sub(
        r"\{\\#([^}]+)\}",
        lambda m: " ".join("<%s>" % l.lstrip("#\\") for l in m.group(1).split()),
        typ_text,
    )

    def _fix_multi_label(line):
        if re.match(r"^={1,6} ", line):
            return re.sub(r"\s*\\#([^ >]+)>", r"> <\1>", line)
        return line

    typ_text = "\n".join(_fix_multi_label(l) for l in typ_text.split("\n"))
    # 3) 删除独立成行且含中文的 slug 行（pandoc 自动生成，会覆盖自定义 label）
    typ_text = re.sub(
        r"^[ \t]*<[^>]*[\u4e00-\u9fff][^>]*>[ \t]*\n?", "", typ_text, flags=re.M
    )
    # 3b) 删除 pandoc 的 thematic break 水平线 — `#divider()`（md 里的 `---` 章节分隔）
    #     用户指出这些横线"无意义"，属于出书过程中的文档用分隔线，不需要保留在出版成品中
    #     （正文/附录里共有 24 条 md thematic break → 24 个无意义 divider 横线）
    typ_text = re.sub(r'^\s*#divider\(\)\s*\n?', '', typ_text, flags=re.M)
    # 4) 破折号恢复：pandoc 将 unicode —/—— 转成 typst 源码 ---/------，统一还原为字符
    #    · 独立成行的 `------` / `---`（md <hr>）不再替换成字符，直接删除整行（上一步已删
    #      divider，这里是保险）
    #    · 只在行内（含前后其他文字或标点的行）做破折号恢复
    def _dash_line(line):
        stripped = line.strip()
        if re.fullmatch(r'-{3,}', stripped):
            return ""
        line = line.replace("------", "——")
        line = line.replace("---", "—")
        return line
    typ_text = "\n".join(_dash_line(l) for l in typ_text.split("\n"))
    # 5) 脚注清理：移除注释中的 .md 文件路径信息
    typ_text = clean_footnotes(typ_text)
    # 5b) 清理旧版脚本插入的显式上标标记（编号由模板 show footnote 规则自动生成）
    typ_text = clean_old_footnote_markers(typ_text)
    # 5c) 标点对细空格：阻断 Typst 的 CJK 标点半角压缩（详见 insert_punct_pad）
    typ_text = insert_punct_pad(typ_text)
    # 6) 插图引用包装：pandoc 生成 #box(image(…, alt: "…")) → #figure()，
    #    以便排版模板里的 figure 样式规则生效（图号、图注、居中、边框等）
    typ_text = wrap_figure_boxes(typ_text)
    # 6b) 表格排版优化：列宽按内容字数分配（替代 pandoc 的等宽均分）、
    #     删除冗余 table.hline()（避免与浅色网格双重绘制成断续深线）
    typ_text = optimize_tables(typ_text)
    # 6b2) 表格单元格内强制换行：⟪br⟫ → #linebreak()
    #      （gfm 表格中 <br> 会被 pandoc 丢弃、反斜杠换行会把单元格拆成两行，
    #        故源 md 用自定义占位符 ⟪br⟫，在 typst 层还原为 linebreak，
    #        实现「中文一行、英文一行」的分行排版）
    typ_text = typ_text.replace("⟪br⟫", "#linebreak()")
    # 6c) 引文块内标题降级：pandoc 会把 `> ## 标题` 输出成正式 heading，
    #     使引文里出现节标题样式并污染目录（巴菲特卷 toc_depth=2 实测受影响）
    typ_text = demote_quote_headings(typ_text)
    return typ_text


def typst_escape_caption(text):
    """escape Typst content brackets in caption text (same as build-editorial-pdfs)"""
    return text.replace("\\", "\\\\").replace("[", "\\[").replace("]", "\\]")


def wrap_figure_boxes(typ_text):
    """Wrap pandoc-generated #box(image(…, alt: "…")) into proper #figure() blocks.

    额外保险：同一张 SVG 在正文里连续出现多次时（pandoc 会因某种路径或
    alt 差异重复生成 box），仅保留第一张出现的，避免一图二插导致的「两
    张同图挨在一起 → 文字被迫叠在图下边距里」的严重重叠。
    """
    seen_paths = set()

    def repl(m):
        path = m.group(1)
        caption = m.group(2)
        if path in seen_paths:
            return ""
        seen_paths.add(path)
        return (
            '#figure(\n'
            '  block(\n'
            '    width: 100%,\n'
            '    inset: (x: 4pt, y: 6pt),\n'
            f'    stroke: 0.5pt + rgb("E7E3DF"),\n'
            '    radius: 2pt,\n'
            f'    align(center)[#image("{path}", width: 100%)],\n'
            '  ),\n'
            f'  caption: [{typst_escape_caption(caption)}],\n'
            ')'
        )
    return re.sub(
        r'#box\(image\(\s*"([^"]+\.svg)",\s*alt:\s*"([^"]*)"\s*\)\s*\)',
        repl,
        typ_text,
    )


# ---------------- 插图锚点提取与回插 ----------------
def extract_figure_anchors(existing_body):
    """从现有 body.typ 提取 (anchor_key, figure_block) 列表。

    规则（修复重复配图的根因）：
      - 同一 heading（h1 或 h1+h2 组合）下的同一张 SVG（image path 相同）仅保留
        第一次出现的 figure 块——避免每次脚本重跑时，旧 body 里已重复的图被
        再次累积插入产生 3× / 18× 级联重复。
      - 不同 heading 下允许重复（极少数章节故意复用同一概念图的场景）。
    """
    anchors = []
    lines = existing_body.split("\n")
    last_h1 = None
    last_h2 = None
    # dedup_key = (last_h1, last_h2, svg_path) → 已见过的图路径
    seen = set()
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if re.match(r"^= ", line):
            last_h1 = line.strip()
            last_h2 = None
        if re.match(r"^== ", line):
            last_h2 = line.strip()
        if re.match(r"^#figure\($", line):
            block = [line]
            j = i + 1
            while j < n:
                block.append(lines[j])
                if re.match(r"^\s*\)\s*$", lines[j]):
                    break
                j += 1
            text = "\n".join(block) + "\n"
            m_img = re.search(r'image\(\s*"([^"]+)"', text)
            svg_path = m_img.group(1) if m_img else None
            if last_h1 and '.svg' in text and svg_path:
                key = (last_h1, last_h2 or "", svg_path)
                if key not in seen:
                    seen.add(key)
                    anchors.append((last_h1, text))
            i = j + 1
            continue
        i += 1
    return anchors


def insert_figures(typ_text, anchors):
    """按 anchor_key（行首匹配 h1）回插 figure 块（全链路去重的最后一环）。

    去重策略：
      1. anchors 先按 (h1, svg_path) 去重：同一 h1 下同一张 SVG 仅保留第一张。
      2. 插入后，在 typ_text 全量再扫一遍：
         - 对所有 #figure(image)：同一个 svg_path 不管在任何位置出现超过 1 次，
           仅保留它在全文中的「第一次出现」，其余所有副本删掉。
         - 对所有 #box(image(.svg)) 形式的裸图：只要 svg_path 在最终保留的
           figure 集合里，就删掉（避免一张图既有 figure 版又有 pandoc 裸
           box 版造成"一图二显"）。
    """
    # ---- 第一层：(h1, svg) 去重 ----
    groups_raw = {}
    for key, fig in anchors:
        m_img = re.search(r'image\(\s*"([^"]+)"', fig)
        pth = m_img.group(1) if m_img else None
        groups_raw.setdefault(key, {})
        if pth and pth not in groups_raw[key]:
            groups_raw[key][pth] = fig
    groups = {k: list(v.values()) for k, v in groups_raw.items()}

    # ---- 按 h1 锚点插入 ----
    for key, figs in reversed(list(groups.items())):
        line = re.search(r"^" + re.escape(key), typ_text, re.M)
        if not line:
            print(f"  [warn] 插图锚点未找到: {key!r}", file=sys.stderr)
            continue
        line_end = typ_text.find("\n", line.start())
        insert_pos = line_end + 1 if line_end != -1 else len(typ_text)
        block = "".join(figs)
        if not block.endswith("\n\n"):
            block += "\n"
        typ_text = typ_text[:insert_pos] + block + typ_text[insert_pos:]

    # ---- 第二层：全量扫 #figure() 的 svg，同一个 svg 仅保留第一次 ----
    figure_pattern = re.compile(
        r'^#figure\(\s*$\n(?:.*?\n)*?^\s*\)\s*$\n?',
        re.MULTILINE,
    )
    seen_fig_paths = set()
    keep_spans = []
    last_end = 0
    for m in figure_pattern.finditer(typ_text):
        block = m.group(0)
        m_pth = re.search(r'image\(\s*"([^"]+\.svg)"', block)
        pth = m_pth.group(1) if m_pth else None
        keep_spans.append((last_end, m.start()))  # 块间文字保留
        if pth is None or pth not in seen_fig_paths:
            if pth: seen_fig_paths.add(pth)
            keep_spans.append((m.start(), m.end()))  # 本 figure 保留
        # else: 同 pth 再遇 → 整段 figure 丢弃
        last_end = m.end()
    keep_spans.append((last_end, len(typ_text)))
    typ_text = "".join(typ_text[s:e] for s, e in keep_spans)

    # ---- 第三层：裸 #box(image(.svg)) 若 svg 已在保留 figure 中则删除 ----
    def _strip_dup_boxes(m):
        pth = m.group(1)
        return "" if pth in seen_fig_paths else m.group(0)
    typ_text = re.sub(
        r'#box\(image\(\s*"([^"]+\.svg)",\s*alt:\s*"[^"]*"\s*\)\s*\)\n?',
        _strip_dup_boxes, typ_text,
    )
    return typ_text


# ---------------- 章末注释（页脚注 → 章后注） ----------------
def _extract_footnote_blocks(typ_text):
    """提取所有 `#footnote[...]` 块，返回 [(start, end, inner)]。

    用方括号配平解析，兼容内容中嵌套 `[` 的脚注。
    """
    blocks = []
    marker = "#footnote["
    i = 0
    n = len(typ_text)
    while True:
        idx = typ_text.find(marker, i)
        if idx == -1:
            break
        depth = 1
        j = idx + len(marker)
        while j < n and depth > 0:
            c = typ_text[j]
            if c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
            j += 1
        inner = typ_text[idx + len(marker): j - 1]
        blocks.append((idx, j, inner))
        i = j
    return blocks


def convert_footnotes_to_endnotes(typ_text):
    """页脚注 → 章末注释（endnote）。

    - 正文引用处替换为 #endnote_mark(n)（章内连续编号，模板渲染上标）
    - 每章「== 注释」标题下插入 #endnote_entries((n, [内容]), ...)
    - 有脚注但没有「注释」标题的章（如部分附录）在章末追加注释区
    - 无脚注的章删除空的「== 注释」标题，避免出现「注释」独占一页的无效印刷页
    """
    blocks = _extract_footnote_blocks(typ_text)
    if not blocks:
        # 无脚注：仍需要删除空的注释标题
        return _strip_empty_note_headings(typ_text)

    # 定位每个 h1（= 标题）作为章的边界
    h1_pos = [(m.start(), m.group(0).strip())
              for m in re.finditer(r"(?m)^= .*$", typ_text)]

    chapter_notes = {}   # h1_key -> [(n, inner)]
    replacements = []    # [(start, end, h1_key, n)]
    h1_idx = 0
    for start, end, inner in blocks:
        while h1_idx + 1 < len(h1_pos) and h1_pos[h1_idx + 1][0] < start:
            h1_idx += 1
        h1_key = h1_pos[h1_idx][1] if h1_pos else "FRONT"
        notes = chapter_notes.setdefault(h1_key, [])
        n = len(notes) + 1
        notes.append((n, inner))
        replacements.append((start, end, h1_key, n))

    # 1) 正文替换：#footnote[inner] → #endnote_mark(n)
    out = []
    last = 0
    for start, end, _k, n in replacements:
        out.append(typ_text[last:start])
        out.append("#endnote_mark(%d)" % n)
        last = end
    out.append(typ_text[last:])
    new_text = "".join(out)

    # 2) 在每个「== 注释」标题下插入该章注释列表
    lines = new_text.split("\n")
    inserted = set()          # 已处理的 h1_key
    inserts = {}              # 行号 -> [文本]
    cur_h1 = None
    for i, ln in enumerate(lines):
        if re.match(r"^= ", ln):
            cur_h1 = ln.strip()
        if re.match(r"^== 注释", ln) and cur_h1 in chapter_notes:
            entries = chapter_notes[cur_h1]
            block = "\n" + _endnote_entries_block(entries)
            inserts.setdefault(i, []).append(block)
            inserted.add(cur_h1)
    for ln_no in sorted(inserts, reverse=True):
        lines[ln_no:ln_no + 1] = [lines[ln_no]] + inserts[ln_no]
    new_text = "\n".join(lines)

    # 3) 有脚注但没有「== 注释」的章（如附录）：在章末追加注释区
    lines = new_text.split("\n")
    for h1_key, entries in chapter_notes.items():
        if h1_key in inserted:
            continue
        # 找到该 h1 的结束行（下一个 h1 前）
        end_ln = None
        for i, ln in enumerate(lines):
            if ln.strip() == h1_key:
                j = i + 1
                while j < len(lines) and not re.match(r"^= ", lines[j]):
                    if lines[j].strip():
                        end_ln = j
                    j += 1
                break
        if end_ln is None:
            continue
        block = "\n== 注释\n" + _endnote_entries_block(entries)
        lines[end_ln:end_ln + 1] = [lines[end_ln], block]
    new_text = "\n".join(lines)

    # 4) 删除空「== 注释」标题（无脚注的章）
    return _strip_empty_note_headings(new_text)


def _endnote_entries_block(entries):
    """生成 `#endnote_entries((n, [内容]), ...)` 调用块。

    注意：inner 是 pandoc 输出的合法 Typst content（`\"` `\$` `\[` 等
    已转义），直接放入 `[ ]` 即可，不可再经 typst_escape_caption 二次转义，
    否则 `\"`→`\\"`、`\$`→`\\$` 会破坏转义序列并触发数学模式报错。
    """
    items = ",\n".join(
        "  (%d, [%s])" % (n, inner) for n, inner in entries
    )
    return "#endnote_entries(\n%s\n)\n" % items


def _strip_empty_note_headings(typ_text):
    """删除下面没有内容的「== 注释」标题（含其后空行）。"""
    lines = typ_text.split("\n")
    out = []
    i = 0
    n = len(lines)
    while i < n:
        ln = lines[i]
        if re.match(r"^== 注释", ln):
            j = i + 1
            has_content = False
            while j < n and not re.match(r"^={1,6} ", lines[j]):
                if lines[j].strip():
                    has_content = True
                j += 1
            if not has_content:
                i += 1
                while i < n and not lines[i].strip():
                    i += 1
                continue
        out.append(ln)
        i += 1
    return "\n".join(out)


# ---------------- 篇首导读并入篇首页 ----------------
def extract_part_leads(typ_text):
    """把「篇首导读」并入篇首页设计页：删除导读标题，正文包成 #part_lead[...]。

    消除「篇首导读」独立成页（每篇多出一页只有几行文字的碎片页）。
    """
    lines = typ_text.split("\n")
    out = []
    i = 0
    n = len(lines)
    while i < n:
        ln = lines[i]
        out.append(ln)
        if re.match(r"^= 第.+篇", ln):
            # part 标题之后找「== 篇首导读」
            j = i + 1
            while j < n and not re.match(r"^== 篇首导读", lines[j]) \
                    and not re.match(r"^= ", lines[j]):
                j += 1
            if j < n and re.match(r"^== 篇首导读", lines[j]):
                # 收集导读正文段（到下个标题）
                k = j + 1
                while k < n and not lines[k].strip():
                    k += 1
                para = []
                if k < n and not re.match(r"^={1,6} ", lines[k]):
                    while k < n and lines[k].strip() and not re.match(r"^={1,6} ", lines[k]):
                        para.append(lines[k].strip())
                        k += 1
                # 从输出中移除导读标题与正文（标题在前面的 out 中，正文尚未 append）
                # 用哨兵标记定位：直接回溯 out 删掉导读标题行
                out = [o for o in out if o.strip() != "== 篇首导读"]
                if para:
                    # para 是 pandoc 输出的合法 Typst content，直接放入，不二次转义
                    out.append("#part_lead[%s]" % " ".join(para))
                i = k
                continue
        i += 1
    return "\n".join(out)


# ---------------- 段首加粗引导语（run-in heading） ----------------
_LEAD_EXCLUDE_STARTS = (
    "既然", "所以", "因此", "这里", "那里", "到这里", "接下来", "首先",
    "但是", "不过", "换句话说", "讲到", "回到", "至于", "关于",
    "同样", "换言之", "最后", "一方面", "如果说",
)

def bold_lead_in(typ_text):
    """段首加粗引导语：h2 节首段若是「判断式主题句」，加粗第一句（run-in heading）。

    克制规则，避免破坏散文：
      - 仅处理非「篇首导读/本章小结/注释」的节
      - 首句以句号结束、不含内部句读、长度 4~20 字
      - 跳过引语开头、数字开头、连接词开头的段落
    """
    lines = typ_text.split("\n")
    i = 0
    n = len(lines)
    while i < n:
        ln = lines[i]
        if re.match(r"^== ", ln) and not re.match(r"^== (篇首导读|本章小结|注释)", ln):
            j = i + 1
            while j < n and not lines[j].strip():
                j += 1
            if j < n and not re.match(r"^={1,6} ", lines[j]):
                lines[j] = _try_bold_lead(lines[j])
        i += 1
    return "\n".join(lines)


def _try_bold_lead(para):
    p = para.strip()
    if not p or p.startswith('\\"') or p.startswith("“") or p.startswith("#"):
        return para
    m = re.match(r"^([^，,。？?！!：:]{4,20}?)([。．])", p)
    if not m:
        return para
    head, punct = m.group(1), m.group(2)
    if re.match(r"^\d", head):
        return para
    if head.startswith(_LEAD_EXCLUDE_STARTS):
        return para
    lead = len(para) - len(p)
    return para[:lead + m.start()] + "#strong[" + head + "]" + punct + p[m.end():]


def dedup_heading_labels(typ_text):
    """heading 行内重复的 label 改为 -2/-3…（保留第一次定义供 #link 引用）。

    同一 label 在正文与附录/索引重复定义时，Typst 会报 label 重复；
    正文与链接引用指向第一次定义，后续重复定义依次改名。
    """
    seen = {}
    out = []
    for line in typ_text.split("\n"):
        if re.match(r"^={1,6} ", line):
            def repl(m):
                label = m.group(1)
                if label in seen:
                    seen[label] += 1
                    return f"<{label}-{seen[label]}>"
                seen[label] = 1
                return m.group(0)
            line = re.sub(r"<([^> ]+)>", repl, line)
        out.append(line)
    return "\n".join(out)


def split_heading_labels(typ_text):
    """heading 行只能带一个 label（Typst 只保留最后一个），多 label 拆到下一行。

    `= 标题 <a> <b> <c>` → `= 标题 <a>` + 后续每行 `#metadata(none) <b>` / `<c>`。
    metadata 是不可见元素、自带可链接位置，label 挂在它后面即可作为 #link 目标；
    每个元素只能挂一个 label，故一个 label 一行。
    """
    out = []
    for line in typ_text.split("\n"):
        if re.match(r"^={1,6} ", line):
            labels = re.findall(r"<([^> ]+)>", line)
            if len(labels) > 1:
                body = re.sub(r"\s*<[^> ]+>", "", line).rstrip()
                out.append(body + " <" + labels[0] + ">")
                out.extend("#metadata(none) <%s>" % l for l in labels[1:])
                continue
        out.append(line)
    return "\n".join(out)


# ---------------- 插图限高（消除图后页底大留白） ----------------
_MAX_IMAGE_CM = 11.0   # 插图最大高度（约版心高 45%，宽自动）
_TEXTWIDTH_CM = 15.2  # 版心宽度：A4 210mm − 左右边距 29mm×2


def _svg_ratio(path):
    """读取 SVG 宽高比 h/w；无法解析时默认 1.0（保守触发限高）。"""
    p = path
    if not os.path.isabs(p):
        # body 里路径形如 ../editorial/...，相对仓库根 → 归一后拼绝对路径
        p = os.path.join(BOOK_ROOT, p.replace("../", ""))
    try:
        with open(p, encoding="utf-8", errors="ignore") as f:
            s = f.read(3000)
    except OSError:
        return 1.0
    m = re.search(r'viewBox="([\d.\- ]+)"', s)
    if m:
        vb = m.group(1).split()
        if len(vb) == 4:
            w = float(vb[2]) - float(vb[0])
            h = float(vb[3]) - float(vb[1])
            if w > 0:
                return h / w
    mw = re.search(r'width="([\d.]+)(?:pt|cm|mm)"', s)
    mh = re.search(r'height="([\d.]+)(?:pt|cm|mm)"', s)
    if mw and mh:
        w, h = float(mw.group(1)), float(mh.group(1))
        if w > 0:
            return h / w
    return 1.0


def cap_image_height(typ_text):
    """width:100% 超高图 → height:11cm 限高（宽自动）。

    版心宽 15.2cm；高宽比 > 11/15.2 ≈ 0.724 的图（如 1:1 方图、0.75 竖图）
    按 width:100% 排会超过 11cm 高、占半页以上，图后正文难以回填造成
    页底大片留白。限高后图占位收窄，后续正文能回填，消除无效留白。
    """
    threshold = _MAX_IMAGE_CM / _TEXTWIDTH_CM

    def repl(m):
        path = m.group(1)
        if _svg_ratio(path) > threshold:
            return f'image("{path}", height: {_MAX_IMAGE_CM}cm)'
        return m.group(0)

    return re.sub(
        r'image\(\s*"([^"]+\.(?:svg|png|jpg|jpeg|webp))",\s*width:\s*100%\)',
        repl, typ_text,
    )


# ---------------- 整卷合成 ----------------
def build_book(vol):
    cfg = SOURCES[vol]
    main_md = cfg["main"]
    extras = [os.path.join(BOOK_ROOT, p) for p in cfg["extras"]]
    body_out = cfg["body"]

    print(f"[{vol}] 转换正文: {os.path.basename(main_md)}")
    parts = [post_process(pandoc_to_typst(main_md), strip_header=True)]
    for p in extras:
        print(f"[{vol}] 转换附录: {os.path.basename(p)}")
        parts.append(post_process(pandoc_to_typst(p), strip_header=False))
    text = "\n".join(parts).strip() + "\n"
    # 正文与附录可能重复定义 label，统一去重改名（正文/链接指向首次定义）
    text = dedup_heading_labels(text)
    # heading 行多 label 拆为独立 #label()，避免 Typst 只保留最后一个
    text = split_heading_labels(text)

    # ---- 出版级正文整理（两卷共用）----
    # 1) 页脚注 → 章末注释：正文保留上标编号，内容归入每章「注释」区
    text = convert_footnotes_to_endnotes(text)
    # 2) 篇首导读并入篇首页，消除「导读」独立碎片页
    text = extract_part_leads(text)
    # 3) 段首加粗引导语（判断式主题句 run-in 加粗）
    text = bold_lead_in(text)

    # 插图位置：pandoc 已在正文原始位置输出 `#box(image(...))`，
    # post_process → wrap_figure_boxes 已将其转为 #figure 并保留原位（md 源插图位置）。
    # 不再从旧 body 提取插图集中插入章首——那会让每章所有图堆在章开头，
    # 而不是出现在正文对应的论述位置。

    # ---- 相对路径修正：
    #   pandoc / 手动回插 image / figure 的路径是相对于项目根（`editorial/...`）的，
    #   但 body.typ 在 `build_books/` 下被 include，按 typst 默认 cwd 解析会少一层。
    #   统一改为相对于 build_books/ 的 `../editorial/...`，这样无论是
    #   `typst compile build_books/xxx.typ` 还是在 build_books 子目录里直接编译都一致。
    def _fix_image_path(m):
        return m.group(0).replace('"editorial/', '"../editorial/')
    text = re.sub(r'image\(\s*("editorial/[^"]*\.(?:svg|png|jpg|jpeg|webp))', _fix_image_path, text)

    # 插图限高：width:100% 超高图 → height:11cm，消除图后页底大留白
    text = cap_image_height(text)

    # body.typ 经 #include 引入时是独立模块作用域，正文里的 endnote/part_lead
    # 辅助函数必须在 body 自身 import，否则报 unknown variable。
    if any(k in text for k in ("#endnote_mark", "#endnote_entries", "#part_lead")):
        text = (
            '#import "book_common.typ": endnote_mark, endnote_entries, part_lead\n\n'
            + text
        )

    with open(body_out, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"[{vol}] 输出: {body_out}")
    return body_out


def main():
    ap = argparse.ArgumentParser(description="巴芒两卷 md→typst 合成生成脚本")
    ap.add_argument("vol", choices=["munger", "buffett", "all"], help="卷别")
    args = ap.parse_args()
    vols = ["munger", "buffett"] if args.vol == "all" else [args.vol]
    for v in vols:
        build_book(v)


if __name__ == "__main__":
    main()
