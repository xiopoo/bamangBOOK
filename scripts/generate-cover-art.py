#!/usr/bin/env python3
"""Generate brand-red cover art (geometry only, no text) per cover-design.md.

Palette from visual-system.md:
  brand #AB1942, ink #151515, dark #454545, mid #8A8A8A,
  light #E7E3DF, paper #FAF8F4, white #FFFFFF
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

BRAND = (171, 25, 66)
INK = (21, 21, 21)
DARK = (69, 69, 69)
MID = (138, 138, 138)
LIGHT = (231, 227, 223)
PAPER = (250, 248, 244)
WHITE = (255, 255, 255)
SIZE = 1832
OUT = os.path.join(
    os.path.dirname(__file__), "..", "editorial", "shared", "brand-assets"
)


def canvas(bg=PAPER):
    img = Image.new("RGB", (SIZE, SIZE), bg)
    return img, ImageDraw.Draw(img)


def blend(c, bg, t):
    """Blend color c toward background bg by factor t (0..1)."""
    return tuple(int(c[i] * (1 - t) + bg[i] * t) for i in range(3))


def fade_circle_rings(draw, cx, cy, r_min, r_max, step, color=BRAND, bg=PAPER):
    """Concentric rings with increasing weight = tree rings (compounding)."""
    r = r_max
    while r > r_min:
        t = (r - r_min) / (r_max - r_min)
        col = blend(color, bg, 0.28 * (1 - t))
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r], outline=col, width=6 + int(r / 60)
        )
        r -= step


def lattice(draw, cx, cy, half, color=BRAND):
    """Orthogonal grid + diagonal connections + nodes = knowledge lattice."""
    step = half * 2 / 5
    for i in range(6):
        off = -half + i * step
        a = 160
        draw.line([cx - half, cy + off, cx + half, cy + off], fill=color, width=3)
        draw.line([cx + off, cy - half, cx + off, cy + half], fill=color, width=3)
    for a, b in [(-half, half), (half, -half), (-half + step, -half + 2 * step),
                 (half - step, -half + 2 * step), (-half + 2 * step, half),
                 (half - 2 * step, -half)]:
        draw.line([cx + a, cy + b, cx - a, cy - b], fill=color, width=2)
    for ox in (-half, -half + 2 * step, 0, half - 2 * step, half):
        for oy in (-half + step, 0, half - step):
            r = 7
            draw.ellipse([cx + ox - r, cy + oy - r, cx + ox + r, cy + oy + r],
                         fill=color)


def flow_curve(draw, cx, cy, w, h, color=BRAND):
    """Compounding-like smooth curve with soft filled area = owner's gaze."""
    def bezier(p0, p1, p2, p3, t):
        mt = 1 - t
        return (
            mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0],
            mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1],
        )
    p0, p1, p2, p3 = (cx - w, cy + h * 0.55), (cx - w * 0.4, cy + h * 0.4), \
                     (cx + w * 0.35, cy - h * 0.35), (cx + w, cy - h * 0.6)
    pts = [bezier(p0, p1, p2, p3, i / 120) for i in range(121)]
    # soft area under curve
    poly = pts + [(cx + w, cy + h * 0.62), (cx - w, cy + h * 0.62)]
    draw.polygon(poly, fill=blend(BRAND, WHITE, 0.82))
    draw.line([(x, y) for x, y in pts], fill=color, width=14, joint="curve")
    r = 16
    draw.ellipse([p0[0] - r, p0[1] - r, p0[0] + r, p0[1] + r], fill=color)
    draw.ellipse([p3[0] - 18, p3[1] - 18, p3[0] + 18, p3[1] + 18], fill=color)


def node_network(draw, cx, cy, half, color=BRAND):
    """Scattered nodes connected by thin lines = knowledge graph."""
    import random
    rng = random.Random(7)
    nodes = []
    for _ in range(20):
        x = cx + rng.uniform(-half * 0.85, half * 0.85)
        y = cy + rng.uniform(-half * 0.85, half * 0.85)
        nodes.append((x, y))
    # connect nearby nodes
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            dx, dy = nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]
            if dx * dx + dy * dy < (half * 0.6) ** 2:
                draw.line([nodes[i], nodes[j]], fill=color, width=3)
    for k, (x, y) in enumerate(nodes):
        r = 14 + (k % 4) * 6
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)


