#!/usr/bin/env python3
"""Backfill content_type frontmatter for body markdown files under content/.

Task 3 of .trae/specs/navigation-systematic-restructure/:
- 按「目录 → content_type」映射为缺失 content_type 的正文 md 补打标签
- 已存在 content_type 的文件一律保留原值（交由 Task 4 审核）
- 只改 frontmatter，绝不改动正文与其它字段
- 跳过 munger-originals/（人工逐篇判断）与 companies-studies/（无 md）

用法：
    python3 scripts/backfill-content-type.py            # dry-run，只统计不写文件
    python3 scripts/backfill-content-type.py --apply    # 实际写入
"""
import os
import re
import sys
import json
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
ROOT = os.path.join(PROJECT, "content")

APPLY = "--apply" in sys.argv

# ---------------------------------------------------------------- 配置

# 非正文文件：按文件名排除
NON_CONTENT_NAMES = {
    "_index.md", "index.md", "README.md", "readme.md",
    "CONTENT_SCHEMA.md", "bamang-README.md", "bamang-readme.md",
    "yearly-events.md",
    # 抓取/过程文档（buffettfaq_cnbc 根目录）
    "CAPTURE_AUDIT.md", "QA_DIFF_REPORT.md",
}

# 顶层目录 → content_type（任务映射表）
DIR_MAP = {
    "letters": "letter",
    "partnership": "partnership",
    "qa": "qa",
    "meetings": "qa",            # 目录当前不存在，映射保留以对齐 spec
    "talks": "talk",
    "interviews": "interview",
    "articles": "article",
    "business-history": "article",
    "bloggers": "article",
    "columns": "article",
    "books": "article",
    "buffett-quotes": "article",
    "companies": "company",
    "concepts": "concept",
    "model": "concept",          # 目录当前为 models/，见下
    "models": "concept",
    "buffettfaq": "qa",
    "buffettfaq_cnbc": "qa",     # CNBC 股东大会问答实录 → qa（对应 meetings/ 语义）
    "people": "person",
    "poor-charlies-almanack": "article",  # 《穷查理宝典》章节
}

# 整目录跳过（人工判断 / 无 md）
SKIP_DIRS = {"munger-originals", "companies-studies"}

# ---- munger-archive/ 顶层（Munger Archive 生平与事业分节页 → article）
MUNGER_ARCHIVE_TOP_ARTICLE = {
    "architecture.md", "books.md", "companies.md", "daily-journal.md",
    "family.md", "investing-philosophy.md", "life.md", "philanthropy.md",
}
# 顶层索引/聚合页（站点 HIDDEN_ARCHIVE_INDEX_SLUGS，非正文）→ 跳过并报告
MUNGER_ARCHIVE_TOP_INDEX = {"home.md", "about.md", "mental-models.md", "quotes.md", "recordings.md"}

# ---- munger-archive/recordings/：依据 content/munger-archive-recordings.json 的 type 字段
RECORDING_TYPE_TO_CT = {
    "Interview": "interview",
    "Podcast": "interview",
    "Daily Journal": "qa",       # 每日期刊年会问答专场
    "Berkshire Meeting": "qa",   # 股东大会问答
    "Lecture": "talk",
    "Speech": "talk",
}
# id → 本地文件 slug（对应 src/lib/munger-archive.ts RECORDING_LOCAL_SLUGS）
RECORDING_SLUG_ALIAS = {
    "final-cnbc-interview-2023": "cnbc-final-interview-2023",
    "invest-like-the-best-john-collison-2023": "invest-like-the-best-2023",
    "berkshire-2023": "berkshire-2023-annual-meeting",
    "todd-combs-2022": "singleton-prize-2022",
    "cnbc-investing-2019": "cnbc-2019",
    "yahoo-china-elon-musk-2019": "yahoo-2019-china",
    "life-choices-build-wealth-2019": "yahoo-2019-wealth",
    "munger-unplugged-wsj-2019": "wsj-unplugged-2019",
    "daily-journal-fireside-2017": "daily-journal-2017-fireside",
    "bbc-boom-bust-2009": "bbc-boom-and-bust-2009",
    "stanford-crisis-2009": "stanford-grundfest-2009",
    "caltech-dubridge-2008": "caltech-2008",
    "academic-economics-2003": "ucsb-2003-academic-economics",
    "harvard-law-1998": "harvard-law-1998-multidisciplinary",
    "psychology-human-misjudgment-1995": "psychology-of-human-misjudgment-1995",
    "harvard-school-1986": "harvard-1986-misery",
    "munger-li-lu-china-2018": "munger-li-lu-2018",
}

