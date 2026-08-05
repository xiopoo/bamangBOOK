import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const editorialRoot = path.join(root, "editorial");
const outputDir = path.join(editorialRoot, "shared", "audit");

const canonicalRelativePaths = [
  "buffett/manuscript/全卷/所有者的眼光_巴菲特卷全卷连续正文.md",
  "munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md",
];

const corruptionPatterns = [
  "重点在因为",
  "不在因为",
  "重点在在",
  "不在在",
  "这个转变而是",
  "通常而是因为",
  "排序才而是",
];

const placeholderPatterns = [
  "出处待考",
  "待后续补充",
  "去AI化编辑完成后填写",
  "<!-- TODO",
  "<!-- TBD",
  "[待补]",
  "【待补】",
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const errors = [];
const warnings = [];
const files = [];
const sourceReferences = [];
const patternMatches = [];
const placeholderMatches = [];
const footnoteChecks = [];

for (const relativePath of canonicalRelativePaths) {
  const absolutePath = path.join(editorialRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push({ type: "missing-canonical-file", file: relativePath });
    continue;
  }

  const buffer = fs.readFileSync(absolutePath);
  const text = buffer.toString("utf8");
  files.push({
    file: relativePath,
    bytes: buffer.length,
    characters: [...text].length,
    lines: text.split("\n").length,
    sha256: sha256(buffer),
  });

  for (const match of text.matchAll(/((?:content|poor-charlies-almanack)\/.*?\.md)/gu)) {
    const sourcePath = match[1].replace(/^[`「『（(【\[]+/u, "");
    const exists = fs.existsSync(path.join(root, sourcePath));
    const item = {
      file: relativePath,
      line: lineNumber(text, match.index),
      sourcePath,
      exists,
    };
    sourceReferences.push(item);
    if (!exists) errors.push({ type: "missing-source", ...item });
  }

  for (const pattern of corruptionPatterns) {
    let from = 0;
    while (true) {
      const index = text.indexOf(pattern, from);
      if (index === -1) break;
      const item = { file: relativePath, line: lineNumber(text, index), pattern };
      patternMatches.push(item);
      errors.push({ type: "mechanical-edit-corruption", ...item });
      from = index + pattern.length;
    }
  }

  for (const pattern of placeholderPatterns) {
    let from = 0;
    while (true) {
      const index = text.indexOf(pattern, from);
      if (index === -1) break;
      const item = { file: relativePath, line: lineNumber(text, index), pattern };
      placeholderMatches.push(item);
      errors.push({ type: "placeholder", ...item });
      from = index + pattern.length;
    }
  }

  const references = [...text.matchAll(/\[\^([^\]]+)\](?!:)/gu)].map((match) => match[1]);
  const definitions = [...text.matchAll(/^\[\^([^\]]+)\]:/gmu)].map((match) => match[1]);
  const definitionSet = new Set(definitions);
  const missingDefinitions = [...new Set(references.filter((id) => !definitionSet.has(id)))];
  const duplicateDefinitions = [...new Set(definitions.filter((id, index) => definitions.indexOf(id) !== index))];
  footnoteChecks.push({ file: relativePath, references: references.length, definitions: definitions.length, missingDefinitions, duplicateDefinitions });
  if (missingDefinitions.length) errors.push({ type: "missing-footnote-definition", file: relativePath, ids: missingDefinitions });
  const isPublicationFile = relativePath.includes("全卷连续正文") || relativePath.includes("全卷连续生产稿");
  if (duplicateDefinitions.length && isPublicationFile) warnings.push({ type: "duplicate-footnote-definition", file: relativePath, ids: duplicateDefinitions });
}

const editorialMarkdownFiles = [
  path.join(editorialRoot, "buffett/manuscript/全卷/所有者的眼光_巴菲特卷全卷连续正文.md"),
  path.join(editorialRoot, "munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md"),
  ...walk(path.join(editorialRoot, "buffett/appendices")),
  ...walk(path.join(editorialRoot, "buffett/archives")),
].filter((file) => file.endsWith(".md") && !file.includes(".fillbak") && !file.includes("规划"));
const anchorDefinitions = new Map();
const anchorReferences = [];
for (const absolutePath of editorialMarkdownFiles) {
  const relativePath = path.relative(editorialRoot, absolutePath);
  const text = fs.readFileSync(absolutePath, "utf8");
  for (const match of text.matchAll(/\{#([a-z][a-z0-9-]+)\}/gu)) {
    const entries = anchorDefinitions.get(match[1]) ?? [];
    entries.push({ file: relativePath, line: lineNumber(text, match.index) });
    anchorDefinitions.set(match[1], entries);
  }
  for (const match of text.matchAll(/\]\(#([a-z][a-z0-9-]+)\)/gu)) {
    anchorReferences.push({ id: match[1], file: relativePath, line: lineNumber(text, match.index) });
  }
}

const missingAnchors = anchorReferences.filter((reference) => !anchorDefinitions.has(reference.id));
const duplicateAnchors = [...anchorDefinitions.entries()]
  .filter(([, definitions]) => definitions.length > 1)
  .map(([id, definitions]) => ({ id, definitions }));
if (missingAnchors.length) warnings.push({ type: "missing-explicit-anchor", items: missingAnchors });
if (duplicateAnchors.length) warnings.push({ type: "duplicate-anchor", items: duplicateAnchors });

const result = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  canonicalFiles: files,
  summary: {
    errors: errors.length,
    warnings: warnings.length,
    sourceReferences: sourceReferences.length,
    missingSourceReferences: sourceReferences.filter((item) => !item.exists).length,
    uniqueMissingSourcePaths: new Set(sourceReferences.filter((item) => !item.exists).map((item) => item.sourcePath)).size,
    mechanicalEditCorruptions: patternMatches.length,
    placeholders: placeholderMatches.length,
    missingExplicitAnchors: missingAnchors.length,
    duplicateAnchors: duplicateAnchors.length,
  },
  sourceReferences,
  footnoteChecks,
  errors,
  warnings,
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "editorial-books-audit.json"), `${JSON.stringify(result, null, 2)}\n`);

const markdown = [
  "# 两卷出版稿自动审计",
  "",
  `- 生成时间：${result.generatedAt}`,
  `- 结论：${result.ok ? "通过" : "未通过"}`,
  `- 错误：${result.summary.errors}`,
  `- 警告：${result.summary.warnings}`,
  `- 来源引用：${result.summary.sourceReferences}`,
  `- 无效来源引用：${result.summary.missingSourceReferences} 次 / ${result.summary.uniqueMissingSourcePaths} 个唯一路径`,
  `- 机械替换病句：${result.summary.mechanicalEditCorruptions}`,
  `- 未清理占位：${result.summary.placeholders}`,
  `- 缺少显式定义的锚点：${result.summary.missingExplicitAnchors}`,
  "",
  "## 当前规范文件",
  "",
  ...files.map((file) => `- \`${file.file}\`：${file.characters} 字符，SHA-256 \`${file.sha256}\``),
  "",
  "## 阻断问题",
  "",
  ...(errors.length ? errors.map((error) => `- ${JSON.stringify(error)}`) : ["- 无"]),
  "",
  "## 警告",
  "",
  ...(warnings.length ? warnings.map((warning) => `- ${JSON.stringify(warning)}`) : ["- 无"]),
  "",
].join("\n");
fs.writeFileSync(path.join(outputDir, "editorial-books-audit.md"), markdown);

console.log(JSON.stringify(result.summary, null, 2));
process.exitCode = result.ok ? 0 : 1;
