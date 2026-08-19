#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""段永平文集 · 改进版主题预分类（v2）

相对 duanyongping_classify_prepass.py 的改进：
  1. 读取【全文】而非仅标题+首 400 字，提升召回（消除空候选章）。
  2. 判定优先级改为「原则优先」：投资原则(P1) → 企业经营(P3) → 人生(P4) →
     教育(P5) → 公司行业(P2) → 社会(P6)。公司名仅在无原则/经营信号时才归 P2，
     以此纠正旧版关键词「公司名优先」导致的 P2 畸高。
  3. 标题含「引用-/转载-」且正文无本人点评 → C6-3。

输出：覆盖所有主单元的 04_classification_hints.csv（覆盖 blog/qa/talks/milestones/speeches/qa_doc）。
"""
import csv
import os
import re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_DIR = os.path.join(REPO, "editorial", "duanyongping", "manifest")
INV_CSV = os.path.join(MANIFEST_DIR, "01_inventory.csv")
OUT_CSV = os.path.join(MANIFEST_DIR, "04_classification_hints.csv")

# 按判定优先级排序的规则组： (章id, [关键词])
RULES = [
    # ---- P1 投资理念（原则优先） ----
    ("C1-1", ["买股票就是买公司", "内在价值", "价值投资", "股票就是公司", "价值投资的根本", "好公司"]),
    ("C1-2", ["能力圈", "不懂不做", "看得懂", "看不懂", "不碰", "不懂"]),
    ("C1-3", ["商业模式", "生意模式", "护城河", "好生意", "利润之上", "企业文化与生意", "生意好"]),
    ("C1-4", ["安全边际", "估值", "股价便宜", "买入价格", "价格合理", "贵不贵", "市盈率", "pe", "估值方法", "便宜", "贵了"]),
    ("C1-5", ["集中投资", "重仓", "仓位", "持仓", "集中度", "分散投资", "满仓", "加仓", "减仓", "卖出", "调仓"]),
    ("C1-6", ["市场先生", "市场波动", "股价波动", "短期", "长期", "大盘", "预测", "牛市", "熊市", "涨跌", "泡沫", "股灾", "回调", "抄底", "波动"]),
    ("C1-7", ["风险", "止损", "亏损", "亏钱", "犯错", "错误", "避免损失", "踩雷", "暴雷"]),
    ("C1-8", ["怎么学", "如何学", "学习方法", "读什么书", "经验", "入门", "新手", "学费", "复盘", "向巴菲特学习"]),
    # ---- P3 企业管理与经营 ----
    ("C3-1", ["本分", "企业文化", "诚信", "价值观", "文化"]),
    ("C3-2", ["消费者导向", "用户导向", "产品导向", "以消费者", "用户体验", "产品"]),
    ("C3-3", ["品牌", "营销", "广告", "定价", "价格策略", "租牌子", "logo"]),
    ("C3-4", ["团队", "人才", "员工", "管理", "组织", "招人", "用人", "激励", "培训"]),
    ("C3-5", ["做对的事情", "不为清单", "stop doing", "决策", "战略", "有所不为"]),
    ("C3-6", ["更健康更长久", "长期经营", "基业长青", "百年企业", "永续"]),
    # ---- P4 人生哲学 ----
    ("C4-1", ["平常心", "心态", "心情", "理性", "情绪", "烦恼", "焦虑"]),
    ("C4-2", ["诚信", "道德", "做人", "人品", "诚实", "信用", "吃亏", "守信用"]),
    ("C4-3", ["快乐", "幸福", "财富", "有钱", "金钱", "欲望", "知足"]),
    ("C4-4", ["慈善", "公益", "捐赠", "捐款", "基金会", "慈善事业", "巴菲特午餐"]),
    ("C4-5", ["健康", "运动", "高尔夫", "体检", "身体", "养生", "跑步", "锻炼"]),
    ("C4-6", ["人生", "选择", "成败", "退休", "命运", "生死", "老了", "人生感悟"]),
    # ---- P5 教育 ----
    ("C5-1", ["年轻人", "大学生", "学生", "毕业生", "毕业", "建议", "寄语", "浙大", "大学"]),
    ("C5-2", ["学习", "读书", "阅读", "思考", "思维", "方法", "知识"]),
    ("C5-3", ["孩子", "子女", "小孩", "教育孩子", "家长", "儿子", "女儿"]),
    # ---- P2 公司与行业（最后，仅当无上述信号） ----
    ("C2-1", ["苹果", "ipad", "iphone", "库克", "apple", "苹果表", "macbook", "乔布斯"]),
    ("C2-2", ["腾讯", "拼多多", "网易", "阿里", "淘宝", "京东", "谷歌", "google", "facebook", "推特", "微信", "美团", "抖音", "快手", "字节", "百度", "互联网", "平台", "游戏", "网游", "b站", "小米"]),
    ("C2-3", ["茅台", "白酒", "可口可乐", "可乐", "喜诗", "海天", "伊利", "蒙牛", "食品", "饮料", "五粮液", "啤酒", "乳业"]),
    ("C2-4", ["oppo", "vivo", "步步高", "小天才", "手机", "家电", "电视", "电器", "数码"]),
    ("C2-5", ["银行", "保险", "券商", "平安", "招行", "花旗", "高盛"]),
    ("C2-6", ["特斯拉", "比亚迪", "汽车", "电动车", "蔚来", "理想", "小鹏", "车"]),
    ("C2-7", ["房地产", "万科", "恒大", "地产", "房价", "物业", "碧桂园", "融创"]),
    ("C2-8", ["医药", "制药", "医疗", "疫苗", "恒瑞", "医院"]),
    ("C2-9", ["伯克希尔", "制造业", "能源", "石油", "煤炭", "航空", "航空业", "铁路", "基建"]),
    # ---- P6 社会观察 ----
    ("C6-1", ["社会", "新闻", "时事", "政治", "美国", "中国", "世界", "事件"]),
    ("C6-2", ["经济", "宏观", "政策", "央行", "利率", "通胀", "gdp", "贸易战", "危机"]),
]


def extract_text(inv_row):
    try:
        with open(inv_row["file_path"], encoding="utf-8") as f:
            text = f.read()
        if text.startswith("---"):
            m = re.match(r"^---\r?\n.*?\r?\n---\r?\n", text, re.S)
            if m:
                text = text[m.end():]
        return text
    except Exception:
        return inv_row.get("body_first_line", "")


def classify(text, title):
    t = text.lower()
    # 转载/引用判定
    if (title.startswith("引用") or title.startswith("转载") or "引用-" in title or "转载-" in title):
        # 若正文含本人实质点评则不改判（此处简单归入 C6-3）
        return "C6-3", "标题为引用/转载"
    for ch, kws in RULES:
        for kw in kws:
            if kw in t:
                return ch, f"{ch} 关键词:{kw}"
    return "", "未命中，待人工判定"


def main():
    rows = []
    with open(INV_CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["source_type"] in ("blog", "qa", "talks", "milestones", "speeches", "qa_doc"):
                rows.append(r)
    out = []
    empty = 0
    for r in rows:
        text = extract_text(r)
        ch, why = classify(text, r.get("title", ""))
        if not ch:
            empty += 1
            ch = "C6-1"  # 兜底：无主题信号归社会杂谈，保证 0 遗漏
            why = "v2兜底→C6-1(无主题信号)"
        out.append({
            "unit_id": r["unit_id"],
            "source_type": r["source_type"],
            "title": r["title"],
            "candidate_chapter": ch,
            "reason": why,
        })
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["unit_id", "source_type", "title", "candidate_chapter", "reason"])
        w.writeheader()
        for o in out:
            w.writerow(o)
    from collections import Counter
    c = Counter(o["candidate_chapter"] for o in out)
    print(f"预分类单元: {len(out)}  兜底归 C6-1: {empty}")
    for k, v in sorted(c.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    print(f"输出: {OUT_CSV}")


if __name__ == "__main__":
    main()
