#!/usr/bin/env python3
"""用现有 v1 封面母图（无文字）合成正式竖版书封（带书名/副标题/作者/出品方）。

输出 1260x1780（比例 1:1.413，正式书籍封面比例）的 PNG：
- 背景：v1 母图缩放居中作为主视觉
- 上区：系列名（品牌红）+ 书名（大）+ 副标题
- 下区：作者 + 出品方 fulilab.com
"""
import sys
import os
from PIL import Image, ImageDraw, ImageFont

BOOK_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BRAND = (171, 25, 66)        # #AB1942
INK = (74, 58, 50)           # 深棕字
MUTED = (138, 122, 112)      # 浅棕
PAPER = (249, 248, 244)      # 米白

W, H = 1260, 1780


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/Library/Fonts/Songti.ttc",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()


def cover(src_base, title, subtitle, series, author, out_path):
    base = Image.open(src_base).convert("RGB")
    canvas = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(canvas)

    # 主视觉：v1 母图缩放居中，占中部约 64% 高度
    margin_x = 150
    visual_w = W - margin_x * 2
    visual_h = int(visual_w * (base.size[1] / base.size[0]))
    visual = base.resize((visual_w, visual_h))
    vx = (W - visual_w) // 2
    vy_top = 360
    canvas.paste(visual, (vx, vy_top))

    # 细分割线（品牌红）
    draw.rectangle([0, 0, W, 6], fill=BRAND)

    # 系列名（顶部居中，品牌红）
    draw.text((W // 2, 110), series, font=font(30), fill=BRAND, anchor="mm")

    # 书名（中部偏上，大号深棕）——放在主视觉上方
    draw.text((W // 2, 235), title, font=font(96, bold=True), fill=INK, anchor="mm")

    # 副标题（书名下，浅棕）
    draw.text((W // 2, 300), subtitle, font=font(32), fill=MUTED, anchor="mm")

    # 作者（底部，深棕）
    draw.text((W // 2, H - 150), f"作者　{author}", font=font(34), fill=INK, anchor="mm")

    # 出品方
    draw.text((W // 2, H - 90), "fulilab.com", font=font(28), fill=BRAND, anchor="mm")

    canvas.save(out_path)
    print("封面已生成:", out_path, canvas.size)


BOOKS = {
    "buffett": dict(
        src="editorial/buffett/cover/cover-v1-classic.jpg",
        title="所有者的眼光",
        subtitle="巴菲特论企业、资本与长期复利",
        series="复利书房 · 巴芒经典",
        author="华少（金家岭小胖）",
        out="editorial/buffett/cover/cover-release-front.png",
    ),
    "munger": dict(
        src="editorial/shared/brand-assets/cover-v1-munger.jpg",
        title="理性的格栅",
        subtitle="芒格论思维模型、商业判断与人生智慧",
        series="复利书房 · 巴芒经典",
        author="华少（金家岭小胖）",
        out="editorial/munger/cover/cover-release-front.png",
    ),
}


if __name__ == "__main__":
    vols = sys.argv[1:] or ["buffett", "munger"]
    for v in vols:
        cfg = BOOKS[v]
        cover(
            os.path.join(BOOK_ROOT, cfg["src"]),
            cfg["title"], cfg["subtitle"], cfg["series"], cfg["author"],
            os.path.join(BOOK_ROOT, cfg["out"]),
        )