# ---- duanyongping/：blog → article，qa（含按年份）→ qa
DUAN_SECTION_MAP = {"blog": "article", "qa": "qa"}
# duanyongping/talks/ 缺失标签文件的逐篇判定（已存在的保留原值）
DUAN_TALKS_MAP = {
    "2004_2004-万科财富人生-对话段永平.md": "interview",          # 电视节目对话/采访
    "2006_2006-秦朔专访段永平.md": "interview",                  # 专访
    "2006_2006-网易财经专访段永平-谈和巴菲特共进午餐.md": "interview",  # 专访
    "2006_2006-资本人物-专访段永平.md": "interview",              # 专访
    "2007_2007-波士堂专访段永平-谈价值投资-上市-企业.md": "interview",  # 专访
    "2008_2008-段永平浙大分享.md": "talk",                       # 校内分享
    "2010_2010-网易财经-对话段永平.md": "interview",              # 对话/采访
    "2018_2018-段永平斯坦福交流.md": "talk",                     # 现场交流
    "2018_2018-段永平浙大毕业生典礼演讲.md": "talk",              # 典礼演讲
    "2025_2025-段永平浙大分享.md": "talk",                       # 校内分享
    "2025_2025-王石对话段永平.md": "interview",                  # 对话
    "2025_2025-雪球-方三文对话段永平.md": "interview",           # 对话/采访
    "unknown_2004-左右-段永平北大总裁班演讲-企业的诚信意识.md": "talk",  # 演讲
    # unknown_段永平-演讲采访-目录.md → 目录索引页，见 INDEX_NAME_MARKERS
}
# duanyongping/milestones/ 缺失标签文件的逐篇判定
DUAN_MILESTONES_MAP = {
    "1999_段永平-二十一世纪来了.md": "article",                    # 新年文章
    "2000_2000-段永平给营销人员讲话-销售手册前言.md": "talk",      # 内部讲话
    "2001_步步高企业文化.md": "article",                          # 文章
    "2005_2005-段永平-步步高十周年记念文艺晚会讲话.md": "talk",    # 晚会讲话
    "2005_2005-陈明永-步步高十周年记念文艺晚会讲话.md": "talk",    # 晚会讲话
    "2015_2015-沈炜-步步高-vivo-20周年.md": "talk",               # 周年讲话
    "2020_2020-推测-OPPO-企业文化.md": "article",                 # 推测性整理文章
    "2025_2025-沈炜-步步高-vivo-30周年-坚守本分-基业长青.md": "talk",  # 周年讲话
    # unknown_段永平-公司里程碑-目录.md → 目录索引页，见 INDEX_NAME_MARKERS
}

# 文件名含以下标记 → 目录/索引页（非正文），跳过并报告
INDEX_NAME_MARKERS = ("目录",)

# source-documents/：raw 源文档 → 合理默认
#   value-investing-yxc-gdut/duanyongping/xueqiu-posts → qa（雪球问答帖，站点 qa 同源）
#   references/research → article（研究文档）
SOURCE_DOCS_QA_MARKER = os.path.join("value-investing-yxc-gdut", "duanyongping", "xueqiu-posts")

