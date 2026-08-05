#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""巴菲特卷、芒格卷统一审计脚本（口径合并版）。

合并两套既有口径：
- AI 写作特征：移植自 scripts/audit-book-ai-style.mjs（Codex 口径，F01—F11、对举模板、
  双破折号密度、句长变异系数），按章切分全卷后逐章扫描正文体。
- 结构/引用/链接/重复：移植自 editorial/buffett/audit/audit_full_manuscript.py（本工作稿口径）。
- 另加"生产话术残留"检测（frontmatter 字段、篇章页信息、编辑说明、HTML 占位注释），
  用于捕捉全卷拼接时未剥离的内部层。

任何复核方直接运行本脚本，获得一致结果：
    python3 editorial/shared/audit/audit_books.py
"""

import sys
import re
import json
import hashlib
from pathlib import Path

ROOT = Path("/Users/lucas/Documents/bamangB/bamangBOOK")
OUT_DIR = ROOT / "editorial/shared/audit"

# ---------------- 书与文件 ----------------
BOOKS = [
    {
        "id": "buffett",
        "name": "《所有者的眼光》巴菲特卷",
        "files": [
            "editorial/buffett/manuscript/全卷/所有者的眼光_巴菲特卷全卷连续正文.md",
        ],
    },
    {
        "id": "munger",
        "name": "《理性的格栅》芒格卷",
        # 终稿为 B 轨（连续生产稿）：A 轨（连续正文/全卷连续正文）已废弃，不再纳入统一审计。
        "files": [
            "editorial/munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md",
        ],
    },
]

# ---------------- AI 写作特征规则（Codex 口径） ----------------
EXACT_RULES = [
    ("F01", "生产过程语言进入正文", "strong",
     r"编辑部|编辑框架|编辑判断|编辑示例|本项目|项目中文|内容身份|本章首次|全书首次|来源性质|主引文|交付标准|字符目标|形式审计|模型稿"),
    ("F02", "无效的材料缺失声明", "strong",
     r"现有(?:资料|摘要|文本)|资料(?:显示|称|将)|(?:资料|摘要)(?:没有|未)(?:记录|提供|提到)|本章不(?:补写|复原|还原|搬进|搬入)|摘要里?没有"),
    ("F11", "来源管理话术进入读者正文", "strong",
     r"(?:这份|该|上述|现有)(?:材料|资料)(?:的身份|是|显示|说明|称|提供|记录|未|没有)|项目(?:语录页|资料)|同一主题的另一处语录|(?:资料|材料)(?:摘要|综述)|另一处语录|正文里合成|来源性质|内容身份"),
    ("F03", "替读者虚构误解", "medium",
     r"你可能(?:会)?(?:以为|认为|觉得)|有人(?:可能)?会说|读者可能(?:会)?(?:以为|认为)|乍看之下|看起来似乎|很容易把.+?理解为"),
    ("F04", "概念命名仪式", "medium",
     r"不妨把.+?(?:称为|叫作)|可以把.+?(?:称为|叫作)|这里把.+?(?:称为|叫作)|这就是所谓的"),
    ("F05", "过度升维或伪深刻收束", "medium",
     r"本质上|归根结底|说到底|最终定义了|真正的答案是|这才是.+?真正|这就是.+?本质"),
    ("F06", "固定位置的弱连接词", "weak",
     r"值得注意的是|需要指出的是|毋庸置疑|不言而喻|显而易见|总的来说|总体而言|换句话说|事实上|实际上|此外|与此同时|当然"),
    ("F07", "章节生产导航过密", "medium",
     r"本章(?:要|将|只|仅|先|讲|讨论|回答|采用|整理|补充)|这一章(?:要|将|先|讲|讨论|回答)|回顾本书|本书到目前为止"),
    ("F08", "模板化收束句", "weak",
     r"走到这里|到这里，|由此可见|这也正是|这就解释了为什么|答案已经很清楚|问题的答案是"),
    ("F09", "不必要的绝对化判断", "medium",
     r"毫无疑问|必然会|注定会|唯一的答案|全部证明了"),
]
CONTRAST_RE = re.compile(r"(?:不是[^。！？\n]{0,55}而是|并非[^。！？\n]{0,55}而是|不在于[^。！？\n]{0,55}而在于|不是[^。！？\n]{0,55}只是)")
COMPILED = [(rid, feat, sev, re.compile(pat)) for rid, feat, sev, pat in EXACT_RULES]

# ---------------- 生产话术残留（全卷拼接未剥离） ----------------
LEAK_RE = re.compile(
    r"^series:\s*|^book:\s*|^part:\s*|^chapter:\s*|^anchor:\s*|^status:\s*|"
    r"^brand_color:\s*|^estimated_final_chars:\s*|^<!-- |^## 篇章页信息\s*$|"
    r"^## 编辑说明\s*$|^## 注释与来源映射\s*$|^观点原子：|^模型身份提示：",
    re.M)

CH_TITLE_RE = re.compile(r"^# 第(.+?)章 .*?\{#(\S+?)\}")
SUMMARY_RE = re.compile(r"^## 本章小结\s*$", re.M)
NOTES_RE = re.compile(r"^## 注释(?:与来源映射)?\s*$", re.M)
CLOSING_RE = re.compile(r"^## 篇末收束\s*$", re.M)
ANCHOR_RE = re.compile(r"^#{1,6} .*\{#([^}]+)\}", re.M)
LINK_RE = re.compile(r"\]\(#([^)]+)\)")
EXTERNAL_RE = re.compile(r"\]\(https?://")


def extract_anchors(text):
    """提取全部标题锚点。支持一个标题携带多个锚点（如 {#a #b}）。"""
    anchors = set()
    for m in ANCHOR_RE.finditer(text):
        anchors.update(tok[1:] if tok.startswith("#") else tok for tok in m.group(1).split())
    return anchors


def chapter_split(lines):
    """按章标题切分。同锚点的重复标题合并为一章（保留首次出现）。"""
    found = []
    for i, l in enumerate(lines):
        m = CH_TITLE_RE.match(l)
        if m:
            found.append((m.group(2), i))
    merged = []
    for anchor, i in found:
        if merged and merged[-1][0] == anchor:
            continue
        merged.append((anchor, i))
    return merged


def body_only(seg):
    """去掉注释区与内部层 section，返回正文体。"""
    m = re.search(r"^## (?:注释|注释与来源映射)\s*$", seg, re.M)
    if m:
        seg = seg[: m.start()]
    return seg


def prose_lines(text):
    out = []
    for i, line in enumerate(text.split("\n")):
        s = line.strip()
        if s and not s.startswith(">") and not s.startswith("|") and not s.startswith("[^"):
            out.append((i, s))
    return out


def excerpt(text, index, length):
    start = max(0, index - 36)
    end = min(len(text), index + length + 72)
    return re.sub(r"\s+", " ", text[start:end]).strip()


def clustered_indexes(matches, window=800, minimum=3):
    indexes = set()
    left = 0
    n = len(matches)
    for right in range(n):
        while matches[right][0] - matches[left][0] > window:
            left += 1
        if right - left + 1 >= minimum:
            for k in range(left, right + 1):
                indexes.add(k)
    return indexes


def chapter_audit(raw_text):
    """对单个全卷文件执行逐章审计。"""
    lines = raw_text.split("\n")
    titles = chapter_split(lines)
    result = {"chapters": [], "footnote": {}, "links": {}, "duplicateParagraphs": [],
              "productionLeaks": [], "partOpener": 0, "partClosing": 0, "bookClosing": 0}

    result["partOpener"] = len(re.findall(r"^## 篇首导读\s*$", raw_text, re.M))
    result["partClosing"] = len(re.findall(r"^## 篇末收束\s*$", raw_text, re.M))
    result["bookClosing"] = len(re.findall(r"^## 全卷收束\s*$", raw_text, re.M))

    # 生产话术残留（全文）
    for m in LEAK_RE.finditer(raw_text):
        line_no = raw_text[: m.start()].count("\n") + 1
        result["productionLeaks"].append({"line": line_no, "match": m.group(0).strip()[:40]})

    # 脚注完整性（兼容 [^b101] 与 [^m01-1] 两种编号格式）
    ref_pat = r"\[\^([bm]?\d[\w-]*)\]"
    def_pat = r"^\[\^([bm]?\d[\w-]*)\]:"
    used = set(re.findall(ref_pat, raw_text))
    defined = set(re.findall(def_pat, raw_text, re.M))
    result["footnote"] = {
        "refCount": len(re.findall(ref_pat, raw_text)),
        "definedCount": len(defined),
        "usedNotDefined": sorted(used - defined),
        "definedNotUsed": sorted(defined - used),
    }

    # 链接
    anchors = extract_anchors(raw_text)
    links = LINK_RE.findall(raw_text)
    result["links"] = {
        "internalCount": len(links),
        "externalCount": len(EXTERNAL_RE.findall(raw_text)),
        "missingTargets": sorted({l for l in links if l not in anchors}),
    }

    # 段落完全重复
    seen, dups = {}, []
    for i, block in enumerate(re.split(r"\n\s*\n", raw_text)):
        block = block.strip()
        if not block:
            continue
        first = block.split("\n")[0].strip()
        if re.match(r"^[-*_]{3,}$", first) or first.startswith(("#", "[^b", "[^m", "|", ">", "series:", "book:", "part:", "chapter:", "anchor:", "status:", "brand_color:", "estimated_final_chars:")):
            continue
        key = hashlib.md5(block.encode("utf-8")).hexdigest()
        if key in seen:
            dups.append({"first": seen[key], "second": i, "preview": block[:50]})
        else:
            seen[key] = i
    result["duplicateParagraphs"] = dups

    # 逐章
    all_chars = 0
    for idx, (anchor, start) in enumerate(titles):
        end = titles[idx + 1][1] if idx + 1 < len(titles) else len(lines)
        seg = "\n".join(lines[start:end])
        all_chars += len(seg)

        summary = len(SUMMARY_RE.findall(seg))
        notes = len(NOTES_RE.findall(seg))
        closing = len(CLOSING_RE.findall(seg))
        title_lines = sum(1 for l in lines[start:end] if CH_TITLE_RE.match(l))

        body = body_only(seg)
        searchable = "\n".join(s for _, s in prose_lines(body))

        # AI 特征命中
        hits = []
        for rid, feat, sev, pat in COMPILED:
            for m in pat.finditer(searchable):
                hits.append({"rule": rid, "feature": feat, "severity": sev,
                             "match": m.group(0)[:40], "excerpt": excerpt(searchable, m.start(), len(m.group(0)))})

        contrasts = list(CONTRAST_RE.finditer(searchable))
        clustered = clustered_indexes([(m.start(), m) for m in contrasts])
        for k in sorted(clustered):
            m = contrasts[k]
            hits.append({"rule": "F10", "feature": "高密度‘不是X而是Y’翻转", "severity": "medium",
                         "match": m.group(0)[:40], "excerpt": excerpt(searchable, m.start(), len(m.group(0)))})

        # 附加指标
        chars = len(searchable)
        em_dashes = len(re.findall(r"——", searchable))
        em_per_10k = round(em_dashes * 10000 / max(chars, 1), 2)
        sentences = [s for s in re.split(r"[。！？]+", searchable) if len(re.sub(r"\s", "", s)) >= 8]
        lengths = [len(s) for s in sentences]
        mean = sum(lengths) / max(len(lengths), 1)
        var = sum((x - mean) ** 2 for x in lengths) / max(len(lengths), 1)
        cv = round((var ** 0.5) / mean, 3) if mean else 0
        contrasts_all = len(contrasts)
        contrasts_clustered = len(clustered)
        per_10k = round(contrasts_all * 10000 / max(chars, 1), 2)

        result["chapters"].append({
            "anchor": anchor, "lines": f"{start + 1}-{end}", "characters": len(seg),
            "bodyChars": chars,
            "summary": summary, "notes": notes, "closing": closing, "titleLines": title_lines,
            "emDashesPer10k": em_per_10k, "sentenceLengthCv": cv,
            "contrasts": contrasts_all, "contrastsPer10k": per_10k, "clusteredContrasts": contrasts_clustered,
            "hits": hits,
        })

    result["totalCharacters"] = all_chars
    result["chapterCount"] = len(titles)
    return result


def summarize(file_result):
    """汇总为报告层统计。"""
    hits = [h for c in file_result["chapters"] for h in c["hits"]]
    strong = sum(1 for h in hits if h["severity"] == "strong")
    medium = sum(1 for h in hits if h["severity"] == "medium")
    weak = sum(1 for h in hits if h["severity"] == "weak")
    by_rule = {}
    for h in hits:
        by_rule[h["rule"]] = by_rule.get(h["rule"], 0) + 1
    return {
        "chapterCount": file_result["chapterCount"],
        "totalCharacters": file_result["totalCharacters"],
        "strong": strong, "medium": medium, "weak": weak,
        "byRule": dict(sorted(by_rule.items())),
        "highContrastChapters": sum(1 for c in file_result["chapters"] if c["clusteredContrasts"] > 0),
        "highDashChapters": sum(1 for c in file_result["chapters"] if c["emDashesPer10k"] > 18),
        "structureErrors": [
            f"{c['anchor']}: 本章小结{c['summary']}次" for c in file_result["chapters"] if c["summary"] != 1
        ] + [
            f"{c['anchor']}: 注释区{c['notes']}次" for c in file_result["chapters"] if c["notes"] != 1
        ] + [
            f"{c['anchor']}: 标题重复{c['titleLines']}次" for c in file_result["chapters"] if c["titleLines"] > 1
        ],
        "productionLeaks": len(file_result["productionLeaks"]),
        "footnote": file_result["footnote"],
        "links": file_result["links"],
        "duplicateParagraphs": len(file_result["duplicateParagraphs"]),
    }


def main():
    out_json = OUT_DIR / "双卷统一审计结果.json"
    out_md = OUT_DIR / "双卷统一审计结果.md"

    results = []
    for book in BOOKS:
        book_result = {"id": book["id"], "name": book["name"], "files": []}
        for rel in book["files"]:
            raw = (ROOT / rel).read_text(encoding="utf-8")
            audit = chapter_audit(raw)
            audit["file"] = rel
            audit["summary"] = summarize(audit)
            book_result["files"].append(audit)
        results.append(book_result)

    json.dump({"generatedAt": "2026-08-02", "methodology": "统一口径：AI特征F01—F11与对举模板来自Codex脚本，结构与引用来自audit_full_manuscript.py，生产话术残留为本脚本新增。机器命中只生成候选，须人工豁免引文与有意修辞。", "results": results},
              (OUT_DIR / out_json).open("w", encoding="utf-8"), ensure_ascii=False, indent=2)

    lines = ["# 巴菲特卷、芒格卷统一审计结果", "", "生成：2026-08-02（口径合并版 audit_books.py）", ""]
    for book in results:
        lines += [f"## {book['name']}", ""]
        for f in book["files"]:
            s = f["summary"]
            lines += [
                f"### {Path(f['file']).name}", "",
                f"- 章节：{s['chapterCount']}｜总字符：{s['totalCharacters']}",
                f"- AI特征：强{s['strong']}｜中{s['medium']}｜弱{s['weak']}｜按规则：{s['byRule']}",
                f"- 对立模板：全部{s['byRule'].get('F10', 0)}处聚集（800字内≥3次）｜聚集章节数：{s['highContrastChapters']}",
                f"- 双破折号密度>18/万字章节数：{s['highDashChapters']}",
                f"- 生产话术残留：{s['productionLeaks']}处",
                f"- 结构错误：{s['structureErrors'] if s['structureErrors'] else '0'}",
                f"- 脚注：定义{s['footnote']['definedCount']}条｜悬空：{s['footnote']['usedNotDefined'] or '0'}",
                f"- 内部链接：{s['links']['internalCount']}｜缺失目标：{s['links']['missingTargets'] or '0'}｜外部链接：{s['links']['externalCount']}",
                f"- 段落级完全重复：{s['duplicateParagraphs']}组", "",
            ]
    (OUT_DIR / out_md).write_text("\n".join(lines), encoding="utf-8")

    # stdout 摘要
    print(json.dumps([{ "id": b["id"], "files": [{"file": Path(f["file"]).name, **f["summary"]} for f in b["files"]] } for b in results],
                     ensure_ascii=False, indent=2))
    print("统一审计结果已写入:", out_json, out_md)


if __name__ == "__main__":
    main()
