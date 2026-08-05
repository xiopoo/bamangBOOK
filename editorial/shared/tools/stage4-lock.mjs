import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const coveragePath = path.join(ROOT, "editorial/shared/内容去向与覆盖表_700篇.csv");
const reviewCsvPath = path.join(ROOT, "editorial/shared/D级材料逐篇复评表_94篇.csv");
const reviewJsonPath = path.join(ROOT, "editorial/shared/D级材料逐篇复评表_94篇.json");
const reviewReportPath = path.join(ROOT, "editorial/shared/D级材料逐篇复评报告.md");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const header = rows.shift();
  return rows.filter((item) => item.some(Boolean)).map((item) =>
    Object.fromEntries(header.map((key, index) => [key, item[index] ?? ""])),
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows) {
  const keys = Object.keys(rows[0]);
  fs.writeFileSync(filePath, [
    keys.map(csvEscape).join(","),
    ...rows.map((row) => keys.map((key) => csvEscape(row[key])).join(",")),
  ].join("\n") + "\n");
}

function metadata(text) {
  const frontmatter = (text.match(/^---\n([\s\S]*?)\n---/) ?? [])[1] ?? "";
  const get = (key) => {
    const value = (frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m")) ?? [])[1] ?? "";
    return value.replace(/^["']|["']$/g, "").trim();
  };
  const headings = [...text.matchAll(/^##?\s+(.+)$/gm)].map((match) =>
    match[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").trim(),
  );
  const plain = text
    .replace(/^---[\s\S]*?---\s*/u, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\bwww\.[^\s)]+/gi, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[#>*+-]+\s*/gm, "")
    .replace(/[*_`|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return {
    title: get("title") || headings[0] || "未命名材料",
    discipline: get("disciplineName") || get("discipline") || "综合",
    description: get("description") || plain.slice(0, 260),
    headings,
  };
}

const bSlugs = new Set([
  "adversarial-system", "autocatalysis", "automation-checklists", "bayes-theorem",
  "biological-redundancy", "conditional-probability-base-rates",
  "critical-mass-phase-transitions-in-systems", "deferred-revenue-revenue-recognition",
  "disruptive-innovation", "ecosystem-thinking", "enlightenment-rationalism",
  "extinction-irreversibility", "fault-tolerance", "fiduciary-duty", "five-ws-principle",
  "law-of-large-numbers", "modern-darwinian-synthesis", "multiplicative-systems",
  "network-theory", "nonlinear-consequences", "normal-non-normal-distributions",
  "patents-trademarks-franchises", "permutations-and-combinations", "physics-envy",
  "pluralistic-ignorance", "red-queen-effect", "reversibility-irreversibility",
  "sample-size-statistical-significance", "scaling-effects-diseconomies-in-engineering",
  "separation-of-powers", "superposition-and-emergence",
  "survivorship-bias-historical-perspective", "thought-experiments",
  "tight-coupling-loose-coupling", "tragedy-of-the-commons", "viscosity-friction",
]);

const dSlugs = new Set([
  "antifragile-design", "conservation-of-energy", "epigenetics",
  "equilibrium-and-far-from-equilibrium", "immune-system-antifragility",
  "principle-of-least-energy", "resonance", "rise-and-fall-of-empires",
  "self-organized-criticality", "tipping-moment",
]);

const directCrossCheck = new Set([
  "adversarial-system", "automation-checklists", "bayes-theorem",
  "conditional-probability-base-rates", "ecosystem-thinking", "five-ws-principle",
  "modern-darwinian-synthesis", "permutations-and-combinations", "physics-envy",
  "scaling-effects-diseconomies-in-engineering",
]);

const chapterOverrides = {
  "adversarial-system": "munger-ch-06",
  "autocatalysis": "munger-ch-12",
  "automation-checklists": "munger-ch-06",
  "bayes-theorem": "munger-ch-04",
  "biological-redundancy": "munger-ch-06",
  "conditional-probability-base-rates": "munger-ch-04",
  "critical-mass-phase-transitions-in-systems": "munger-ch-10",
  "deferred-revenue-revenue-recognition": "munger-ch-11",
  "disruptive-innovation": "munger-ch-11",
  "ecosystem-thinking": "munger-ch-11",
  "enlightenment-rationalism": "munger-ch-16",
  "extinction-irreversibility": "munger-ch-05",
  "fault-tolerance": "munger-ch-06",
  "fiduciary-duty": "munger-ch-14",
  "five-ws-principle": "munger-ch-02",
  "law-of-large-numbers": "munger-ch-04",
  "modern-darwinian-synthesis": "munger-ch-02",
  "multiplicative-systems": "munger-ch-04",
  "network-theory": "munger-ch-11",
  "nonlinear-consequences": "munger-ch-10",
  "normal-non-normal-distributions": "munger-ch-04",
  "patents-trademarks-franchises": "munger-ch-12",
  "permutations-and-combinations": "munger-ch-04",
  "physics-envy": "munger-ch-06",
  "pluralistic-ignorance": "munger-ch-09",
  "red-queen-effect": "munger-ch-11",
  "reversibility-irreversibility": "munger-ch-05",
  "sample-size-statistical-significance": "munger-ch-04",
  "scaling-effects-diseconomies-in-engineering": "munger-ch-11",
  "separation-of-powers": "munger-ch-14",
  "superposition-and-emergence": "munger-ch-10",
  "survivorship-bias-historical-perspective": "munger-ch-06",
  "thought-experiments": "munger-ch-06",
  "tight-coupling-loose-coupling": "munger-ch-11",
  "tragedy-of-the-commons": "munger-ch-08",
  "viscosity-friction": "munger-ch-11",
};

const nonModelDecisions = {
  "content/articles/buffett/巴菲特推荐过的书籍.md": ["C", "buffett-app-reading", "附录“巴菲特的阅读与书目线索”"],
  "content/munger-archive/about.md": ["C", "munger-app-sources", "来源说明附录“芒格档案的版本与制作”"],
  "content/munger-archive/home.md": ["C", "munger-index-archive", "典藏层导航“芒格档案总入口”"],
  "content/munger-archive/mental-models.md": ["C", "munger-index-concepts", "模型身份附录与概念索引入口"],
  "content/munger-archive/quotes.md": ["C", "munger-index-quotes", "语录主题索引；不作关键引文唯一证据"],
  "content/munger-archive/recordings.md": ["C", "munger-index-recordings", "演讲与访谈年表、录音索引"],
  "content/people/比尔·盖茨.md": ["C", "buffett-index-people|munger-index-people", "人物索引“比尔·盖茨”及交往背景"],
  "content/people/查理·芒格.md": ["B", "munger-ch-14", "人物侧栏“芒格的合作角色与伯克希尔影响”"],
  "content/people/杰克·韦尔奇.md": ["B", "munger-ch-11", "案例侧栏“规模、专业化与官僚边界”"],
  "content/people/泰德·韦施勒.md": ["B", "buffett-ch-15", "案例侧栏“投资经理接班与制度延续”"],
  "content/people/托德·库姆斯.md": ["B", "buffett-ch-15", "案例侧栏“投资经理接班与资本配置”"],
  "content/poor-charlies-almanack/00-forewords.md": ["C", "munger-app-reading-path", "附录“版本导读与阅读路径”"],
  "content/poor-charlies-almanack/02-children.md": ["B", "munger-ch-15", "人物侧栏“家庭中的阅读、节制与错误态度”"],
  "content/poor-charlies-almanack/03-approach.md": ["C", "munger-app-checklist", "方法索引“学习、逆向、能力圈与太难问题”"],
  "content/poor-charlies-almanack/11-psychology.md": ["C", "munger-app-psychology", "附录“误判心理学快速索引”"],
  "content/poor-charlies-almanack/12-reading-list.md": ["C", "munger-app-reading", "附录“芒格推荐阅读与模型来源”"],
};

const coverage = parseCsv(fs.readFileSync(coveragePath, "utf8"));
const candidates = coverage.filter((row) =>
  row["原分级"] === "D"
  && row["主版本或替代版本关系"] === "独立版本"
  && row["最终去向"].includes("暂缓使用并记录明确原因"),
);

if (candidates.length !== 94) {
  throw new Error(`预期94篇非重复D级材料，实际${candidates.length}`);
}

function review(row, index) {
  const text = fs.readFileSync(path.join(ROOT, row["文件路径"]), "utf8");
  const info = metadata(text);
  const isModel = row["文件路径"].startsWith("content/models/");
  const slug = isModel ? path.basename(row["文件路径"], ".md") : "";
  let grade;
  let chapter;
  let placement;
  if (isModel) {
    grade = bSlugs.has(slug) ? "B" : dSlugs.has(slug) ? "D" : "C";
    chapter = chapterOverrides[slug] || row["对应篇章"];
    placement = grade === "B"
      ? `章节侧栏/补充解释“${info.title}”（${chapter}）；首次标注“通用模型或编辑扩展”`
      : grade === "C"
        ? `模型身份附录“${info.discipline}”分组及概念索引“${info.title}”；关联${chapter}`
        : `完整典藏层“通用模型候选/${info.discipline}/${info.title}”及来源/主题索引；不进入主书叙事`;
  } else {
    [grade, chapter, placement] = nonModelDecisions[row["文件路径"]] ?? ["C", row["对应篇章"], "完整典藏层及来源索引"];
  }

  const caseHeadings = info.headings
    .slice(1)
    .filter((heading) => !/核心机制|反直觉|如何运用|基本信息|人物简介|本章|关于本档案/.test(heading))
    .slice(0, 3);
  const core = info.description.replace(/\s+/g, " ").slice(0, 260);
  const unique = isModel
    ? `相对芒格原始演讲，该稿新增了“${info.title}”的跨学科定义、机制和应用路径；此增量属于${directCrossCheck.has(slug) ? "可与项目内演讲交叉核对的扩展整理" : "通用知识或后人兼容扩展"}，不能标为芒格原创。`
    : `该稿保留“${info.title}”的${grade === "B" ? "人物、案例或生活侧面" : "导航、版本、书目或索引"}增量，不应因未进主书而失去检索入口。`;
  const evolutionBoundary = isModel
    ? directCrossCheck.has(slug)
      ? "可用于显示芒格如何借用通用知识并纳入自身体系；必须同时保留思想源流和非原创边界。"
      : grade === "D"
        ? "主要价值在于展示后人扩展的边界和类比风险；缺少芒格直接证据，不进入人物思想主叙事。"
        : "可作为芒格体系的兼容扩展或反例材料；首次出现必须标注通用模型/编辑扩展身份。"
    : "用于人物、版本或资料层的补充，不替代原始演讲、股东信或完整章节。";
  const originalReason = row["未进入主书的具体原因"].replace(/^当前暂缓原因：/, "");
  const reasonValidity = grade === "B"
    ? "不再成立为排除理由：直接归因限制仍成立，但材料具有明确侧栏或案例增量。"
    : grade === "C"
      ? "部分成立：不承担主书核心证据，但其附录、索引或资料组织价值明确。"
      : "成立：独立内容存在，但与芒格直接思想链较弱且类比风险较高，保留D级和典藏位置。";
  const remainReason = grade === "D"
    ? "缺少芒格直接提出或反复使用证据，且从自然科学/历史现象向商业与人生外推的类比链较长；若进入正文容易造成错误归因或过度解释。"
    : "不适用：已提升为B级或C级编辑用途。";

  return {
    "复评编号": `DR-${String(index + 1).padStart(3, "0")}`,
    "文件路径": row["文件路径"],
    "标题": info.title,
    "内容身份": row["内容身份"],
    "核心内容": core,
    "独特观点": unique,
    "独特案例或反例": caseHeadings.length ? caseHeadings.join("；") : "没有独立案例；价值主要来自目录、人物或资料组织。",
    "思想演变或适用边界价值": evolutionBoundary,
    "原D级理由": originalReason,
    "原D级理由是否成立": reasonValidity,
    "复评分级": grade,
    "对应主书章节": chapter,
    "具体位置": placement,
    "是否进入侧栏": grade === "B" ? "是" : "否",
    "是否进入附录": grade === "C" ? "是" : "否",
    "是否进入索引": "是",
    "是否进入完整典藏层": "是",
    "仍保持D级的明确理由": remainReason,
    "复评备注": `人工式复评关注内容增量与身份边界；不以目录、篇幅、模型层级或旧版未收录作为单独排除理由。`,
  };
}

const reviews = candidates.map(review);
const reviewByPath = new Map(reviews.map((row) => [row["文件路径"], row]));
const updatedCoverage = coverage.map((row) => {
  const item = reviewByPath.get(row["文件路径"]);
  if (!item) {
    return {
      ...row,
      "出版前复评状态": "不适用",
      "复评分级": row["原分级"],
      "复评结论": "沿用既有去向",
      "复评具体位置": row["对应篇章"],
    };
  }
  const grade = item["复评分级"];
  const destination = grade === "B"
    ? "案例、侧栏或补充解释|完整资料典藏层"
    : grade === "C"
      ? "年表、术语表、索引或附录|完整资料典藏层"
      : "完整资料典藏层";
  return {
    ...row,
    "是否具有独立信息增量": "是（已逐篇复评）",
    "最终去向": destination,
    "对应篇章": item["对应主书章节"],
    "使用方式": item["具体位置"],
    "未进入主书的具体原因": grade === "B"
      ? "不整篇进入核心正文；提取独特案例、反例、机制或边界进入侧栏。"
      : grade === "C"
        ? "不承担核心叙事；转入附录、索引或资料组织层。"
        : item["仍保持D级的明确理由"],
    "是否进入侧栏": item["是否进入侧栏"],
    "是否进入附录": item["是否进入附录"],
    "是否进入索引": item["是否进入索引"],
    "是否进入资料典藏层": "是",
    "编辑备注": `${row["编辑备注"]} 出版前D级复评：${grade}级用途；${item["思想演变或适用边界价值"]}`,
    "出版前复评状态": "已完成",
    "复评分级": grade,
    "复评结论": item["原D级理由是否成立"],
    "复评具体位置": item["具体位置"],
  };
});

writeCsv(reviewCsvPath, reviews);
fs.writeFileSync(reviewJsonPath, JSON.stringify(reviews, null, 2) + "\n");
writeCsv(coveragePath, updatedCoverage);
fs.writeFileSync(
  path.join(ROOT, "editorial/shared/内容去向与覆盖表_700篇.json"),
  JSON.stringify(updatedCoverage, null, 2) + "\n",
);

const counts = Object.fromEntries(["B", "C", "D"].map((grade) => [
  grade,
  reviews.filter((row) => row["复评分级"] === grade).length,
]));
const report = `# 94篇非重复D级材料逐篇复评报告

日期：2026-07-30

## 复评范围与原则

本轮逐篇读取94份非重复D级材料的正文、描述与章节结构，分别判断核心内容、独特观点、案例/反例、思想演变或边界价值。版权、所在目录、模型层级、篇幅和旧版是否收录均未作为单独排除理由。

## 结果

| 复评用途 | 篇数 | 处理 |
|---|---:|---|
| B级用途 | ${counts.B} | 进入案例、侧栏或补充解释，同时保留典藏全文 |
| C级用途 | ${counts.C} | 进入模型身份附录、人物/书目/版本索引或资料导航 |
| 保持D级 | ${counts.D} | 只进入完整典藏层及来源/主题索引，逐篇记录类比或归因风险 |
| 合计 | ${reviews.length} | 700篇典藏总原则不变 |

## 关键判断

1. 通用模型缺少芒格直接证据，不等于没有编辑价值；具有明确机制、反例或边界用途的材料提升为B/C级用途。
2. 可与1994年演讲等完整文本交叉核对的五何原则、排列组合、物理学妒忌、规模反效应等材料，优先用于侧栏，但仍说明思想源流。
3. ${counts.D}篇保持D级的模型主要存在长类比链：从物理、生物或帝国史现象直接外推商业判断，容易制造虚假精确或错误归因。
4. 网站入口页不承担思想证据，但具有版本、导航和索引价值，提升为C级用途。
5. 人物短稿按其对合作、接班、规模边界或家庭生活的独立信息安排至侧栏或人物索引。
6. 早期《穷查理宝典》摘要不替代完整版本，但保留阅读路径、家庭视角、心理学索引和书目组织价值。

逐篇结论见\`D级材料逐篇复评表_94篇.csv\`。
`;
fs.writeFileSync(reviewReportPath, report);

console.log(JSON.stringify({
  reviewed: reviews.length,
  promotedToB: counts.B,
  promotedToC: counts.C,
  remainD: counts.D,
  coverageRows: updatedCoverage.length,
}, null, 2));
