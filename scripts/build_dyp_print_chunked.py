#!/usr/bin/env python3
"""后备方案：将打印版 Markdown 按「卷(h1)」切分为多块，分别转 HTML→PDF，再用 pypdf 合并。
用于单文档 Chromium 渲染内存溢出(137)时的降级路径。TOC 在分块模式下省略。"""
import os, re, subprocess, json, glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "build_books/dyp_themed")
SRC = os.path.join(OUT, "段永平文集_打印版.md")
CSS = os.path.join(BASE, "scripts/print_dyp.css")
NODE = os.path.join(BASE, "scripts/html_to_pdf.js")


def split_parts(md):
    lines = md.splitlines()
    chunks = []  # list of (title, [lines])
    cur = None
    buf = []
    for ln in lines:
        if re.match(r"^#\s+", ln) and not ln.startswith("##"):
            if cur is not None:
                chunks.append((cur, buf))
            cur = ln
            buf = [ln]
        else:
            if cur is None:
                cur = "# 正文"
                buf = []
            buf.append(ln)
    if cur is not None:
        chunks.append((cur, buf))
    return chunks


def main():
    md = open(SRC, encoding="utf-8").read()
    chunks = split_parts(md)
    # 第一块前插入封面（分块模式省略目录）
    cover = ('<div class="cover">\n<p class="booktitle">做对的事情</p>\n'
             '<p class="subtitle">段永平文集 · 主题分类全编</p>\n'
             '<p class="compile">二〇二六年八月 · 汇编</p>\n</div>\n\n')
    pdfs = []
    for i, (title, buf) in enumerate(chunks):
        text = (cover if i == 0 else "") + "\n".join(buf)
        mdf = os.path.join(OUT, f"_part_{i}.md")
        html = os.path.join(OUT, f"_part_{i}.html")
        pdf = os.path.join(OUT, f"_part_{i}.pdf")
        open(mdf, "w", encoding="utf-8").write(text)
        subprocess.run(["pandoc", mdf, "-o", html, "--standalone",
                        "-f", "markdown-yaml_metadata_block",
                        "--include-in-header", CSS,
                        "--metadata", "title=段永平文集"], check=True)
        subprocess.run(["node", NODE, html, pdf], check=True)
        pdfs.append(pdf)
        print("rendered part", i, title[:20])
    # 合并
    from pypdf import PdfWriter
    w = PdfWriter()
    for p in pdfs:
        w.append_pages_from_reader(__import__("pypdf").PdfReader(p))
    final = os.path.join(OUT, "段永平文集_打印版.pdf")
    w.write(final)
    print("合并完成:", final)
    # 清理临时
    for p in pdfs + [p[:-4] + ".html" for p in pdfs] + [p[:-4] + ".md" for p in pdfs]:
        try: os.remove(p)
        except OSError: pass


if __name__ == "__main__":
    main()
