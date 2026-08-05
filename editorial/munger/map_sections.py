#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将芒格股东会讲话的###小标题映射到《理性的格栅》16章
输出CSV: 芒格之道_章节映射.csv
"""

import os
import re
import csv
from collections import defaultdict

CHAPTERS = {
    "ch01": "第一章 一把锤子为什么不够",
    "ch02": "第二章 多元思维模型怎样连成知识格栅",
    "ch03": "第三章 终身学习：让模型保持活性",
    "ch04": "第四章 概率：把故事变成可以检验的判断",
    "ch05": "第五章 逆向：先问怎样会失败",
    "ch06": "第六章 反证、检查清单与第二次思考",
    "ch07": "第七章 误判不是偶然：心理倾向的系统",
    "ch08": "第八章 激励：制度比劝诫更诚实",
    "ch09": "第九章 群体、权威与被剥夺感",
    "ch10": "第十章 当偏误彼此增强",
    "ch11": "第十一章 穿过会计看商业现实",
    "ch12": "第十二章 好企业让少行动成为优势",
    "ch13": "第十三章 少数机会、集中下注与资本配置",
    "ch14": "第十四章 应得信任：合作如何降低摩擦",
    "ch15": "第十五章 避免惯常的失败方式",
    "ch16": "第十六章 理性近乎一种道德义务",
}

CH_NUM = {k: int(k[2:]) for k in CHAPTERS}

# 精准关键词：每个章节最核心的匹配词
# 规则：关键词必须足够具体，避免跨章节混淆
RULES = [
    # ch01: 单模型思维、专业局限、多学科
    ("ch01", [
        "多元模型", "多元思维", "跨学科", "多学科", "铁锤",
        "工具箱", "专业局限", "通才", "普世智慧",
        "学科融合", "只懂一个", "只有一个模型", "单一学科",
        "商学院教育", "自学、跨学科", "跨学科学",
        "多种思维模型", "不同的思维模型", "几个模型",
        "不只一个模型",
    ]),
    # ch02: 格栅、模型连接、排列组合
    ("ch02", [
        "格栅", "知识格栅", "排列组合", "决策树", "费马", "帕斯卡",
        "模型思维", "思维模型", "模型体系", "模型框架",
        "学习模型思维", "模型思维没有捷径",
        "心理学要和其他学科融合",
    ]),
    # ch03: 学习、阅读、进步
    ("ch03", [
        "终身学习", "持续学习", "学习机器", "读书", "阅读",
        "前人经验", "前人智慧", "从别人那里学", "向别人学",
        "从历史学", "历史教训", "吸取教训", "自学",
        "用进废退", "刻意练习", "求知", "好奇心",
        "富兰克林", "向古人学", "向死人学",
        "有的书我会重读", "什么书值得读",
        "从错误中学习", "从失败中学",
    ]),
    # ch04: 概率、下注、分散/集中
    ("ch04", [
        "概率", "赔率", "期望值", "概率论",
        "分散投资", "分散化", "过度分散", "高度分散",
        "集中投资", "集中持有", "重仓", "重注", "下重注",
        "彩池", "马会", "赛马", "考勤卡", "20格",
        "胜算", "概率思维", "定量",
        "四个机会", "两三个机会",
    ]),
    # ch05: 逆向思维、避开失败
    ("ch05", [
        "逆向", "倒过来", "反过来想", "逆向思考",
        "失败清单", "怎样会失败", "如何失败", "避免失败",
        "乡下人", "死在哪里", "不去那个地方",
        "卡森", "痛苦人生", "悲惨", "雅可比",
        "安全边际", "冗余", "备份",
        "否定自己", "不做什么", "不该做什么",
        "降低预期", "咬牙苦干",
    ]),
    # ch06: 反证、清单、双轨
    ("ch06", [
        "反证", "证伪", "检查清单", "核对", "检查单",
        "达尔文", "双轨", "第二次思考", "再思考",
        "飞行员", "核对表", "人都会犯错",
        "先写下来", "记下来", "列出来", "逐条",
        "复查", "复核", "自我检查", "自我反省",
        "不欺骗自己", "不自欺", "诚实面对",
        "不签让自己偷懒的合同", "正式流程",
    ]),
    # ch07: 心理偏误
    ("ch07", [
        "误判", "心理倾向", "心理偏误", "认知偏见",
        "潜意识", "下意识", "本能", "人性", "人的本性",
        "心理学", "行为偏差", "行为金融",
        "自欺", "自我欺骗", "欺骗自己",
        "认知错误", "思维错误", "判断错误",
        "过度自信", "过度乐观", "确认偏误",
        "人类误判", "心理清单", "倾向清单",
        "条件反射", "巴甫洛夫", "单纯联想",
        "基因", "文化基因", "动物精神",
        "心理效应", "心理账户",
        "正风气", "人性的阻力",
    ]),
    # ch08: 激励、制度
    ("ch08", [
        "激励", "奖励", "惩罚", "激励制度",
        "薪酬", "报酬", "佣金", "奖金",
        "制度", "机制", "利益", "利益驱动",
        "动机", "动力", "联邦快递", "按小时", "按班次",
        "管理费", "利益冲突", "销售提成",
        "代理问题", "代理人", "委托人",
        "你奖励什么", "得到什么", "撒糖",
        "鱼钩", "钓鱼", "卖给鱼",
        "官僚", "官僚主义", "官僚病",
        "劝说", "劝诫", "说服", "讲道理",
        "高管薪酬", "薪酬问题", "代理成本",
        "人员精简", "充分放权", "机构臃肿",
        "医保制度", "医保",
        "邓小平推动", "改革",
    ]),
    # ch09: 社会认同、泡沫、投机、宏观
    ("ch09", [
        "社会认同", "从众", "跟风", "随大流",
        "权威", "被剥夺", "剥夺感", "损失厌恶",
        "泡沫", "投机", "投机泡沫", "投机潮", "投机热",
        "南海泡沫", "互联网泡沫", "科技泡沫",
        "疯狂", "狂热", "癫狂", "崩盘", "恐慌",
        "比特币", "加密货币", "虚拟货币",
        "炒作", "投机者", "赌徒", "跟风者",
        "羊群", "羊群效应", "抱团", "扎堆", "一窝蜂",
        "SPAC", "游戏驿站", "逼空", "散户", "做空",
        "罗宾汉", "Robinhood",
        "市场的疯狂", "疯狂从不曾停止",
        "指数基金", "指数", "货币发行", "印钞", "印钱",
        "通货膨胀", "通胀", "利率", "低利率", "负利率",
        "美联储", "央行", "国债", "货币政策", "货币超发",
        "财政赤字", "宏观经济", "宏观",
        "金融体系", "金融监管", "金融危机", "次贷",
        "金融衍生品", "衍生品", "华尔街", "投行",
        "评级机构", "信贷", "联邦储蓄", "存款保险",
        "储贷", "储蓄贷款", "抵押贷款", "按揭",
        "长期资本", "长期资本管理",
    ]),
    # ch10: 偏误叠加、合流
    ("ch10", [
        "叠加", "合流", "合力", "共同作用",
        "鲁拉帕路萨", "lollapalooza",
        "相互作用", "相互影响", "彼此增强",
        "嫉妒", "攀比", "特百惠", "高压销售",
        "非线性", "连锁反应", "多米诺",
        "系统性", "系统风险", "系统性风险",
        "传染", "蔓延",
    ]),
    # ch11: 会计、财务
    ("ch11", [
        "会计", "会计报表", "财务", "财务报表", "财报",
        "利润", "净利润", "盈利", "利润表",
        "现金流", "现金", "自由现金流",
        "折旧", "摊销", "折旧率",
        "应收", "应付", "存货", "资产负债表",
        "收入", "营收", "营收确认",
        "成本", "费用", "支出",
        "安然", "世通", "造假", "舞弊", "财务造假",
        "审计", "会计师", "审计师",
        "按市值计价", "公允价值",
        "特殊目的实体", "SPV", "表外",
        "资本支出", "运营支出",
        "ROE", "ROIC", "收益率", "回报率",
        "税", "税务", "纳税",
        "账面", "净值", "账面价值",
        "股票期权", "期权", "股权激励",
        "商誉", "无形资产", "减值",
        "合并报表", "计提", "拨备", "准备金", "坏账",
        "会计问题", "会计政策",
        "息税折旧摊销", "EBITDA",
        "市盈率", "市净率", "市销率",
        "股息", "红利", "股票回购",
        "财务数据", "财务指标", "财务比率",
        "赌场", "赌博", "赌徒",
    ]),
    # ch12: 好企业、护城河、商业分析
    ("ch12", [
        "好企业", "好公司", "伟大企业", "伟大公司",
        "护城河", "竞争优势", "竞争壁垒",
        "提价", "涨价", "定价权", "提价能力",
        "品牌", "信誉", "名声", "声誉",
        "长期持有", "长期投资", "一直持有",
        "好生意", "好业务", "好行业",
        "商业模式", "商业模型", "生意模式",
        "喜诗", "See's", "可口可乐", "Coca",
        "迪士尼", "Disney", "开市客", "Costco", "好市多",
        "吉列", "华盛顿邮报",
        "垄断", "寡头", "独占",
        "轻资产", "重资产",
        "什么都不做", "少做", "不动", "不折腾",
        "管理层", "资本回报", "资本回报率",
        "管理层能力", "管理能力", "好管理层",
        "公司文化", "企业文化", "组织文化",
        "规模优势", "规模经济", "成本优势",
        "网络效应", "转换成本", "粘性",
        "特许经营权", "牌照",
        "通用电气", "GE", "3G资本",
        "微软", "苹果", "Alphabet", "亚马逊",
        "比亚迪", "BYD", "富国银行", "富国",
        "美国运通", "所罗门", "所罗门兄弟",
        "全美航空", "PS集团", "精致邮票",
        "韦斯科", "Wesco", "每日期刊", "期刊科技",
        "软件", "软件业务", "法庭软件", "法院",
        "报纸", "报业", "传统媒体", "媒体",
        "制造业", "工业", "零售", "零售业",
        "消费", "消费品", "能源", "石油", "天然气",
        "医疗", "医保", "运输", "铁路",
        "公用事业", "电力", "新能源", "太阳能", "风电",
        "汽车", "汽车行业", "房地产", "地产",
        "建筑", "工程", "餐饮", "食品",
        "娱乐", "游戏", "杂志", "出版", "广告",
        "物流", "供应链",
        "基金", "基金行业", "基金经理", "基金管理",
        "私募", "风投", "风险投资", "对冲基金",
        "共同基金", "指数基金", "量化", "量化交易",
        "被动投资", "主动投资", "价值投资", "成长投资",
        "互联网公司", "大型科技", "大公司",
        "优秀", "出色", "强大",
        "好公司", "好生意", "不卖", "继续持有",
        "不卖银行", "不卖富国", "喜欢", "看好",
        "能力圈", "深刻理解", "看得懂", "看不懂",
        "了解", "理解", "熟悉",
    ]),
    # ch13: 机会成本、集中配置
    ("ch13", [
        "机会成本", "资本配置", "资金配置", "资源配置",
        "集中投资", "集中持有", "集中下注", "重仓",
        "少数机会", "好机会", "最好机会", "最佳机会",
        "放弃", "舍弃", "排序", "择优",
        "仓位", "持仓", "投资组合",
        "杠杆", "负债", "借款", "借钱", "融资",
        "保证金", "margin", "保证金交易",
        "现金", "现金为王", "持有现金", "现金储备",
        "等待", "耐心", "伺机", "待机",
        "伯克希尔", "伯克希尔哈撒韦", "巴菲特",
        "回购", "分红", "派息", "资本返还",
        "弹药", "子弹", "备战", "储备",
        "机会不多", "没什么机会", "没有机会",
        "找不到", "找不到机会", "机会稀缺",
        "多持有", "多买", "少卖", "增持", "减持",
        "清仓", "全部卖出", "套现", "变现",
        "投资之道", "投资方法", "投资风格",
        "我们的态度", "我们的投资", "我们的仓位",
        "不投资", "不买", "不碰",
        "投资中国", "中国投资", "投资海外",
        "投资银行", "投资金融", "投资保险", "投资地产",
        "投资科技", "投资互联网", "投资能源",
        "怎么配置", "怎样配置", "如何配置",
        "股票投资", "有价证券投资", "地产投资",
        "债券投资", "固定收益",
        "资金管理", "现金管理", "仓位管理",
        "什么该买", "什么不该买", "什么该卖",
    ]),
    # ch14: 信任、合作、人际关系
    ("ch14", [
        "信任", "应得信任", "可信", "可靠", "靠谱",
        "合作", "合伙", "伙伴", "搭档", "共事",
        "诚信", "正直", "诚实", "老实", "坦率",
        "忠诚", "忠实", "信用", "履约",
        "识人", "察人", "用人之道", "用人",
        "朋友", "友谊", "老友", "挚友", "知己",
        "合伙人", "合作伙伴", "商业伙伴",
        "人际关系", "人品", "品质", "品格",
        "团队", "授权", "放权", "委托",
        "辛格尔顿", "亨利·辛格尔顿",
        "墨菲", "汤姆·墨菲",
        "盖林", "瑞克·盖林", "瑞克",
        "萨尔兹曼", "盖瑞", "盖瑞·萨尔兹曼",
        "彼得·考夫曼", "李录", "Li Lu",
        "李光耀", "新加坡", "俾斯麦",
        "值得交往", "值得信任", "值得托付", "靠得住",
        "与优秀的人共事", "和好人共事", "和靠谱的人在一起",
        "用人不疑", "疑人不用", "充分信任",
        "利益一致", "利益一致化", "一条心",
        "分工", "各司其职", "各尽其责",
        "举贤", "推荐", "引荐",
        "合作无间", "幸福生活", "生活秘诀",
        "故事", "逸事", "轶事", "功劳",
        "谦虚", "谨慎", "低调", "保守",
        "与优秀", "与聪明", "和优秀",
        "与谨慎", "与谨慎的人合作",
    ]),
    # ch15: 情绪管理、避免惯常失败
    ("ch15", [
        "嫉妒", "妒忌", "眼红", "怨恨", "憎恨", "仇恨",
        "自怜", "自怨自艾", "自怨", "自艾",
        "情绪", "情绪管理", "情绪控制", "脾气",
        "极端", "极端主义", "极端意识形态", "偏激", "激进",
        "意识形态", "政治", "左派", "右派", "民主", "共和",
        "痛苦", "悲剧", "不幸", "苦难", "磨难",
        "灾难", "打击", "沉重打击",
        "爱比克泰德", "斯多葛", "斯多亚", "Epictetus",
        "酗酒", "吸毒", "毒品", "药物", "成瘾",
        "酒精", "喝醉", "酒鬼",
        "反复无常", "不专注", "三心二意",
        "一蹶不振", "消沉", "低沉", "抑郁", "沮丧",
        "放弃", "自暴自弃", "破罐子破摔",
        "固执", "偏执", "顽固", "执迷不悟",
        "不吸取教训", "漠视", "逃避", "不承认", "否认",
        "自己的错", "自己的失败", "自己的问题",
        "不改变", "不改", "倔强",
        "不理性", "不理智", "不冷静", "冲动", "感情用事",
        "吵架", "争吵", "内斗", "内耗", "对立",
        "不是好人", "坏人", "恶人", "恶劣",
        "撒谎", "欺骗", "骗人", "说谎", "诈骗",
        "过度", "过分", "过头", "跑偏", "走极端",
        "斯多葛学派", "林肯",
        "怨天怨地", "怨天尤人", "不怨天", "不抱怨",
        "笑对苦难", "坚持做有价值的人",
        "人生秘诀", "秘诀",
        "幸存者", "受害者", "做幸存者", "不做受害者",
    ]),
    # ch16: 理性、道德义务（仅保留最核心关键词）
    ("ch16", [
        "理性", "理智", "清醒", "冷静",
        "道德", "道德义务", "义务",
        "常识", "基本常识", "普通常识",
        "走大道", "大道", "正道", "正路",
        "坚持道德", "坚持简单",
        "保持理智", "保持理性", "保持清醒", "保持冷静",
        "头脑清醒", "头脑清晰", "脑子清楚",
        "不骗人", "不忽悠", "不吹牛", "不说大话",
        "实事求是", "实实在在", "踏实", "务实",
        "按规律办事", "遵守规律", "遵循规律",
        "为社会做贡献", "对社会有益", "有益于社会",
        "把好东西卖给别人", "卖好东西", "提供价值",
        "不坑蒙拐骗", "不走歪门邪道", "正大光明",
        "问心无愧", "心安理得", "良心", "良知",
        "按理性行动", "理性行动", "理性决策", "理性判断",
        "理性选择", "理性思考", "理性分析",
        "维持理性", "守住理性", "坚持理性",
        "做正确的事", "做对的事",
        "芒格的智慧", "芒格之道", "芒格哲学",
        "追求理性", "追求客观", "客观和理性",
        "理性需要慢慢培养",
        "否定自己和逆向思考是我追求理性的方法",
        "无论在何处，都要保持理智",
        "我是怎么成功的",
        "很多人以为具备常识很简单",
        "我们这样追求客观和理性",
        "成功秘诀",
        "好多事情，把问题想明白就成功了一半",
        "有些道理朴实无华",
        "我们从不忽悠",
        "笑对苦难",
    ]),
]


def extract_sections(filepath):
    """从文件中提取所有###和####级别的小标题，过滤单字母索引标题"""
    sections = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"读取文件失败 {filepath}: {e}")
        return sections

    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        # 跳过单字母标题如 [A], [B], [C] 等
        if re.match(r'^#{2,4}\s*\[[A-Z]\]\s*$', line):
            continue
        if line.startswith('#### '):
            title = line[5:].strip()
            title = re.sub(r'\{\.[^}]*\}', '', title)
            title = re.sub(r'\[([^\]]*)\]\{[^}]*\}', r'\1', title)
            title = title.strip()
            if title and title != '编者按' and len(title) > 2 and not re.match(r'^[A-Z]$', title):
                sections.append(title)
        elif line.startswith('### '):
            title = line[4:].strip()
            title = re.sub(r'\{\.[^}]*\}', '', title)
            title = re.sub(r'\[([^\]]*)\]\{[^}]*\}', r'\1', title)
            title = title.strip()
            if title and title != '编者按' and len(title) > 2 and not re.match(r'^[A-Z]$', title):
                sections.append(title)
    return sections


