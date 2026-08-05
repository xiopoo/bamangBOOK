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
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const header = rows.shift();
  return rows
    .filter((item) => item.some(Boolean))
    .map((item) => Object.fromEntries(header.map((key, index) => [key, item[index] ?? ""])));
}

function loadCsv(relativePath) {
  return parseCsv(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function normalize(text) {
  return text
    .normalize("NFKC")
    .replace(/[\s，,。；;：:“”"'‘’（）()《》【】\[\]—–…·!?！？、-]/g, "")
    .toLowerCase();
}

const classification = loadCsv("editorial/shared/内容分级表_700篇.csv");
const models = loadCsv("editorial/munger/audit/芒格模型身份分层表_232篇.csv");
const versions = loadCsv("editorial/shared/主版本—替代版本映射.csv");
const buffettAtoms = loadCsv("editorial/buffett/outline/巴菲特观点原子库.csv");
const mungerAtoms = loadCsv("editorial/munger/outline/芒格观点原子库.csv");

const requiredClassFields = [
  "所属人物",
  "内容身份",
  "分级",
  "分级理由",
  "对应主题",
  "推荐用途",
  "主版本",
  "替代版本",
  "是否需要事实核验",
  "是否存在错误归因风险",
];

const errors = [];
if (classification.length !== 700) errors.push(`内容分级记录应为700，实际${classification.length}`);
if (new Set(classification.map((row) => row["来源文件"])).size !== 700) errors.push("内容分级表来源文件不唯一");
for (const [index, row] of classification.entries()) {
  for (const field of requiredClassFields) {
    if (!(field in row) || row[field] === "") errors.push(`内容分级第${index + 2}行缺少${field}`);
  }
  if (!["A", "B", "C", "D", "E"].includes(row["分级"])) errors.push(`内容分级第${index + 2}行等级非法`);
  if (/缺少.{0,8}(版权|授权)|版权.{0,8}(缺失|不明)|授权.{0,8}(缺失|不明)/.test(row["分级理由"])) {
    errors.push(`内容分级第${index + 2}行错误使用版权/授权理由`);
  }
  if (!fs.existsSync(path.join(root, row["来源文件"]))) errors.push(`候选文件不存在：${row["来源文件"]}`);
}

if (models.length !== 232) errors.push(`芒格模型记录应为232，实际${models.length}`);
for (const [index, row] of models.entries()) {
  if (!["1", "2", "3", "4"].includes(row["身份层级"])) errors.push(`模型第${index + 2}行层级非法`);
  if (!fs.existsSync(path.join(root, row["来源文件"]))) errors.push(`模型文件不存在：${row["来源文件"]}`);
}

const exactGroups = new Set(versions.filter((row) => row["关系类型"] === "精确重复").map((row) => row["版本组"]));
if (exactGroups.size !== 10) errors.push(`精确重复组应为10，实际${exactGroups.size}`);

for (const atom of [...buffettAtoms, ...mungerAtoms]) {
  const sourcePath = path.join(root, atom["来源文件"]);
  if (!fs.existsSync(sourcePath)) {
    errors.push(`观点原子${atom["节点编号"]}来源不存在`);
    continue;
  }
  const source = normalize(fs.readFileSync(sourcePath, "utf8"));
  const expression = normalize(atom["原始表达"]);
  if (!source.includes(expression)) errors.push(`观点原子${atom["节点编号"]}原始表达未逐字见于来源`);
}

const result = {
  ok: errors.length === 0,
  classificationRows: classification.length,
  gradeCounts: Object.fromEntries(["A", "B", "C", "D", "E"].map((grade) => [
    grade,
    classification.filter((row) => row["分级"] === grade).length,
  ])),
  modelRows: models.length,
  modelLayerCounts: Object.fromEntries(["1", "2", "3", "4"].map((layer) => [
    layer,
    models.filter((row) => row["身份层级"] === layer).length,
  ])),
  versionRows: versions.length,
  exactDuplicateGroups: exactGroups.size,
  buffettAtoms: buffettAtoms.length,
  mungerAtoms: mungerAtoms.length,
  errors,
};

console.log(JSON.stringify(result, null, 2));
process.exitCode = errors.length ? 1 : 0;
