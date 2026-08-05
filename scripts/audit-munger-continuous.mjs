import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const chapterDir = path.join(root, "editorial/munger/manuscript/连续生产");
const reportDir = path.join(root, "editorial/munger/audit");
const fullBuild = path.join(root, "editorial/munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md");
const backmatterFiles = [
  "editorial/munger/appendices/附录一_模型身份与思想源流对照表.md",
  "editorial/munger/appendices/附录二_双轨判断检查清单5组.md",
  "editorial/munger/appendices/附录三_25种心理倾向速查表.md",
  "editorial/munger/indexes/典藏A_芒格年表1924-2023.md",
  "editorial/munger/indexes/典藏B_关键人物与关键企业索引.md",
  "editorial/munger/indexes/典藏C_概念问题案例三类索引.md",
];
const requirements = [
  ["01", "第一章 一把锤子为什么不够", 17000, ["MA-002", "MA-001"]],
  ["02", "第二章 多元思维模型怎样连成知识格栅", 18000, ["MA-001", "MA-003"]],
  ["03", "第三章 终身学习：让模型保持活性", 17000, ["MA-009", "MA-022"]],
  ["04", "第四章 概率：把故事变成可以检验的判断", 18000, ["MA-003", "MA-019"]],
  ["05", "第五章 逆向：先问怎样会失败", 18000, ["MA-004", "MA-005"]],
  ["06", "第六章 反证、检查清单与第二次思考", 17000, ["MA-006", "MA-010"]],
  ["07", "第七章 误判不是偶然：心理倾向的系统", 19000, ["MA-011", "MA-010"]],
  ["08", "第八章 激励：制度比劝诫更诚实", 20000, ["MA-012", "MA-018"]],
  ["09", "第九章 群体、权威与被剥夺感", 19000, ["MA-014", "MA-015", "MA-016"]],
  ["10", "第十章 当偏误彼此增强", 18000, ["MA-013", "MA-017"]],
  ["11", "第十一章 穿过会计看商业现实", 18000, ["MA-021", "MA-026"]],
  ["12", "第十二章 好企业让少行动成为优势", 19000, ["MA-020", "MA-027"]],
  ["13", "第十三章 少数机会、集中下注与资本配置", 17000, ["MA-007", "MA-025"]],
  ["14", "第十四章 应得信任：合作如何降低摩擦", 14000, ["MA-023", "MA-028"]],
  ["15", "第十五章 避免惯常的失败方式", 17000, ["MA-005", "MA-024"]],
  ["16", "第十六章 理性近乎一种道德义务", 18000, ["MA-029", "MA-022", "MA-030"]],
];

const forbidden = [
  "证据规划锚点", "篇章页信息", "模型身份提示：", "观点原子：", "来源映射表", "编辑说明",
  "99%的人一辈子不成功", "超过三天", "格栅模型的真正起源", "1972年的一篇私人笔记",
  "多拯救了我们至少2-3倍的钱", "他们拒绝了90%以上的求购项目", "贪婪有天花板",
];