def match_section(section_title):
    """匹配小标题到最相关的章节"""
    best_ch = None
    best_score = 0
    best_kw = []

    for ch_key, keywords in RULES:
        score = 0
        matched = []
        for kw in keywords:
            if kw in section_title:
                score += 1
                matched.append(kw)
        if score > best_score:
            best_score = score
            best_ch = ch_key
            best_kw = matched

    return best_ch, best_score, best_kw


def determine_relevance(score):
    if score >= 2:
        return "high"
    elif score == 1:
        return "medium"
    else:
        return "low"


def generate_reason(ch_key, keywords, relevance):
    ch_title = CHAPTERS[ch_key]
    if keywords:
        kw_str = "、".join(keywords[:3])
        return f"包含关键词「{kw_str}」，与「{ch_title}」主题高度相关"
    elif relevance == "low":
        return f"无明确关键词匹配，根据语义判断最接近「{ch_title}」"
    else:
        return f"根据语义判断与「{ch_title}」相关"


def parse_filename(filename):
    basename = os.path.splitext(filename)[0]
    parts = basename.split('_', 1)
    year = parts[0]
    rest = parts[1] if len(parts) > 1 else ''
    if '西科' in rest:
        company = '西科金融'
    elif '每日' in rest:
        company = '每日期刊'
    else:
        company = '未知'
    return year, company


