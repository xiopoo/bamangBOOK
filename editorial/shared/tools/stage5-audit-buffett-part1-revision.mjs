import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "editorial/buffett/manuscript/第一篇_所有者的起点");
const names = {
  intro: "篇首导读.md",
  ch1: "第一章_二次精编修订稿.md",
  ch2: "第二章_二次精编修订稿.md",
  ch3: "第三章_二次精编修订稿.md",
  closing: "篇末收束.md",
  complete: "第一篇_所有者的起点_二次精编完整修订稿.md",
};
const text = Object.fromEntries(
  Object.entries(names).map(([key, name]) => [key, fs.readFileSync(path.join(dir, name), "utf8")]),
);
const errors = [];
const counts = Object.fromEntries(["ch1", "ch2", "ch3"].map((key) => [key, text[key].length]));
const total = text.complete.length;
const target = { ch1: [10000, 12000], ch2: [12000, 15000], ch3: [12000, 15000], total: [36000, 42000] };
for (const key of ["ch1", "ch2", "ch3"]) {
  if (counts[key] < target[key][0] || counts[key] > target[key][1]) errors.push(`${key}篇幅越界：${counts[key]}`);
}
if (total < target.total[0] || total > target.total[1]) errors.push(`全篇篇幅越界：${total}`);

const atomMap = { ch1: ["BA-001", "BA-024"], ch2: ["BA-003", "BA-004"], ch3: ["BA-002", "BA-027"] };
for (const [chapter, atoms] of Object.entries(atomMap)) {
  for (const atom of atoms) if (!text[chapter].includes(atom)) errors.push(`${chapter}缺少${atom}`);
  for (const field of ["核心命题", "常见误解", "边界", "编辑说明"]) {
    if (!text[chapter].includes(field)) errors.push(`${chapter}缺少${field}`);
  }
}

const sourceChecks = [
  ["content/articles/buffett/巴菲特谈投资_1985.md", "他们并不真正认为自己拥有企业的一部分"],
  ["content/articles/buffett/巴菲特：回忆进入证券行业_2005.md", "事实和推理"],
  ["content/partnership/partnership_1958-巴菲特致合伙人信.md", "联邦信托"],
  ["content/partnership/partnership_1961-annual-巴菲特致合伙人信.md", "第一类是低估类股票"],
  ["content/letters/berkshire_1985-巴菲特致股东信.md", "我们在1973年中期买入了全部的WPC持仓"],
  ["content/letters/berkshire_1986-巴菲特致股东信.md", "所有者收益等于"],
  ["content/articles/buffett/巴菲特：股票期权与常识_2002.md", "期权不应该记录为企业费用"],
  ["content/articles/buffett/巴菲特：模糊数学与股票期权_2004.md", "模糊的正确总比精确的错误要好"],
];
for (const [file, phrase] of sourceChecks) {
  if (!fs.readFileSync(path.join(root, file), "utf8").includes(phrase)) errors.push(`来源无法定位：${file}｜${phrase}`);
}

for (const [key, phrase] of [
  ["ch1", "专题文章中文翻译"],
  ["ch2", "访谈转录与中文整理"],
  ["ch3", "第三方文章与编辑资料"],
  ["ch3", "巴菲特署名评论"],
]) if (!text[key].includes(phrase)) errors.push(`${key}缺少身份标注：${phrase}`);

const external = (text.complete.match(/https?:\/\/|www\.|mailto:/giu) ?? []).length;
if (external) errors.push(`外部链接不为0：${external}`);
const anchors = new Set([...text.complete.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)].map((match) => match[1]));
const outline = fs.readFileSync(path.join(root, "editorial/buffett/outline/巴菲特卷唯一融合三级目录.md"), "utf8");
for (const match of outline.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)) anchors.add(match[1]);
const links = [...text.complete.matchAll(/\]\(#([a-z][a-z0-9-]+)\)/gu)].map((match) => match[1]);
const missingLinks = [...new Set(links.filter((id) => !anchors.has(id)))];
if (missingLinks.length) errors.push(`缺少内部链接目标：${missingLinks.join(",")}`);

const paragraphs = text.complete.split(/\n\s*\n/u)
  .map((item) => item.trim())
  .filter((item) => item.length > 80 && !item.startsWith(">") && !item.startsWith("|"));
const duplicates = [...new Set(paragraphs.filter((item, index) => paragraphs.indexOf(item) !== index))];
if (duplicates.length) errors.push(`发现完全重复长段落：${duplicates.length}`);

const coverage = JSON.parse(fs.readFileSync(path.join(root, "editorial/shared/内容去向与覆盖表_700篇.json"), "utf8"));
const reviewed = coverage.filter((row) => row["第一篇二次精编决定"] && row["第一篇二次精编决定"] !== "不适用");
if (reviewed.length !== 26) errors.push(`第一篇映射材料审阅应为26篇，当前${reviewed.length}`);
if (reviewed.some((row) => !row["第一篇二次精编审阅"]?.includes("逐篇"))) errors.push("存在未标记逐篇审阅的映射材料");
const usedRows = coverage.filter((row) => /buffett-ch-0[1-3]/u.test(row["精编实际使用位置"] ?? ""));
if (usedRows.length !== 20) errors.push(`实际使用回写应为20篇，当前${usedRows.length}`);

const quoteRatios = Object.fromEntries(["ch1", "ch2", "ch3"].map((key) => {
  const quoteChars = text[key].split("\n").filter((line) => line.startsWith(">")).join("\n").length;
  return [key, Number((quoteChars / text[key].length).toFixed(3))];
}));

const result = {
  ok: errors.length === 0,
  characters: {
    chapter1: counts.ch1,
    chapter2: counts.ch2,
    chapter3: counts.ch3,
    intro: text.intro.length,
    closing: text.closing.length,
    total,
    target,
  },
  atoms: atomMap,
  sourceQuoteChecks: sourceChecks.length,
  contentIdentityChecks: 4,
  quoteRatios,
  duplicateLongParagraphs: duplicates.length,
  internalLinks: { total: links.length, missingTargets: missingLinks.length },
  externalLinks: external,
  coverageRows: coverage.length,
  mappedMaterialsReviewed: reviewed.length,
  actuallyUsedMaterialsBackfilled: usedRows.length,
  errors,
};
fs.writeFileSync(path.join(dir, "第一篇二次精编质量审计结果.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
process.exitCode = errors.length ? 1 : 0;
