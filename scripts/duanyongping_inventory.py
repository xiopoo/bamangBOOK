#!/usr/bin/env python3
"""段永平文集 · 语料全量盘点脚本

扫描主语料与附录语料，抽取 frontmatter，计算字节数与 sha256，
输出 editorial/duanyongping/manifest/01_inventory.csv

主语料（进入主题分类正文）：
  blog / qa(个体) / talks / milestones / speeches(txt)
附录语料（第三方）：
  blogger(提及段永平的博主文章) / interview(提及段永平的访谈)
参考语料（不进入正文，仅映射）：
  xueqiu_monthly / research / thinking_framework
"""
import csv
import hashlib
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DYP = os.path.join(REPO, "content", "duanyongping")
SRC_DYP = os.path.join(REPO, "content", "source-documents", "value-investing-yxc-gdut", "duanyongping")
MANIFEST_DIR = os.path.join(REPO, "editorial", "duanyongping", "manifest")
OUT_CSV = os.path.join(MANIFEST_DIR, "01_inventory.csv")

try:
    import yaml  # type: ignore
    HAS_YAML = True
except ImportError:
    HAS_YAML = False


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def parse_frontmatter(text: str):
    """返回 (fm_dict, body)。无 frontmatter 时返回 ({}, text)。"""
    if not text.startswith("---"):
        return {}, text
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
    if not m:
        return {}, text
    raw = m.group(1)
    body = text[m.end():]
    fm = {}
    if HAS_YAML:
        try:
            fm = yaml.safe_load(raw) or {}
            if not isinstance(fm, dict):
                fm = {}
        except Exception:
            fm = {}
    if not fm:
        for line in raw.splitlines():
            mm = re.match(r"^([A-Za-z_][\w]*)\s*:\s*(.*)$", line.strip())
            if mm:
                fm[mm.group(1)] = mm.group(2).strip().strip('"').strip("'")
    return fm, body


def slugify(name: str, maxlen: int = 60) -> str:
    s = re.sub(r"[^\w\u4e00-\u9fff-]+", "_", name).strip("_")
    return s[:maxlen]


def first_body_line(body: str) -> str:
    for ln in body.splitlines():
        s = ln.strip()
        if s and not s.startswith("!"):
            return s[:120]
    return ""


def collect_blog():
    out = []
    blog_dir = os.path.join(DYP, "blog")
    for year in sorted(os.listdir(blog_dir)):
        ydir = os.path.join(blog_dir, year)
        if not os.path.isdir(ydir):
            continue
        for fn in sorted(os.listdir(ydir)):
            if not fn.endswith(".md"):
                continue
            p = os.path.join(ydir, fn)
            with open(p, encoding="utf-8") as f:
                text = f.read()
            fm, body = parse_frontmatter(text)
            title = fm.get("title") or os.path.splitext(fn)[0]
            aid = str(fm.get("article_id") or "")
            date = str(fm.get("date") or "")
            src = str(fm.get("source") or "")
            out.append({
                "source_type": "blog",
                "unit_id": f"blog_{aid}" if aid else f"blog_{slugify(os.path.splitext(fn)[0])}",
                "file_path": p,
                "title": title,
                "date": date,
                "year": str(fm.get("date") or "")[:4],
                "article_id": aid,
                "source_url": src,
                "content_type": str(fm.get("content_type") or "article"),
                "bytes": len(text.encode("utf-8")),
                "sha256": sha256_of(p),
                "body_first_line": first_body_line(body),
            })
    return out


def collect_qa():
    out = []
    qa_dir = os.path.join(DYP, "qa")
    for year in sorted(os.listdir(qa_dir)):
        ydir = os.path.join(qa_dir, year)
        if not os.path.isdir(ydir) or year == "按年份":
            continue
        for fn in sorted(os.listdir(ydir)):
            if not fn.endswith(".md"):
                continue
            p = os.path.join(ydir, fn)
            with open(p, encoding="utf-8") as f:
                text = f.read()
            fm, body = parse_frontmatter(text)
            if fn.startswith("qa_"):
                stype = "qa"
                title = fm.get("title") or fn
                idx = str(fm.get("index") or os.path.splitext(fn)[0].replace("qa_", ""))
                date = str(fm.get("date") or "")
                src = str(fm.get("source") or "")
                uid = f"qa_{idx}"
            else:
                # 年份目录内的非问答文档（如「段永平最完整投资思路梳理」），同属主语料
                stype = "qa_doc"
                title = fm.get("title") or os.path.splitext(fn)[0]
                idx = ""
                date = str(fm.get("date") or "")
                src = str(fm.get("source") or "")
                uid = f"qadoc_{slugify(os.path.splitext(fn)[0])}"
            out.append({
                "source_type": stype,
                "unit_id": uid,
                "file_path": p,
                "title": title,
                "date": date,
                "year": year,
                "article_id": idx,
                "source_url": src,
                "content_type": str(fm.get("content_type") or "qa"),
                "bytes": len(text.encode("utf-8")),
                "sha256": sha256_of(p),
                "body_first_line": first_body_line(body),
            })
    return out


