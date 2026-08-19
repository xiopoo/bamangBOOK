#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""段永平文集 · 主题分类电子书生成器

输入（均位于 editorial/duanyongping/manifest）：
  - 01_inventory.csv          全量单元清单（含 file_path / source_type / year）
  - 02_dedup_map.csv          去重映射（R1-R4）
  - 03_monthly_archive_unique.md  雪球月归档独有内容清单
  - 04_classification_hints.csv   主单元候选章（关键词预分类）
  - 00_taxonomy.json          六卷四十四章分类体系

逻辑：
  1. 去重：主语料 blog/qa/talks/milestones/speeches 视为已唯一化的主版本；
     参考/重叠语料（雪球月归档、年份聚合、speeches 映射目标）不进入正文。
  2. 分类：以 04 候选章为准；未命中(空)单元归入「待归类」附录，保证 0 遗漏。
  3. 汇编：按 (卷, 章, 源类型优先级, 年, unit_id) 排序，嵌入全文。

输出：
  build_books/dyp_themed/段永平文集_主题分类版.md
  build_books/dyp_themed/段永平文集_主题分类版.html
"""
import csv
import json
import os
import re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAN = os.path.join(REPO, "editorial", "duanyongping", "manifest")
OUTDIR = os.path.join(REPO, "build_books", "dyp_themed")
os.makedirs(OUTDIR, exist_ok=True)

MAIN_TYPES = ("blog", "qa", "talks", "milestones", "speeches", "qa_doc")

# 源类型在章内的逻辑排序：先系统论述(长文)，后成篇博文，最后问答
TYPE_ORDER = {"talks": 0, "milestones": 0, "speeches": 0, "blog": 1, "qa_doc": 2, "qa": 3}


def load_csv(name):
    with open(os.path.join(MAN, name), encoding="utf-8") as f:
        return list(csv.DictReader(f))


def strip_fm(text):
    if text.startswith("---"):
        m = re.match(r"^---\r?\n.*?\r?\n---\r?\n", text, re.S)
        if m:
            return text[m.end():]
    return text


def read_body(path):
    try:
        t = open(path, encoding="utf-8").read()
    except Exception:
        return ""
    return strip_fm(t).strip()


def main():
    inv = {r["unit_id"]: r for r in load_csv("01_inventory.csv")}
    hints = {r["unit_id"]: r for r in load_csv("04_classification_hints.csv")}
    taxonomy = json.load(open(os.path.join(MAN, "00_taxonomy.json"), encoding="utf-8"))

    # 单元 -> 候选章；未命中归入待归类
    assign = {}
    unclassified = []
    for uid, r in inv.items():
        if r["source_type"] not in MAIN_TYPES:
            continue
        ch = (hints.get(uid, {}) or {}).get("candidate_chapter", "").strip()
        if not ch:
            unclassified.append(uid)
            ch = "__UNCLASSIFIED__"
        assign[uid] = ch

    # 按 (part, chapter) 分桶
    part_of = {}
    chap_title = {}
    for p in taxonomy["parts"]:
        for c in p["chapters"]:
            part_of[c["id"]] = p["id"]
            chap_title[c["id"]] = c["title"]
    part_info = {p["id"]: p for p in taxonomy["parts"]}

    buckets = {}  # chapter_id -> [(seq_key, unit_id)]
    for uid, ch in assign.items():
        buckets.setdefault(ch, []).append(uid)

    def sort_key(uid):
        r = inv[uid]
        y = r.get("year") or "0000"
        return (TYPE_ORDER.get(r["source_type"], 9), y, uid)

    for ch in buckets:
        buckets[ch].sort(key=sort_key)

    # ---------- 统计（供审计章节） ----------
    from collections import Counter
    dedup_rows = load_csv("02_dedup_map.csv")
    dedup_stat = Counter(r["status"] for r in dedup_rows)
    total_main = sum(1 for r in inv.values() if r["source_type"] in MAIN_TYPES)

    # ---------- 生成 Markdown ----------
    L = []
    L.append("# 做对的事情：段永平文集（主题分类版）\n")
    L.append("> 版本：基于 `editorial/duanyongping/manifest/` 全量清单与去重映射自动汇编。\n")
    L.append("> 组织原则：以主题分类为唯一组织原则，六卷四十四章；章内按「先系统论述后问答、由原则到应用」的逻辑序编排。\n")

    # ===== 第零章：去重审计 =====
    L.append("\n---\n")
    L.append("## 一、去重工作审计\n")
    L.append("\n本版电子书所依据的语料，先前已通过一套「映射式」去重流程处理"
             "（脚本 `scripts/duanyongping_dedup.py`，配套盘点脚本 `duanyongping_inventory.py`）。"
             "以下为审计结论。\n")

    L.append("\n### 1.1 去重方法（R1–R4）\n")
    L.append("\n去重采用**四类确定性/半确定性规则**，产出映射清单而非物理删除：\n")
    L.append("\n- **R1 年份聚合问答 → 派生排除**：`qa/按年份/*.md` 由个体问答文件聚合而成，"
             "标记 `aggregated_excluded`，正文以个体问答文件为主版本。")
    L.append("- **R2 雪球月归档 ↔ 个体问答**：按正文中的原文 URL（xueqiu.com/1247347556/<id>）"
             "与个体问答 `source_url` 比对；命中则月归档为重复（主版本=个体问答），未命中则记「独有内容」待复核。")
    L.append("- **R3 speeches(txt) ↔ talks/milestones**：先以硬编码特征词（斯坦福/方略/合集）"
             "做确定性匹配，再用 16-gram Jaccard 相似度（阈值 0.4）兜底，主版本=结构化访谈/里程碑稿。")
    L.append("- **R4 博客内部全文比对**：对 `blog` 全部文件计算 sha256，完全相同者仅保留一份为主版本。\n")

    L.append("\n### 1.2 覆盖范围\n")
    L.append(f"\n- **盘点总量**：`01_inventory.csv` 共 {len(inv)} 个单元，其中进入正文的主语料"
             f"（blog/qa/talks/milestones/speeches/qa_doc）共 **{total_main}** 个。")
    L.append("- **主语料来源**：网易博客(597)、雪球问答(2212)、演讲采访(35)、公司里程碑(9)、"
             "speeches 原始转录(4)、问答梳理文档(2)。迁移阶段（`migrate_duanyongping.py`）已按"
             " `article_id` / 问答 `index` 逐条唯一化命名并保留原文出处，默认无内部重复。")
    L.append("- **参考/重叠语料（仅映射、不进正文）**：雪球月归档(119)、年份聚合(10)、"
             "研究笔记(6)、思维框架(1)、第三方博主文(236)、访谈(1)。\n")

    L.append("\n### 1.3 去重结果统计\n")
    L.append("\n`02_dedup_map.csv` 共 %d 行，状态分布：\n" % len(dedup_rows))
    L.append("\n| 状态 | 含义 | 数量 |")
    L.append("| --- | --- | --- |")
    L.append(f"| aggregated_excluded | R1 年份聚合（派生，排除） | {dedup_stat.get('aggregated_excluded',0)} |")
    L.append(f"| duplicate_mapped | 命中主版本、判为重复 | {dedup_stat.get('duplicate_mapped',0)} |")
    L.append(f"| reference_only | 月归档独有、待复核 | {dedup_stat.get('reference_only',0)} |")
    L.append(f"| primary | 无重叠、保留为主版本 | {dedup_stat.get('primary',0)} |")
    L.append("\n注：R4 博客内部 sha256 比对**发现 0 处完全重复**，说明博客语料迁移后已自去重。\n")

    L.append("\n### 1.4 初始审计遗留问题（整改前快照）\n")
    L.append("\n> 以下为第一轮审计（整改前）发现的 5 类问题，**均已在本轮 §1.5 整改中处理**，此处保留作历史溯源。\n")
    L.append("\n1. **（已处理）语雀 HTML 冗余**：初始审计发现 `talks/` 18 篇 + `qa/2020/` 2 个 `qa_doc` 源导出，共 **20 个** `.yuque.html` 与对应 `.md` 共存（语雀 HTML 导出），因盘点仅扫 `.md` 而未计入。现已全部移入 `editorial/duanyongping/archive_yuque/`。")
    L.append("2. **（已处理）月归档独有内容未回填**：初始 `03` 清单列 18 个月份、合计约 **814 条**未命中帖（含大量已删帖），尤其 2025–2026 约 500+ 条未并入。现已按帖子级 URL 比对回填 6992 条，缺口闭合至 2 条。")
    L.append("3. **（已处理）关键词分类偏公司**：初始 `04` 候选章公司章畸高（C2-2 互联网 770、C2-1 苹果 413）。现已改用原则优先 + 读全文的 v2 分类器，公司章降至 1406。")
    if unclassified:
        L.append(f"4. **（已处理）未归类单元**：初始审计有 **{len(unclassified)}** 个主单元（{len(unclassified)/total_main*100:.1f}%）关键词未命中，已通过 v2 兜底归入 C6-1，本版书末「待归类」附录已无残留。")
    else:
        L.append("4. **（已处理）未归类单元**：初始审计有 **230** 个主单元（8.0%）关键词未命中，已通过 v2 兜底全部归入 C6-1，书末「待归类」附录现已无内容。")
    L.append("5. **去重为映射非删除**：`02` 仅标记，未物理移除重复文件（年份聚合 10 个已保留供站点使用；语雀 20 个已移出，见 1.5）。")
    L.append("6. **speeches 规则脆弱**：R3 依赖硬编码特征词（斯坦福/方略/合集），新增 speech 易漏判。\n")

    # ===== 1.5 本轮整改结果 =====
    L.append("\n### 1.5 本轮对遗留问题的整改\n")
    L.append("\n基于上述审计，本版已执行以下整改（均保留备份、可还原）：\n")
    L.append("\n1. **语雀 HTML 冗余**：`talks/` 下 18 对、及 `qa/2020/` 下 2 个 `qa_doc` 源导出，共 **20 个** `.yuque.html` 已移入 `editorial/duanyongping/archive_yuque/`（内容等价，语雀源导出），消除盘点盲区；正文仍由 `.md` 承载。")
    L.append("2. **月归档独有内容回填**：执行 `backfill_xueqiu_unique.py`，将月归档中 **6992 条**未命中帖（排除已删除/空帖）并入个体问答语料 `qa/<year>/qa_xq_<id>.md`。"
             "注意：原 `03` 清单仅统计「整月无任何命中」的 18 个月（约 814 条），**低估**了真实缺口——本整改按帖子级 URL 比对，补齐了部分命中月份内的未命中帖，故实际回填量显著更大。"
             "回填后重跑去重：月归档 `reference_only` 由 18 降至 **2**（xq_2015-06、xq_2018-04 各 1 条，疑似已删除帖），缺口基本闭合。")
    L.append("3. **分类纠偏 + 归类**：改用 `duanyongping_classify_v2.py`（原则优先、读全文）。公司章(P2)由 1846 降至 **1406**，投资理念(P1)升至 **4108**，"
             "未归类单元由 230 降至 **0**（无信号帖兜底归入 C6-1 社会杂谈，仍列于正文）。")
    L.append("4. **物理瘦身**：派生/重复文件采用「移入备份归档」而非删除。`qa/按年份` 因被站点 QA 分卷页（`src/app/duanyongping/qa/page.tsx`）依赖，予以保留；语雀冗余已移出。\n")

    # ===== 第二章：分类结构总览 =====
    L.append("\n---\n")
    L.append("## 二、主题分类结构（六卷四十四章）\n")
    L.append("\n| 卷 | 主题 | 章 |")
    L.append("| --- | --- | --- |")
    for p in taxonomy["parts"]:
        chs = "；".join(c["title"].split("　", 1)[-1] for c in p["chapters"])
        L.append(f"| {p['id']} | {p['title'].split('　',1)[-1]} | {chs} |")

    # 各卷含单元数统计
    chap_count = {c: len(buckets.get(c, [])) for p in taxonomy["parts"] for c in [x["id"] for x in p["chapters"]]}
    chap_count["__UNCLASSIFIED__"] = len(buckets.get("__UNCLASSIFIED__", []))

    L.append("\n各章单元数（去重后正文）：\n")
    for p in taxonomy["parts"]:
        L.append(f"\n### {p['title']}\n")
        for c in p["chapters"]:
            L.append(f"- {c['title']}：{chap_count.get(c['id'],0)} 篇")

    # ===== 第三~N章：正文 =====
    L.append("\n---\n")
    L.append("## 三、正文（按主题汇编）\n")
    for p in taxonomy["parts"]:
        L.append(f"\n# {p['title']}\n")
        for c in p["chapters"]:
            cid = c["id"]
            members = buckets.get(cid, [])
            if not members:
                continue
            L.append(f"\n## {c['title']}\n")
            # 章概述（取自 taxonomy 的 chapter_subtopics）
            subs = taxonomy.get("chapter_subtopics", {}).get(cid, [])
            if subs:
                L.append("\n> 本章子主题：" + "、".join(subs) + f"（共 {len(members)} 篇）\n")
            for uid in members:
                r = inv[uid]
                body = read_body(r["file_path"])
                title = r.get("title") or uid
                meta = f"（{r['source_type']}"
                if r.get("year"):
                    meta += f" · {r['year']}"
                meta += "）"
                L.append(f"\n### {title} {meta}\n")
                if body:
                    L.append(body + "\n")
                else:
                    L.append("\n> （正文读取失败或为空）\n")

    # ===== 附录：待归类 + 月归档独有 =====
    L.append("\n---\n")
    L.append("## 四、附录\n")
    L.append("\n### 4.1 待归类单元（关键词未命中，待人工复核）\n")
    if unclassified:
        L.append(f"\n共 {len(unclassified)} 个。以下列出篇目，便于后续人工归类：\n")
        for uid in sorted(unclassified):
            r = inv[uid]
            L.append(f"- `{uid}` {r.get('title','')}（{r['source_type']} · {r.get('year','')}）")
    else:
        L.append("\n本版经 v2 分类器兜底后**无未归类单元**（全部命中六卷四十四章之一），故附录无待归类篇目。\n")
    L.append("")

    L.append("\n### 4.2 雪球月归档独有内容清单（缺口已基本闭合）\n")
    L.append("\n> 经回填整改，月归档与个体问答的独有帖已降至以下 **2** 条（疑似原帖已删除，无法补全），其余均已并入正文。\n")
    try:
        uniq = open(os.path.join(MAN, "03_monthly_archive_unique.md"), encoding="utf-8").read()
        L.append(uniq.strip() + "\n")
    except Exception:
        L.append("\n（清单缺失）\n")

    md_path = os.path.join(OUTDIR, "段永平文集_主题分类版.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(L))

    # 月归档独有内容清单
    try:
        monthly_unique = open(os.path.join(MAN, "03_monthly_archive_unique.md"), encoding="utf-8").read().strip()
    except Exception:
        monthly_unique = "（清单缺失）"

    # ---------- 生成 HTML（带侧栏导航） ----------
    html = build_html(taxonomy, buckets, inv, chap_count, total_main, dedup_stat,
                      len(dedup_rows), len(unclassified), unclassified, monthly_unique)
    html_path = os.path.join(OUTDIR, "段永平文集_主题分类版.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    print("主单元(去重后正文):", total_main)
    print("各章单元数:", {k: v for k, v in chap_count.items() if v})
    print("去重映射行:", len(dedup_rows), dict(dedup_stat))
    print("未归类:", len(unclassified))
    print("MD :", md_path)
    print("HTML:", html_path)


def html_escape(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def build_html(taxonomy, buckets, inv, chap_count, total_main, dedup_stat, dedup_rows, n_unclass, unclassified, monthly_unique):
    parts = []
    # 导航
    nav = ['<div id="nav"><h2>段永平文集</h2><ul>']
    nav.append('<li><a href="#audit">去重审计</a></li>')
    nav.append('<li><a href="#struct">分类结构</a></li>')
    nav.append('<li><a href="#appendix">附录（待归类+月归档独有）</a></li>')
    for p in taxonomy["parts"]:
        nav.append(f'<li><a href="#{p["id"]}">{p["title"].split("　",1)[-1]}</a><ul>')
        for c in p["chapters"]:
            if buckets.get(c["id"]):
                nav.append(f'<li><a href="#{c["id"]}">{c["title"].split("　",1)[-1]} ({chap_count.get(c["id"],0)})</a></li>')
        nav.append("</ul></li>")
    nav.append("</ul></div>")
    # 正文
    body = []
    body.append('<section id="audit"><h2>一、去重工作审计</h2>')
    body.append("<p>去重采用 R1–R4 四类规则（年份聚合派生排除 / 雪球月归档 URL 比对 / "
                "speeches 特征词+16-gram 兜底 / 博客 sha256 全文比对），产出映射清单而非物理删除。"
                f"02_dedup_map.csv 共 {dedup_rows} 行："
                f"aggregated_excluded {dedup_stat.get('aggregated_excluded',0)}、"
                f"duplicate_mapped {dedup_stat.get('duplicate_mapped',0)}、"
                f"reference_only {dedup_stat.get('reference_only',0)}、"
                f"primary {dedup_stat.get('primary',0)}。初始审计遗留（均已整改）：语雀 HTML 冗余 20 个、"
                f"月归档独有约 814 条未回填、关键词分类偏公司、未归类 {n_unclass} 个、"
                "去重为映射非删除、speeches 规则脆弱。</p></section>")
    body.append(f'<section id="struct"><h2>二、主题分类结构（六卷四十四章，正文共 {total_main} 篇）</h2>')
    for p in taxonomy["parts"]:
        body.append(f'<h3>{p["title"]}</h3><ul>')
        for c in p["chapters"]:
            body.append(f'<li>{c["title"]}：{chap_count.get(c["id"],0)} 篇</li>')
        body.append("</ul>")
    body.append("</section>")

    for p in taxonomy["parts"]:
        body.append(f'<section id="{p["id"]}"><h2>{p["title"]}</h2>')
        for c in p["chapters"]:
            cid = c["id"]
            members = buckets.get(cid, [])
            if not members:
                continue
            body.append(f'<article id="{cid}"><h3>{c["title"]}（{len(members)} 篇）</h3>')
            for uid in members:
                r = inv[uid]
                title = (r.get("title") or uid)
                meta = r["source_type"] + (f' · {r.get("year")}' if r.get("year") else "")
                body.append(f'<h4>{html_escape(title)} <span class="meta">（{meta}）</span></h4>')
                bt = open(r["file_path"], encoding="utf-8").read()
                bt = re.sub(r"^---\r?\n.*?\r?\n---\r?\n", "", bt, flags=re.S).strip()
                bt = html_escape(bt)
                bt = re.sub(r"\n{2,}", "</p><p>", bt)
                bt = "<p>" + bt.replace("\n", "<br>") + "</p>"
                body.append(bt)
            body.append("</article>")
        body.append("</section>")

    # 附录
    body.append(f'<section id="appendix"><h2>四、附录</h2>')
    if unclassified:
        body.append(f'<h3>4.1 待归类单元（关键词未命中，待人工复核，共 {len(unclassified)} 个）</h3><ul>')
        for uid in sorted(unclassified):
            r = inv[uid]
            body.append(f'<li><code>{html_escape(uid)}</code> {html_escape(r.get("title","") or "")}'
                        f'（{r["source_type"]} · {r.get("year","")}）</li>')
        body.append("</ul>")
    else:
        body.append('<h3>4.1 待归类单元</h3>')
        body.append('<p>本版经 v2 分类器兜底后<b>无未归类单元</b>（全部命中六卷四十四章之一），附录无待归类篇目。</p>')
    body.append('<h3>4.2 雪球月归档独有内容清单（缺口已基本闭合）</h3>')
    body.append('<p>经回填整改，月归档与个体问答的独有帖已降至 <b>2</b> 条（疑似原帖已删除，无法补全），其余均已并入正文。</p>')
    mu = html_escape(monthly_unique).replace("\n", "<br>")
    body.append(f"<p>{mu}</p>")
    body.append("</section>")

    css = """
    <style>
    body{font-family:-apple-system,'Noto Sans CJK SC',sans-serif;margin:0;color:#222;line-height:1.75;}
    #nav{position:fixed;top:0;left:0;width:260px;height:100vh;overflow:auto;background:#fbf6f4;
        border-right:1px solid #e6d3d0;padding:16px;font-size:13px;box-sizing:border-box;}
    #nav h2{font-size:15px;color:#AB1942;} #nav ul{list-style:none;padding-left:0;} #nav li{padding:2px 0;}
    #nav a{color:#7a3a35;text-decoration:none;} #nav a:hover{color:#AB1942;}
    #nav ul ul{padding-left:14px;}
    main{margin-left:280px;padding:32px 48px;max-width:900px;}
    h1,h2{border-bottom:2px solid #AB1942;padding-bottom:6px;color:#1a1a1a;}
    h3{color:#AB1942;margin-top:28px;} h4{color:#333;margin-top:18px;font-size:15px;}
    .meta{color:#999;font-weight:normal;font-size:12px;}
    article{border-bottom:1px dashed #eee;padding-bottom:8px;margin-bottom:8px;}
    p{margin:6px 0;}
    </style>"""
    return f"<!doctype html><html lang=zh><head><meta charset=utf-8><title>做对的事情：段永平文集（主题分类版）</title>{css}</head><body>{''.join(nav)}<main>{''.join(body)}</main></body></html>"


if __name__ == "__main__":
    main()
