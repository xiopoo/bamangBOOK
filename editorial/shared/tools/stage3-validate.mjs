import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
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

function load(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const coverage = parseCsv(load("editorial/shared/内容去向与覆盖表_700篇.csv"));
const versionRows = parseCsv(load("editorial/shared/主版本—替代版本映射.csv"));
const buffettOutline = load("editorial/buffett/outline/巴菲特卷唯一融合三级目录.md");
const mungerOutline = load("editorial/munger/outline/芒格卷唯一融合三级目录.md");
const buffettEvidence = load("editorial/buffett/manuscript/巴菲特卷逐章证据规划.md");
const mungerEvidence = load("editorial/munger/manuscript/芒格卷逐章证据规划.md");
const buffettSample = load("editorial/buffett/manuscript/样章_喜诗糖果、企业质量与资本配置.md");
const mungerSample = load("editorial/munger/manuscript/样章_多元思维模型与知识格栅.md");
const designSummary = JSON.parse(load("editorial/shared/stage3-design-summary.json"));

const errors = [];
const requiredCoverageFields = [
  "文件路径", "所属人物", "原分级", "内容身份", "核心观点", "是否具有独立信息增量",
  "最终去向", "对应书卷", "对应篇章", "使用方式", "主版本或替代版本关系",
  "对应篇级结构",
  "未进入主书的具体原因", "是否由其他主版本承接", "是否进入侧栏", "是否进入附录",
  "是否进入索引", "是否进入资料典藏层", "编辑备注",
];
const allowedDestinations = new Set([
  "主书核心正文",
  "案例、侧栏或补充解释",
  "年表、术语表、索引或附录",
  "完整资料典藏层",
  "由主版本承接",
  "暂缓使用并记录明确原因",
]);

if (coverage.length !== 700) errors.push(`覆盖表应为700条，实际${coverage.length}`);
if (new Set(coverage.map((row) => row["文件路径"])).size !== 700) errors.push("覆盖表文件路径不唯一");
for (const [index, row] of coverage.entries()) {
  for (const field of requiredCoverageFields) {
    if (!row[field]) errors.push(`覆盖表第${index + 2}行缺少${field}`);
  }
  const destinations = row["最终去向"].split("|");
  if (!destinations.length || destinations.some((item) => !allowedDestinations.has(item))) {
    errors.push(`覆盖表第${index + 2}行最终去向非法`);
  }
  if (row["原分级"] === "D" && row["是否进入资料典藏层"] !== "是") {
    errors.push(`D级未进入典藏层：${row["文件路径"]}`);
  }
  if (!fs.existsSync(path.join(root, row["文件路径"]))) errors.push(`来源文件不存在：${row["文件路径"]}`);
  if (/https?:\/\/|www\.|mailto:|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/i.test(Object.values(row).join(" "))) {
    errors.push(`覆盖表含外部链接或邮箱：${row["文件路径"]}`);
  }
}

for (const version of versionRows) {
  if (!coverage.some((row) => row["主版本或替代版本关系"].includes(version["版本组"]))) {
    errors.push(`版本组未进入覆盖表：${version["版本组"]}`);
  }
}

function validateOutline(text, expectedChapters, expectedParts, label) {
  const chapterCount = (text.match(/^### 第.+章 /gm) ?? []).length;
  if (chapterCount !== expectedChapters) errors.push(`${label}章节应为${expectedChapters}，实际${chapterCount}`);
  const partCount = (text.match(/^## 第.+篇 .+\{#[a-z]+-part-\d{2}\}$/gm) ?? []).length;
  if (partCount !== expectedParts) errors.push(`${label}篇数应为${expectedParts}，实际${partCount}`);
  for (const field of [
    "本章核心问题", "核心命题", "对应观点原子", "主要来源文件", "最佳证据片段", "代表案例",
    "思想演变", "常见误解", "适用边界", "预计字符数", "插图需求", "与前后章节的关系", "书内链接目标",
  ]) {
    const count = (text.match(new RegExp(`^- ${field}：`, "gm")) ?? []).length;
    if (count !== expectedChapters) errors.push(`${label}字段“${field}”应有${expectedChapters}项，实际${count}`);
  }
}

validateOutline(buffettOutline, 15, 5, "巴菲特目录");
validateOutline(mungerOutline, 16, 5, "芒格目录");
if (mungerOutline.includes("第六篇")) errors.push("芒格目录仍含第六篇");
if ((buffettEvidence.match(/^## 第.+章 /gm) ?? []).length !== 15) errors.push("巴菲特证据包章节数不为15");
if ((mungerEvidence.match(/^## 第.+章 /gm) ?? []).length !== 16) errors.push("芒格证据包章节数不为16");
if ((buffettEvidence.match(/^- 所属篇：/gm) ?? []).length !== 15) errors.push("巴菲特证据包所属篇字段不为15");
if ((mungerEvidence.match(/^- 所属篇：/gm) ?? []).length !== 16) errors.push("芒格证据包所属篇字段不为16");
if (designSummary.buffettMainTextChars < 300000 || designSummary.buffettMainTextChars > 360000) errors.push("巴菲特正文预算越界");
if (designSummary.mungerMainTextChars < 260000 || designSummary.mungerMainTextChars > 320000) errors.push("芒格正文预算越界");

for (const [label, sample] of [["巴菲特样章", buffettSample], ["芒格样章", mungerSample]]) {
  for (const required of [
    "篇章页信息", "插图占位", "侧栏", "注释", "来源与引文映射", "内部交叉链接", "编辑说明", "常见误解", "适用边界",
  ]) {
    if (!sample.includes(required)) errors.push(`${label}缺少${required}`);
  }
  if (/https?:\/\/|www\.|mailto:/i.test(sample)) errors.push(`${label}含外部链接`);
}

const phaseFiles = [
  "editorial/buffett/outline/巴菲特卷唯一融合三级目录.md",
  "editorial/munger/outline/芒格卷唯一融合三级目录.md",
  "editorial/buffett/manuscript/巴菲特卷逐章证据规划.md",
  "editorial/munger/manuscript/芒格卷逐章证据规划.md",
  "editorial/buffett/manuscript/样章_喜诗糖果、企业质量与资本配置.md",
  "editorial/munger/manuscript/样章_多元思维模型与知识格栅.md",
  "editorial/buffett/illustrations/巴菲特样章插图任务卡.md",
  "editorial/munger/illustrations/芒格样章插图任务卡.md",
  "editorial/shared/内部链接设计说明.md",
];
for (const file of phaseFiles) {
  if (/https?:\/\/|www\.|mailto:/i.test(load(file))) errors.push(`阶段文件含外部链接：${file}`);
}

const result = {
  ok: errors.length === 0,
  coverageRows: coverage.length,
  gradeD: coverage.filter((row) => row["原分级"] === "D").length,
  gradeDInArchive: coverage.filter((row) => row["原分级"] === "D" && row["是否进入资料典藏层"] === "是").length,
  coverageWithoutDestination: coverage.filter((row) => !row["最终去向"]).length,
  buffettChapters: (buffettOutline.match(/^### 第.+章 /gm) ?? []).length,
  buffettParts: (buffettOutline.match(/^## 第.+篇 .+\{#buffett-part-\d{2}\}$/gm) ?? []).length,
  mungerChapters: (mungerOutline.match(/^### 第.+章 /gm) ?? []).length,
  mungerParts: (mungerOutline.match(/^## 第.+篇 .+\{#munger-part-\d{2}\}$/gm) ?? []).length,
  buffettBudget: designSummary.buffettMainTextChars,
  mungerBudget: designSummary.mungerMainTextChars,
  externalLinksInPhaseMarkdown: phaseFiles.reduce((count, file) => count + ((load(file).match(/https?:\/\/|www\.|mailto:/gi) ?? []).length), 0),
  versionGroupsCovered: versionRows.filter((version) => coverage.some((row) => row["主版本或替代版本关系"].includes(version["版本组"]))).length,
  errors,
};

console.log(JSON.stringify(result, null, 2));
process.exitCode = errors.length ? 1 : 0;
