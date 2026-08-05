import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manuscript = path.join(root, "editorial/buffett/manuscript");
const entries = [
  ["01", "第一篇_所有者的起点/第一章_锁定稿.md", ["BA-001", "BA-024"]],
  ["02", "第一篇_所有者的起点/第二章_锁定稿.md", ["BA-003", "BA-004"]],
  ["03", "第一篇_所有者的起点/第三章_锁定稿.md", ["BA-002", "BA-027"]],
  ["04", "第二篇_好企业如何创造价值/第四章_安全边际与能力圈.md", ["BA-005", "BA-006"]],
  ["05", "第二篇_好企业如何创造价值/第五章_伯克希尔纺织_便宜为何仍会昂贵.md", ["BA-026", "BA-025"]],
  ["06", "第二篇_好企业如何创造价值/第六章_喜诗糖果_企业质量改变资本配置.md", ["BA-007", "BA-008", "BA-013"]],
  ["07", "第二篇_好企业如何创造价值/第七章_护城河必须经得住时间.md", ["BA-008", "BA-014", "BA-017"]],
  ["08", "第三篇_人与制度/第八章_选择经理人_能力精力与正直.md", ["BA-009", "BA-010"]],
  ["09", "第三篇_人与制度/第九章_信任声誉与去中心化.md", ["BA-011", "BA-012", "BA-023"]],
  ["10", "第四篇_资本配置/第十章_经理人的第二项工作.md", ["BA-013", "BA-014"]],
  ["11", "第四篇_资本配置/第十一章_回购收购与价格纪律.md", ["BA-015", "BA-016", "BA-017"]],
  ["12", "第四篇_资本配置/第十二章_浮存金_资本优势不是免费午餐.md", ["BA-021", "BA-022"]],
  ["13", "第五篇_风险时间与复利/第十三章_风险不是一条波动曲线.md", ["BA-018", "BA-005"]],
  ["14", "第五篇_风险时间与复利/第十四章_现金与恐慌中的选择权.md", ["BA-019", "BA-020"]],
  ["15", "第五篇_风险时间与复利/第十五章_把个人判断变成可传承的复利制度.md", ["BA-024", "BA-025", "BA-028"]],
];
const chapters = entries.map(([id, relative, atoms]) => ({
  id,
  relative,
  atoms,
  text: fs.readFileSync(path.join(manuscript, relative), "utf8"),
}));
const fullPath = path.join(manuscript, "全卷/所有者的眼光_巴菲特卷全卷连续正文.md");
const full = fs.readFileSync(fullPath, "utf8");
const appendixPath = path.join(root, "editorial/buffett/appendices/附录A_斯科特费泽ON会计桥完整档案.md");
const appendix = fs.readFileSync(appendixPath, "utf8");
const appendixPlanning = fs.readFileSync(path.join(root, "editorial/buffett/appendices/术语表与案例索引规划.md"), "utf8");
const errors = [];
const warnings = [];

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
  let hit = 0;
  for (const item of ga) if (gb.has(item)) hit += 1;
  return hit / Math.max(ga.size, gb.size, 1);
}

