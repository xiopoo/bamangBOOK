import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalogDir = join(root, "editorial", "shared", "source-catalog");
const officialManifest = JSON.parse(readFileSync(join(catalogDir, "official-primary-source-manifest.json"), "utf8"));
const outputDir = join(root, "editorial", "buffett", "collation", "shareholder-letters");
const manuscriptPath = join(root, "editorial", "buffett", "manuscript", "巴菲特文献全集_股东信正文边界清理稿.md");

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (path, rows) => {
  const headers = Object.keys(rows[0] || {});
  writeFileSync(path, `${[headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n")}\n`);
};

function replaceExactly(text, from, to, label) {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one replacement target, found ${count}`);
  return text.replace(from, to);
}

function cleanBoundary(year, original) {
  let cleaned = original;
  const actions = [];

  if ([2000, 2001, 2002, 2003, 2004, 2006, 2007].includes(year)) {
    const firstLine = cleaned.split("\n", 1)[0];
    if (!/^注：/u.test(firstLine)) throw new Error(`${year}: expected leading layout note`);
    cleaned = replaceExactly(cleaned, `${firstLine}\n`, `> 编者版式注：${firstLine.slice(2)}\n`, `${year} layout note`);
    actions.push("leading-layout-note-labeled-editorial");
  }

  if (year === 1990) {
    cleaned = replaceExactly(
      cleaned,
      "[^1]: 原文：",
      "[^1]: 译者注（英文原句）：",
      "1990 translator note",
    );
    actions.push("source-language-footnote-labeled-translator-note");
  }

  if (year === 2016) {
    for (const marker of ["[^1]: 原文中", "[^2]: \"make the numbers\"", "[^3]: \"don't-count-this\" managers"]) {
      cleaned = replaceExactly(cleaned, marker, marker.replace(": ", ": 译者注："), `2016 ${marker}`);
    }
    actions.push("three-explanatory-footnotes-labeled-translator-note");
  }

  let removedPrefix = "";
  let removedSuffix = "";
  if (year === 2025) {
    const startMarker = "## 致各位股东\n";
    const endMarker = "\n## 关于伯克希尔\n";
    const start = cleaned.indexOf(startMarker);
    const end = cleaned.indexOf(endMarker, start + startMarker.length);
    if (start < 0 || end < 0) throw new Error("2025: unable to locate letter boundary markers");
    removedPrefix = cleaned.slice(0, start);
    removedSuffix = cleaned.slice(end + 1);
    cleaned = `${cleaned.slice(start, end).trimEnd()}\n`;
    actions.push("official-press-release-prefix-separated");
    actions.push("company-description-and-contact-suffix-separated");
  }

  return { cleaned, actions, removedPrefix, removedSuffix };
}

const sourceRows = officialManifest.rows
  .filter((row) => row.person === "buffett")
  .sort((a, b) => Number(a.year) - Number(b.year));
if (sourceRows.length !== 49) throw new Error(`Expected 49 Buffett official-source rows, found ${sourceRows.length}`);

mkdirSync(outputDir, { recursive: true });
const records = sourceRows.map((row, index) => {
  const sourcePath = join(root, row.linkedMarkdown);
  if (!existsSync(sourcePath)) throw new Error(`Missing source Markdown: ${row.linkedMarkdown}`);
  const original = readFileSync(sourcePath, "utf8");
  const { cleaned, actions, removedPrefix, removedSuffix } = cleanBoundary(Number(row.year), original);
  const outputRelative = `editorial/buffett/collation/shareholder-letters/${basename(row.linkedMarkdown)}`;
  writeFileSync(join(root, outputRelative), cleaned);
  return {
    sequence: index + 1,
    year: Number(row.year),
    documentLabel: row.collection === "thanksgiving-shareholder-message"
      ? `${row.year} 年感恩节致股东信`
      : `${row.year} 年致伯克希尔股东信`,
    sourceMarkdown: row.linkedMarkdown,
    sourceSha256: sha256(original),
    sourceBytes: Buffer.byteLength(original),
    boundaryCopy: outputRelative,
    boundaryCopySha256: sha256(cleaned),
    boundaryCopyBytes: Buffer.byteLength(cleaned),
    changed: original !== cleaned,
    actions: actions.join("|"),
    removedPrefixBytes: Buffer.byteLength(removedPrefix),
    removedPrefixSha256: removedPrefix ? sha256(removedPrefix) : "",
    removedSuffixBytes: Buffer.byteLength(removedSuffix),
    removedSuffixSha256: removedSuffix ? sha256(removedSuffix) : "",
    officialSourcePath: row.localPath,
    officialSourceUrl: row.officialUrl,
    status: "boundary-cleaned-not-yet-bilingually-collated",
    text: cleaned,
  };
});

const toc = records.map((record) => `- ${record.year}　${record.documentLabel}`).join("\n");
const documents = records.map((record) => [
  `# ${record.documentLabel}`,
  "",
  "> 文献元数据",
  `> - 正文边界副本：\`${record.boundaryCopy}\``,
  `> - 原始中文 Markdown：\`${record.sourceMarkdown}\``,
  `> - 本地官方底本：\`${record.officialSourcePath}\``,
  `> - 官方来源：${record.officialSourceUrl}`,
  `> - 当前状态：正文边界已初筛；尚未完成逐段中英校勘`,
  "",
  `<!-- SOURCE-BEGIN ${record.boundaryCopy} ${record.boundaryCopySha256} -->`,
  record.text,
  `<!-- SOURCE-END ${record.boundaryCopy} -->`,
].join("\n")).join("\n\n");

