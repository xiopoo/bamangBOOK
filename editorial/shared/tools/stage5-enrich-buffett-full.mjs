import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manuscript = path.join(root, "editorial/buffett/manuscript");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function section(file, startHeading, endHeading) {
  const text = read(file);
  const start = text.indexOf(startHeading);
  const end = endHeading ? text.indexOf(endHeading, start + startHeading.length) : text.length;
  if (start < 0 || end < 0) throw new Error(`Cannot extract ${file}: ${startHeading} -> ${endHeading}`);
  return text.slice(start, end).trim();
}

function before(file, heading) {
  const text = read(file);
  const end = text.indexOf(heading);
  if (end < 0) throw new Error(`Cannot extract ${file} before ${heading}`);
  return text.slice(0, end).trim();
}

function quote(text) {
  return text.split("\n").map((line) => line ? `> ${line}` : ">").join("\n");
}

function enrich(relative, title, identity, evidence, bridge) {
  const file = path.join(manuscript, relative);
  const text = fs.readFileSync(file, "utf8");
  const marker = "## 本章小结";
  const at = text.indexOf(marker);
  if (at < 0) throw new Error(`Missing summary in ${relative}`);
  const block = `## 档案证据：${title}

> 内容身份：${identity}。以下保留一个连续证据窗口，用于核对本章案例和边界；正式论证仍由前文编辑叙述承担。

${quote(evidence)}

${bridge}

`;
  fs.writeFileSync(file, `${text.slice(0, at)}${block}${text.slice(at)}`);
}

