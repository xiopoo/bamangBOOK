#!/usr/bin/env python3
"""2.35:1 电子书封面生成器（ebook-split skill 配套）

生成"主书名 + 规范副标题 + 章节标签"的电子书风横版封面，含右侧复利曲线装饰。
同时生成 1:1 方形小图封面，供公众号消息/转发小图使用。
用法:
  python3 gen_cover.py --default defaults.json --out 封面.png [--chapter-tag "自定义章节标签"]
"""
import os, json, argparse, math
from PIL import Image, ImageDraw, ImageFont

FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def f(size, index=0):
    return ImageFont.truetype(FONT, size, index=index)

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgb(r, g, b):
    return (r, g, b)

def interpolate(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def draw_gradient_bg(img, c1, c2, direction='diagonal'):
    """绘制柔和渐变背景"""
    W, H = img.size
    pixels = img.load()
    if direction == 'diagonal':
        for y in range(H):
            for x in range(W):
                t = (x / W + y / H) / 2.0
                pixels[x, y] = interpolate(c1, c2, t)
    elif direction == 'radial':
        cx, cy = W * 0.85, H * 0.25
        max_d = math.sqrt(cx**2 + cy**2)
        for y in range(H):
            for x in range(W):
                d = math.sqrt((x - cx)**2 + (y - cy)**2)
                t = min(d / max_d, 1.0)
                pixels[x, y] = interpolate(c1, c2, t)
    else:
        for y in range(H):
            t = y / H
            for x in range(W):
                pixels[x, y] = interpolate(c1, c2, t)

def draw_rounded_rect(draw, xy, radius, fill):
    """绘制圆角矩形"""
    x1, y1, x2, y2 = xy
    r = radius
    draw.pieslice([x1, y1, x1 + 2*r, y1 + 2*r], 180, 270, fill=fill)
    draw.pieslice([x2 - 2*r, y1, x2, y1 + 2*r], 270, 360, fill=fill)
    draw.pieslice([x1, y2 - 2*r, x1 + 2*r, y2], 90, 180, fill=fill)
    draw.pieslice([x2 - 2*r, y2 - 2*r, x2, y2], 0, 90, fill=fill)
    draw.rectangle([x1 + r, y1, x2 - r, y2], fill=fill)
    draw.rectangle([x1, y1 + r, x2, y2 - r], fill=fill)

def draw_curve_and_area(draw, W, H, brand_rgb, muted_rgb, x0=900, x1=1360, y_base=520, y_top=180):
    """绘制带填充区域的复利曲线"""
    # 曲线函数：幂函数增长
    def curve_y(x):
        t = (x - x0) / (x1 - x0)
        return y_base - (y_base - y_top) * (t ** 1.7)

    pts = [(x, curve_y(x)) for x in range(x0, x1 + 1, 3)]
    pts = [p for p in pts if 0 <= p[1] <= H]
    if len(pts) < 2:
        return

    # 淡网格
    grid_color = (*muted_rgb, 30)  # 需要 RGBA 模式
    # 这里 draw 是 RGB，先画浅线
    grid_line = tuple(int(c * 0.9 + 245 * 0.1) for c in muted_rgb)
    for i in range(6):
        gx = x0 + 22 + i * 80
        draw.line([(gx, y_top + 20), (gx, y_base)], fill=grid_line, width=1)
    for i in range(5):
        gy = y_top + 20 + i * ((y_base - y_top - 20) / 4)
        draw.line([(x0 + 22, gy), (x1, gy)], fill=grid_line, width=1)

    # 填充区域（用浅品牌色）
    area_pts = pts + [(x1, y_base), (x0, y_base)]
    fill_color = tuple(int(brand_rgb[i] * 0.08 + 255 * 0.92) for i in range(3))
    draw.polygon(area_pts, fill=fill_color)

    # 主曲线
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i+1]], fill=brand_rgb, width=5)

    # 端点
    draw.ellipse([pts[-1][0]-9, pts[-1][1]-9, pts[-1][0]+9, pts[-1][1]+9], fill=brand_rgb)
    draw.ellipse([pts[0][0]-6, pts[0][1]-6, pts[0][0]+6, pts[0][1]+6], fill=brand_rgb)

    # 终点高光圈
    draw.ellipse([pts[-1][0]-14, pts[-1][1]-14, pts[-1][0]+14, pts[-1][1]+14], outline=brand_rgb, width=2)