const manuscript = [
  "# 巴菲特文献全集",
  "",
  "> 当前工作范围：1977—2024 年伯克希尔年度股东信，以及 2025 年感恩节致股东信。",
  "> 本稿只做正文边界隔离，不改写巴菲特正文；尚未完成逐段中英校勘，不是最终正本。",
  "",
  "## 目录",
  "",
  toc,
  "",
  documents,
  "",
].join("\n");
writeFileSync(manuscriptPath, manuscript);

for (const record of records) {
  const beginMarker = `<!-- SOURCE-BEGIN ${record.boundaryCopy} ${record.boundaryCopySha256} -->\n`;
  const endMarker = `\n<!-- SOURCE-END ${record.boundaryCopy} -->`;
  const begin = manuscript.indexOf(beginMarker);
  const end = manuscript.indexOf(endMarker, begin + beginMarker.length);
  const extracted = begin >= 0 && end >= 0 ? manuscript.slice(begin + beginMarker.length, end) : "";
  if (sha256(extracted) !== record.boundaryCopySha256) throw new Error(`Manuscript fidelity failed: ${record.boundaryCopy}`);
}

const generatedAt = new Date().toISOString();
const publicRecords = records.map(({ text: _text, ...record }) => record);
const jsonPath = join(catalogDir, "buffett-shareholder-boundary-copies.json");
const csvPath = join(catalogDir, "buffett-shareholder-boundary-copies.csv");
const reportPath = join(catalogDir, "巴菲特股东信正文边界清理报告.md");
writeFileSync(jsonPath, `${JSON.stringify({ generatedAt, count: publicRecords.length, manuscript: manuscriptPath.slice(root.length + 1), records: publicRecords }, null, 2)}\n`);
writeCsv(csvPath, publicRecords);
writeFileSync(reportPath, [
  "# 巴菲特股东信正文边界清理报告",
  "",
  `- 生成时间：${generatedAt}`,
  `- 文献：${records.length} 篇`,
  `- 原样复制：${records.filter((record) => !record.changed).length} 篇`,
  `- 仅调整注释标识或正文边界：${records.filter((record) => record.changed).length} 篇`,
  `- 合卷反向哈希复核：${records.length}/${records.length} 通过`,
  `- 工作稿：\`${manuscriptPath.slice(root.length + 1)}\``,
  "",
  "## 发生边界处理的文件",
  "",
  ...records.filter((record) => record.changed).map((record) => `- ${record.year}：${record.actions.replaceAll("|", "；")}。`),
  "",
  "所有处理均发生在 `editorial/` 副本；`content/` 原始文件未修改。2025 年被分离的新闻稿前缀和公司说明后缀已记录字节数与 SHA-256，未静默丢弃。",
  "",
].join("\n"));

console.log(JSON.stringify({
  generatedAt,
  count: records.length,
  unchanged: records.filter((record) => !record.changed).length,
  boundaryAdjusted: records.filter((record) => record.changed).length,
  manuscript: manuscriptPath.slice(root.length + 1),
  report: reportPath.slice(root.length + 1),
}, null, 2));
