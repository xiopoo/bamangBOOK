#!/usr/bin/env python3
"""巴芒两卷「正式发布」EPUB 生成脚本（pandoc + OPF 后处理）

输出 output/release-epub/ 下的正式发布版 EPUB，包含：
- 封面页（自建 <img> 封面，确保阅读器真实显示，并在 OPF 声明 cover-image）
- 出版版权页（独立前页章节，含公众号二维码）
- 成稿正文（原样保留，自带书名大标题，不重复拼接）
- 附录 / 典藏层索引
- 末尾「关于本书」出品方说明
- 脚注：删除反引号包裹的内部 .md 文件路径
- 正文插图（SVG）随 pandoc 内嵌

用法：
  python3 scripts/build-release-epub.py munger
  python3 scripts/build-release-epub.py buffett
  python3 scripts/build-release-epub.py all
"""
import argparse
import os
import re
import subprocess
import tempfile
import zipfile
from xml.etree import ElementTree as ET

BOOK_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BOOK_ROOT, "output", "release-epub")
QR_PATH = "public/qrcode.jpeg"

OPF_NS = "http://www.idpf.org/2007/opf"
NCX_NS = "http://www.daisy.org/z3986/2005/ncx/"

CSS = """
body { font-family: "Songti SC", "Noto Serif CJK SC", serif; line-height: 1.85; }
h1 { color: #AB1942; }
h2, h3 { color: #7a1330; }
.cover { text-align: center; padding: 0; margin: 0; }
.cover img { width: 100%; height: auto; display: block; }
.copyright-qr { text-align: center; margin: 24px 0; }
.copyright-qr img { width: 160px; height: 160px; }
blockquote { border-left: 3px solid #AB1942; padding-left: 1em; color: #444; }
"""

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
        "copyright": "editorial/munger/版权页.md",
        "cover": "editorial/munger/cover/cover-release-front.png",
        "about": "本文出自《理性的格栅——芒格论思维模型、商业判断与人生智慧》，"
                 "是「复利书房·巴芒经典」系列第二卷，由金家岭小胖（华少）"
                 "从芒格数十年公开文字中蒸馏、整理与再编辑。非商业出版物，"
                 "非官方授权著作；引文版权归原作者及原权利人所有。",
        "title": "理性的格栅",
        "subtitle": "芒格论思维模型、商业判断与人生智慧",
        "author": "华少（金家岭小胖）",
        "series": "复利书房·巴芒经典",
        "out": "理性的格栅_芒格卷_正式发布.epub",
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
        "copyright": "editorial/buffett/版权页.md",
        "cover": "editorial/buffett/cover/cover-release-front.png",
        "about": "本文出自《所有者的眼光——巴菲特论企业、资本与长期复利》，"
                 "是「复利书房·巴芒经典」系列第一卷，由金家岭小胖（华少）"
                 "从巴菲特数十年公开文字中蒸馏、整理与再编辑。非商业出版物，"
                 "非官方授权著作；引文版权归原作者及原权利人所有。",
        "title": "所有者的眼光",
        "subtitle": "巴菲特论企业、资本与长期复利",
        "author": "华少（金家岭小胖）",
        "series": "复利书房·巴芒经典",
        "out": "所有者的眼光_巴菲特卷_正式发布.epub",
    },
}


def read(path):
    with open(os.path.join(BOOK_ROOT, path), encoding="utf-8") as f:
        return f.read()


# 指向仓库内部目录的源文件路径前缀（出现在脚注或正文 <code> 中，属编辑内部引用，对读者无意义）
REPO_PATH_PREFIX = (
    r"(?:`?)(?:content/|appendices/|archives/|manuscript/|indexes/|editorial/|"
    r"letters/|people/|articles/|partnership/|docs/|scripts/|build_books/|recovery_archive/)"
)
REPO_PATH_RE = re.compile(REPO_PATH_PREFIX + r"[^\s，。；,.;`<>]*" + r"(?:\.md`?|/\*?`?|`?)?")


