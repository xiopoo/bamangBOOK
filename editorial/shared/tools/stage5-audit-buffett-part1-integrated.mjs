import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "editorial/buffett/manuscript/第一篇_所有者的起点");
const appendixPath = path.join(root, "editorial/buffett/appendices/附录A_斯科特费泽ON会计桥完整档案.md");
const files = ["第一章_连续阅读定稿候选.md", "第二章_连续阅读定稿候选.md", "第三章_连续阅读定稿候选.md"];
const chapters = files.map((file) => fs.readFileSync(path.join(dir, file), "utf8"));
const fullPath = path.join(dir, "第一篇_所有者的起点_连续阅读定稿候选.md");
const full = fs.readFileSync(fullPath, "utf8");
const appendix = fs.readFileSync(appendixPath, "utf8");
const errors = [];

function normalize(text) {
  return text
    .replace(/`[^`]*`/gu, "")
    .replace(/\[[^\]]+\]\([^)]*\)/gu, "")
    .replace(/[#>*_|~\-\d\s\p{P}\p{S}]/gu, "")
    .toLowerCase();
}

function grams(text, n = 3) {
  const set = new Set();
  for (let i = 0; i <= text.length - n; i += 1) set.add(text.slice(i, i + n));
  return set;
}

function similarity(a, b) {
  const ga = grams(a);
  const gb = grams(b);
  let overlap = 0;
  for (const item of ga) if (gb.has(item)) overlap += 1;
  return overlap / Math.max(ga.size, gb.size, 1);
}

const structural = [];
const bodyParagraphs = [];
const quoteParagraphs = [];

chapters.forEach((chapter, chapterIndex) => {
  const heads = [...chapter.matchAll(/^## (.+)$/gmu)].map((match) => ({ title: match[1], index: match.index }));
  const titles = heads.map((item) => item.title);
  const summaryIndexes = heads.filter((item) => item.title === "本章小结");
  const editorIndexes = heads.filter((item) => item.title === "编辑说明");
  if (summaryIndexes.length !== 1) errors.push(`第${chapterIndex + 1}章“本章小结”数量为${summaryIndexes.length}`);
  if (editorIndexes.length !== 1) errors.push(`第${chapterIndex + 1}章“编辑说明”数量为${editorIndexes.length}`);
  if (titles.filter((title) => /^注释(?:与来源映射)?$/u.test(title)).length !== 1) {
    errors.push(`第${chapterIndex + 1}章注释区数量不为1`);
  }
  const sourceCount = titles.filter((title) => title === "来源与引文映射" || title === "注释与来源映射").length;
  if (sourceCount !== 1) errors.push(`第${chapterIndex + 1}章来源映射区数量为${sourceCount}`);
  if (titles.at(-1) !== "编辑说明") errors.push(`第${chapterIndex + 1}章最后一个二级标题不是编辑说明`);

  if (summaryIndexes.length === 1) {
    const afterSummary = heads.filter((item) => item.index > summaryIndexes[0].index).map((item) => item.title);
    const allowed = chapterIndex === 0
      ? ["注释", "来源与引文映射", "编辑说明"]
      : ["注释与来源映射", "编辑说明"];
    if (JSON.stringify(afterSummary) !== JSON.stringify(allowed)) {
      errors.push(`第${chapterIndex + 1}章小结后结构异常：${afterSummary.join(" → ")}`);
    }
  }
  if (editorIndexes.length === 1) {
    const laterH2 = heads.filter((item) => item.index > editorIndexes[0].index);
    if (laterH2.length) errors.push(`第${chapterIndex + 1}章编辑说明后仍有正文标题`);
  }

  const bodyEnd = summaryIndexes[0]?.index ?? chapter.length;
  const body = chapter.slice(0, bodyEnd);
  const paragraphs = body.split(/\n\s*\n/u).map((item) => item.trim()).filter(Boolean);
  for (const paragraph of paragraphs) {
    const cleaned = normalize(paragraph);
    if (cleaned.length < 100 || paragraph.startsWith("|")) continue;
    const entry = { chapter: chapterIndex + 1, text: cleaned, sample: paragraph.slice(0, 80) };
    if (paragraph.startsWith(">")) quoteParagraphs.push(entry);
    else bodyParagraphs.push(entry);
  }
  structural.push({ chapter: chapterIndex + 1, headings: titles, summaryPosition: summaryIndexes[0]?.index, editorPosition: editorIndexes[0]?.index });
});

function findNearDuplicates(items, threshold) {
  const pairs = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i];
      const b = items[j];
      const ratio = Math.min(a.text.length, b.text.length) / Math.max(a.text.length, b.text.length);
      if (ratio < 0.72) continue;
      const score = similarity(a.text, b.text);
      if (score >= threshold) pairs.push({ a: a.sample, b: b.sample, score: Number(score.toFixed(3)) });
    }
  }
  return pairs;
}

const nearBody = findNearDuplicates(bodyParagraphs, 0.9);
const nearQuotes = findNearDuplicates(quoteParagraphs, 0.94);
if (nearBody.length) errors.push(`发现近重复正文长段：${nearBody.length}组`);
if (nearQuotes.length) errors.push(`发现重复或近重复引文：${nearQuotes.length}组`);

const chapter3Body = chapters[2].slice(0, chapters[2].indexOf("## 本章小结"));
for (const phrase of ["O公司”和“N公司", "经营现实相同"]) {
  const count = (chapter3Body.match(new RegExp(phrase, "gu")) ?? []).length;
  if (count > 1) errors.push(`O/N案例关键叙述重复：${phrase}×${count}`);
}
const mainTables = (chapters[2].match(/^\| 会计桥项目/gmu) ?? []).length;
if (mainTables !== 1) errors.push(`第三章O/N编辑表数量应为1，当前${mainTables}`);
if (!chapters[2].includes("历史语境") || !chapters[2].includes("不是复述当前并购会计规则")) {
  errors.push("第三章未充分标明购买法会计历史语境");
}
if (!chapters[2].includes("(#buffett-app-sf-on)")) errors.push("第三章缺少O/N附录内链");
if (!appendix.includes("{#buffett-app-sf-on}")) errors.push("O/N附录缺少锚点");
if (!appendix.includes("完整表格和长段论证")) errors.push("O/N附录未声明完整档案用途");

const total = full.length;
if (total < 32000 || total > 38000) errors.push(`第一篇字符数越界：${total}`);
for (const atom of ["BA-001", "BA-024", "BA-003", "BA-004", "BA-002", "BA-027"]) {
  if (!full.includes(atom)) errors.push(`缺少观点原子${atom}`);
}

const allForLinks = `${full}\n${appendix}`;
const anchors = new Set([...allForLinks.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)].map((match) => match[1]));
const outline = fs.readFileSync(path.join(root, "editorial/buffett/outline/巴菲特卷唯一融合三级目录.md"), "utf8");
for (const match of outline.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)) anchors.add(match[1]);
const links = [...allForLinks.matchAll(/\]\(#([a-z][a-z0-9-]+)\)/gu)].map((match) => match[1]);
const missing = [...new Set(links.filter((target) => !anchors.has(target)))];
if (missing.length) errors.push(`缺少内部链接目标：${missing.join(",")}`);
const external = (allForLinks.match(/https?:\/\/|www\.|mailto:/giu) ?? []).length;
if (external) errors.push(`外部链接不为0：${external}`);

const coverage = JSON.parse(fs.readFileSync(path.join(root, "editorial/shared/内容去向与覆盖表_700篇.json"), "utf8"));
const reviewed = coverage.filter((row) => row["第一篇二次精编决定"] && row["第一篇二次精编决定"] !== "不适用");
if (reviewed.length !== 26) errors.push(`第一篇映射材料应为26篇，当前${reviewed.length}`);

const result = {
  ok: errors.length === 0,
  characters: {
    chapter1: chapters[0].length,
    chapter2: chapters[1].length,
    chapter3: chapters[2].length,
    total,
    allowed: [32000, 38000],
  },
  structural,
  bodyNearDuplicatePairs: nearBody,
  quoteNearDuplicatePairs: nearQuotes,
  onBridge: {
    editedTablesInMain: mainTables,
    historicalContextLabeled: chapters[2].includes("历史语境"),
    appendixLinked: chapters[2].includes("(#buffett-app-sf-on)"),
    appendixCharacters: appendix.length,
  },
  internalLinks: { total: links.length, missing: missing.length },
  externalLinks: external,
  mappedMaterialsReviewed: reviewed.length,
  errors,
};

const auditPath = path.join(dir, "第一篇连续阅读结构与近重复审计结果.json");
fs.writeFileSync(auditPath, `${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) {
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = 1;
} else {
  const locked = [
    ["第一章_连续阅读定稿候选.md", "第一章_锁定稿.md"],
    ["第二章_连续阅读定稿候选.md", "第二章_锁定稿.md"],
    ["第三章_连续阅读定稿候选.md", "第三章_锁定稿.md"],
    ["第一篇_所有者的起点_连续阅读定稿候选.md", "第一篇_所有者的起点_锁定稿.md"],
  ];
  for (const [from, to] of locked) fs.writeFileSync(path.join(dir, to), fs.readFileSync(path.join(dir, from)));
  console.log(JSON.stringify(result, null, 2));
}