const paragraphs = [];
const quotes = [];
const structure = [];
for (const chapter of chapters) {
  const heads = [...chapter.text.matchAll(/^## (.+)$/gmu)].map((match) => ({ title: match[1], index: match.index }));
  const titles = heads.map((item) => item.title);
  const summaries = heads.filter((item) => item.title === "本章小结");
  const editors = heads.filter((item) => item.title === "编辑说明");
  if (summaries.length !== 1) errors.push(`第${chapter.id}章本章小结数量${summaries.length}`);
  if (editors.length !== 1) errors.push(`第${chapter.id}章编辑说明数量${editors.length}`);
  if (titles.filter((title) => /^注释(?:与来源映射)?$/u.test(title)).length !== 1) errors.push(`第${chapter.id}章注释区数量异常`);
  if (titles.filter((title) => title === "来源与引文映射" || title === "注释与来源映射").length !== 1) errors.push(`第${chapter.id}章来源映射数量异常`);
  if (titles.at(-1) !== "编辑说明") errors.push(`第${chapter.id}章最后二级标题不是编辑说明`);
  if (summaries.length === 1) {
    const after = heads.filter((item) => item.index > summaries[0].index).map((item) => item.title);
    const allowed = new Set(["注释", "来源与引文映射", "注释与来源映射", "内部交叉链接", "编辑说明"]);
    if (after.some((title) => !allowed.has(title))) errors.push(`第${chapter.id}章小结后出现正文：${after.join(" → ")}`);
  }
  if (editors.length === 1 && heads.some((item) => item.index > editors[0].index)) errors.push(`第${chapter.id}章编辑说明后有正文`);
  for (const atom of chapter.atoms) if (!chapter.text.includes(atom)) errors.push(`第${chapter.id}章缺少${atom}`);
  if (!chapter.text.includes("内容身份") && !chapter.text.includes("| 身份 |")) warnings.push(`第${chapter.id}章身份标注依赖来源表`);

  const end = summaries[0]?.index ?? chapter.text.length;
  for (const raw of chapter.text.slice(0, end).split(/\n\s*\n/u).map((item) => item.trim()).filter(Boolean)) {
    if (raw.startsWith("|")) continue;
    const text = normalize(raw);
    if (text.length < 140) continue;
    const item = { chapter: chapter.id, text, sample: raw.slice(0, 70) };
    if (raw.startsWith(">")) quotes.push(item);
    else paragraphs.push(item);
  }
  structure.push({ chapter: chapter.id, characters: chapter.text.length, headings: titles.length, afterSummary: summaries.length ? heads.filter((item) => item.index > summaries[0].index).map((item) => item.title) : [] });
}

function near(items, threshold) {
  const pairs = [];
  for (let i = 0; i < items.length; i += 1) for (let j = i + 1; j < items.length; j += 1) {
    const a = items[i];
    const b = items[j];
    const ratio = Math.min(a.text.length, b.text.length) / Math.max(a.text.length, b.text.length);
    if (ratio < 0.78) continue;
    const score = similarity(a.text, b.text);
    if (score >= threshold) pairs.push({ chapters: [a.chapter, b.chapter], score: Number(score.toFixed(3)), a: a.sample, b: b.sample });
  }
  return pairs;
}
const duplicateParagraphs = near(paragraphs, 0.92);
const duplicateQuotes = near(quotes, 0.95);
if (duplicateParagraphs.length) errors.push(`发现近重复正文长段${duplicateParagraphs.length}组`);
if (duplicateQuotes.length) errors.push(`发现重复或近重复档案段${duplicateQuotes.length}组`);

const all = `${full}\n${appendix}\n${appendixPlanning}`;
const anchors = new Set([...all.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)].map((match) => match[1]));
const outlinePath = path.join(root, "editorial/buffett/outline/巴菲特卷唯一融合三级目录.md");
if (fs.existsSync(outlinePath)) {
  const outline = fs.readFileSync(outlinePath, "utf8");
  for (const match of outline.matchAll(/#(buffett-[a-z0-9-]+)/gu)) anchors.add(match[1]);
}
const links = [...all.matchAll(/\]\(#([a-z][a-z0-9-]+)\)/gu)].map((match) => match[1]);
const missing = [...new Set(links.filter((target) => !anchors.has(target)))];
if (missing.length) errors.push(`缺少内部链接目标：${missing.join(",")}`);
const external = (all.match(/https?:\/\/|www\.|mailto:/giu) ?? []).length;
if (external) errors.push(`外部链接不为0：${external}`);

const anchorCounts = Object.fromEntries([...full.matchAll(/\{#(buffett-ch-\d{2})\}/gu)].map((match) => match[1]).reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map()));
for (let n = 1; n <= 15; n += 1) {
  const id = `buffett-ch-${String(n).padStart(2, "0")}`;
  if (anchorCounts[id] !== 1) errors.push(`${id}锚点数量为${anchorCounts[id] ?? 0}`);
}

const mappingPath = path.join(root, "editorial/buffett/巴菲特卷全卷人物原话与来源映射.csv");
const mappingLines = fs.readFileSync(mappingPath, "utf8").trim().split("\n");
if (mappingLines.length - 1 !== 47) errors.push(`全卷来源映射应为47条，当前${mappingLines.length - 1}`);
const coverage = JSON.parse(fs.readFileSync(path.join(root, "editorial/shared/内容去向与覆盖表_700篇.json"), "utf8"));
const ledger = JSON.parse(fs.readFileSync(path.join(root, "editorial/shared/全书精编实际使用台账.json"), "utf8"));
if (coverage.length !== 700) errors.push(`覆盖表不是700行：${coverage.length}`);
if (coverage.some((row) => !row["最终去向"])) errors.push("覆盖表存在无去向材料");
const reviewed = coverage.filter((row) => row["巴菲特全卷精编审阅"]?.includes("已逐篇"));
if (reviewed.length !== 250) errors.push(`第二至第五篇映射材料审阅应为250，当前${reviewed.length}`);
if (ledger.length !== 47) errors.push(`实际使用台账应为47，当前${ledger.length}`);

const result = {
  ok: errors.length === 0,
  mainTextCharacters: full.length,
  chapterCharacters: Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter.text.length])),
  chaptersBelowReference10000: chapters.filter((chapter) => chapter.text.length < 10000).map((chapter) => chapter.id),
  chaptersAboveReference15000: chapters.filter((chapter) => chapter.text.length > 15000).map((chapter) => chapter.id),
  structure,
  atomCoverage: Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter.atoms])),
  nearDuplicateParagraphs: duplicateParagraphs,
  nearDuplicateQuotes: duplicateQuotes,
  internalLinks: { total: links.length, missing: missing.length },
  externalLinks: external,
  sourceMappings: mappingLines.length - 1,
  coverageRows: coverage.length,
  mappedRowsReviewed: reviewed.length,
  actualUseLedgerEntries: ledger.length,
  warnings,
  errors,
};
const auditDir = path.join(root, "editorial/buffett/audit");
fs.mkdirSync(auditDir, { recursive: true });
fs.writeFileSync(path.join(auditDir, "巴菲特卷全卷结构内容与近重复审计结果.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
process.exitCode = errors.length ? 1 : 0;
