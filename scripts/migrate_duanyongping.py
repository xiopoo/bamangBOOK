#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 xiaopond/大道 下已抓取/整理的段永平资料，迁移到 bamangBOOK/content/duanyongping/。
四类内容：
  - 网易博客  -> content/duanyongping/blog/{year}/{date}_{id}_{slug}.md
  - 雪球问答  -> content/duanyongping/qa/{year}/qa_{index}.md  （同时生成 按年份 分卷索引）
  - 演讲采访  -> content/duanyongping/talks/{year}_{slug}.md  + attachments/
  - 公司里程碑 -> content/duanyongping/milestones/{year}_{slug}.md + attachments/

源文件一律保留原始出处（网易原文 / 雪球链接 / 整理者），不改动正文。
"""
import json
import os
import re
import shutil
import sys

XIAOPOND = "/Users/lucas/Documents/bamangB/xiaopond/大道"
OUT = "/Users/lucas/Documents/bamangB/bamangBOOK/content/duanyongping"

SLUG_RE = re.compile(r"[^0-9A-Za-z\u4e00-\u9fa5]+")


def slugify(text, limit=40):
    text = (text or "").strip().replace("/", " ").replace("\\", " ")
    s = SLUG_RE.sub("-", text).strip("-")
    s = re.sub(r"-+", "-", s)
    return s[:limit] or "untitled"


def ensure(dirpath):
    os.makedirs(dirpath, exist_ok=True)


def safe_name(name):
    return re.sub(r"[\/\\\?\%\*\:\|\"<>\s]+", "_", name).strip("_")[:120]


def yaml_str(value):
    """把任意字符串安全地写成 YAML 双引号标量。"""
    s = "" if value is None else str(value)
    s = s.replace("\\", "\\\\").replace('"', '\\"')
    return '"%s"' % s



# ---------------------------------------------------------------------------
# 1) 网易博客
# ---------------------------------------------------------------------------
def migrate_blog():
    posts_dir = os.path.join(XIAOPOND, "posts")
    out_root = os.path.join(OUT, "blog")
    ensure(out_root)
    count = 0
    for fn in sorted(os.listdir(posts_dir)):
        if not fn.endswith(".md"):
            continue
        src = os.path.join(posts_dir, fn)
        raw = open(src, encoding="utf-8").read()
        # 解析已有 frontmatter
        m = re.match(r"^---\n(.*?)\n---\n?(.*)$", raw, re.S)
        if m:
            fm_text, body = m.group(1), m.group(2)
            fm = {}
            for line in fm_text.splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    fm[k.strip()] = v.strip().strip('"')
            title = fm.get("title", fn)
            date = fm.get("date", "")[:10]
            source = fm.get("source", "")
            mirror = fm.get("mirror", "")
            article_id = fm.get("article_id", "")
            comment_count = fm.get("comment_count", "")
            duan_comment = fm.get("duan_comment_count", "")
            platform = fm.get("platform", "网易博客")
        else:
            title, date, source, mirror = fn, "", "", ""
            article_id = comment_count = duan_comment = platform = ""
            body = raw

        year = (date or "unknown")[:4]
        ydir = os.path.join(out_root, year)
        ensure(ydir)
        out_name = f"{date}_{article_id}_{slugify(title)}.md" if date else f"{slugify(title)}.md"
        out_name = safe_name(out_name)
        out_path = os.path.join(ydir, out_name)

        new_fm = [
            "---",
            'title: %s' % yaml_str(title),
            'author: %s' % yaml_str("段永平"),
            'date: %s' % yaml_str(date),
            'platform: %s' % yaml_str("网易博客"),
            'article_id: %s' % yaml_str(article_id),
            'source: %s' % yaml_str(source),
            'mirror: %s' % yaml_str(mirror),
            'comment_count: %s' % yaml_str(comment_count),
            'duan_comment_count: %s' % yaml_str(duan_comment),
            'category: %s' % yaml_str("blog"),
            "---",
            "",
        ]
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(new_fm) + body.lstrip("\n"))
        count += 1
    # 年份索引
    years = sorted(
        [d for d in os.listdir(out_root) if re.match(r"^\d{4}$", d)],
        reverse=True,
    )
    meta = {
        "type": "blog",
        "title": "段永平网易博客",
        "author": "段永平",
        "platform": "网易博客（原 nteswjq.blog.163.com，2018-11-30 关停）",
        "source": "镜像备份 tencent4.waaao.com",
        "total": count,
        "years": years,
        "note": "正文 + 完整评论楼（含段永平本人逐条回复）。每篇保留网易原文链接可回溯核对。",
    }
    json.dump(meta, open(os.path.join(out_root, "_meta.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"[blog] 迁移 {count} 篇，年份 {years}")


# ---------------------------------------------------------------------------
# 2) 雪球问答
# ---------------------------------------------------------------------------
def migrate_qa():
    qa_dir = os.path.join(XIAOPOND, "雪球问答录")
    data = json.load(open(os.path.join(qa_dir, "qa.json"), encoding="utf-8"))
    items = data["items"]
    out_root = os.path.join(OUT, "qa")
    ensure(out_root)

    by_year = {}
    for it in items:
        dt = it.get("datetime", "")
        year = (dt[:4] or "unknown")
        by_year.setdefault(year, []).append(it)

        ydir = os.path.join(out_root, year)
        ensure(ydir)
        idx = it["index"]
        q = it.get("question", "").strip()
        a = it.get("answer", "").strip()
        url = it.get("url", "")
        out_name = safe_name(f"qa_{idx:04d}.md")
        out_path = os.path.join(ydir, out_name)
        fm = [
            "---",
            'title: %s' % yaml_str("雪球问答 #%d" % idx),
            'author: %s' % yaml_str("段永平"),
            'date: %s' % yaml_str(dt),
            'year: %s' % yaml_str(year),
            'index: %d' % idx,
            'platform: %s' % yaml_str("雪球"),
            'source: %s' % yaml_str(url),
            'category: %s' % yaml_str("qa"),
            "---",
            "",
            "## 提问",
            "",
            q,
            "",
            "## 段永平回答",
            "",
            a,
            "",
            "> 出处：" + url,
            "",
        ]
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(fm))

    # 按年份分卷索引
    vol_root = os.path.join(out_root, "按年份")
    ensure(vol_root)
    for year, lst in sorted(by_year.items(), reverse=True):
        lines = [f"# 段永平雪球问答 · {year} 年", "", f"本年共 {len(lst)} 条。", ""]
        for it in lst:
            q = it.get("question", "").strip().replace("\n", " ")
            a = it.get("answer", "").strip().replace("\n", " ")
            q = (q[:80] + "…") if len(q) > 80 else q
            a = (a[:80] + "…") if len(a) > 80 else a
            lines.append(f"### 第 {it['index']} 条 · {it.get('datetime','')}")
            lines.append("")
            lines.append(f"**问：** {q}")
            lines.append("")
            lines.append(f"**答：** {a}")
            lines.append("")
            lines.append(f"> 出处：{it.get('url','')}")
            lines.append("")
        open(os.path.join(vol_root, f"{year}.md"), "w", encoding="utf-8").write(
            "\n".join(lines)
        )

    meta = {
        "type": "qa",
        "title": "段永平雪球问答录",
        "author": "段永平",
        "platform": "雪球 @大道无形我有型 (xueqiu.com/u/1247347556)",
        "compiler": data.get("compiler", ""),
        "repo": data.get("repo", ""),
        "cutoff": data.get("cutoff", ""),
        "total": data.get("count", len(items)),
        "note": data.get("note", ""),
        "year_stat": data.get("year_stat", {}),
    }
    json.dump(meta, open(os.path.join(out_root, "_meta.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"[qa] 迁移 {len(items)} 条，年份 {sorted(by_year, reverse=True)}")


# ---------------------------------------------------------------------------
# 3) 演讲采访
# ---------------------------------------------------------------------------
def migrate_talks():
    src_dir = os.path.join(XIAOPOND, "演讲采访")
    out_root = os.path.join(OUT, "talks")
    att_out = os.path.join(out_root, "attachments")
    ensure(att_out)
    count = 0
    for fn in sorted(os.listdir(src_dir)):
        if not fn.endswith(".md"):
            continue
        src = os.path.join(src_dir, fn)
        raw = open(src, encoding="utf-8").read()
        m = re.match(r"^#\s+(.*?)\n(.*)$", raw, re.S)
        title = m.group(1).strip() if m else fn
        body = m.group(2) if m else raw
        # 提取年份：文件名形如 03-2006-秦朔专访段永平.md
        ym = re.match(r"^\d{2}-(\d{4})-", fn)
        year = ym.group(1) if ym else "unknown"
        # 复制附件
        att_src = os.path.join(src_dir, "attachments")
        att_links = []
        if os.path.isdir(att_src):
            for af in os.listdir(att_src):
                if af.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
                    shutil.copy2(os.path.join(att_src, af), os.path.join(att_out, af))
                    att_links.append(af)
        out_name = safe_name(f"{year}_{slugify(title)}.md")
        out_path = os.path.join(out_root, out_name)
        fm = [
            "---",
            'title: %s' % yaml_str(title),
            'author: %s' % yaml_str("段永平"),
            'year: %s' % yaml_str(year),
            'platform: %s' % yaml_str("演讲/采访"),
            'source: %s' % yaml_str("整理自公开视频/文字记录（@杨不为）"),
            'category: %s' % yaml_str("talks"),
            "---",
            "",
        ]
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(fm) + body.lstrip("\n"))
        count += 1
    meta = {
        "type": "talks",
        "title": "段永平演讲与采访",
        "total": count,
        "note": "万科财富人生、秦朔/网易/波士堂专访、浙大分享、斯坦福交流、方三文对话、王石对话等。附件图片已一并迁入。",
    }
    json.dump(meta, open(os.path.join(out_root, "_meta.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"[talks] 迁移 {count} 篇，附件 {len(os.listdir(att_out))} 个")


# ---------------------------------------------------------------------------
# 4) 公司里程碑
# ---------------------------------------------------------------------------
def migrate_milestones():
    src_dir = os.path.join(XIAOPOND, "公司里程碑")
    out_root = os.path.join(OUT, "milestones")
    att_out = os.path.join(out_root, "attachments")
    ensure(att_out)
    count = 0
    for fn in sorted(os.listdir(src_dir)):
        if not fn.endswith(".md"):
            continue
        src = os.path.join(src_dir, fn)
        raw = open(src, encoding="utf-8").read()
        m = re.match(r"^#\s+(.*?)\n(.*)$", raw, re.S)
        title = m.group(1).strip() if m else fn
        body = m.group(2) if m else raw
        ym = re.match(r"^\d{2}-(\d{4})", fn)
        year = ym.group(1) if ym else "unknown"
        att_src = os.path.join(src_dir, "attachments")
        if os.path.isdir(att_src):
            for af in os.listdir(att_src):
                if af.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
                    shutil.copy2(os.path.join(att_src, af), os.path.join(att_out, af))
        out_name = safe_name(f"{year}_{slugify(title)}.md")
        out_path = os.path.join(out_root, out_name)
        fm = [
            "---",
            'title: %s' % yaml_str(title),
            'year: %s' % yaml_str(year),
            'source: %s' % yaml_str("步步高/OPPO/vivo 企业文化与周年讲话（@杨不为整理）"),
            'category: %s' % yaml_str("milestones"),
            "---",
            "",
        ]
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(fm) + body.lstrip("\n"))
        count += 1
    print(f"[milestones] 迁移 {count} 篇")


def main():
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    ensure(OUT)
    migrate_blog()
    migrate_qa()
    migrate_talks()
    migrate_milestones()
    print("done.")


if __name__ == "__main__":
    main()