def collect_talks():
    out = []
    tdir = os.path.join(DYP, "talks")
    for fn in sorted(os.listdir(tdir)):
        if not fn.endswith(".md"):
            continue
        p = os.path.join(tdir, fn)
        with open(p, encoding="utf-8") as f:
            text = f.read()
        fm, body = parse_frontmatter(text)
        title = fm.get("title") or os.path.splitext(fn)[0]
        date = str(fm.get("date") or "")
        year = str(fm.get("year") or "")[:4]
        out.append({
            "source_type": "talks",
            "unit_id": f"talks_{slugify(os.path.splitext(fn)[0])}",
            "file_path": p,
            "title": title,
            "date": date,
            "year": year,
            "article_id": "",
            "source_url": str(fm.get("source") or ""),
            "content_type": str(fm.get("content_type") or "talk"),
            "bytes": len(text.encode("utf-8")),
            "sha256": sha256_of(p),
            "body_first_line": first_body_line(body),
        })
    return out


def collect_milestones():
    out = []
    mdir = os.path.join(DYP, "milestones")
    for fn in sorted(os.listdir(mdir)):
        if not fn.endswith(".md"):
            continue
        p = os.path.join(mdir, fn)
        with open(p, encoding="utf-8") as f:
            text = f.read()
        fm, body = parse_frontmatter(text)
        title = fm.get("title") or os.path.splitext(fn)[0]
        year = str(fm.get("year") or "")[:4]
        out.append({
            "source_type": "milestones",
            "unit_id": f"milestone_{slugify(os.path.splitext(fn)[0])}",
            "file_path": p,
            "title": title,
            "date": "",
            "year": year,
            "article_id": "",
            "source_url": "",
            "content_type": str(fm.get("content_type") or "talk"),
            "bytes": len(text.encode("utf-8")),
            "sha256": sha256_of(p),
            "body_first_line": first_body_line(body),
        })
    return out


def collect_speeches():
    out = []
    sdir = os.path.join(SRC_DYP, "speeches")
    if not os.path.isdir(sdir):
        return out
    for fn in sorted(os.listdir(sdir)):
        if not fn.endswith(".txt"):
            continue
        p = os.path.join(sdir, fn)
        with open(p, encoding="utf-8") as f:
            text = f.read()
        base = os.path.splitext(fn)[0]
        title = re.sub(r"^duan_", "", base)
        out.append({
            "source_type": "speeches",
            "unit_id": f"speech_{slugify(base)}",
            "file_path": p,
            "title": title,
            "date": "",
            "year": "",
            "article_id": "",
            "source_url": "",
            "content_type": "speech",
            "bytes": len(text.encode("utf-8")),
            "sha256": sha256_of(p),
            "body_first_line": first_body_line(text),
        })
    return out


def collect_xueqiu_monthly():
    out = []
    xdir = os.path.join(SRC_DYP, "xueqiu-posts")
    if not os.path.isdir(xdir):
        return out
    for fn in sorted(os.listdir(xdir)):
        if not fn.endswith(".md"):
            continue
        p = os.path.join(xdir, fn)
        with open(p, encoding="utf-8") as f:
            text = f.read()
        fm, body = parse_frontmatter(text)
        month = str(fm.get("month") or os.path.splitext(fn)[0].split("_")[0])
        out.append({
            "source_type": "xueqiu_monthly",
            "unit_id": f"xq_{month}",
            "file_path": p,
            "title": fm.get("title") or fn,
            "date": month,
            "year": month[:4],
            "article_id": month,
            "source_url": "",
            "content_type": str(fm.get("content_type") or "xueqiu"),
            "bytes": len(text.encode("utf-8")),
            "sha256": sha256_of(p),
            "body_first_line": first_body_line(body),
        })
    return out


def collect_reference_files():
    out = []
    # research notes
    rdir = os.path.join(SRC_DYP, "references", "research")
    if os.path.isdir(rdir):
        for fn in sorted(os.listdir(rdir)):
            if not fn.endswith(".md"):
                continue
            p = os.path.join(rdir, fn)
            with open(p, encoding="utf-8") as f:
                text = f.read()
            fm, body = parse_frontmatter(text)
            out.append({
                "source_type": "research",
                "unit_id": f"research_{slugify(os.path.splitext(fn)[0])}",
                "file_path": p,
                "title": fm.get("title") or fn,
                "date": "",
                "year": "",
                "article_id": "",
                "source_url": "",
                "content_type": str(fm.get("content_type") or "research"),
                "bytes": len(text.encode("utf-8")),
                "sha256": sha256_of(p),
                "body_first_line": first_body_line(body),
            })
    # thinking framework
    fp = os.path.join(SRC_DYP, "段永平思维框架.md")
    if os.path.isfile(fp):
        with open(fp, encoding="utf-8") as f:
            text = f.read()
        fm, body = parse_frontmatter(text)
        out.append({
            "source_type": "thinking_framework",
            "unit_id": "framework",
            "file_path": fp,
            "title": fm.get("title") or "段永平思维框架",
            "date": "",
            "year": "",
            "article_id": "",
            "source_url": "",
            "content_type": str(fm.get("content_type") or "note"),
            "bytes": len(text.encode("utf-8")),
            "sha256": sha256_of(fp),
            "body_first_line": first_body_line(body),
        })
    return out


