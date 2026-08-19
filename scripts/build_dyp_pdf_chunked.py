#!/usr/bin/env python3
"""稳健打印管线：将打印版 Markdown 按「章(H2)」切分为小块，分别 pandoc->HTML->Chromium PDF，
避免超大单文档触发 Chromium 打印崩溃；随后 pypdf 合并，并用 reportlab(STSong-Light 中文) 加盖
全局连续页码「第 X / Y 页」。临时块文件自动清理。"""
import os, re, subprocess, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "build_books/dyp_themed")
SRC = os.path.join(OUT, "段永平文集_打印版.md")
CSS = os.path.join(BASE, "scripts/print_dyp_chunk.css")
RENDER = os.path.join(BASE, "scripts/html_to_pdf_chunk.js")
TMP = os.path.join(OUT, "_chunks")
FINAL = os.path.join(OUT, "段永平文集_打印版.pdf")


def split_md(md):
    lines = md.splitlines()
    # 前置：封面 + 目录（到第一个卷 H1 之前）
    front = []
    body_start = 0
    for i, ln in enumerate(lines):
        if re.match(r"^#\s+\S", ln) and not ln.startswith("##"):
            body_start = i
            break
        front.append(ln)
    else:
        body_start = len(lines)
    body = lines[body_start:]

    # 按卷(H1)分组，卷内按章(H2)切块；卷标题仅在该卷首章出现
    chunks = []
    cur_vol = None
    cur_buf = None
    for ln in body:
        if re.match(r"^#\s+\S", ln) and not ln.startswith("##"):
            if cur_buf is not None:
                chunks.append("\n".join(cur_vol + cur_buf))
            cur_vol = [ln]
            cur_buf = []
        elif re.match(r"^##\s+\S", ln) and not ln.startswith("###"):
            if cur_buf:
                chunks.append("\n".join(cur_vol + cur_buf))
            cur_buf = [ln]
        else:
            if cur_buf is None:
                cur_vol = cur_vol or ["# 正文"]
                cur_buf = []
            cur_buf.append(ln)
    if cur_buf is not None:
        chunks.append("\n".join(cur_vol + cur_buf))

    front_md = "\n".join(front).strip()
    return front_md, chunks


def render_chunk(text, idx):
    os.makedirs(TMP, exist_ok=True)
    mdf = os.path.join(TMP, f"c{idx}.md")
    html = os.path.join(TMP, f"c{idx}.html")
    pdf = os.path.join(TMP, f"c{idx}.pdf")
    open(mdf, "w", encoding="utf-8").write(text)
    # pandoc --include-in-header 会把文件内容原样插入 <head>；裸 CSS 文本在 <head>
    # 中无效且会被浏览器当作正文推入 <body>，导致样式全失效、品牌色不渲染。
    # 故用 <style> 包裹后再传入。
    hdr = os.path.join(TMP, f"_hdr_{idx}.html")
    with open(hdr, "w", encoding="utf-8") as f:
        f.write('<style>\n' + open(CSS, encoding="utf-8").read() + '\n</style>')
    subprocess.run(["pandoc", mdf, "-o", html, "--standalone",
                    "-f", "markdown-yaml_metadata_block",
                    "--include-in-header", hdr,
                    "--metadata", "title=段永平文集"], check=True)
    subprocess.run(["node", RENDER, html, pdf], check=True)
    return pdf


def make_overlay(n_pages, total):
    # reportlab 自带 STSong-Light 中文 CID 字体，无需外部字体文件
    from reportlab.pdfgen import canvas
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.cidfonts import UnicodeCIDFont
    try:
        pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
        font = "STSong-Light"
    except Exception:
        font = "Helvetica"
    ov = os.path.join(TMP, "_overlay.pdf")
    c = canvas.Canvas(ov, pagesize=(595.28, 841.89))
    for i in range(n_pages):
        # setFont/setFillColor 必须在 showPage 之前、循环内重设，否则仅首页生效
        c.setFont(font, 8.5)
        c.setFillColorRGB(0.4, 0.4, 0.4)
        c.drawCentredString(595.28 / 2.0, 30, f"第 {i + 1} / {total} 页")
        c.showPage()
    c.save()
    return ov


def main():
    if not os.path.exists(SRC):
        print("缺少打印版 Markdown，请先运行 build_dyp_print.py")
        sys.exit(1)
    md = open(SRC, encoding="utf-8").read()
    front_md, chunks = split_md(md)
    print(f"切块: 前置1 + 章 {len(chunks)}")

    pdfs = []
    # 前置（封面+目录）作为第 0 块
    pdfs.append(render_chunk(front_md, -1))
    for i, ch in enumerate(chunks):
        pdfs.append(render_chunk(ch, i))

    # 合并
    from pypdf import PdfReader, PdfWriter
    writer = PdfWriter()
    for p in pdfs:
        reader = PdfReader(p)
        for pg in reader.pages:
            writer.add_page(pg)
    merged_tmp = os.path.join(TMP, "_merged.pdf")
    with open(merged_tmp, "wb") as f:
        writer.write(f)

    n = len(writer.pages)
    overlay = make_overlay(n, n)
    oreader = PdfReader(overlay)
    final_writer = PdfWriter()
    merged_reader = PdfReader(merged_tmp)
    for i, pg in enumerate(merged_reader.pages):
        pg.merge_page(oreader.pages[i])
        final_writer.add_page(pg)
    with open(FINAL, "wb") as f:
        final_writer.write(f)
    print(f"已生成: {FINAL}  共 {n} 页")

    # 清理临时
    for root, _, files in os.walk(TMP):
        for fn in files:
            try:
                os.remove(os.path.join(root, fn))
            except OSError:
                pass
    try:
        os.rmdir(TMP)
    except OSError:
        pass


if __name__ == "__main__":
    main()
