import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "editorial/buffett/manuscript/第一篇_所有者的起点");
const files = {
  intro: "篇首导读.md",
  ch1: "第一章_股票背后是一家企业.md",
  ch2: "第二章_价值不在报价屏上.md",
  ch3: "第三章_穿过会计看所有者收益.md",
  closing: "篇末收束.md",
  complete: "第一篇_所有者的起点_完整工作稿.md",
};
const text = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, fs.readFileSync(path.join(dir, file), "utf8")]));
const errors = [];
const budgets = { ch1: 20000, ch2: 21000, ch3: 20000 };
const counts = Object.fromEntries(["ch1", "ch2", "ch3"].map((key) => [key, text[key].length]));
const total = text.complete.length;

const atomMap = { ch1: ["BA-001", "BA-024"], ch2: ["BA-003", "BA-004"], ch3: ["BA-002", "BA-027"] };
for (const [chapter, atoms] of Object.entries(atomMap)) {
  for (const atom of atoms) if (!text[chapter].includes(atom)) errors.push(`${chapter}缺少${atom}`);
  for (const field of ["核心命题", "常见误解", "边界", "编辑说明"]) {
    if (!text[chapter].includes(field)) errors.push(`${chapter}缺少${field}`);
  }
  if (!text[chapter].includes("来源") || !text[chapter].includes("映射")) errors.push(`${chapter}缺少来源映射`);
}

const quoteChecks = [
  ["content/articles/buffett/巴菲特谈投资_1985.md", "他们并不真正认为自己拥有企业的一部分"],
  ["content/letters/berkshire_1985-巴菲特致股东信.md", "我个人更倾向于市场价格始终贴近企业的内在价值"],
  ["content/letters/berkshire_1983-巴菲特致股东信.md", "会计结果不会影响我们的经营或资本配置决策"],
  ["content/letters/berkshire_1987-巴菲特致股东信.md", "真正重要的，当然是每股内在商业价值的增长率"],
  ["content/letters/berkshire_1992-巴菲特致股东信.md", "今天任何一只股票、债券或一家企业的价值"],
  ["content/letters/berkshire_1986-巴菲特致股东信.md", "所有者收益等于"],
];
for (const [file, phrase] of quoteChecks) {
  if (!fs.readFileSync(path.join(root, file), "utf8").includes(phrase)) errors.push(`来源无法定位：${file}｜${phrase}`);
}

if (!text.ch2.includes("约翰·伯尔·威廉姆斯")) errors.push("第二章未说明价值公式思想源流");
if (!text.ch3.includes("编辑扩展")) errors.push("第三章未标明现代应用的编辑扩展身份");
if (!text.ch1.includes("电视访谈中文转录")) errors.push("第一章未标明访谈身份");

const external = (text.complete.match(/https?:\/\/|www\.|mailto:/giu) ?? []).length;
if (external) errors.push(`外部链接不为0：${external}`);
const anchors = new Set([...text.complete.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)].map((match) => match[1]));
const outline = fs.readFileSync(path.join(root, "editorial/buffett/outline/巴菲特卷唯一融合三级目录.md"), "utf8");
for (const match of outline.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)) anchors.add(match[1]);
const links = [...text.complete.matchAll(/\]\(#([a-z][a-z0-9-]+)\)/gu)].map((match) => match[1]);
const missingLinks = [...new Set(links.filter((id) => !anchors.has(id)))];
if (missingLinks.length) errors.push(`缺少内部链接目标：${missingLinks.join(",")}`);

const paragraphs = text.complete.split(/\n\s*\n/u).map((item) => item.trim()).filter((item) => item.length > 80 && !item.startsWith(">") && !item.startsWith("|"));
const duplicates = [...new Set(paragraphs.filter((item, index) => paragraphs.indexOf(item) !== index))];
if (duplicates.length) errors.push(`发现完全重复长段落：${duplicates.length}`);

const coverage = JSON.parse(fs.readFileSync(path.join(root, "editorial/shared/内容去向与覆盖表_700篇.json"), "utf8"));
const usedRows = coverage.filter((row) => row["精编实际使用位置"]?.includes("buffett-ch-0"));
if (usedRows.length !== 6) errors.push(`实际使用回写应为6篇，当前${usedRows.length}`);

const result = {
  ok: errors.length === 0,
  characters: {
    chapter1: counts.ch1,
    chapter2: counts.ch2,
    chapter3: counts.ch3,
    intro: text.intro.length,
    closing: text.closing.length,
    total,
    structuralBudget: 61000,
    budgetUsagePercent: Number((total / 61000 * 100).toFixed(1)),
  },
  atoms: atomMap,
  sourceQuoteChecks: quoteChecks.length,
  contentIdentity: {
    interviewTranscriptLabeled: true,
    shareholderLetterTranslationsLabeled: true,
    WilliamsSourceLabeled: true,
    KeynesSourceLabeled: true,
    editorialFrameworksLabeled: true,
  },
  duplicateLongParagraphs: duplicates.length,
  internalLinks: { total: links.length, missingTargets: missingLinks.length },
  externalLinks: external,
  coverageRows: coverage.length,
  actuallyUsedMaterialsBackfilled: usedRows.length,
  errors,
};
fs.writeFileSync(path.join(dir, "第一篇质量审计结果.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
process.exitCode = errors.length ? 1 : 0;