def clean_repo_paths(md):
    """删除正文中所有指向仓库内部目录的源文件路径（反引号或 <code> 包裹），
    并清除标题/正文里残留的锚点（{#...} 标题锚点属性，以及散落的 #munger-ch-xx
    交叉引用标记），这些对读者都是无效英文。"""
    out = []
    for line in md.split("\n"):
        # 规范化未闭合的 HTML 换行标签（XHTML 要求 <br/>，否则阅读器报 XML 错误）
        line = re.sub(r"<br\s*>", "<br/>", line)
        line = re.sub(r"<hr\s*>", "<hr/>", line)
        line = REPO_PATH_RE.sub("", line)
        # 删除标题锚点属性（支持多锚点空格分隔）：{#a #b}
        line = re.sub(r"\{#[^}]*\}", "", line)
        # 删除任意 `xxx.md` 反引号路径（不限于已知仓库前缀）
        line = re.sub(r"`[^`]*?\.md`", "", line)
        # 删除表格/代码块等位置的纯 ASCII 源文件路径（xxx/yyy.md）
        line = re.sub(r"[A-Za-z0-9_./-]+\.md", "", line)
        # 删除正文里散落的交叉引用锚点标记：#munger-ch-xx 等
        line = re.sub(r"#[A-Za-z][A-Za-z0-9_-]*", "", line)
        # 删除删锚点/路径后可能残留的孤立标点/空白
        line = re.sub(r"\s*[，,。;；:：、]\s*(?=$)", "", line)
        line = re.sub(r"[（(]\s*[）)]", "", line)  # 清掉被掏空的括号
        line = re.sub(r"\s{2,}", " ", line)
        out.append(line)
    return "\n".join(out)


def clean_footnote_paths(md):
    """删除脚注定义中的源文件路径反引号及其后标点，仅保留中文说明；
    并清理正文里剩余的仓库内部路径（见 clean_repo_paths）。"""
    md = clean_repo_paths(md)
    out = []
    in_footnote = False
    for line in md.split("\n"):
        if re.match(r"^\[\^[^\]]+\]:", line):
            in_footnote = True
        elif line.strip() and not line.startswith((" ", "\t")):
            in_footnote = False
        if in_footnote:
            line = re.sub(r"`[^`]*?\.md`", "", line)
            line = re.sub(r"[A-Za-z0-9_./-]+\.md\b", "", line)
            line = re.sub(r"[，,。;；:：]\s*$", "", line)
            line = re.sub(r"^\s*[，,。;；:：]\s*", "", line)
            line = re.sub(r"\s{2,}", " ", line).strip()
            if re.match(r"^\[\^[^\]]+\]:\s*$", line):
                line = ""
        out.append(line)
    return "\n".join(out)