# ---------------------------------------------------------------- 解析

def read_text(path):
    with open(path, "r", encoding="utf-8", errors="strict") as f:
        return f.read()


def parse_frontmatter(text):
    """返回 (has_fm, frontmatter_block_lines, insert_pos_after_first_newline)。
    has_fm 为 True 表示以 --- 开头且能找到闭合 ---。"""
    if not text.startswith("---"):
        return False, None, None
    idx = text.find("\n")
    if idx == -1:
        return False, None, None
    rest = text[idx + 1:]
    # 找闭合 --- 行
    lines = rest.split("\n")
    end = None
    for i, ln in enumerate(lines):
        if ln.strip() == "---":
            end = i
            break
    if end is None:
        return False, None, None
    block = "\n".join(lines[:end])
    return True, block, idx


def has_content_type(block):
    if not block:
        return False
    return re.search(r"^[ \t]*content_type[ \t]*:", block, re.M) is not None


def backfill_text(text, ct):
    """在 frontmatter 中插入 content_type（或为无 frontmatter 文件补最小 frontmatter）。
    返回新文本；仅改动 frontmatter 区域。"""
    has_fm, _, idx = parse_frontmatter(text)
    if has_fm:
        nl = "\r\n" if idx > 0 and text[idx - 1] == "\r" else "\n"
        return text[:idx + 1] + "content_type: {}{}".format(ct, nl) + text[idx + 1:]
    # 无 frontmatter → 顶部补最小 frontmatter
    return "---\ncontent_type: {}\n---\n\n{}".format(ct, text)


def load_recording_map():
    """recordings/ 文件名 → content_type（依据 recordings.json type）。"""
    out = {}
    try:
        with open(os.path.join(ROOT, "munger-archive-recordings.json"), encoding="utf-8") as f:
            recordings = json.load(f)
    except (OSError, ValueError):
        return out
    for rec in recordings:
        ct = RECORDING_TYPE_TO_CT.get(rec.get("type"))
        if not ct:
            continue
        slug = RECORDING_SLUG_ALIAS.get(rec.get("id"), rec.get("id"))
        out[slug + ".md"] = ct
    return out


# ---------------------------------------------------------------- 主逻辑

def classify(rel, top, fn, has_fm, block):
    """返回 ('skip'|'keep'|'backfill', ct) 或 None（未处理）。"""
    if fn in NON_CONTENT_NAMES:
        return "skip", None
    if top in SKIP_DIRS:
        return "skip", None
    if has_fm and has_content_type(block):
        return "keep", None
    if any(m in fn for m in INDEX_NAME_MARKERS):
        return "skip", None

    # 1) 顶层目录映射
    if top in DIR_MAP:
        return "backfill", DIR_MAP[top]

    # 2) 特殊目录
    if top == "duanyongping":
        parts = rel.split(os.sep)
        if len(parts) >= 3 and parts[1] in DUAN_SECTION_MAP:
            return "backfill", DUAN_SECTION_MAP[parts[1]]
        if len(parts) >= 2 and parts[1] == "talks":
            return ("backfill", DUAN_TALKS_MAP[fn]) if fn in DUAN_TALKS_MAP else (None, None)
        if len(parts) >= 2 and parts[1] == "milestones":
            return ("backfill", DUAN_MILESTONES_MAP[fn]) if fn in DUAN_MILESTONES_MAP else (None, None)
        return None, None

    if top == "munger-archive":
        parts = rel.split(os.sep)
        if len(parts) == 2:  # 顶层
            if fn in MUNGER_ARCHIVE_TOP_INDEX:
                return "skip", None
            if fn in MUNGER_ARCHIVE_TOP_ARTICLE:
                return "backfill", "article"
            return None, None
        if len(parts) >= 3 and parts[1] == "mental-models":
            return "backfill", "concept"
        if len(parts) >= 3 and parts[1] == "quotes":
            return "backfill", "article"
        if len(parts) >= 3 and parts[1] == "recordings":
            ct = RECORDING_MAP.get(fn)
            return ("backfill", ct) if ct else (None, None)
        return None, None

    if top == "source-documents":
        if SOURCE_DOCS_QA_MARKER in rel and "/xueqiu-posts/" in rel:
            return "backfill", "qa"
        if "references/research" in rel:
            return "backfill", "article"
        if fn == "段永平思维框架.md":
            return "backfill", "concept"  # 思维框架/心智模型文档
        return None, None

    return None, None


