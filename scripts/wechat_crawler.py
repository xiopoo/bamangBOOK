#!/usr/bin/env python3
"""
微信公众号文章爬虫

从文章 URL 抓取内容，提取元数据和正文，输出为带 frontmatter 的 Markdown 文件，
直接放入 content/bloggers/_inbox/，后续运行 npm run sync-bloggers 完成入库。

用法:
  # 从文件读取 URL 列表
  python3 scripts/wechat_crawler.py urls.txt

  # 单个 URL
  python3 scripts/wechat_crawler.py https://mp.weixin.qq.com/s/XXXXX

  # 多个 URL
  python3 scripts/wechat_crawler.py url1 url2 url3

  # 指定输出目录
  python3 scripts/wechat_crawler.py urls.txt --out ./custom_output

  # 只打印元数据，不保存文件
  python3 scripts/wechat_crawler.py urls.txt --dry-run

依赖: pip3 install requests beautifulsoup4 html2text
"""

import sys
import os
import re
import json
import time
import random
import argparse
import hashlib
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse, parse_qs

import requests
from bs4 import BeautifulSoup
import html2text

# ============================================================
# 配置
# ============================================================

# 默认输出目录（对接 sync-bloggers 的 _inbox）
DEFAULT_OUTPUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "content", "bloggers", "_inbox"
)

# 请求头
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

# 请求间隔（秒）
MIN_DELAY = 2.0
MAX_DELAY = 5.0

# 重试配置
MAX_RETRIES = 3
RETRY_BASE_DELAY = 5  # 指数退避基数


# ============================================================
# HTML → Markdown 转换器
# ============================================================

def make_markdown_converter():
    """创建配置好的 html2text 转换器"""
    h = html2text.HTML2Text()
    h.body_width = 0          # 不自动换行
    h.ignore_links = False
    h.ignore_images = False
    h.ignore_emphasis = False
    h.skip_internal_links = False
    h.inline_links = True
    h.protect_links = True
    h.unicode_snob = True
    h.ignore_mailto_links = True
    h.default_image_alt = "图片"
    return h


# ============================================================
# 微信文章解析
# ============================================================

def fetch_article(url: str, timeout: int = 15) -> str:
    """获取文章 HTML"""
    resp = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
    resp.raise_for_status()
    resp.encoding = 'utf-8'
    return resp.text


def parse_article(html: str, source_url: str) -> dict:
    """
    解析微信文章 HTML，提取元数据和正文。
    返回 dict: { title, author, account, date, content_md, url }
    """
    soup = BeautifulSoup(html, 'lxml')
    result = {"url": source_url}

    # --- 标题 ---
    title_tag = (
        soup.select_one("h1.rich_media_title") or
        soup.select_one("h2.rich_media_title") or
        soup.select_one("meta[property='og:title']")
    )
    result["title"] = (
        title_tag.get("content", "").strip() if title_tag and title_tag.name == "meta"
        else title_tag.get_text(strip=True) if title_tag
        else ""
    )

    # --- 作者 ---
    author_tag = (
        soup.select_one("meta[name='author']") or
        soup.select_one("#js_author_name") or
        soup.select_one(".rich_media_meta_text")
    )
    if author_tag and author_tag.name == "meta":
        result["author"] = author_tag.get("content", "").strip()
    elif author_tag:
        txt = author_tag.get_text(strip=True)
        # 过滤重复（微信有时会渲染两次）
        half = len(txt) // 2
        if half > 0 and txt[:half] == txt[half:]:
            txt = txt[:half]
        result["author"] = txt
    else:
        result["author"] = ""

    # --- 公众号名称 ---
    account_tag = (
        soup.select_one(".rich_media_meta_nickname") or
        soup.select_one("#js_name") or
        soup.select_one("meta[property='og:article:author']")
    )
    if account_tag and account_tag.name == "meta":
        result["account"] = account_tag.get("content", "").strip()
    elif account_tag:
        result["account"] = account_tag.get_text(strip=True)
    else:
        result["account"] = ""

    # --- 发布日期 ---
    # 优先从 JS 变量中提取（微信新版页面日期由 JavaScript 动态渲染）
    date_tag = (
        soup.find("em", id="publish_time") or
        soup.find("meta", property="article:published_time") or
        soup.find("meta", itemprop="datePublished")
    )
    raw_date = (
        date_tag.get("content", "").strip() if date_tag and date_tag.name == "meta"
        else date_tag.get_text(strip=True) if date_tag
        else ""
    )
    # 如果 DOM 中没有日期，从 JavaScript 中提取
    if not raw_date or not re.search(r'\d{4}-\d{2}-\d{2}', raw_date):
        js_match = re.search(r"create_?time['\"]?\s*[:=]\s*['\"](20\d{2}-\d{2}-\d{2}[^'\"]*)['\"]", html)
        if js_match:
            raw_date = js_match.group(1)
    result["date"] = normalize_date(raw_date)

    # --- 正文 ---
    content_div = soup.find("div", id="js_content") or soup.find("div", class_="rich_media_content")
    if not content_div:
        raise ValueError("找不到文章正文区域（可能被反爬保护）")

    # 移除微信内联样式标签和无用元素
    for tag in content_div.find_all(["section", "span", "p", "div", "br"]):
        # 保留 br 标签用于换行
        if tag.name == "br":
            continue
        # 清除所有 style 属性
        if tag.has_attr("style"):
            del tag["style"]
        # 清除微信特殊属性
        for attr in list(tag.attrs):
            if attr.startswith("data-") or attr in ("powered-by", "label", "aria-"):
                del tag[attr]

    # 移除隐藏元素
    for hidden in content_div.find_all(style=re.compile(r"display\s*:\s*none", re.I)):
        hidden.decompose()
    for hidden in content_div.find_all(class_=re.compile(r"hide|hidden", re.I)):
        hidden.decompose()

    # 处理图片：补全 src
    for img in content_div.find_all("img"):
        src = img.get("data-src") or img.get("src") or ""
        if src and not src.startswith("http"):
            if src.startswith("//"):
                src = "https:" + src
        if src:
            img["src"] = src
        # 设置 alt 文本
        if not img.get("alt"):
            img["alt"] = "图片"

    # HTML → Markdown
    converter = make_markdown_converter()
    body_html = str(content_div)
    markdown = converter.handle(body_html)

    # 清理 Markdown 产出
    markdown = clean_markdown(markdown)

    result["content_md"] = markdown
    return result


