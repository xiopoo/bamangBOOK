#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
按《插图任务卡》将两卷精绘插图嵌入正文章节。

规则：
- 每章默认 1 张概念图，插入该章"## 本章小结"小节标题之前。
- 多图章节（BF-CH06 六张 / MG-CH02 三张）按指定小节标题锚点分散插入。
- BF-CH06 的两个既有【插图占位】块整体替换为图片。
- 插图以标准 markdown 图片语法写入正文：![图注](相对路径.svg)
- 构建脚本负责把图片转为 typst figure（图注、居中、宽度适配）。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BF_FILE = ROOT / "editorial/buffett/manuscript/全卷/所有者的眼光_巴菲特卷全卷连续正文.md"
MG_FILE = ROOT / "editorial/munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md"

BF_REL = "editorial/buffett/illustrations/refined"
MG_REL = "editorial/munger/illustrations/refined"


def img_block(caption: str, rel_dir: str, filename: str) -> str:
    """生成 markdown 图片块（独立段落，前后空行）。"""
    return f"\n![{caption}]({rel_dir}/{filename})\n"


# ---------- 巴菲特卷 20 张 ----------
# (文件名, 图注, 锚点)
# 锚点 = "章名"（如"第一章"）：插到该章"## 本章小结"之前。
# 锚点 = "## 小节标题"：插到该小节标题之前（多图章节）。
BF_IMAGES = [
    ("BF-01-01_所有者视角双层图_品牌色精绘.svg",
     "从报价器后退一步，股票的另一端是一家真实的企业——你买到的是长期现金流与所有者权利的一部分。",
     "第一章"),
    ("BF-02-01_内在价值估计漏斗_品牌色精绘.svg",
     "DCF 是共同语言，不是计算器；最终必须落成一个保守的、有边界的区间。",
     "第二章"),
    ("BF-03-01_所有者收益桥图_品牌色精绘.svg",
     "报告收益只是起点；真正属于你的是扣除维持竞争地位所需资本后、能够离开企业而不损害未来的那部分现金。",
     "第三章"),
    ("BF-04-01_安全边际与能力圈重叠_品牌色精绘.svg",
     "真正的低价买入只发生在能力圈内；在圈外谈分散和低估，都可能是伪装的赌博。",
     "第四章"),
    ("BF-05-01_纺织资本投入与机会成本_品牌色精绘.svg",
     "烟蒂的最后一口可能让你付出整家企业的未来；价格折扣无法补偿恶劣的经济特征和无止境的资本需求。",
     "第五章"),
    # ---- CH06 六张：a 组 2 张替换占位符，a3/b1/b2/b3 按小节锚点插入 ----
    ("BF-06-03_资本循环_品牌色精绘.svg",
     "资本循环：定价权保证每磅糖果赚得更多，低资本需求保证利润不被吞回，特许经营权维护保证定价权明天还在。",
     "## 从一家好企业到一个资本配置系统"),
    ("BF-06-01_永久持有偏好与卖出信号_品牌色精绘.svg",
     "永久持有是严格进入后的长期偏好，不是取消复核；真正触发卖出的信号只有四种。",
     "## 喜诗真正改变了什么"),
    ("BF-06-02_年度复核清单_品牌色精绘.svg",
     "年度复核四维：护城河、管理层、估值价格、机会成本——分别落到继续持有、深入研究与减仓三种动作。",
     "## 从喜诗推导企业质量检查表"),
    ("BF-06-03_复核边界周期波动与结构破坏_品牌色精绘.svg",
     "复核的边界：天气波动继续持有甚至加仓，气候破坏才减仓退出——先分清是哪一种，再决定动作。",
     "## 常见误解：好企业可以解决一切"),
    ("BF-07-01_护城河动态剖面_品牌色精绘.svg",
     "护城河不是画在地图上的线，是每天被竞争试图填埋的结构——只有被持续证明存在才算存在。",
     "第七章"),
    ("BF-08-01_经理人判断三角_品牌色精绘.svg",
     "能力越大，方向错的代价越大；伟大企业不依赖超级明星，而是让普通人在对的制度里做出不普通的事。",
     "第八章"),
    ("BF-09-01_分权结构与声誉红线_品牌色精绘.svg",
     "总部把经营决策权放出去，只保留资本配置、选任 CEO 与共同边界——用信任和分权减少摩擦，用红线守住声誉。",
     "第九章"),
    ("BF-10-01_资本配置决策树_品牌色精绘.svg",
     "把钱放在任何一条路上，都必须回答同一个问题——长期能不能提升每股内在价值？",
     "第十章"),
    ("BF-11-01_回购收购双路径_品牌色精绘.svg",
     "回购低于保守价值才增厚每股权益；收购只有六项条件同时成立才值得做——都不是为了动作本身的姿态。",
     "第十一章"),
    ("BF-12-01_浮存金时序图_品牌色精绘.svg",
     "真实成本=承保利润减去承保亏损的净值；规模不是护城河，定价纪律和巨灾承压才是。",
     "第十二章"),
    ("BF-13-01_市场情绪钟摆与买入窗口_品牌色精绘.svg",
     "波动本身不是风险；只有杠杆、被迫出售、独立判断缺席，才会把波动变成永久购买力损失。",
     "第十三章"),
    ("BF-14-01_组合仓位与集中程度_品牌色精绘.svg",
     "现金牺牲长期收益，换来灾难中的生存、信誉与行动选择权；真正的集中只发生在深度理解与显著低估同时成立的地方。",
     "第十四章"),
    ("BF-15-01_伯克希尔资产结构剖面_品牌色精绘.svg",
     "对普通人可复制的是原则与纪律；不可复制的是永久资本、保险结构、规模与交易渠道——复利不是收益率，是系统。",
     "第十五章"),
]

