#!/usr/bin/env python3
"""巴芒两卷「出版校样」EPUB 生成脚本（pandoc）

与 build_md2typst.py 共用同一组源文件（正文 + 附录 + 典藏层），输出
output/epub/ 下的出版校样 epub：

- 正文：剥离书名页 / 编辑状态行等前页，重建干净的卷首页（书名 + 系列）
- 脚注：删除反引号包裹的内部 .md 文件路径（与 PDF 出版管线一致）
- 图片：正文插图（SVG）随 pandoc 内嵌为 epub 媒体文件
- 目录：按 h1 分章，toc 含 h1+h2 两级

用法：
  python3 scripts/build-publish-epub.py munger
  python3 scripts/build-publish-epub.py buffett
  python3 scripts/build-publish-epub.py all
"""
import argparse
import os
import re
import subprocess
import tempfile

BOOK_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BOOK_ROOT, "output", "epub")

CSS = 'body { font-family: "Songti SC", serif; } h1, h2, h3 { color: #AB1942; }'

BOOKS = {
    "munger": {
        "main": "editorial/munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md",
        "extras": [
            "editorial/munger/appendices/附录一_模型身份与思想源流对照表.md",
            "editorial/munger/appendices/附录二_双轨判断检查清单5组.md",
            "editorial/munger/appendices/附录三_25种心理倾向速查表.md",
            "editorial/munger/indexes/典藏A_芒格年表1924-2023.md",
            "editorial/munger/indexes/典藏B_关键人物与关键企业索引.md",
            "editorial/munger/indexes/典藏C_概念问题案例三类索引.md",
        ],
        "title": "理性的格栅",
        "author": "查理·芒格",
        "out": "理性的格栅_芒格卷_出版校样.epub",
    },
    "buffett": {
        "main": "editorial/buffett/manuscript/全卷/所有者的眼光_巴菲特卷全卷连续正文.md",
        "extras": [
            "editorial/buffett/appendices/附录A_斯科特费泽ON会计桥完整档案.md",
            "editorial/buffett/appendices/附录B_读者与复核检查清单.md",
            "editorial/buffett/archives/典藏层_巴菲特思想与伯克希尔制度年表.md",
            "editorial/buffett/archives/典藏层_人物索引.md",
            "editorial/buffett/archives/典藏层_企业索引.md",
            "editorial/buffett/archives/典藏层_概念·问题·案例总索引.md",
        ],
        "title": "所有者的眼光",
        "author": "沃伦·巴菲特",
        "out": "所有者的眼光_巴菲特卷_出版校样.epub",
    },
}


def read(path):
    with open(os.path.join(BOOK_ROOT, path), encoding="utf-8") as f:
        return f.read()


def clean_footnote_paths(md):
    """删除脚注定义中反引号包裹的 .md 文件路径（保留其后的说明文字）。

    只作用于脚注定义行（`[^xxx]: ...`）及其缩进续行；表格单元格内的
    .md 证据路径（如附录一）不属于脚注，保持不变，与 PDF 管线行为一致。
    """
    out = []
    in_footnote = False
    for line in md.split("\n"):
        if re.match(r"^\[\^[^\]]+\]:", line):
            in_footnote = True
        elif line.strip() and not line.startswith((" ", "\t")):
            in_footnote = False
        if in_footnote:
            line = re.sub(r"`[^`]*\.md`\s*[，,。;；]?\s*", "", line)
            line = re.sub(r"^\s*[，,。;；]\s*", "", line)
        out.append(line)
    return "\n".join(out)


def clean_front_matter(md):
    """剥离书名页 / 编辑状态行等前页，返回 (书名, 系列, 正文)。"""
    title = ""
    for line in md.split("\n"):
        m = re.match(r"^#\s+(.+)$", line.strip())
        if m:
            title = m.group(1).strip()
            break
    series = ""
    for line in md.split("\n"):
        m = re.match(r"^系列[:：]\s*(.+)$", line.strip())
        if m:
            series = "系列：" + m.group(1).strip()
            break
    m = re.search(r"(?m)^#\s+第.+篇", md)
    body = md[m.start():] if m else md
    return title, series, body


def absolute_image_paths(md):
    """正文中的相对图片路径（editorial/...）改为绝对路径，供 pandoc 内嵌。"""
    return re.sub(
        r"\((editorial/[^)\s]+)\)",
        lambda m: "(" + os.path.abspath(os.path.join(BOOK_ROOT, m.group(1))) + ")",
        md,
    )


def build(vol):
    cfg = BOOKS[vol]
    main_md = read(cfg["main"])
    title, series, body = clean_front_matter(main_md)
    title_page = f"# {title}\n"
    if series:
        title_page += f"\n{series}\n"

    parts = [title_page, body]
    parts += [read(p) for p in cfg["extras"]]
    combined = "\n\n".join(clean_footnote_paths(p) for p in parts)
    combined = absolute_image_paths(combined)

    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, cfg["out"])
    with tempfile.TemporaryDirectory() as tmp:
        md_path = os.path.join(tmp, "book.md")
        css_path = os.path.join(tmp, "book.css")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(combined)
        with open(css_path, "w", encoding="utf-8") as f:
            f.write(CSS)
        cmd = [
            "pandoc", md_path,
            "-f", "gfm+footnotes",
            "-t", "epub3",
            "--toc", "--toc-depth=2",
            "--split-level=1",
            "--metadata", f"title={cfg['title']}",
            "--metadata", f"author={cfg['author']}",
            "--metadata", "lang=zh-CN",
            f"--css={css_path}",
            "-o", out_path,
        ]
        print(f"[{vol}] pandoc -> {os.path.basename(out_path)}")
        subprocess.run(cmd, check=True)
    size = os.path.getsize(out_path)
    print(f"[{vol}] 完成: {out_path} ({size / 1024:.0f} KB)")


def main():
    ap = argparse.ArgumentParser(description="巴芒两卷出版校样 epub 生成")
    ap.add_argument("vol", choices=["munger", "buffett", "all"])
    args = ap.parse_args()
    vols = ["munger", "buffett"] if args.vol == "all" else [args.vol]
    for v in vols:
        build(v)


if __name__ == "__main__":
    main()