function sha(text) { return crypto.createHash("sha256").update(text).digest("hex"); }
function refs(text) { return [...text.matchAll(/\[\^([^\]]+)\](?!:)/gu)].map((m) => m[1]); }
function defs(text) { return [...text.matchAll(/^\[\^([^\]]+)\]:/gmu)].map((m) => m[1]); }
function paths(text) { return [...text.matchAll(/`((?:content|poor-charlies-almanack|editorial)\/[^`]+\.md)`/gu)].map((m) => m[1]); }

const chapters = [];
const errors = [];
const warnings = [];
const paragraphOwners = new Map();
const allTexts = [];

for (const [id, title, target, atoms] of requirements) {
  const file = fs.readdirSync(chapterDir).find((name) => name.startsWith(`${id}_`));
  if (!file) { errors.push(`${id}: 缺少章节文件`); continue; }
  const text = fs.readFileSync(path.join(chapterDir, file), "utf8");
  allTexts.push([file, text]);
  const characters = [...text].length;
  const lowerBound = 10000;
  const upperBound = null;
  if (!text.startsWith(`# ${title} {#munger-ch-${id}}`)) errors.push(`${id}: 章题或锚点不匹配`);
  if (characters < lowerBound) errors.push(`${id}: ${characters}字符，低于弹性篇幅的10000字符最低检查线`);
  for (const token of forbidden) if (text.includes(token)) errors.push(`${id}: 命中内部或禁用文本“${token}”`);
  if (/https?:\/\//u.test(text)) errors.push(`${id}: 正文含外部链接`);
  const used = refs(text);
  const defined = defs(text);
  for (const ref of new Set(used)) if (!defined.includes(ref)) errors.push(`${id}: 脚注${ref}无定义`);
  for (const def of new Set(defined)) if (!used.includes(def)) warnings.push(`${id}: 脚注${def}未使用`);
  const sourcePaths = new Set(paths(text));
  for (const source of sourcePaths) if (!fs.existsSync(path.join(root, source))) errors.push(`${id}: 来源不存在 ${source}`);
  if (sourcePaths.size < 6) errors.push(`${id}: 实际来源文件${sourcePaths.size}项，低于逐章证据规划要求的6项`);
  if ((text.match(/^## 本章小结$/gmu) || []).length !== 1) errors.push(`${id}: 本章小结数量不为1`);
  if ((text.match(/^## 注释$/gmu) || []).length !== 1) errors.push(`${id}: 注释区数量不为1`);
  const conclusion = text.indexOf("## 本章小结");
  const notes = text.indexOf("## 注释");
  if (conclusion < 0 || notes < conclusion) errors.push(`${id}: 小结与注释顺序异常`);
  const afterNotes = notes >= 0 ? text.slice(notes + 5) : "";
  if (/^#{1,3} /mu.test(afterNotes)) errors.push(`${id}: 注释后仍有正文标题`);
  for (const paragraph of text.split(/\n\s*\n/gu)) {
    const normalized = paragraph.replace(/\[\^[^\]]+\]/gu, "").replace(/\s+/gu, "").trim();
    if (normalized.length < 120 || normalized.startsWith("[^")) continue;
    const hash = sha(normalized);
    const owner = paragraphOwners.get(hash);
    if (owner && owner !== id) errors.push(`${id}: 与第${owner}章存在重复长段：${normalized.slice(0, 32)}…`);
    else paragraphOwners.set(hash, id);
  }
  const readerProse = (notes >= 0 ? text.slice(0, notes) : text)
    .split("\n")
    .filter((line) => !line.trimStart().startsWith(">"))
    .join("\n");
  const contrastPatterns = (readerProse.match(/(?:不是[^。！？\n]{0,45}而是|并非[^。！？\n]{0,45}而是|不在于[^。！？\n]{0,45}而在于)/gu) || []).length;
  if (contrastPatterns > 8) warnings.push(`${id}: “不是/并非……而是……”等模板化对举${contrastPatterns}处，需人工压缩文体`);
  chapters.push({ id, title, characters, target, lowerBound, upperBound, delta: characters - target, atoms, sourcePaths: sourcePaths.size, footnotes: defined.length, contrastPatterns, sha256: sha(text) });
}

for (const relative of backmatterFiles) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    errors.push(`缺少附录或典藏文件：${relative}`);
    continue;
  }
  const text = fs.readFileSync(absolute, "utf8");
  allTexts.push([relative, text]);
  if (/https?:\/\//u.test(text)) errors.push(`${relative}: 含外部链接`);
}

const anchors = new Set();
for (const [, text] of allTexts) {
  for (const match of text.matchAll(/\{#([a-z0-9-]+)\}/gu)) anchors.add(match[1]);
}
for (const [file, text] of allTexts) {
  for (const match of text.matchAll(/\]\(#([a-z0-9-]+)\)/gu)) {
    if (!anchors.has(match[1])) errors.push(`${file}: 内部链接无法解析 #${match[1]}`);
  }
}

const totalCharacters = chapters.reduce((sum, chapter) => sum + chapter.characters, 0);
if (totalCharacters < 220000 || totalCharacters > 300000) {
  errors.push(`全卷正文${totalCharacters}字符，不在220000—300000字符范围内`);
}

let fullBuildCharacters = 0;
let fullBuildAnchors = 0;
let fullBuildInternalLinks = 0;
if (!fs.existsSync(fullBuild)) {
  errors.push("缺少全卷连续生产稿；须先运行 build-munger-continuous.mjs");
} else {
  const text = fs.readFileSync(fullBuild, "utf8");
  fullBuildCharacters = [...text].length;
  const buildAnchors = new Set([...text.matchAll(/\{#([a-z0-9-]+)\}/gu)].map((match) => match[1]));
  const buildLinks = [...text.matchAll(/\]\(#([a-z0-9-]+)\)/gu)].map((match) => match[1]);
  fullBuildAnchors = buildAnchors.size;
  fullBuildInternalLinks = buildLinks.length;
  if (/https?:\/\//u.test(text)) errors.push("全卷连续生产稿含外部链接");
  if (/`(?:content|poor-charlies-almanack|editorial)\/[^`]+\.md`/u.test(text)) {
    errors.push("全卷连续生产稿仍暴露项目内文件路径");
  }
  for (const term of ["编辑部", "本项目", "项目中文", "编辑推演", "编辑模型", "主引文", "内容身份", "全卷首次", "本卷首次", "本章首次", "本章引文", "来源性质", "属编者", "模型稿", "档案", "交付标准", "字符目标", "形式审计", "本章原先", "本章不补", "本章不作", "本章的回答", "属于本书分析", "本书对全书方法", "资料显示", "资料将未签署", "MA-"]) {
    if (text.includes(term)) errors.push(`全卷连续生产稿仍含生产过程语言“${term}”`);
  }
  for (const anchor of new Set(buildLinks)) {
    if (!buildAnchors.has(anchor)) errors.push(`全卷连续生产稿内部链接无法解析 #${anchor}`);
  }
  for (const required of ["munger-backmatter", "munger-app-model-identity", "munger-app-checklist", "munger-app-psychology", "munger-app-timeline", "munger-index-companies", "munger-index-cases"]) {
    if (!buildAnchors.has(required)) errors.push(`全卷连续生产稿缺少附录或典藏锚点 #${required}`);
  }
}

const result = { generatedAt: new Date().toISOString(), errors, warnings, totalCharacters, anchors: anchors.size, fullBuildCharacters, fullBuildAnchors, fullBuildInternalLinks, chapters };
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, "芒格卷连续生产审计.json"), `${JSON.stringify(result, null, 2)}\n`);
const table = chapters.map((c) => `| ${c.id} | ${c.title} | ${c.characters} | ≥${c.lowerBound} | ${c.target} | ${c.delta} | ${c.sourcePaths} | ${c.footnotes} | ${c.contrastPatterns} |`).join("\n");
fs.writeFileSync(path.join(reportDir, "芒格卷连续生产审计.md"), `# 芒格卷连续生产审计\n\n- 错误：${errors.length}\n- 警告：${warnings.length}\n- 正文总字符：${totalCharacters}\n- 源文件可解析锚点：${anchors.size}\n- 构建稿总字符：${fullBuildCharacters}\n- 构建稿唯一锚点：${fullBuildAnchors}\n- 构建稿内部链接：${fullBuildInternalLinks}\n- 口径：一般章节以 10,000—15,000 字符为参考，不机械补足；单章只设 10,000 字符最低检查线，全卷正文须达到 220,000—300,000 字符。\n\n| 章 | 标题 | 字符 | 最低检查线 | 原规划参考 | 与原规划差额 | 来源文件 | 脚注 | 模板化对举 |\n| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${table}\n\n## 错误\n\n${errors.map((x) => `- ${x}`).join("\n") || "无"}\n\n## 警告\n\n${warnings.map((x) => `- ${x}`).join("\n") || "无"}\n`);
console.log(JSON.stringify({ errors: errors.length, warnings: warnings.length, totalCharacters, anchors: anchors.size, fullBuildCharacters, fullBuildAnchors, fullBuildInternalLinks, chapters: chapters.length }, null, 2));
if (errors.length) process.exitCode = 1;
