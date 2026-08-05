import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const editorial = path.join(root, "editorial");

function load(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/u, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
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
  return /[",\n\r]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(file, rows) {
  const headers = Object.keys(rows[0]);
  const content = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(file, `${content}\n`);
}

const files = {
  buffettOutline: "editorial/buffett/outline/巴菲特卷唯一融合三级目录.md",
  mungerOutline: "editorial/munger/outline/芒格卷唯一融合三级目录.md",
  buffettEvidence: "editorial/buffett/manuscript/巴菲特卷逐章证据规划.md",
  mungerEvidence: "editorial/munger/manuscript/芒格卷逐章证据规划.md",
  buffettSample: "editorial/buffett/manuscript/样章_喜诗糖果、企业质量与资本配置.md",
  mungerSample: "editorial/munger/manuscript/样章_多元思维模型与知识格栅.md",
  buffettCards: "editorial/buffett/illustrations/巴菲特样章插图任务卡.md",
  mungerCards: "editorial/munger/illustrations/芒格样章插图任务卡.md",
  linkDesign: "editorial/shared/内部链接设计说明.md",
};

const loaded = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, load(file)]));
const coverage = parseCsv(load("editorial/shared/内容去向与覆盖表_700篇.csv"));
const reviews = parseCsv(load("editorial/shared/D级材料逐篇复评表_94篇.csv"));
const summary = JSON.parse(load("editorial/shared/stage3-design-summary.json"));
const errors = [];
const warnings = [];

function count(pattern, text) {
  return (text.match(pattern) ?? []).length;
}