def oak_tree(draw, cx, cy, color=BRAND):
    """Oak silhouette on plain: trunk + layered crown."""
    trunk_w = 46
    draw.polygon([(cx - trunk_w, cy + 190), (cx + trunk_w, cy + 190),
                  (cx + trunk_w - 6, cy - 60), (cx - trunk_w + 6, cy - 60)],
                 fill=color)
    crown_centers = [(cx - 150, cy - 40, 150), (cx + 150, cy - 40, 150),
                     (cx, cy - 190, 170), (cx - 70, cy - 120, 130), (cx + 70, cy - 120, 130)]
    for x, y, r in crown_centers:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)


def prism(draw, cx, cy, half, color=BRAND):
    """Prism: triangle + diverging light rays (rational decomposition)."""
    draw.polygon([(cx, cy - half * 0.85), (cx - half * 0.6, cy + half * 0.5),
                  (cx + half * 0.6, cy + half * 0.5)], outline=color, width=12)
    for ang in (-38, -22, -6, 10, 26, 42):
        rad = math.radians(90 - ang)
        x2 = cx + half * 1.1 * math.cos(rad)
        y2 = cy - half * 0.55 - half * 1.1 * math.sin(rad)
        draw.line([(cx, cy - half * 0.85), (x2, y2)], fill=color, width=8)
    r = 28
    draw.ellipse([cx - r, cy - half * 0.85 - r, cx + r, cy - half * 0.85 + r],
                 fill=color)


def save_sidebyside(name, left_fn, right_fn, gap=70):
    a = Image.open(left_fn).resize((SIZE // 2 - gap, SIZE))
    b = Image.open(right_fn).resize((SIZE // 2 - gap, SIZE))
    canvas_img = Image.new("RGB", (SIZE, SIZE), PAPER)
    canvas_img.paste(a, (0, 0))
    canvas_img.paste(b, (SIZE // 2 + gap, 0))
    # vertical divider line in brand color
    d = ImageDraw.Draw(canvas_img)
    d.line([(SIZE // 2, 60), (SIZE // 2, SIZE - 60)], fill=BRAND, width=6)
    canvas_img.save(os.path.join(OUT, name), quality=92)
    print("saved", name)


def main():
    os.makedirs(OUT, exist_ok=True)
    cx = cy = SIZE // 2

    # ---- 方案一 经典文献型：树轮 / 格栅 ----
    img, d = canvas(PAPER)
    fade_circle_rings(d, cx, cy, 150, 600, 62)
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    p1 = os.path.join(OUT, "cover-v1-buffett.jpg")
    img.save(p1, quality=92)
    print("saved", p1)

    img, d = canvas(PAPER)
    lattice(d, cx, cy, 560)
    p2 = os.path.join(OUT, "cover-v1-munger.jpg")
    img.save(p2, quality=92)
    print("saved", p2)

    # ---- 方案二 现代思想图谱型：曲线 / 节点网络 ----
    img, d = canvas(WHITE)
    flow_curve(d, cx, cy, 620, 560)
    p3 = os.path.join(OUT, "cover-v2-buffett.jpg")
    img.save(p3, quality=92)
    print("saved", p3)

    img, d = canvas(WHITE)
    node_network(d, cx, cy, 600)
    p4 = os.path.join(OUT, "cover-v2-munger.jpg")
    img.save(p4, quality=92)
    print("saved", p4)

    # ---- 方案三 时间与人物精神型：橡树 / 棱镜 ----
    img, d = canvas(PAPER)
    oak_tree(d, cx, cy + 120, INK)
    # faint brand halo
    halo = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.ellipse([cx - 460, cy - 460, cx + 460, cy + 460],
               fill=(BRAND[0], BRAND[1], BRAND[2], 46))
    halo = halo.filter(ImageFilter.GaussianBlur(120))
    img = Image.alpha_composite(img.convert("RGBA"), halo).convert("RGB")
    p5 = os.path.join(OUT, "cover-v3-buffett.jpg")
    img.save(p5, quality=92)
    print("saved", p5)

    img, d = canvas(PAPER)
    prism(d, cx, cy, 560)
    p6 = os.path.join(OUT, "cover-v3-munger.jpg")
    img.save(p6, quality=92)
    print("saved", p6)

    # ---- 双书并列 ----
    save_sidebyside("cover-v1-sidebyside.jpg", p1, p2)
    save_sidebyside("cover-v2-sidebyside.jpg", p3, p4)
    save_sidebyside("cover-v3-sidebyside.jpg", p5, p6)


if __name__ == "__main__":
    main()