def collect_thirdparty_bloggers():
    """content/bloggers 与 content/interviews 中提及「段永平」的 md 文件。"""
    out = []
    bdir = os.path.join(REPO, "content", "bloggers")
    seen = set()
    if os.path.isdir(bdir):
        for root, _dirs, files in os.walk(bdir):
            for fn in sorted(files):
                if not fn.endswith(".md"):
                    continue
                p = os.path.join(root, fn)
                with open(p, encoding="utf-8") as f:
                    text = f.read()
                if "段永平" not in text:
                    continue
                blogger = os.path.relpath(root, bdir).split(os.sep)[0]
                fm, body = parse_frontmatter(text)
                title = fm.get("title") or os.path.splitext(fn)[0]
                uid = f"blogger_{slugify(blogger)}_{slugify(os.path.splitext(fn)[0])}"
                n = 1
                while uid in seen:
                    uid = f"blogger_{slugify(blogger)}_{slugify(os.path.splitext(fn)[0])}_{n}"
                    n += 1
                seen.add(uid)
                out.append({
                    "source_type": "blogger",
                    "unit_id": uid,
                    "file_path": p,
                    "title": title,
                    "date": str(fm.get("date") or ""),
                    "year": str(fm.get("date") or "")[:4],
                    "article_id": "",
                    "source_url": "",
                    "content_type": str(fm.get("content_type") or "article"),
                    "bytes": len(text.encode("utf-8")),
                    "sha256": sha256_of(p),
                    "body_first_line": first_body_line(body),
                })
    # interviews
    idir = os.path.join(REPO, "content", "interviews")
    if os.path.isdir(idir):
        for fn in sorted(os.listdir(idir)):
            if not fn.endswith(".md"):
                continue
            p = os.path.join(idir, fn)
            with open(p, encoding="utf-8") as f:
                text = f.read()
            if "段永平" not in text:
                continue
            fm, body = parse_frontmatter(text)
            title = fm.get("title") or os.path.splitext(fn)[0]
            uid = f"interview_{slugify(os.path.splitext(fn)[0])}"
            n = 1
            while uid in seen:
                uid = f"interview_{slugify(os.path.splitext(fn)[0])}_{n}"
                n += 1
            seen.add(uid)
            out.append({
                "source_type": "interview",
                "unit_id": uid,
                "file_path": p,
                "title": title,
                "date": str(fm.get("date") or ""),
                "year": str(fm.get("date") or "")[:4],
                "article_id": "",
                "source_url": "",
                "content_type": str(fm.get("content_type") or "article"),
                "bytes": len(text.encode("utf-8")),
                "sha256": sha256_of(p),
                "body_first_line": first_body_line(body),
            })
    return out


def main():
    rows = (
        collect_blog()
        + collect_qa()
        + collect_talks()
        + collect_milestones()
        + collect_speeches()
        + collect_xueqiu_monthly()
        + collect_reference_files()
        + collect_thirdparty_bloggers()
    )
    os.makedirs(MANIFEST_DIR, exist_ok=True)
    cols = ["source_type", "unit_id", "file_path", "title", "date", "year",
            "article_id", "source_url", "content_type", "bytes", "sha256",
            "body_first_line"]
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for r in rows:
            w.writerow(r)
    # 统计
    from collections import Counter
    c = Counter(r["source_type"] for r in rows)
    print(f"总单元数: {len(rows)}")
    for k, v in sorted(c.items()):
        print(f"  {k}: {v}")
    print(f"输出: {OUT_CSV}")
    # 与预期数量的对照校验
    expect = {"blog": 597, "qa": 2212, "qa_doc": 2, "talks": 35, "milestones": 9,
              "speeches": 4, "xueqiu_monthly": 119}
    mism = []
    for k, v in expect.items():
        if c.get(k) != v:
            mism.append(f"{k}: 实际{c.get(k)} != 预期{v}")
    if mism:
        print("WARN 数量与初始预期不符（语料已增长，如回填月归档独有帖子）：")
        for m in mism:
            print("  ", m)
        print("（已降级为警告，继续生成清单）")
    else:
        print("OK 主语料数量与预期一致")


if __name__ == "__main__":
    main()
