import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manuscript = path.join(root, "editorial/buffett/manuscript");
const shared = path.join(root, "editorial/shared");

const chapters = [
  ["01", "出版分章/01_第一章 股票背后是一家企业.md"],
  ["02", "出版分章/02_第二章 价值不在报价屏上.md"],
  ["03", "出版分章/03_第三章 穿过会计看所有者收益.md"],
  ["04", "出版分章/04_第四章 安全边际与能力圈.md"],
  ["05", "出版分章/05_第五章 伯克希尔纺织：便宜为何仍会昂贵.md"],
  ["06", "出版分章/06_第六章 喜诗糖果：企业质量改变资本配置.md"],
  ["07", "出版分章/07_第七章 护城河必须经得住时间.md"],
  ["08", "出版分章/08_第八章 选择经理人：能力、精力与正直.md"],
  ["09", "出版分章/09_第九章 信任、声誉与去中心化.md"],
  ["10", "出版分章/10_第十章 经理人的第二项工作.md"],
  ["11", "出版分章/11_第十一章 回购、收购与价格纪律.md"],
  ["12", "出版分章/12_第十二章 浮存金：资本优势不是免费午餐.md"],
  ["13", "出版分章/13_第十三章 风险不是一条波动曲线.md"],
  ["14", "出版分章/14_第十四章 现金与恐慌中的选择权.md"],
  ["15", "出版分章/15_第十五章 把个人判断变成可传承的复利制度.md"],
];

const partText = {
  "01": `# 第一篇　所有者的起点 {#buffett-part-01}

## 篇首导读

投资的第一道分界，不是选择哪只股票，而是如何理解股票。把它当作报价符号，判断会围绕下一位买家的情绪；把它当作企业权益，问题便转向现金流、资本需要、管理者和价格。

本篇依次建立三个尺度：所有者身份、内在价值、所有者收益。它们共同回答“买到什么、值多少、真正赚多少”。`,
  "02": `# 第二篇　好企业如何创造价值 {#buffett-part-02}

## 篇首导读

第一篇建立价值尺度，第二篇把尺度放到不同企业上。安全边际与能力圈先限制错误；伯克希尔纺织展示低价资产怎样吞噬资本；喜诗说明定价权和低增量资本怎样释放现金；护城河则要求优势经受竞争和时间。

本篇不是从便宜转向昂贵，而是从静态资产折价转向企业质量、价格和机会成本的共同判断。`,
  "03": `# 第三篇　人与制度 {#buffett-part-03}

## 篇首导读

好企业不会自动把现金交给所有者。经理人的能力、精力和正直决定经营方向，信任、审计、声誉与分权决定组织能否在扩大后保持责任。

本篇从选人推进到制度：经营自主权下放，资本配置和品行红线集中。`,
  "04": `# 第四篇　资本配置 {#buffett-part-04}

## 篇首导读

企业产生现金之后，管理层必须决定它的下一站。再投资、收购、证券、回购、分红和现金都不是天然正确的工具；每一项都要服从长期每股价值、流动性和机会成本。

本篇先建立统一尺度，再讨论回购与收购，最后说明保险浮存金怎样扩大资本池并带来新的责任。`,
  "05": `# 第五篇　风险、时间与复利 {#buffett-part-05}

## 篇首导读

复利需要回报，更需要不中断。永久购买力损失、杠杆、被迫出售和现金短缺都可能在结果兑现前终止系统；声誉和股东期限又决定组织能否穿越恐慌。

最后三章把风险、现金和接班连成制度闭环：活下来，保持选择权，再让正确原则超越个人任期。`,
};

const partClosing = {
  "02": `## 篇末收束

从纺织到喜诗，变化的不是价格纪律，而是对安全边际来源的理解。真正的好企业既保护资本回报，也把现金释放给更好的机会；护城河仍需经理人每天维护。下一篇转向承担这些判断的人和制度。`,
  "03": `## 篇末收束

分权降低信息和官僚成本，信任却必须由选人、审计和声誉红线支撑。伯克希尔把日常经营交给经理人，把多余现金和重大资本责任留给总部。下一篇进入这项“第二工作”。`,
  "04": `## 篇末收束

资本配置把企业质量转化为集团复利。浮存金扩大可用资金，却把承保、流动性和巨灾生存带入同一系统。下一篇讨论怎样让资本循环穿过坏年份与接班。`,
  "05": `## 全卷收束

所有者视角不是一句持有口号，而是一条责任链：理解企业、估计价值、识别真实收益、选择好业务与好管理、配置资本、守住风险和声誉。复利是这条链不断裂后的结果。`,
};

