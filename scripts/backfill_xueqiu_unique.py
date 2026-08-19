#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""回填雪球月归档独有帖子到个体问答语料

读取 content/source-documents/.../xueqiu-posts/*.md 月归档，
解析每条帖子，将「URL 数字 id 未出现在现有个体问答语料」且「非删除/非空」的帖子，
生成为 content/duanyongping/qa/<year>/qa_xq_<id>.md。

幂等：已存在的 qa id 跳过；跨文件同 id 去重。
"""
import glob
import os
import re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QA_DIR = os.path.join(REPO, "content", "duanyongping", "qa")
ARCHIVE_DIR = os.path.join(REPO, "content", "source-documents",
                           "value-investing-yxc-gdut", "duanyongping", "xueqiu-posts")

URL_RE = re.compile(r"xueqiu\.com/1247347556/(\d+)")
HEAD_RE = re.compile(r"^##\s+(.+?)\s*·\s*\[原文\]\(([^)]+)\)")
FOOT_RE = re.compile(r"👍|💬|🔁")


def existing_qa_ids():
    ids = set()
    for fn in glob.glob(os.path.join(QA_DIR, "*", "qa_*.md")):
        for line in open(fn, encoding="utf-8"):
            m = re.search(r"^source:\s*[\"']?(.*?)[\"']?\s*$", line)
            if m:
                u = m.group(1)
                mm = URL_RE.search(u)
                if mm:
                    ids.add(mm.group(1))
    return ids


def parse_posts(text):
    """按月归档文本切分帖子，返回 [(datetime, url, body)]。"""
    posts = []
    cur = None
    for line in text.splitlines():
        hm = HEAD_RE.match(line)
        if hm:
            if cur:
                posts.append(cur)
            cur = {"dt": hm.group(1).strip(), "url": hm.group(2).strip(), "body": []}
        elif cur is not None:
            if FOOT_RE.search(line):
                continue  # 跳过点赞/评论/转发统计行
            cur["body"].append(line)
    if cur:
        posts.append(cur)
    return posts


def main():
    existing = existing_qa_ids()
    print("现有个体问答 id 数:", len(existing))
    seen = set()
    added = 0
    skipped_deleted = 0
    skipped_empty = 0
    per_month = {}
    for fn in sorted(glob.glob(os.path.join(ARCHIVE_DIR, "*.md"))):
        month = os.path.splitext(os.path.basename(fn))[0].split("_")[0]
        text = open(fn, encoding="utf-8").read()
        for p in parse_posts(text):
            um = URL_RE.search(p["url"])
            if not um:
                continue
            pid = um.group(1)
            if pid in existing or pid in seen:
                continue
            body = "\n".join(p["body"]).strip()
            if not body or "原帖已删除" in body:
                skipped_deleted += 1
                continue
            if len(body) < 2:
                skipped_empty += 1
                continue
            seen.add(pid)
            # 年份
            ym = re.match(r"(\d{4})-(\d{2})-(\d{2})", p["dt"])
            year = ym.group(1) if ym else month[:4]
            ydir = os.path.join(QA_DIR, year)
            os.makedirs(ydir, exist_ok=True)
            out = os.path.join(ydir, f"qa_xq_{pid}.md")
            fm = [
                "---",
                f'title: "雪球 #{pid}"',
                'author: "段永平"',
                f'date: "{p["dt"]}"',
                f'year: "{year}"',
                f'index: "xq{pid}"',
                'platform: "雪球"',
                f'source: "{p["url"]}"',
                'category: "qa"',
                "---",
                "",
                body,
                "",
            ]
            with open(out, "w", encoding="utf-8") as f:
                f.write("\n".join(fm))
            added += 1
            per_month[month] = per_month.get(month, 0) + 1
    print(f"回填新增: {added}  跳过(已删除/空): {skipped_deleted + skipped_empty}")
    print("各月新增:", dict(sorted(per_month.items())))
    print("输出目录:", QA_DIR)


if __name__ == "__main__":
    main()