def build_main_cover(cfg, chapter_tag):
    W, H = 1410, 600
    BRAND = hex_to_rgb(cfg['brand']['color'])
    BRAND_DARK = tuple(int(BRAND[i] * 0.78) for i in range(3))  # 更深红，用于渐变底部
    CREAM = hex_to_rgb("#F7F2EA")   # 米白文字
    GOLD = hex_to_rgb("#E8C98A")    # 浅金副标题
    MUTED = tuple(int(BRAND[i] * 0.6 + 255 * 0.4) for i in range(3))  # 浅红灰

    img = Image.new("RGB", (W, H))
    draw_gradient_bg(img, BRAND, BRAND_DARK, 'diagonal')
    draw = ImageDraw.Draw(img)

    # 顶部品牌条（更深红）
    draw.rectangle([0, 0, W, 6], fill=BRAND_DARK)

    # 左上角系列名（米白）
    series_line = cfg['cover']['series_line']
    draw.text((78, 58), series_line, font=f(24), fill=CREAM)

    # 主书名（米白）
    title = cfg['book']['title']
    draw.text((78, 128), title, font=f(108, index=2), fill=CREAM)

    # 副标题（浅金）
    subtitle = cfg['book']['subtitle']
    draw.text((80, 282), subtitle, font=f(40, index=1), fill=GOLD)

    # 装饰线（浅红灰）
    draw.line([(80, 360), (560, 360)], fill=MUTED, width=2)

    # 章节标签 + 章节徽章
    tag = chapter_tag or cfg['cover']['chapter_tag']
    # 解析章节号
    import re
    chap_num = ""
    m = re.search(r'第(\d+)章', tag)
    if m:
        chap_num = m.group(1)
    # 标签文字（米白）
    draw.text((80, 388), tag, font=f(26), fill=CREAM)

    # 右侧曲线（稍深的红，压在红底上做暗纹）
    draw_curve_and_area(draw, W, H, BRAND_DARK, BRAND_DARK)

    # 右下角小字：系列域名
    domain = cfg['brand'].get('domain', '')
    if domain:
        draw.text((W - 220, H - 42), domain, font=f(18), fill=MUTED)

    return img

def build_square_cover(cfg, chapter_tag):
    """1:1 方形封面：适合公众号消息列表小图 / 转发卡片"""
    S = 600
    BRAND = hex_to_rgb(cfg['brand']['color'])
    BRAND_DARK = tuple(int(BRAND[i] * 0.78) for i in range(3))
    CREAM = hex_to_rgb("#F7F2EA")
    GOLD = hex_to_rgb("#E8C98A")
    MUTED = tuple(int(BRAND[i] * 0.6 + 255 * 0.4) for i in range(3))

    img = Image.new("RGB", (S, S))
    draw_gradient_bg(img, BRAND, BRAND_DARK, 'radial')
    draw = ImageDraw.Draw(img)

    # 顶部品牌条
    draw.rectangle([0, 0, S, 6], fill=BRAND_DARK)

    # 系列名
    series_line = cfg['cover']['series_line']
    draw.text((44, 44), series_line, font=f(22), fill=CREAM)

    # 主书名（缩小适配）
    title = cfg['book']['title']
    draw.text((44, 92), title, font=f(72, index=2), fill=CREAM)

    # 副标题（浅金）
    subtitle = cfg['book']['subtitle']
    draw.text((46, 188), subtitle, font=f(28, index=1), fill=GOLD)

    # 章节标签
    tag = chapter_tag or cfg['cover']['chapter_tag']
    draw.text((46, 244), tag, font=f(24), fill=CREAM)

    # 底部装饰曲线（深红暗纹）
    x0, x1 = 80, 540
    y_base, y_top = 500, 340
    def curve_y(x):
        t = (x - x0) / (x1 - x0)
        return y_base - (y_base - y_top) * (t ** 1.7)
    pts = [(x, curve_y(x)) for x in range(x0, x1 + 1, 4)]
    area_pts = pts + [(x1, y_base), (x0, y_base)]
    fill_color = tuple(int(BRAND_DARK[i] * 0.5 + BRAND[i] * 0.5) for i in range(3))
    draw.polygon(area_pts, fill=fill_color)
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i+1]], fill=BRAND_DARK, width=5)
    draw.ellipse([pts[-1][0]-9, pts[-1][1]-9, pts[-1][0]+9, pts[-1][1]+9], fill=BRAND_DARK)
    draw.ellipse([pts[0][0]-6, pts[0][1]-6, pts[0][0]+6, pts[0][1]+6], fill=BRAND_DARK)

    return img

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--default', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--chapter-tag', default='')
    ap.add_argument('--square-out', default='', help='1:1 方形封面输出路径；留空则自动在 --out 文件名后加 _1x1')
    args = ap.parse_args()

    cfg = json.load(open(args.default, encoding='utf-8'))
    chapter_tag = args.chapter_tag or cfg['cover'].get('chapter_tag', '')

    main_img = build_main_cover(cfg, chapter_tag)
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    main_img.save(args.out, "PNG")
    print(f"main cover saved: {args.out}  ({main_img.size[0]}x{main_img.size[1]})")

    if args.square_out:
        square_path = args.square_out
    else:
        base, ext = os.path.splitext(args.out)
        square_path = f"{base}_1x1{ext}"
    square_img = build_square_cover(cfg, chapter_tag)
    square_img.save(square_path, "PNG")
    print(f"square cover saved: {square_path}  ({square_img.size[0]}x{square_img.size[1]})")

if __name__ == '__main__':
    main()