const sources = {
  "04": [
    ["content/partnership/partnership_1965-11月-巴菲特致合伙人信.md", "主引文、安全边际与集中条件", "巴菲特合伙人信中文翻译"],
    ["content/talks/巴菲特：哥大商学院演讲_1984.md", "格雷厄姆—多德投资者", "演讲中文翻译／转录"],
    ["content/articles/buffett/巴菲特谈施洛斯的信_1994.md", "烟蒂方法边界", "专题文章中文翻译／编辑整理"],
  ],
  "05": [
    ["content/articles/buffett/伯克希尔_50_周年：过去、现在和未来.md", "烟蒂、收购经过与长期复盘", "巴菲特与芒格回顾文章中文翻译，身份分列"],
    ["content/letters/berkshire_1985-巴菲特致股东信.md", "关闭纺织完整案例", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2022-巴菲特致股东信.md", "58年资本配置复盘", "巴菲特股东信中文翻译"],
  ],
  "06": [
    ["content/articles/buffett/巴菲特谈喜诗糖果_1972.md", "收购现场与品牌维护", "信件译文与编辑汇编"],
    ["content/letters/berkshire_1983-巴菲特致股东信.md", "经济商誉与资本需求", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_1987-巴菲特致股东信.md", "现金释放与经理人", "巴菲特股东信中文翻译"],
    ["content/articles/buffett/伯克希尔_50_周年：过去、现在和未来.md", "长期结果", "巴菲特与芒格回顾文章中文翻译，身份分列"],
  ],
  "07": [
    ["content/letters/berkshire_2007-巴菲特致股东信.md", "护城河与三类企业", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_1978-巴菲特致股东信.md", "增长和留存边界", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_1988-巴菲特致股东信.md", "永久持有条件", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2016-巴菲特致股东信.md", "GEICO低成本案例", "巴菲特股东信中文翻译"],
  ],
  "08": [
    ["content/letters/berkshire_1987-巴菲特致股东信.md", "能力、精力、正直与授权", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2007-巴菲特致股东信.md", "超级明星边界", "巴菲特股东信中文翻译"],
    ["content/people/B夫人.md", "人物语境", "人物背景资料／编辑整理"],
    ["content/people/格雷格·阿贝尔.md", "接班语境", "人物背景资料／编辑整理"],
  ],
  "09": [
    ["content/letters/berkshire_2022-巴菲特致股东信.md", "权责和品行红线", "巴菲特股东信中文翻译"],
    ["content/articles/buffett/巴菲特：给全体经理人备忘录_2006.md", "声誉与报纸测试", "巴菲特内部备忘录中文翻译"],
    ["content/articles/buffett/巴菲特致所罗门股东信_1991.md", "所罗门危机", "巴菲特原始文献中文翻译"],
    ["content/articles/buffett/伯克希尔_50_周年：过去、现在和未来.md", "分权结构", "巴菲特与芒格回顾文章中文翻译，身份分列"],
  ],
  "10": [
    ["content/letters/berkshire_1986-巴菲特致股东信.md", "资本配置第二工作", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_1978-巴菲特致股东信.md", "留存收益双向检验", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2018-巴菲特致股东信.md", "多业务资本系统", "巴菲特股东信中文翻译"],
  ],
  "11": [
    ["content/letters/berkshire_2015-巴菲特致股东信.md", "回购标准", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2005-巴菲特致股东信.md", "收购六项标准", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_1988-巴菲特致股东信.md", "永久持有条件", "巴菲特股东信中文翻译"],
    ["content/articles/buffett/伯克希尔股东手册_1996.md", "股份发行和所有者原则", "巴菲特股东手册中文翻译"],
  ],
  "12": [
    ["content/letters/berkshire_2019-巴菲特致股东信.md", "浮存金定义和完整证据", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2024-巴菲特致股东信.md", "零成本条件与最新成熟表达", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2016-巴菲特致股东信.md", "国民保险与GEICO", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2002-巴菲特致股东信.md", "准备金和再保险边界", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2014-巴菲特致股东信.md", "承保纪律", "巴菲特股东信中文翻译"],
  ],
  "13": [
    ["content/letters/berkshire_2011-巴菲特致股东信.md", "购买力风险和资产分类", "巴菲特股东信中文翻译"],
    ["content/partnership/partnership_1965-11月-巴菲特致合伙人信.md", "永久损失", "巴菲特合伙人信中文翻译"],
    ["content/letters/berkshire_2003-巴菲特致股东信.md", "杠杆、衍生品与机会挟持", "巴菲特股东信中文翻译"],
  ],
  "14": [
    ["content/letters/berkshire_2008-巴菲特致股东信.md", "危机投资", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2021-巴菲特致股东信.md", "现金最低承诺", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2024-巴菲特致股东信.md", "股权优先于现金", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_2018-巴菲特致股东信.md", "金融堡垒", "巴菲特股东信中文翻译"],
  ],
  "15": [
    ["content/letters/berkshire_2022-巴菲特致股东信.md", "所有权形式、少数赢家与58年复盘", "巴菲特股东信中文翻译"],
    ["content/letters/berkshire_1985-巴菲特致股东信.md", "股东关系和价值", "巴菲特股东信中文翻译"],
    ["content/articles/buffett/伯克希尔_50_周年：过去、现在和未来.md", "制度与接班", "巴菲特与芒格回顾文章中文翻译，身份分列"],
    ["content/people/托德·库姆斯.md", "投资经理接班侧栏", "人物背景资料／编辑整理"],
    ["content/people/泰德·韦施勒.md", "投资经理接班侧栏", "人物背景资料／编辑整理"],
    ["content/people/格雷格·阿贝尔.md", "CEO接班侧栏", "人物背景资料／编辑整理"],
  ],
};

const partForChapter = (n) => n <= 3 ? "01" : n <= 7 ? "02" : n <= 9 ? "03" : n <= 12 ? "04" : "05";

function readerFacingChapter(text) {
  const sections = text.split(/(?=^## )/gmu);
  return sections
    .map((section) => {
      const title = section.match(/^## ([^\n]+)/mu)?.[1] ?? "";
      if (/^注释/u.test(title)) {
        const definitions = section.split("\n").filter((line) => /^\[\^[^\]]+\]:/u.test(line));
        return definitions.length ? `## 注释\n\n${definitions.join("\n\n")}\n` : "";
      }
      if (/^(?:档案证据|来源与引文映射|内部交叉链接|编辑说明|插图任务卡摘要)/u.test(title)) return "";
      return section;
    })
    .join("")
    .replace(/^> 内容身份：.*(?:\n|$)/gmu, "")
    .replace(/^> 以下保留.*(?:\n|$)/gmu, "")
    .replace(/^【插图占位[^\n]*】[^\n]*(?:\n图题：[^\n]*)?(?:\n画面：[^\n]*)?(?:\n注意：[^\n]*)?(?:\n|$)/gmu, "")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

let previousPart = null;
const blocks = [
  "# 所有者的眼光——巴菲特论企业、资本与长期复利",
  "",
  "系列：复利书房·巴芒经典",
  "",
  "正文状态：全卷连续精编工作定稿；正式视觉、PDF与EPUB尚未启动。",
];
const counts = {};
for (const [id, relative] of chapters) {
  const part = partForChapter(Number(id));
  if (part !== previousPart) {
    if (previousPart && partClosing[previousPart]) blocks.push(partClosing[previousPart]);
    blocks.push(partText[part]);
    previousPart = part;
  }
  const chapter = readerFacingChapter(fs.readFileSync(path.join(manuscript, relative), "utf8"));
  counts[id] = chapter.length;
  blocks.push(chapter);
}
blocks.push(partClosing["05"]);
const full = blocks.join("\n\n---\n\n");
const outputDir = path.join(manuscript, "全卷");
fs.mkdirSync(outputDir, { recursive: true });
const fullPath = path.join(outputDir, "所有者的眼光_巴菲特卷全卷连续正文.md");
fs.writeFileSync(fullPath, `${full}\n`);

const coveragePath = path.join(shared, "内容去向与覆盖表_700篇.json");
const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
const ledgerPath = path.join(shared, "全书精编实际使用台账.json");
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
const ledgerByPath = new Map(ledger.map((row) => [row["文件路径"], row]));
const reviewRows = [];
for (let n = 4; n <= 15; n += 1) {
  const id = String(n).padStart(2, "0");
  const anchor = `buffett-ch-${id}`;
  const mapped = coverage.filter((row) => (row["对应篇章"] ?? "").includes(anchor));
  for (const row of mapped) {
    const used = (sources[id] ?? []).some(([file]) => file === row["文件路径"]);
    row["巴菲特全卷精编审阅"] = "已逐篇复核元数据、内容摘要与章节增量";
    row["巴菲特全卷精编决定"] = used
      ? `进入正文｜${anchor}`
      : row["原分级"] === "A"
        ? `由最佳证据或后续相关章节承接｜完整典藏层`
        : row["原分级"] === "B"
          ? "保留为案例、侧栏、索引候选｜完整典藏层"
          : row["原分级"] === "C"
            ? "进入年表、索引、附录或完整典藏层"
            : "由主版本承接或保留于完整典藏层";
    reviewRows.push({
      章节: anchor,
      文件路径: row["文件路径"],
      原分级: row["原分级"],
      内容身份: row["内容身份"],
      审阅决定: row["巴菲特全卷精编决定"],
    });
  }
  for (const [file, use, identity] of sources[id] ?? []) {
    if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing source ${file}`);
    const row = coverage.find((item) => item["文件路径"] === file);
    if (row) {
      row["精编实际使用状态"] = "已进入巴菲特卷全卷连续正文";
      const positions = new Set((row["精编实际使用位置"] ?? "").split("|").filter(Boolean));
      positions.add(anchor);
      row["精编实际使用位置"] = [...positions].join("|");
      row["精编实际使用方式"] = use;
      row["精编实际身份复核"] = identity;
    }
    ledgerByPath.set(file, {
      文件路径: file,
      精编批次: "巴菲特卷全卷连续生产",
      实际使用位置: anchor,
      实际使用方式: use,
      实际内容身份: identity,
      状态: "已进入全卷连续正文",
    });
  }
}
fs.writeFileSync(coveragePath, `${JSON.stringify(coverage, null, 2)}\n`);
fs.writeFileSync(ledgerPath, `${JSON.stringify([...ledgerByPath.values()], null, 2)}\n`);

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
const reviewHeaders = ["章节", "文件路径", "原分级", "内容身份", "审阅决定"];
const reviewCsv = [reviewHeaders.join(","), ...reviewRows.map((row) => reviewHeaders.map((h) => csvEscape(row[h])).join(","))].join("\n");
fs.writeFileSync(path.join(root, "editorial/buffett/巴菲特卷第二至第五篇材料审阅表.csv"), `${reviewCsv}\n`);

const mappingRows = [["章节", "来源路径", "使用方式", "内容身份"]];
for (const [id, entries] of Object.entries(sources)) for (const entry of entries) mappingRows.push([`buffett-ch-${id}`, ...entry]);
const mappingCsv = mappingRows.map((row) => row.map(csvEscape).join(",")).join("\n");
fs.writeFileSync(path.join(root, "editorial/buffett/巴菲特卷全卷人物原话与来源映射.csv"), `${mappingCsv}\n`);

console.log(JSON.stringify({
  fullPath,
  chapterCharacters: counts,
  mainTextCharacters: full.length,
  reviewedMappedRows: reviewRows.length,
  actualSourceMappings: mappingRows.length - 1,
  ledgerEntries: ledgerByPath.size,
}, null, 2));