# CH06 既有占位块整体替换（占位符首行 → 图片）
BF_PLACEHOLDERS = [
    ("【插图占位 BF-06-01】",
     ("BF-06-01_两种观察方式_品牌色精绘.svg",
      "2500 万美元价格对 800 万美元净有形资产，是静态的账面比较；客户信任、定价权、低增量资本与可分配现金，才是喜诗真正的经济结构。")),
    ("【插图占位 BF-06-02】",
     ("BF-06-02_通胀资本需求_品牌色精绘.svg",
      "物价翻倍情境下，喜诗需要累计补充 800 万美元维持性资本，平庸企业需要 1800 万美元——利润能否离开企业，取决于资本需求。")),
]

# ---------- 芒格卷 18 张 ----------
MG_IMAGES = [
    ("MG-01-01_单一锤子与多模型视野_品牌色精绘.svg",
     "模型越少，问题越像钉子；模型越多，同一个问题越清晰。",
     "第一章"),
    ("MG-02-01_从孤立知识到格栅_品牌色精绘.svg",
     "模型的价值不只来自数量，而来自它们在事实约束下形成的连接。",
     "## 格栅不是模型收藏"),
    ("MG-02-02_五学科检查_品牌色精绘.svg",
     "这些模型大多是通用知识；芒格的贡献在于选择、连接和反复应用。",
     "## 从哪些学科取模型"),
    ("MG-02-03_格栅更新循环_品牌色精绘.svg",
     "知识格栅依靠现实反馈更新；无法可靠判断的问题可以进入太难篮子。",
     "## 思想演变：格栅不是1994年凭空出现的"),
    ("MG-03-01_学习复利循环_品牌色精绘.svg",
     "循环靠真实反馈驱动；无法可靠判断的问题，可以进入太难篮子。",
     "第三章"),
    ("MG-04-01_概率树与期望值_品牌色精绘.svg",
     "好故事不如好算术：先算期望值，再设极端下行上限。",
     "第四章"),
    ("MG-05-01_逆向求解双向箭头_品牌色精绘.svg",
     "逆向不是不行动：它把失败路径和必要条件摆上桌面。",
     "第五章"),
    ("MG-06-01_双轨检查清单_品牌色精绘.svg",
     "聪明人评估任何重要的事，都同时沿两条轨道进行。",
     "第六章"),
    ("MG-07-01_误判心理学分组框架_品牌色精绘.svg",
     "先看情境和激励，再判断是哪种倾向在起作用。",
     "第七章"),
    ("MG-08-01_激励反馈回路与指标异化_品牌色精绘.svg",
     "设计不易作弊的系统：让正确行为与回报尽量一致。",
     "第八章"),
    ("MG-09-01_群体误判三角_品牌色精绘.svg",
     "不确定性越高、压力越大，三者越容易同时出现——先警惕环境，再责怪个体。",
     "第九章"),
    ("MG-10-01_多因素叠加与反馈环_品牌色精绘.svg",
     "说明因素方向、先后与反馈机制，别用一个标签代替因果。",
     "第十章"),
    ("MG-11-01_商业判断多轨剖面_品牌色精绘.svg",
     "同一家企业穿过会计、竞争、规模与激励四条轨道，汇成商业判断。",
     "第十一章"),
    ("MG-12-01_优质企业少行动复利_品牌色精绘.svg",
     "大钱靠熬过波动、稳坐不动；少行动是结果，不是方法。",
     "第十二章"),
    ("MG-13-01_机会成本与资本配置桶_品牌色精绘.svg",
     "每一个是，都是对别的什么说不。",
     "第十三章"),
    ("MG-14-01_应得信任结构_品牌色精绘.svg",
     "四者缺一，信任就从应得滑向赌运气。",
     "第十四章"),
    ("MG-15-01_人生避错清单与红线地图_品牌色精绘.svg",
     "避错不是保守：它把人生从试错变成有边界的进取。",
     "第十五章"),
    ("MG-16-01_理性责任闭环_品牌色精绘.svg",
     "闭环没有终点：每一次后果都回到事实与修正，继续下一圈。",
     "第十六章"),
]


