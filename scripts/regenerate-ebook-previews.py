#!/usr/bin/env python3
"""从新版 PDF 重新生成电子书预览图（1100x1556）。"""
import pymupdf
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / "build_books"
OUT_DIR = ROOT / "public" / "ebook-previews"
OUT_DIR.mkdir(parents=True, exist_ok=True)

TARGET_W, TARGET_H = 1100, 1556

jobs = [
    ("所有者的眼光_巴菲特卷.pdf", [1, 3, 13], "buffett"),
    ("理性的格栅_芒格卷.pdf", [1, 3, 4], "munger"),
]

for pdf_name, pages, prefix in jobs:
    pdf_path = PDF_DIR / pdf_name
    doc = pymupdf.open(pdf_path)
    for page_num in pages:
        page = doc[page_num - 1]
        rect = page.rect
        scale = TARGET_W / rect.width
        mat = pymupdf.Matrix(scale, scale)
        pix = page.get_pixmap(matrix=mat)
        # 比例一致时 height 应正好等于 TARGET_H；如不一致则按高度居中裁剪
        if pix.height != TARGET_H:
            clip_h = TARGET_H / scale
            clip_y = (rect.height - clip_h) / 2
            clip = pymupdf.Rect(0, clip_y, rect.width, clip_y + clip_h)
            pix = page.get_pixmap(matrix=mat, clip=clip)
        out_path = OUT_DIR / f"{prefix}-p{page_num:02d}.png"
        pix.save(out_path)
        print(f"saved {out_path} ({pix.width}x{pix.height})")
    doc.close()

print("done")