def build_cover_html(cfg):
    """自建封面页：用 <img> 直接引用封面图（避免 pandoc SVG 占位不显示）。"""
    cover_path = os.path.abspath(os.path.join(BOOK_ROOT, cfg["cover"]))
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="zh-CN" xml:lang="zh-CN">
<head><meta charset="UTF-8"/><title>封面</title></head>
<body class="cover">
<figure><img src="{cover_path}" alt="{cfg['title']} 封面" /></figure>
</body>
</html>""", cover_path


def postprocess_opf(epub_path, cover_html, cover_basename, cover_img_path):
    """后处理：注入自建封面页（<img> 真实封面），声明 cover-image，移到 spine 最前。"""
    with zipfile.ZipFile(epub_path, "r") as z:
        names = z.namelist()
        opf_name = [n for n in names if n.endswith(".opf")][0]
        opf_bytes = z.read(opf_name)
        others = {n: z.read(n) for n in names if n != opf_name}

    ET.register_namespace("opf", OPF_NS)
    ET.register_namespace("epub", "http://www.idpf.org/2007/ops")
    root = ET.fromstring(opf_bytes)
    manifest = root.find(f"{{{OPF_NS}}}manifest")
    spine = root.find(f"{{{OPF_NS}}}spine")

    cover_id = "cover-page"
    cover_href = "text/" + cover_basename
    # 封面图相对封面页的引用路径
    img_name = "media/" + os.path.basename(cover_img_path)
    cover_html = cover_html.replace(os.path.abspath(cover_img_path),
                                    "../" + img_name)

    # 1) 加入封面图 media 文件（若不存在）
    img_id = None
    if img_name not in [it.get("href") for it in manifest.findall(f"{{{OPF_NS}}}item")]:
        rel_src = os.path.relpath(cover_img_path, BOOK_ROOT)
        with zipfile.ZipFile(epub_path, "r") as zr:
            # 取封面图原始字节：优先从已内嵌 media 找，否则从源读
            try:
                img_bytes = zr.read("EPUB/" + img_name)
            except KeyError:
                img_bytes = open(cover_img_path, "rb").read()
        others["EPUB/" + img_name] = img_bytes
        it = ET.SubElement(manifest, f"{{{OPF_NS}}}item")
        it.set("id", "cover-image")
        it.set("href", img_name)
        it.set("media-type", "image/png" if cover_img_path.lower().endswith(".png") else "image/jpeg")
        it.set("properties", "cover-image")
        img_id = "cover-image"

    # 2) 加入封面页 item
    cover_item = ET.SubElement(manifest, f"{{{OPF_NS}}}item")
    cover_item.set("id", cover_id)
    cover_item.set("href", cover_href)
    cover_item.set("media-type", "application/xhtml+xml")

    # 3) spine 最前插入封面
    ref = ET.Element(f"{{{OPF_NS}}}itemref")
    ref.set("idref", cover_id)
    spine.insert(0, ref)

    out_bytes = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(epub_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr(opf_name, out_bytes)
        z.writestr("EPUB/" + cover_href, cover_html)
        for n, b in others.items():
            z.writestr(n, b)


def build(vol):
    cfg = BOOKS[vol]
    qr_abs = os.path.abspath(os.path.join(BOOK_ROOT, QR_PATH))

    # 版权页（含二维码引用 qrcode.jpeg）+ 成稿正文（自带书名大标题）+ 附录 + 关于本书
    copyright_md = read(cfg["copyright"])
    body_md = read(cfg["main"]).strip()
    extras_md = "\n\n".join(read(p) for p in cfg["extras"])
    about_md = f"\n\n---\n\n## 关于本书\n\n{cfg['about']}\n"

    # 版权页里引用的 qrcode.jpeg 解析为绝对路径，供 pandoc 内嵌
    copyright_md = copyright_md.replace("](qrcode.jpeg)", f"]({qr_abs})")

    combined = "\n\n".join(
        clean_footnote_paths(x) for x in [copyright_md, body_md, extras_md, about_md]
    )

    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, cfg["out"])

    with tempfile.TemporaryDirectory() as tmp:
        md_path = os.path.join(tmp, "book.md")
        css_path = os.path.join(tmp, "book.css")
        cover_html, cover_img = build_cover_html(cfg)
        cover_basename = "cover.xhtml"

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
            "--metadata", f"title={cfg['title']}：{cfg['subtitle']}",
            "--metadata", f"author={cfg['author']}",
            "--metadata", "publisher=复利书房",
            "--metadata", "lang=zh-CN",
            f"--css={css_path}",
            "-o", out_path,
        ]
        print(f"[{vol}] pandoc -> {os.path.basename(out_path)}")
        subprocess.run(cmd, check=True)

    # 后处理：注入自建封面页（真实 <img> 封面），声明 cover-image，置于 spine 最前
    postprocess_opf(out_path, cover_html, cover_basename, cover_img)

    size = os.path.getsize(out_path)
    print(f"[{vol}] 完成: {out_path} ({size / 1024:.0f} KB)")


def main():
    ap = argparse.ArgumentParser(description="巴芒两卷正式发布 epub 生成（含版权页与封面）")
    ap.add_argument("vol", choices=["munger", "buffett", "all"])
    args = ap.parse_args()
    vols = ["munger", "buffett"] if args.vol == "all" else [args.vol]
    for v in vols:
        build(v)


if __name__ == "__main__":
    main()
