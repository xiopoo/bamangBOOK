#!/usr/bin/env python3
"""段永平文集 · 去重映射与独有内容识别

输入：editorial/duanyongping/manifest/01_inventory.csv
输出：
  editorial/duanyongping/manifest/02_dedup_map.csv
  editorial/duanyongping/manifest/03_monthly_archive_unique.md

规则：
  R1 按年份聚合文件（qa/按年份/*.md）→ 由个体问答派生，主版本=个体文件
  R2 雪球月归档（xueqiu-posts）→ 按原文 URL 与问答个体比对：
      命中 → 主版本=个体问答，月归档为重复
      未命中 → 记入「月归档独有内容清单」（无遗漏复核用）
  R3 speeches txt 与 talks md 重叠检测（文本 n-gram 相似度）→ 主版本=结构化 md
  R4 博客内部完全重复（sha256 相同）→ 仅保留一份为主版本
"""
import csv
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DYP = os.path.join(REPO, "content", "duanyongping")
SRC_DYP = os.path.join(REPO, "content", "source-documents", "value-investing-yxc-gdut", "duanyongping")
MANIFEST_DIR = os.path.join(REPO, "editorial", "duanyongping", "manifest")
INV_CSV = os.path.join(MANIFEST_DIR, "01_inventory.csv")
OUT_CSV = os.path.join(MANIFEST_DIR, "02_dedup_map.csv")
OUT_UNIQUE_MD = os.path.join(MANIFEST_DIR, "03_monthly_archive_unique.md")

XQ_URL_RE = re.compile(r"xueqiu\.com/1247347556/(\d+)")