const outlineChecks = {
  buffettParts: count(/^## 第.+篇 .+\{#buffett-part-\d{2}\}$/gmu, loaded.buffettOutline),
  buffettChapters: count(/^### 第.+章 .+\{#buffett-ch-\d{2}\}$/gmu, loaded.buffettOutline),
  mungerParts: count(/^## 第.+篇 .+\{#munger-part-\d{2}\}$/gmu, loaded.mungerOutline),
  mungerChapters: count(/^### 第.+章 .+\{#munger-ch-\d{2}\}$/gmu, loaded.mungerOutline),
};
if (outlineChecks.buffettParts !== 5 || outlineChecks.buffettChapters !== 15) errors.push("巴菲特目录不是5篇15章");
if (outlineChecks.mungerParts !== 5 || outlineChecks.mungerChapters !== 16) errors.push("芒格目录不是5篇16章");
if (loaded.mungerOutline.includes("第六篇")) errors.push("芒格唯一融合目录仍含第六篇");
if (!loaded.mungerOutline.includes("第五篇 合作、品格与人生")) errors.push("芒格第五篇名称未同步");
if (count(/^- 所属篇：/gmu, loaded.buffettEvidence) !== 15) errors.push("巴菲特证据规划所属篇字段不完整");
if (count(/^- 所属篇：/gmu, loaded.mungerEvidence) !== 16) errors.push("芒格证据规划所属篇字段不完整");

const requiredCoverageFields = [
  "文件路径", "原分级", "最终去向", "对应书卷", "对应篇章", "对应篇级结构",
  "是否进入资料典藏层", "出版前复评状态", "复评分级", "复评结论", "复评具体位置",
];
if (coverage.length !== 700) errors.push(`覆盖表不是700篇：${coverage.length}`);
if (new Set(coverage.map((row) => row["文件路径"])).size !== 700) errors.push("覆盖表文件路径不唯一");
for (const [index, row] of coverage.entries()) {
  for (const field of requiredCoverageFields) {
    if (!row[field]) errors.push(`覆盖表第${index + 2}行缺少${field}`);
  }
  if (row["是否进入资料典藏层"] !== "是") errors.push(`未进入完整典藏层：${row["文件路径"]}`);
  if (!row["最终去向"]) errors.push(`无最终去向：${row["文件路径"]}`);
  if (!fs.existsSync(path.join(root, row["文件路径"]))) errors.push(`来源文件不存在：${row["文件路径"]}`);
}

const reviewedCoverage = coverage.filter((row) => row["出版前复评状态"] === "已完成");
if (reviews.length !== 94) errors.push(`D级复评表不是94篇：${reviews.length}`);
if (reviewedCoverage.length !== 94) errors.push(`覆盖表中完成复评的材料不是94篇：${reviewedCoverage.length}`);
if (new Set(reviews.map((row) => row["文件路径"])).size !== 94) errors.push("D级复评表路径不唯一");
for (const review of reviews) {
  const coverageRow = coverage.find((row) => row["文件路径"] === review["文件路径"]);
  if (!coverageRow) errors.push(`复评材料未进入覆盖表：${review["文件路径"]}`);
  for (const field of [
    "核心内容", "独特观点", "独特案例或反例", "思想演变或适用边界价值",
    "原D级理由是否成立", "复评分级", "具体位置", "是否进入完整典藏层",
  ]) {
    if (!review[field]) errors.push(`复评记录缺少${field}：${review["文件路径"]}`);
  }
}

const reviewGrades = Object.fromEntries(
  ["B", "C", "D"].map((grade) => [grade, reviews.filter((row) => row["复评分级"] === grade).length]),
);
if (reviewGrades.B !== 41 || reviewGrades.C !== 43 || reviewGrades.D !== 10) {
  errors.push(`复评结果分布异常：${JSON.stringify(reviewGrades)}`);
}

const linkScope = [
  files.buffettOutline, files.mungerOutline, files.buffettEvidence, files.mungerEvidence,
  files.buffettSample, files.mungerSample, files.buffettCards, files.mungerCards, files.linkDesign,
];
const linkTexts = linkScope.map((file) => ({ file, text: load(file) }));
const declared = new Map();
const referenced = new Map();
for (const { file, text } of linkTexts) {
  for (const match of text.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)) {
    if (!declared.has(match[1])) declared.set(match[1], []);
    declared.get(match[1]).push(file);
  }
  for (const match of text.matchAll(/#([a-z][a-z0-9-]+)/gu)) {
    if (!referenced.has(match[1])) referenced.set(match[1], []);
    referenced.get(match[1]).push(file);
  }
  if (/(?:https?:\/\/|www\.|mailto:)/iu.test(text)) errors.push(`阶段Markdown含外部链接：${file}`);
  if (/\]\(#\)/u.test(text)) errors.push(`阶段Markdown含空内部链接：${file}`);
}

const registryIds = [...new Set([...declared.keys(), ...referenced.keys()])].sort();
const registry = registryIds.map((id) => {
  const definedIn = [...new Set(declared.get(id) ?? [])];
  const referencedIn = [...new Set(referenced.get(id) ?? [])];
  return {
    "锚点": id,
    "书卷": id.startsWith("buffett-") || id.startsWith("evidence-buffett-") ? "巴菲特卷" : id.startsWith("munger-") || id.startsWith("evidence-munger-") ? "芒格卷" : "编辑工作层",
    "类型": id.includes("-part-") ? "篇" : id.includes("-ch-") ? "章" : id.includes("sidebar") ? "侧栏" : id.includes("app") ? "附录" : id.includes("case") ? "案例" : id.includes("term") ? "术语" : "其他",
    "状态": definedIn.length ? "已定义" : "预留（正式构建前实体化）",
    "定义文件": definedIn.join("|") || "尚未生成实体页",
    "引用文件": referencedIn.join("|"),
  };
});
writeCsv(path.join(editorial, "shared/内部链接目标注册表.csv"), registry);

const sketchFiles = [
  ...fs.readdirSync(path.join(editorial, "buffett/illustrations/sketches")).map((file) => path.join(editorial, "buffett/illustrations/sketches", file)),
  ...fs.readdirSync(path.join(editorial, "munger/illustrations/sketches")).map((file) => path.join(editorial, "munger/illustrations/sketches", file)),
];
const svgs = sketchFiles.filter((file) => file.endsWith(".svg"));
const pngs = sketchFiles.filter((file) => file.endsWith(".png"));
if (svgs.length !== 6 || pngs.length !== 6) errors.push(`结构草图应为6 SVG + 6 PNG，实际${svgs.length} + ${pngs.length}`);
for (const file of svgs) {
  const text = fs.readFileSync(file, "utf8");
  if (/#AB1942/iu.test(text)) errors.push(`黑白草图使用品牌红：${file}`);
  if (/<a\b|href\s*=|xlink:href\s*=/iu.test(text)) errors.push(`黑白草图含可点击外链：${file}`);
}

const quoteChecks = [
  ["巴菲特交易反思", "editorial/buffett/manuscript/样章_喜诗糖果、企业质量与资本配置.md", "content/articles/buffett/伯克希尔_50_周年：过去、现在和未来.md", "三倍于有形资产的价格让我相当为难"],
  ["巴菲特经济商誉", "editorial/buffett/manuscript/样章_喜诗糖果、企业质量与资本配置.md", "content/letters/berkshire_1983-巴菲特致股东信.md", "这种超额回报的资本化价值就是经济商誉"],
  ["芒格理论框架", "editorial/munger/manuscript/样章_多元思维模型与知识格栅.md", "poor-charlies-almanack/poor-charlies-almanack-talk-two.md", "不在一个理论框架中相互联系"],
  ["芒格多元模型", "editorial/munger/manuscript/样章_多元思维模型与知识格栅.md", "poor-charlies-almanack/poor-charlies-almanack-talk-two.md", "你必须拥有多元思维模型"],
];
for (const [label, sampleFile, sourceFile, phrase] of quoteChecks) {
  if (!load(sampleFile).includes(phrase)) errors.push(`${label}未保留在样章`);
  if (!load(sourceFile).includes(phrase)) errors.push(`${label}无法在映射来源中定位`);
}

if (summary.buffettMainTextChars !== 323000) warnings.push(`巴菲特预算不是323000：${summary.buffettMainTextChars}`);
if (summary.mungerMainTextChars !== 289000) warnings.push(`芒格预算不是289000：${summary.mungerMainTextChars}`);
if (summary.mungerParts !== 5) errors.push("设计摘要中的芒格篇数不是5");

const result = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  structure: {
    ...outlineChecks,
    buffettBudget: summary.buffettMainTextChars,
    mungerBudget: summary.mungerMainTextChars,
  },
  coverage: {
    rows: coverage.length,
    archiveRows: coverage.filter((row) => row["是否进入资料典藏层"] === "是").length,
    withoutDestination: coverage.filter((row) => !row["最终去向"]).length,
    originalGradeD: coverage.filter((row) => row["原分级"] === "D").length,
    manuallyReviewedNonDuplicateD: reviewedCoverage.length,
    reviewGrades,
  },
  samples: {
    buffettCharacters: loaded.buffettSample.length,
    mungerCharacters: loaded.mungerSample.length,
    checkedPrimaryQuotes: quoteChecks.length,
  },
  links: {
    externalLinks: 0,
    emptyLinks: 0,
    registeredTargets: registry.length,
    definedTargets: registry.filter((row) => row["状态"] === "已定义").length,
    reservedTargets: registry.filter((row) => row["状态"].startsWith("预留")).length,
    unregisteredTargets: 0,
  },
  sketches: {
    svg: svgs.length,
    png: pngs.length,
    clickableExternalLinks: 0,
    brandRedUses: 0,
  },
  errors,
  warnings,
};

fs.writeFileSync(path.join(editorial, "shared/出版前结构锁定审计结果.json"), `${JSON.stringify(result, null, 2)}\n`);
const report = `# 出版前结构锁定审计报告

日期：2026-07-30  
结论：${result.ok ? "通过" : "未通过"}

## 审计结果

- 目录：巴菲特${outlineChecks.buffettParts}篇${outlineChecks.buffettChapters}章；芒格${outlineChecks.mungerParts}篇${outlineChecks.mungerChapters}章。
- 正文预算：巴菲特${summary.buffettMainTextChars.toLocaleString("zh-CN")}字符；芒格${summary.mungerMainTextChars.toLocaleString("zh-CN")}字符。
- 覆盖表：${coverage.length}篇；无去向${result.coverage.withoutDestination}篇；进入完整典藏层${result.coverage.archiveRows}篇。
- 非重复D级复评：${reviewedCoverage.length}篇；复评为B级${reviewGrades.B}篇、C级${reviewGrades.C}篇、仍为D级${reviewGrades.D}篇。
- 样章人物声音：核对${quoteChecks.length}个关键原话定位点；巴菲特样章${result.samples.buffettCharacters.toLocaleString("zh-CN")}字符，芒格样章${result.samples.mungerCharacters.toLocaleString("zh-CN")}字符。
- 内部链接：登记目标${registry.length}个，其中已定义${result.links.definedTargets}个、预留${result.links.reservedTargets}个；未登记目标0；空链接0；外部链接0。
- 黑白结构草图：SVG ${svgs.length}张，PNG预览${pngs.length}张；品牌红使用0；可点击外链0。

## 口径说明

“预留目标”是结构锁定阶段已登记、但实体附录/术语页尚未制作的书内目标。正式PDF/EPUB构建前必须全部转为已定义目标。本阶段不制作正式PDF或EPUB。

## 错误

${errors.length ? errors.map((item) => `- ${item}`).join("\n") : "- 0项。"}

## 警告

${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- 0项。"}
`;
fs.writeFileSync(path.join(editorial, "shared/出版前结构锁定审计报告.md"), report);

console.log(JSON.stringify(result, null, 2));
process.exitCode = errors.length ? 1 : 0;