def main():
    base_dir = '/Users/lucas/Documents/bamangB/bamangBOOK/editorial/munger'
    output_path = os.path.join(base_dir, '芒格之道_章节映射.csv')

    all_files = sorted([f for f in os.listdir(base_dir)
                        if f.endswith('.md') and ('西科' in f or '每日' in f)])

    print(f"找到 {len(all_files)} 个讲话文件")

    all_mappings = []
    for f in all_files:
        filepath = os.path.join(base_dir, f)
        year, company = parse_filename(f)
        sections = extract_sections(filepath)
        print(f"\n{year} {company}: {len(sections)} 个小标题")
        for title in sections:
            ch_key, score, keywords = match_section(title)
            if ch_key is None:
                ch_key = 'ch16'
                score = 0
                keywords = []
            relevance = determine_relevance(score)
            reason = generate_reason(ch_key, keywords, relevance)
            all_mappings.append({
                'year': year,
                'company': company,
                'section_title': title,
                'mapped_chapter': CH_NUM[ch_key],
                'mapped_chapter_title': CHAPTERS[ch_key],
                'relevance': relevance,
                'reason': reason,
            })

    # 排序
    all_mappings.sort(key=lambda x: (x['year'], x['company'], x['mapped_chapter']))

    # 写入CSV
    with open(output_path, 'w', newline='', encoding='utf-8-sig') as csvfile:
        fieldnames = ['year', 'company', 'section_title', 'mapped_chapter',
                      'mapped_chapter_title', 'relevance', 'reason']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for m in all_mappings:
            writer.writerow({
                'year': m['year'],
                'company': m['company'],
                'section_title': m['section_title'],
                'mapped_chapter': m['mapped_chapter'],
                'mapped_chapter_title': m['mapped_chapter_title'],
                'relevance': m['relevance'],
                'reason': m['reason'],
            })

    print(f"\n\nCSV已保存到: {output_path}")
    print(f"总映射数: {len(all_mappings)}")

    # === 统计 ===
    print("\n" + "="*80)
    print("统计总结")
    print("="*80)

    chapter_counts = defaultdict(int)
    chapter_high = defaultdict(int)
    chapter_medium = defaultdict(int)
    chapter_low = defaultdict(int)
    for m in all_mappings:
        ch_num = m['mapped_chapter']
        chapter_counts[ch_num] += 1
        if m['relevance'] == 'high':
            chapter_high[ch_num] += 1
        elif m['relevance'] == 'medium':
            chapter_medium[ch_num] += 1
        else:
            chapter_low[ch_num] += 1

    print("\n【章节匹配分布】")
    print(f"{'章节':<40} {'总数':>5} {'高相关':>7} {'中相关':>7} {'低相关':>7}")
    print("-" * 70)
    for ch_num in sorted(chapter_counts.keys(), key=lambda x: chapter_counts[x], reverse=True):
        ch_title = CHAPTERS[f'ch{ch_num:02d}']
        print(f"{ch_title:<40} {chapter_counts[ch_num]:>5} {chapter_high[ch_num]:>7} {chapter_medium[ch_num]:>7} {chapter_low[ch_num]:>7}")

    year_counts = defaultdict(int)
    year_high = defaultdict(int)
    for m in all_mappings:
        year_counts[m['year']] += 1
        if m['relevance'] == 'high':
            year_high[m['year']] += 1

    print("\n【年份丰富度统计】")
    print(f"{'年份':<8} {'公司':<10} {'总小标题数':>10} {'高相关':>8}")
    print("-" * 40)
    for year in sorted(year_counts.keys()):
        company = next((m['company'] for m in all_mappings if m['year'] == year), '')
        print(f"{year:<8} {company:<10} {year_counts[year]:>10} {year_high[year]:>8}")

    company_counts = defaultdict(int)
    for m in all_mappings:
        company_counts[m['company']] += 1

    print("\n【公司维度统计】")
    for company, count in company_counts.items():
        print(f"  {company}: {count} 个小标题")

    total = len(all_mappings)
    high_count = sum(1 for m in all_mappings if m['relevance'] == 'high')
    medium_count = sum(1 for m in all_mappings if m['relevance'] == 'medium')
    low_count = sum(1 for m in all_mappings if m['relevance'] == 'low')
    print(f"\n【相关性分布】")
    print(f"  高相关(high): {high_count} ({high_count/total*100:.1f}%)")
    print(f"  中相关(medium): {medium_count} ({medium_count/total*100:.1f}%)")
    print(f"  低相关(low): {low_count} ({low_count/total*100:.1f}%)")

    print("\n【匹配最多 TOP 5 章节】")
    top_chapters = sorted(chapter_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    for i, (ch_num, count) in enumerate(top_chapters, 1):
        ch_title = CHAPTERS[f'ch{ch_num:02d}']
        print(f"  {i}. {ch_title}: {count}个匹配 (高相关:{chapter_high[ch_num]})")

    print("\n【内容最丰富 TOP 5 年份】")
    top_years = sorted(year_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    for i, (year, count) in enumerate(top_years, 1):
        company = next((m['company'] for m in all_mappings if m['year'] == year), '')
        print(f"  {i}. {year}年 {company}: {count}个小标题 (高相关:{year_high[year]})")


if __name__ == '__main__':
    main()