def load_inventory():
    rows = []
    with open(INV_CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append(r)
    return rows


def xueqiu_post_ids(text):
    return set(XQ_URL_RE.findall(text))


def rule1_aggregated(rows):
    """按年份聚合文件 → 主版本=该年个体问答文件"""
    out = []
    agg_dir = os.path.join(DYP, "qa", "按年份")
    if not os.path.isdir(agg_dir):
        return out
    qa_by_year = {}
    for r in rows:
        if r["source_type"] == "qa":
            qa_by_year.setdefault(r["year"], []).append(r["unit_id"])
    for fn in sorted(os.listdir(agg_dir)):
        if not fn.endswith(".md"):
            continue
        year = os.path.splitext(fn)[0]
        p = os.path.join(agg_dir, fn)
        primary = qa_by_year.get(year, [])
        out.append({
            "unit_id": f"aggregated_{year}",
            "file_path": p,
            "status": "aggregated_excluded",
            "duplicate_group": f"aggregated_{year}",
            "maps_to_unit_id": ";".join(primary),
            "reason": f"R1 按年份聚合文件，由 {len(primary)} 个个体问答派生，正文以个体文件为准",
        })
    return out


def rule2_monthly(rows):
    """雪球月归档 ↔ 问答个体文件"""
    qa_by_url = {}
    for r in rows:
        if r["source_type"] == "qa" and r["source_url"]:
            ids = re.findall(r"(\d+)/?$", r["source_url"])
            if ids:
                qa_by_url.setdefault(ids[0], []).append(r["unit_id"])
    out = []
    unique_posts = []
    for r in rows:
        if r["source_type"] != "xueqiu_monthly":
            continue
        p = r["file_path"]
        with open(p, encoding="utf-8") as f:
            text = f.read()
        post_ids = xueqiu_post_ids(text)
        # 正文中的「原帖已删除」链接可能无数字 id，跳过
        mapped = []
        for pid in sorted(post_ids):
            if pid in qa_by_url:
                mapped.extend(qa_by_url[pid])
        if mapped:
            out.append({
                "unit_id": r["unit_id"],
                "file_path": p,
                "status": "duplicate_mapped",
                "duplicate_group": r["unit_id"],
                "maps_to_unit_id": ";".join(sorted(set(mapped))),
                "reason": f"R2 月归档含 {len(mapped)} 条与问答个体同源的帖子，正文以个体问答为准",
            })
        else:
            out.append({
                "unit_id": r["unit_id"],
                "file_path": p,
                "status": "reference_only",
                "duplicate_group": r["unit_id"],
                "maps_to_unit_id": "",
                "reason": "R2 月归档未命中个体问答的帖子数量待独有清单统计",
            })
            # 统计未命中的帖子
            seen = set()
            for m in XQ_URL_RE.finditer(text):
                pid = m.group(1)
                if pid in qa_by_url or pid in seen:
                    continue
                seen.add(pid)
            unique_posts.append((r["unit_id"], len(seen)))
    return out, unique_posts


def _normalize_text(text):
    """去除空白与标点，仅保留中文/字母/数字，用于 n-gram 相似度"""
    text = re.sub(r"[\s\W_]+", "", text)
    return text


# speeches 与 talks/milestones 的确定性匹配规则（同一场讲话的不同版本）
# 键：speech 文件名中的特征词；值：(匹配目标 source_type, 目标标题特征词, 说明)
SPEECH_MATCH_RULES = [
    ("斯坦福", "talks", "连答53问", "同场斯坦福交流，主版本=结构化访谈稿"),
    ("2025方略", "talks", "方三文", "2025 方三文对话（方略访谈为原始转录片段），主版本=结构化访谈稿"),
    ("合集", "milestones", "营销人员讲话", "营销人员讲话（合集标注 1998，里程碑为 2000 版），主版本=里程碑稿"),
]


def rule3_speeches_vs_talks(rows):
    """speeches txt 与 talks/milestones 重叠检测（确定性特征词匹配 + n-gram 兜底）"""
    speeches = [r for r in rows if r["source_type"] == "speeches"]
    targets = [r for r in rows if r["source_type"] in ("talks", "milestones")]
    out = []
    talk_grams = []
    for t in targets:
        with open(t["file_path"], encoding="utf-8") as f:
            text = _normalize_text(f.read())
        grams = set(text[i:i + 16] for i in range(0, max(1, len(text) - 16), 16))
        talk_grams.append((t, grams))
    for s in speeches:
        base = s["unit_id"]
        matched = None
        for kw, stype, tkw, desc in SPEECH_MATCH_RULES:
            if kw in base:
                for t in targets:
                    if t["source_type"] == stype and tkw in t["title"]:
                        matched = (t, desc)
                        break
                break
        if matched:
            t, desc = matched
            out.append({
                "unit_id": s["unit_id"],
                "file_path": s["file_path"],
                "status": "duplicate_mapped",
                "duplicate_group": s["unit_id"],
                "maps_to_unit_id": t["unit_id"],
                "reason": f"R3 特征词匹配：{desc}（{t['title']}）",
            })
            continue
        # 兜底：n-gram 相似度
        with open(s["file_path"], encoding="utf-8") as f:
            text = _normalize_text(f.read())
        sgrams = set(text[i:i + 16] for i in range(0, max(1, len(text) - 16), 16))
        best, best_score = None, 0.0
        for t, tgrams in talk_grams:
            inter = len(sgrams & tgrams)
            denom = min(len(sgrams), len(tgrams)) or 1
            score = inter / denom
            if score > best_score:
                best, best_score = t, score
        if best and best_score >= 0.4:
            out.append({
                "unit_id": s["unit_id"],
                "file_path": s["file_path"],
                "status": "duplicate_mapped",
                "duplicate_group": s["unit_id"],
                "maps_to_unit_id": best["unit_id"],
                "reason": f"R3 n-gram 重叠（相似度 {best_score:.2f}），主版本=结构化稿：{best['title']}",
            })
        else:
            out.append({
                "unit_id": s["unit_id"],
                "file_path": s["file_path"],
                "status": "primary",
                "duplicate_group": s["unit_id"],
                "maps_to_unit_id": "",
                "reason": f"R3 未发现重叠（最高相似度 {best_score:.2f}），作为主版本收录",
            })
    return out


def rule4_blog_dups(rows):
    """博客内部完全重复（sha256 相同）"""
    by_sha = {}
    for r in rows:
        if r["source_type"] == "blog":
            by_sha.setdefault(r["sha256"], []).append(r)
    out = []
    for sha, group in by_sha.items():
        if len(group) < 2:
            continue
        group.sort(key=lambda r: r["unit_id"])
        primary = group[0]
        for r in group[1:]:
            out.append({
                "unit_id": r["unit_id"],
                "file_path": r["file_path"],
                "status": "duplicate_mapped",
                "duplicate_group": f"blog_sha_{sha[:8]}",
                "maps_to_unit_id": primary["unit_id"],
                "reason": f"R4 博客内完全重复（sha256={sha[:12]}…），主版本={primary['unit_id']}",
            })
    return out


def main():
    rows = load_inventory()
    map_rows = []
    map_rows += rule1_aggregated(rows)
    monthly_rows, unique_posts = rule2_monthly(rows)
    map_rows += monthly_rows
    map_rows += rule3_speeches_vs_talks(rows)
    map_rows += rule4_blog_dups(rows)

    os.makedirs(MANIFEST_DIR, exist_ok=True)
    cols = ["unit_id", "file_path", "status", "duplicate_group", "maps_to_unit_id", "reason"]
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for r in sorted(map_rows, key=lambda x: (x["unit_id"],)):
            w.writerow(r)

    # 月归档独有内容清单
    with open(OUT_UNIQUE_MD, "w", encoding="utf-8") as f:
        f.write("# 雪球月归档独有内容清单\n\n")
        f.write("> 说明：雪球月归档（xueqiu-posts）中未在个体问答语料中出现的帖子，"
                "供「无遗漏」复核。正文以个体问答为准；若复核确认某独有帖子为段永平原创内容且值得收录，"
                "可在后续版本补充。\n\n")
        if not unique_posts:
            f.write("（无独有内容）\n")
        for uid, n in unique_posts:
            f.write(f"- {uid}：{n} 条未命中\n")
    print(f"去重映射: {len(map_rows)} 行")
    from collections import Counter
    print(Counter(r["status"] for r in map_rows))
    print(f"输出: {OUT_CSV}")
    print(f"独有清单: {OUT_UNIQUE_MD}")
    for uid, n in unique_posts:
        print(f"  月归档独有 {uid}: {n}")


if __name__ == "__main__":
    main()