def normalize_date(raw: str) -> str:
    """标准化日期为 YYYY-MM-DD"""
    if not raw:
        return ""

    # 微信常见格式: "2024-01-15 10:30" 或 "2024年1月15日"
    patterns = [
        (r"(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日]?", r"\1-\2-\3"),  # 补齐月份和日期
    ]
    for pattern, template in patterns:
        m = re.search(pattern, raw)
        if m:
            y, mo, d = m.group(1), m.group(2).zfill(2), m.group(3).zfill(2)
            return f"{y}-{mo}-{d}"

    # 如果已经是 YYYY-MM-DD
    m = re.match(r"(\d{4}-\d{2}-\d{2})", raw)
    if m:
        return m.group(1)

    return raw.strip()


def clean_markdown(md: str) -> str:
    """清理 Markdown 输出"""
    # 去除连续多余空行
    md = re.sub(r"\n{4,}", "\n\n\n", md)
    # 去除每行尾部空白
    md = re.sub(r"[ \t]+$", "", md, flags=re.MULTILINE)
    # 修复 html2text 常见问题：多余的转义
    md = md.replace("\\_", "_").replace("\\*", "*")
    return md.strip()


# ============================================================
# 文件输出
# ============================================================

def save_article(article: dict, output_dir: str) -> str:
    """
    将文章保存为带 frontmatter 的 Markdown 文件。
    文件名格式: YYYYMMDD_标题.md
    """
    os.makedirs(output_dir, exist_ok=True)

    # 生成文件名
    date_part = article["date"].replace("-", "") if article["date"] else "nodate"
    title_part = sanitize_filename(article["title"]) if article["title"] else "untitled"
    filename = f"{date_part}_{title_part}.md"
    filepath = os.path.join(output_dir, filename)

    # 避免覆盖：如果已存在，加序号
    counter = 1
    while os.path.exists(filepath):
        filename = f"{date_part}_{title_part}_{counter}.md"
        filepath = os.path.join(output_dir, filename)
        counter += 1

    # 构建 frontmatter
    frontmatter = {
        "title": article["title"],
        "author": article["author"],
        "account": article["account"],
        "date": article["date"],
        "url": article["url"],
    }

    # 写入文件
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("---\n")
        for key, value in frontmatter.items():
            f.write(f'{key}: "{value}"\n')
        f.write("---\n\n")
        f.write(f"# {article['title']}\n\n")
        f.write(f"> {article['author']} · {article['account']} · {article['date']}\n")
        f.write(f"> [原文链接]({article['url']})\n\n")
        f.write(article["content_md"])
        f.write("\n")

    return filepath


