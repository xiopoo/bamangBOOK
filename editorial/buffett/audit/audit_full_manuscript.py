#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""巴菲特卷全卷统一审计脚本。

本脚本是全卷质量报告的检测基准（口径锚点）。任何复核方（人工或 AI）
直接运行本脚本，即可获得一致的结构、链接、脚注与句式统计结果，
避免不同复核方各自推断造成口径分歧。

用法：
    python3 audit_full_manuscript.py [正文.md路径] [输出.json路径]
"""

import sys
import re
import json
import hashlib

DEFAULT_MD = "/Users/lucas/Documents/bamangB/bamangBOOK/editorial/buffett/manuscript/全卷/所有者的眼光_巴菲特卷全卷连续正文.md"
DEFAULT_OUT = "/Users/lucas/Documents/bamangB/bamangBOOK/editorial/buffett/audit/巴菲特卷全卷审计结果.json"

CH_TITLE_RE = re.compile(r"^# 第(.+?)章 .*\{#(buffett-ch-\d+)\}")
ANCHOR_RE = re.compile(r"^# .*\{#(buffett-[^}]+)\}", re.M)
LINK_RE = re.compile(r"\]\(#(buffett-[^)]+)\)")
EXTERNAL_LINK_RE = re.compile(r"\]\(https?://")
NOTBUT_RE = re.compile(r"不是[^。！？；]{0,20}而是")
SUMMARY_RE = re.compile(r"^## 本章小结\s*$", re.M)
NOTES_RE = re.compile(r"^## 注释\s*$", re.M)
CLOSING_RE = re.compile(r"^## 篇末收束\s*$", re.M)
PART_OPEN_RE = re.compile(r"^## 篇首导读\s*$", re.M)
BOOK_CLOSING_RE = re.compile(r"^## 全卷收束\s*$", re.M)


def split_blocks(text):
    """按空行切分正文，返回段落列表（行号从 0 开始）。"""
    blocks = []
    offset = 0
    for match in re.finditer(r"\n\s*\n", text):
        blocks.append((offset, text[offset:match.start()]))
        offset = match.end()
    blocks.append((offset, text[offset:]))
    return [(start, b) for start, b in blocks if b.strip()]


def is_structural_block(block):
    first = block.split("\n")[0].strip()
    if re.match(r"^[-*_]{3,}$", first):  # 分隔线
        return True
    return first.startswith("#") or first.startswith("[^b") or first.startswith("|") or first.startswith(">")


def main():
    md_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_MD
    out_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUT
    text = open(md_path, encoding="utf-8").read()
    lines = text.split("\n")

    report = {"file": md_path}
    errors = []

    # ---- 1. 总字符（与 wc -m 口径一致，含换行） ----
    report["totalCharacters"] = len(text)

    # ---- 2. 章节结构 ----
    ch_titles = [(m.group(2), i) for i, l in enumerate(lines) if (m := CH_TITLE_RE.match(l))]
    report["chapterCount"] = len(ch_titles)
    chapters = []
    for idx, (anchor, start) in enumerate(ch_titles):
        end = ch_titles[idx + 1][1] if idx + 1 < len(ch_titles) else len(lines)
        seg = "\n".join(lines[start:end])
        summary = len(SUMMARY_RE.findall(seg))
        notes = len(NOTES_RE.findall(seg))
        closing = len(CLOSING_RE.findall(seg))
        chars = len(seg)
        if summary != 1:
            errors.append(f"{anchor}: 本章小结出现 {summary} 次（应为 1）")
        if notes != 1:
            errors.append(f"{anchor}: 注释区出现 {notes} 次（应为 1）")
        if closing > 1:
            errors.append(f"{anchor}: 篇末收束出现 {closing} 次（最多 1）")
        chapters.append({
            "anchor": anchor,
            "lines": f"{start + 1}-{end}",
            "characters": chars,
            "summary": summary,
            "notes": notes,
            "closing": closing,
        })
    report["chapters"] = chapters
    report["chaptersBelow10000"] = [c["anchor"] for c in chapters if c["characters"] < 10000]

    # ---- 3. 篇级与全卷级结构件 ----
    report["partOpenerCount"] = len(PART_OPEN_RE.findall(text))
    report["partClosingCount"] = len(CLOSING_RE.findall(text))
    report["bookClosingCount"] = len(BOOK_CLOSING_RE.findall(text))
    if report["bookClosingCount"] != 1:
        errors.append(f"全卷收束出现 {report['bookClosingCount']} 次（应为 1）")

    # ---- 4. 段落级完全重复检测（剔除结构件、注释、表格） ----
    seen, dups = {}, []
    for i, (start, block) in enumerate(split_blocks(text)):
        if is_structural_block(block):
            continue
        key = hashlib.md5(block.encode("utf-8")).hexdigest()
        if key in seen:
            dups.append({
                "first": seen[key], "second": i,
                "length": len(block), "preview": block[:60],
            })
        else:
            seen[key] = i
    report["duplicateParagraphs"] = dups
    if dups:
        errors.append(f"段落级完全重复 {len(dups)} 组")

    # ---- 5. 脚注完整性 ----
    used = set(re.findall(r"\[\^(b\d+)\]", text))
    defined = set(re.findall(r"^\[\^(b\d+)\]:", text, re.M))
    report["footnote"] = {
        "refCount": len(re.findall(r"\[\^b\d+\]", text)),
        "definedCount": len(defined),
        "usedNotDefined": sorted(used - defined),
        "definedNotUsed": sorted(defined - used),
    }
    if used - defined or defined - used:
        errors.append("脚注引用与定义不一致")

    # ---- 6. 链接完整性 ----
    anchors = set(ANCHOR_RE.findall(text))
    links = LINK_RE.findall(text)
    missing = sorted({l for l in links if l not in anchors})
    report["links"] = {
        "internalCount": len(links),
        "externalCount": len(EXTERNAL_LINK_RE.findall(text)),
        "missingTargets": missing,
    }
    if missing:
        errors.append(f"内部链接目标缺失: {missing}")

    # ---- 7. 对举句式（统一口径，逐章分布） ----
    per_chapter, total = {}, 0
    for idx, (anchor, start) in enumerate(ch_titles):
        end = ch_titles[idx + 1][1] if idx + 1 < len(ch_titles) else len(lines)
        seg = "\n".join(lines[start:end])
        c = len(NOTBUT_RE.findall(seg))
        per_chapter[anchor] = c
        total += c
    report["notButPattern"] = {
        "regex": "不是[^。！？；]{0,20}而是",
        "perChapter": per_chapter,
        "total": total,
    }

    report["errors"] = errors
    report["ok"] = not errors

    print(json.dumps({
        "ok": report["ok"],
        "totalCharacters": report["totalCharacters"],
        "chapterCount": report["chapterCount"],
        "chaptersBelow10000": report["chaptersBelow10000"],
        "footnoteDefined": report["footnote"]["definedCount"],
        "internalLinks": report["links"]["internalCount"],
        "notButTotal": total,
        "duplicateParagraphs": len(dups),
        "errors": errors,
    }, ensure_ascii=False, indent=2))

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print("审计结果已写入:", out_path)
    sys.exit(0 if not errors else 1)


if __name__ == "__main__":
    main()