def replace_placeholder(lines, rel_dir, placeholder, filename, caption, log):
    """把占位符整块（从占位符行到'任务卡'行）替换为图片。"""
    start = None
    for i, line in enumerate(lines):
        if placeholder in line:
            start = i
            break
    if start is None:
        raise LookupError(f"未找到占位块：{placeholder}")
    # 占位块由连续的说明行组成：图题/画面/注意/任务卡，直到空行或下一标题
    end = start
    while end < len(lines):
        nxt = lines[end].strip()
        if end > start and (nxt == "" or nxt.startswith("# ") or nxt.startswith("## ")):
            break
        if end > start and lines[end].startswith("## "):
            break
        end += 1
    block = img_block(caption, rel_dir, filename)
    lines[start:end] = block.splitlines(keepends=True)
    log.append(f"  替换占位块 {placeholder} -> {filename}")


def chapter_summary_index(lines, chapter_name):
    """返回该章范围内 '## 本章小结' 的行号（用于在其前插入）。"""
    start = None
    for i, line in enumerate(lines):
        if line.startswith(f"# {chapter_name} "):
            start = i
            break
    if start is None:
        raise LookupError(f"未找到章节：{chapter_name}")
    for i in range(start, len(lines)):
        if re.match(r"^# 第[一二三四五六七八九十]+章", lines[i]) and i != start:
            break
        if lines[i].startswith("## 本章小结"):
            return i
    raise LookupError(f"章节 {chapter_name} 内未找到 '## 本章小结'")


def insert_at(lines, idx, block, log):
    lines[idx:idx] = block.splitlines(keepends=True)
    log.append(f"  插入于行 {idx + 1}")


def run_bf():
    print("== 巴菲特卷 ==")
    text = BF_FILE.read_text("utf-8")
    lines = text.splitlines(keepends=True)
    log = []
    # 1) 替换两个占位块
    for placeholder, (filename, caption) in BF_PLACEHOLDERS:
        replace_placeholder(lines, BF_REL, placeholder, filename, caption, log)
    # 2) 按锚点插入
    for filename, caption, anchor in BF_IMAGES:
        block = img_block(caption, BF_REL, filename)
        if anchor.startswith("## "):
            idx = None
            for i, line in enumerate(lines):
                if line.startswith(anchor):
                    idx = i
                    break
            if idx is None:
                raise LookupError(f"未找到小节锚点：{anchor}")
            insert_at(lines, idx, block, log)
            log[-1] += f"  [{filename}] <- {anchor}"
        else:
            idx = chapter_summary_index(lines, anchor)
            insert_at(lines, idx, block, log)
            log[-1] += f"  [{filename}] <- {anchor}本章小结前"
    BF_FILE.write_text("".join(lines), "utf-8")
    for entry in log:
        print(entry)


def run_mg():
    print("== 芒格卷 ==")
    text = MG_FILE.read_text("utf-8")
    lines = text.splitlines(keepends=True)
    log = []
    for filename, caption, anchor in MG_IMAGES:
        block = img_block(caption, MG_REL, filename)
        if anchor.startswith("## "):
            idx = None
            for i, line in enumerate(lines):
                if line.startswith(anchor):
                    idx = i
                    break
            if idx is None:
                raise LookupError(f"未找到小节锚点：{anchor}")
            insert_at(lines, idx, block, log)
            log[-1] += f"  [{filename}] <- {anchor}"
        else:
            idx = chapter_summary_index(lines, anchor)
            insert_at(lines, idx, block, log)
            log[-1] += f"  [{filename}] <- {anchor}本章小结前"
    MG_FILE.write_text("".join(lines), "utf-8")
    for entry in log:
        print(entry)


def main():
    run_bf()
    run_mg()
    print("\n完成。请核对插入位置后运行构建脚本。")


if __name__ == "__main__":
    sys.exit(main())
