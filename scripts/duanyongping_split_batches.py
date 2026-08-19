#!/usr/bin/env python3
"""将盘点+预分类信息拆分为分类子代理的分批输入 CSV。

输出到 editorial/duanyongping/manifest/classification_partial/ 目录，
文件名: batch_<name>.csv，列: unit_id,source_type,year,title,file_path,candidate_chapter,hint_reason
"""
import csv
import os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_DIR = os.path.join(REPO, "editorial", "duanyongping", "manifest")
INV_CSV = os.path.join(MANIFEST_DIR, "01_inventory.csv")
HINTS_CSV = os.path.join(MANIFEST_DIR, "04_classification_hints.csv")
OUT_DIR = os.path.join(MANIFEST_DIR, "classification_partial")

# 批次定义: (批次名, 过滤函数)
BATCHES = [
    ("qa_111218", lambda r: r["source_type"] == "qa" and r["year"] in ("2011", "2012", "2018")),
    ("qa_2019", lambda r: r["source_type"] == "qa" and r["year"] == "2019"),
    ("qa_2020", lambda r: r["source_type"] in ("qa", "qa_doc") and r["year"] == "2020"),
    ("qa_212223", lambda r: r["source_type"] == "qa" and r["year"] in ("2021", "2022", "2023")),
    ("qa_2425", lambda r: r["source_type"] == "qa" and r["year"] in ("2024", "2025")),
    ("blog", lambda r: r["source_type"] == "blog"),
    ("long", lambda r: r["source_type"] in ("talks", "milestones", "speeches")),
]


def main():
    inv = {}
    with open(INV_CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            inv[r["unit_id"]] = r
    hints = {}
    with open(HINTS_CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            hints[r["unit_id"]] = r
    os.makedirs(OUT_DIR, exist_ok=True)
    total = 0
    for name, cond in BATCHES:
        rows = []
        for uid, r in inv.items():
            if r["source_type"] in ("blog", "qa", "qa_doc", "talks", "milestones", "speeches") and cond(r):
                h = hints.get(uid, {})
                rows.append({
                    "unit_id": uid,
                    "source_type": r["source_type"],
                    "year": r["year"],
                    "title": r["title"],
                    "file_path": r["file_path"],
                    "candidate_chapter": h.get("candidate_chapter", ""),
                    "hint_reason": h.get("reason", ""),
                })
        rows.sort(key=lambda x: x["unit_id"])
        out = os.path.join(OUT_DIR, f"batch_{name}.csv")
        with open(out, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            for row in rows:
                w.writerow(row)
        print(f"{name}: {len(rows)} 行 → {out}")
        total += len(rows)
    print(f"合计: {total}")


if __name__ == "__main__":
    main()