def sanitize_filename(name: str) -> str:
    """清理文件名中的非法字符"""
    # 移除或替换 Windows/macOS 不支持的字符
    name = re.sub(r'[\\/:*?"<>|]', "", name)
    # 替换换行和制表符
    name = name.replace("\n", "").replace("\t", " ")
    # 截断过长文件名（保留中文字符）
    if len(name) > 80:
        name = name[:80]
    return name.strip()


# ============================================================
# URL 读取
# ============================================================

def read_urls(source) -> list:
    """从文件或命令行参数读取 URL 列表"""
    urls = []

    if isinstance(source, str) and os.path.isfile(source):
        with open(source, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    # 兼容每行一个 URL，也兼容 [标题](URL) 格式
                    m = re.match(r"\[.*?\]\((https?://mp\.weixin\.qq\.com[^)]+)\)", line)
                    if m:
                        urls.append(m.group(1))
                    elif line.startswith("http"):
                        urls.append(line)

    elif isinstance(source, list):
        for item in source:
            if isinstance(item, str):
                # 检查是否是文件
                if os.path.isfile(item):
                    urls.extend(read_urls(item))
                elif item.startswith("http"):
                    urls.append(item)

    # 去重
    seen = set()
    unique = []
    for u in urls:
        # 用 URL 的 hash 做去重
        h = hashlib.md5(u.encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            unique.append(u)
    return unique


# ============================================================
# 主流程
# ============================================================

def crawl(urls: list, output_dir: str, dry_run: bool = False, min_delay: float = 2.0, max_delay: float = 5.0):
    """主抓取流程"""
    success = 0
    fail = 0

    print(f"📡 微信文章爬虫开始")
    print(f"   目标: {len(urls)} 篇文章")
    if dry_run:
        print(f"   🔍 DRY-RUN 模式，不保存文件")
    else:
        print(f"   输出: {output_dir}")
    print()

    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] {url[:80]}...")

        # 重试循环
        article = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                html = fetch_article(url)
                article = parse_article(html, url)
                break
            except requests.RequestException as e:
                wait = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                print(f"   ⚠ 网络错误 (第{attempt}次重试, {wait}s后): {e}")
                time.sleep(wait)
            except ValueError as e:
                print(f"   ❌ 解析失败: {e}")
                break
            except Exception as e:
                print(f"   ❌ 未知错误: {e}")
                break

        if article is None:
            fail += 1
            print(f"   ❌ 最终失败\n")
        else:
            success += 1
            print(f"   ✅ {article['title'][:50]}")
            print(f"      {article['account']} · {article['date']}")

            if not dry_run:
                filepath = save_article(article, output_dir)
                print(f"      → {os.path.basename(filepath)}")
            print()

        # 请求间隔
        if i < len(urls):
            delay = random.uniform(min_delay, max_delay)
            time.sleep(delay)

    print("=" * 50)
    print(f"✅ 完成: {success} 成功, {fail} 失败")
    if not dry_run and success > 0:
        print(f"💡 文件已保存至: {output_dir}")
        print(f"   运行 npm run sync-bloggers 完成入库")


def main():
    parser = argparse.ArgumentParser(
        description="微信公众号文章爬虫",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 wechat_crawler.py urls.txt
  python3 wechat_crawler.py https://mp.weixin.qq.com/s/XXXXX
  python3 wechat_crawler.py urls.txt --dry-run
  python3 wechat_crawler.py urls.txt --out ./my_output
        """
    )
    parser.add_argument("source", nargs="+", help="URL 列表文件 或 文章 URL")
    parser.add_argument("--out", default=DEFAULT_OUTPUT, help=f"输出目录 (默认: {DEFAULT_OUTPUT})")
    parser.add_argument("--dry-run", action="store_true", help="只抓取不保存")
    parser.add_argument("--delay-min", type=float, default=MIN_DELAY, help=f"最小请求间隔秒数 (默认: {MIN_DELAY})")
    parser.add_argument("--delay-max", type=float, default=MAX_DELAY, help=f"最大请求间隔秒数 (默认: {MAX_DELAY})")

    args = parser.parse_args()

    urls = read_urls(args.source)

    if not urls:
        print("❌ 未找到有效的微信文章 URL")
        sys.exit(1)

    crawl(urls, args.out, args.dry_run, args.delay_min, args.delay_max)


if __name__ == "__main__":
    main()