def main():
    if not APPLY:
        print("[dry-run] 不写文件，仅统计\n")

    stats = defaultdict(Counter)      # top -> {action: count}
    unhandled = []
    changed_files = []
    total_md = 0
    total_backfilled = 0

    for dirpath, dirnames, filenames in os.walk(ROOT):
        # 跳过隐藏目录
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        for fn in sorted(filenames):
            if not fn.endswith(".md"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, ROOT)
            parts = rel.split(os.sep)
            top = parts[0] if len(parts) > 1 else "(root)"
            total_md += 1

            try:
                text = read_text(full)
            except (UnicodeDecodeError, OSError) as e:
                stats[top]["unhandled"] += 1
                unhandled.append(rel + f"  (读取失败: {e})")
                continue
            has_fm, block, _ = parse_frontmatter(text)
            action, ct = classify(rel, top, fn, has_fm, block)

            if action is None:
                stats[top]["unhandled"] += 1
                unhandled.append(rel)
                continue
            stats[top][action] += 1

            if action == "backfill":
                new_text = backfill_text(text, ct)
                if new_text == text:
                    stats[top]["unhandled"] += 1
                    unhandled.append(rel + "  (插入无变化)")
                    continue
                total_backfilled += 1
                changed_files.append(rel)
                if APPLY:
                    with open(full, "w", encoding="utf-8", newline="") as f:
                        f.write(new_text)

    # ------------------------------------------------------------ 输出
    print("=== 统计（按顶层目录）===")
    header = f"{'目录':<22}{'总md':>6}{'非正文/跳过':>10}{'已有标签':>8}{'本次补打':>8}{'未处理':>8}"
    print(header)
    print("-" * len(header))
    grand = Counter()
    for top in sorted(stats):
        c = stats[top]
        row = f"{top + '/':<22}{sum(c.values()):>6}{c['skip']:>10}{c['keep']:>8}{c['backfill']:>8}{c['unhandled']:>8}"
        grand.update(c)
        print(row)
    print("-" * len(header))
    print(f"{'合计':<22}{total_md:>6}{grand['skip']:>10}{grand['keep']:>8}{grand['backfill']:>8}{grand['unhandled']:>8}")
    print()
    print(f"补打总篇数: {total_backfilled}")
    print(f"已有标签保留: {grand['keep']}")
    print(f"非正文/整目录/索引页跳过: {grand['skip']}")
    print(f"未处理: {len(unhandled)}")
    if unhandled:
        print("\n=== 未处理清单 ===")
        for u in unhandled:
            print("  " + u)

    if APPLY and changed_files:
        print(f"\n已写入 {len(changed_files)} 个文件")
    elif not APPLY and changed_files:
        print(f"\n[dry-run] 将写入 {len(changed_files)} 个文件（加 --apply 生效）")

    # 供后续生成报告
    with open(os.path.join(HERE, "backfill_stats.json"), "w", encoding="utf-8") as f:
        json.dump({
            "total_md": total_md,
            "backfilled": total_backfilled,
            "kept": grand["keep"],
            "skipped": grand["skip"],
            "unhandled": unhandled,
            "changed_files": changed_files,
            "stats": {k: dict(v) for k, v in stats.items()},
        }, f, ensure_ascii=False, indent=2)


RECORDING_MAP = load_recording_map()

if __name__ == "__main__":
    main()