enrich(
  "第二篇_好企业如何创造价值/第四章_安全边际与能力圈.md",
  "1965年合伙规则与集中条件",
  "巴菲特合伙人信中文翻译",
  read("content/partnership/partnership_1965-11月-巴菲特致合伙人信.md").replace(/^# .+\n+/u, "").trim(),
  "这封信把安全边际、分散、利益一致和特殊集中放在同一套规则里。正文没有把40%上限抽成仓位建议；证据窗口的作用正是保留限制条件。",
);

enrich(
  "第二篇_好企业如何创造价值/第五章_伯克希尔纺织_便宜为何仍会昂贵.md",
  "1985年关闭纺织业务的完整复盘",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_1985-巴菲特致股东信.md", "## 关闭纺织业务", "## 三家非常优秀的企业"),
  "档案同时保留员工责任、管理努力和行业算术，防止把关闭写成一个容易的数字决定。完整股东信仍保留于资料典藏层。",
);

enrich(
  "第二篇_好企业如何创造价值/第七章_护城河必须经得住时间.md",
  "出色、良好与糟糕企业的资本需求对照",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_2007-巴菲特致股东信.md", "## 企业：出色的、良好的、糟糕的", "## 保险业务"),
  "这段证据把护城河、增量资本和通胀放进同一比较，不把“轻资产”单独当作企业质量结论。",
);

enrich(
  "第三篇_人与制度/第八章_选择经理人_能力精力与正直.md",
  "七家企业与经理人判断",
  "巴菲特股东信中文翻译",
  before("content/letters/berkshire_1987-巴菲特致股东信.md", "## 报告收益的来源"),
  "原段先用投入资本检验经营结果，再评价经理人的品质。顺序说明赞扬并非脱离数字的个人好感。",
);

const ch9Evidence = `${section("content/letters/berkshire_2022-巴菲特致股东信.md", "## 我们做什么", "## 秘密武器")}

---

${read("content/articles/buffett/巴菲特：给全体经理人备忘录_2006.md").replace(/^# .+\n+/u, "").trim()}`;
enrich(
  "第三篇_人与制度/第九章_信任声誉与去中心化.md",
  "权责结构与声誉红线",
  "前半为巴菲特股东信中文翻译，后半为巴菲特内部备忘录中文翻译",
  ch9Evidence,
  "两份材料分别回答“权力怎样分配”和“共同边界怎样维持”，没有把信任误写成无规则管理。",
);

enrich(
  "第四篇_资本配置/第十章_经理人的第二项工作.md",
  "少数持股、留存收益与资本去向",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_1978-巴菲特致股东信.md", "## 保险投资业务", "## 银行业务"),
  "证据窗口保留了报告收益与经济归属的区别，也保留“低回报时应分配或回购”的反向条件。",
);

enrich(
  "第四篇_资本配置/第十一章_回购收购与价格纪律.md",
  "2005年收购标准与交易边界",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_2005-巴菲特致股东信.md", "## 并购", "## 保险业务"),
  "收购广告、价格要求和管理条件作为一个整体保留，避免只提取“永久持有”而遗漏严格进入标准。",
);

enrich(
  "第四篇_资本配置/第十二章_浮存金_资本优势不是免费午餐.md",
  "2019年浮存金与承保成本",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_2019-巴菲特致股东信.md", "## 财产意外险业务", "## 伯克希尔·哈撒韦能源"),
  "这段材料同时呈现浮存金规模、承保结果和风险条件，支持正文把资金规模与资金质量分开。",
);

enrich(
  "第五篇_风险时间与复利/第十三章_风险不是一条波动曲线.md",
  "投资者的基本选择与购买力风险",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_2011-巴菲特致股东信.md", "## 投资者的基本选择与我们的强烈偏好", "## 年度股东大会"),
  "完整分类保留现金、非生产资产和生产性资产各自边界；正文没有把生产性资产偏好改写成对所有股票的无条件推荐。",
);

const ch14Evidence = `${section("content/letters/berkshire_2021-巴菲特致股东信.md", "## 美国国库券", "## 股票回购")}

---

${section("content/letters/berkshire_2008-巴菲特致股东信.md", "## 投资业务", "## 衍生品")}`;
enrich(
  "第五篇_风险时间与复利/第十四章_现金与恐慌中的选择权.md",
  "现金承诺与危机中的投资条件",
  "巴菲特股东信中文翻译，分别来自2021年和2008年",
  ch14Evidence,
  "两段材料把最低流动性和危机机会放在同一章：现金先承担承诺，其余部分才拥有选择权。",
);

const ch15Evidence = `${section("content/letters/berkshire_2022-巴菲特致股东信.md", "## 秘密武器", "## 过去一年简述")}

---

${section("content/letters/berkshire_2022-巴菲特致股东信.md", "## 58年——和几个数字", "## 关于联邦税收的一些惊人事实")}`;
enrich(
  "第五篇_风险时间与复利/第十五章_把个人判断变成可传承的复利制度.md",
  "所有权形式、秘密武器与58年复盘",
  "巴菲特股东信中文翻译",
  ch15Evidence,
  "证据窗口把少数赢家、错误控制、股东储蓄和美国环境同时保留，避免把长期结果归因于单一投资技巧。",
);

enrich(
  "第二篇_好企业如何创造价值/第七章_护城河必须经得住时间.md",
  "GEICO低成本护城河的长期结果",
  "巴菲特股东信中文翻译",
  section(
    "content/letters/berkshire_2016-巴菲特致股东信.md",
    "GEICO的低成本创造了一条护城河",
    "2016年下半年",
  ),
  "这一证据窗口只承接低成本、客户价格和份额增长的因果链；浮存金与巨灾风险留给第十二章。",
);

enrich(
  "第三篇_人与制度/第八章_选择经理人_能力精力与正直.md",
  "B夫人与经营能力的现场",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_1987-巴菲特致股东信.md", "## 内布拉斯加家具店", "## 布法罗新闻报"),
  "人物故事服务于经营能力、客户信誉和自主权，不把个人传奇当作可复制的经理人公式。",
);

enrich(
  "第三篇_人与制度/第九章_信任声誉与去中心化.md",
  "小总部、积极审计与信任边界",
  "巴菲特与芒格五十年回顾文章中文翻译；以下窗口出自芒格独立评论部分",
  section(
    "content/articles/buffett/伯克希尔_50_周年：过去、现在和未来.md",
    "目前伯克希尔存在的非同寻常的权力下放",
    "我们的董事还认为",
  ),
  "这段评论明确归于芒格，不写成巴菲特原话；其功能是补足分权外形背后的审计与接班条件。",
);

enrich(
  "第四篇_资本配置/第十章_经理人的第二项工作.md",
  "1986年的资本配置难题与不行动",
  "巴菲特股东信中文翻译",
  section(
    "content/letters/berkshire_1986-巴菲特致股东信.md",
    "查理跟我的第二项工作是资本配置",
    "有一点再怎么强调也不为过",
  ),
  "窗口保留了偿债、持有现金和等待机会这些看似消极的配置选择，防止把资本配置等同于不断成交。",
);

enrich(
  "第四篇_资本配置/第十一章_回购收购与价格纪律.md",
  "账面价值、内在价值与回购门槛",
  "巴菲特股东信中文翻译",
  section(
    "content/letters/berkshire_2015-巴菲特致股东信.md",
    "在前半段时期，伯克希尔的账面价值",
    "## 伯克希尔这一年",
  ),
  "这段材料说明回购门槛来自当时对价值与账面关系的判断，不应把历史倍数永久化。",
);

enrich(
  "第四篇_资本配置/第十二章_浮存金_资本优势不是免费午餐.md",
  "无法获得合适保费时必须拒绝业务",
  "巴菲特股东信中文翻译",
  section(
    "content/letters/berkshire_2014-巴菲特致股东信.md",
    "从根本上说，一个稳健的保险公司需要遵守四条纪律",
    "如今的通用再保险是一颗宝石。",
  ),
  "四条纪律作为巴菲特原文保留；正文的“四问”是对同一材料的编辑转写，不另行归因。",
);

enrich(
  "第五篇_风险时间与复利/第十三章_风险不是一条波动曲线.md",
  "债务、风险与期限",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_2005-巴菲特致股东信.md", "## 债务与风险", "## 管理继任"),
  "债务证据把概率判断与合同期限连接起来，补足正文对杠杆如何改变持有人时间权的解释。",
);

enrich(
  "第五篇_风险时间与复利/第十四章_现金与恐慌中的选择权.md",
  "五片树林、不可动用现金与金融堡垒",
  "巴菲特股东信中文翻译",
  section("content/letters/berkshire_2018-巴菲特致股东信.md", "## 关注森林——忘掉树木", "## 回购与报告"),
  "证据窗口把现金放回控股企业、证券和保险融资的整体资产结构，不把现金余额孤立评价。",
);

enrich(
  "第五篇_风险时间与复利/第十五章_把个人判断变成可传承的复利制度.md",
  "接班者、文化与官僚主义",
  "巴菲特与芒格五十年回顾文章中文翻译；窗口保留原文人物归属",
  section(
    "content/articles/buffett/伯克希尔_50_周年：过去、现在和未来.md",
    "我的继任者还需要具备一个特别的优势",
    "沃伦·巴菲特副董事长的思考",
  ),
  "接班材料保留文化、总部、审计和董事会条件；正文只提炼可传承部分，不承诺复制历史回报。",
);

// 将已通过审阅的喜诗样章重排为正式第六章：本章小结之后只保留资料区。
const sample = fs.readFileSync(path.join(manuscript, "样章_喜诗糖果、企业质量与资本配置.md"), "utf8");
const chapterStart = sample.indexOf("# 第六章");
const sampleBody = sample.slice(chapterStart);
const positions = [...sampleBody.matchAll(/^## .+$/gmu)].map((match) => match.index);
const header = sampleBody.slice(0, positions[0]).trim();
const sections = new Map();
positions.forEach((start, index) => {
  const end = positions[index + 1] ?? sampleBody.length;
  const value = sampleBody.slice(start, end).trim();
  sections.set(value.split("\n", 1)[0].replace(/^## /u, ""), value);
});
const order = [
  "篇章页信息",
  "一笔差点因为“太贵”而错过的交易",
  "账面上没有的资产",
  "资本需求决定利润能否离开企业",
  "从一家好企业到一个资本配置系统",
  "喜诗真正改变了什么",
  "护城河不是抽象名词，而是一组日常选择",
  "一个反事实：如果喜诗把现金全部投回糖果",
  "从喜诗推导企业质量检查表",
  "常见误解：好企业可以解决一切",
  "适用边界：怎样寻找“下一家喜诗”",
  "插图任务卡摘要",
  "本章小结",
  "注释",
  "来源与引文映射",
  "内部交叉链接",
  "编辑说明",
];
const ch6 = `${header}\n\n${order.map((name) => {
  if (!sections.has(name)) throw new Error(`Missing ch6 section ${name}`);
  return sections.get(name);
}).join("\n\n")}\n`;
fs.writeFileSync(path.join(manuscript, "第二篇_好企业如何创造价值/第六章_喜诗糖果_企业质量改变资本配置.md"), ch6);

console.log("enriched chapters 4-15 and integrated chapter 6");
