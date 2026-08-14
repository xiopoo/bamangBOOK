import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalogDir = join(root, "editorial", "shared", "source-catalog");
const mappingPath = join(catalogDir, "partnership-source-map.json");
const outputDir = join(root, "editorial", "buffett", "collation", "partnership");
const python = "/Users/lucas/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (path, rows) => {
  const headers = Object.keys(rows[0] || {});
  const lines = [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))];
  writeFileSync(path, `${lines.join("\n")}\n`);
};

function extractPdfPages(pdfPath) {
  const code = [
    "import json, sys",
    "from pypdf import PdfReader",
    "reader = PdfReader(sys.argv[1])",
    "print(json.dumps([page.extract_text() or '' for page in reader.pages], ensure_ascii=False))",
  ].join("\n");
  const output = execFileSync(python, ["-c", code, pdfPath], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(output);
}

function visibleChars(text) {
  return text.replace(/\s+/g, "").length;
}

function englishWords(text) {
  return (text.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length;
}

function chineseChars(text) {
  return (text.match(/[\u3400-\u9fff]/g) || []).length;
}

const mapping = JSON.parse(readFileSync(mappingPath, "utf8"));
const mapped = mapping.rows
  .filter((row) => row.status === "page-mapped")
  .sort((a, b) => Number(a.startPage) - Number(b.startPage));

if (mapped.length !== 29) throw new Error(`Expected 29 mapped partnership letters, found ${mapped.length}`);
const pdfPaths = [...new Set(mapped.map((row) => row.sourcePath))];
if (pdfPaths.length !== 1) throw new Error(`Expected one partnership compilation PDF, found ${pdfPaths.length}`);
const pdfPath = join(root, pdfPaths[0]);
if (!existsSync(pdfPath)) throw new Error(`Missing partnership source PDF: ${pdfPaths[0]}`);

const pdfPages = extractPdfPages(pdfPath);
mkdirSync(outputDir, { recursive: true });

const records = mapped.map((row, index) => {
  const chinesePath = join(root, row.relative);
  if (!existsSync(chinesePath)) throw new Error(`Missing Chinese Markdown: ${row.relative}`);
  const chineseText = readFileSync(chinesePath, "utf8");
  if (!chineseText.endsWith("\n")) throw new Error(`Chinese Markdown lacks final newline: ${row.relative}`);

  const selectedPages = pdfPages.slice(Number(row.startPage) - 1, Number(row.endPage));
  if (selectedPages.length !== Number(row.endPage) - Number(row.startPage) + 1) {
    throw new Error(`PDF page range out of bounds: ${row.relative}`);
  }
  const englishText = selectedPages
    .map((pageText, pageIndex) => `--- PDF PAGE ${Number(row.startPage) + pageIndex} ---\n${pageText.trimEnd()}`)
    .join("\n\n");

  const stem = basename(row.relative, extname(row.relative));
  const packetRelative = `editorial/buffett/collation/partnership/${stem}_中英校勘包.md`;
  const packetPath = join(root, packetRelative);
  const chineseSha256 = sha256(chineseText);
  const englishExtractionSha256 = sha256(englishText);
  const title = `${row.sourceLabel}｜中英校勘包`;
  const packet = [
    `# ${title}`,
    "",
    "> 校勘状态：待逐段核对。此文件不作自动改译。",
    `> - 中文候选：\`${row.relative}\``,
    `> - 英文底本：\`${row.sourcePath}\`，PDF 第 ${row.startPage}—${row.endPage} 页`,
    `> - 来源：${row.sourceUrl}`,
    `> - 中文 SHA-256：\`${chineseSha256}\``,
    `> - 英文抽取 SHA-256：\`${englishExtractionSha256}\``,
    "",
    "## 英文底本（按指定 PDF 页机械抽取）",
    "",
    "~~~text",
    englishText,
    "~~~",
    "",
    "## 中文候选（原 Markdown 原样嵌入）",
    "",
    `<!-- SOURCE-BEGIN ${row.relative} ${chineseSha256} -->`,
    chineseText,
    `<!-- SOURCE-END ${row.relative} -->`,
    "",
    "## 人工校勘记录",
    "",
    "- [ ] 文献起止位置与日期一致",
    "- [ ] 标题、称谓、签名与附注完整",
    "- [ ] 数字、百分比、金额、年份逐项核对",
    "- [ ] 段落无整段遗漏或重复",
    "- [ ] 专名与投资术语核对",
    "- [ ] 实质性修订已写入校勘日志",
    "",
  ].join("\n");
  mkdirSync(dirname(packetPath), { recursive: true });
  writeFileSync(packetPath, packet);

  const beginMarker = `<!-- SOURCE-BEGIN ${row.relative} ${chineseSha256} -->\n`;
  const endMarker = `\n<!-- SOURCE-END ${row.relative} -->`;
  const saved = readFileSync(packetPath, "utf8");
  const begin = saved.indexOf(beginMarker);
  const end = saved.indexOf(endMarker, begin + beginMarker.length);
  const extractedChinese = begin >= 0 && end >= 0 ? saved.slice(begin + beginMarker.length, end) : "";
  const chineseFidelityPass = sha256(extractedChinese) === chineseSha256 && Buffer.byteLength(extractedChinese) === Buffer.byteLength(chineseText);
  if (!chineseFidelityPass) throw new Error(`Chinese fidelity check failed: ${row.relative}`);

  return {
    sequence: index + 1,
    sourceLabel: row.sourceLabel,
    chineseMarkdown: row.relative,
    chineseSha256,
    chineseBytes: Buffer.byteLength(chineseText),
    chineseVisibleChars: visibleChars(chineseText),
    chineseHanChars: chineseChars(chineseText),
    englishPdf: row.sourcePath,
    englishStartPage: row.startPage,
    englishEndPage: row.endPage,
    englishPageCount: selectedPages.length,
    englishExtractionSha256,
    englishVisibleChars: visibleChars(englishText),
    englishWords: englishWords(englishText),
    sourceUrl: row.sourceUrl,
    packet: packetRelative,
    chineseFidelityPass,
    collationStatus: "pending-manual-paragraph-collation",
  };
});

const generatedAt = new Date().toISOString();
const manifestJsonPath = join(catalogDir, "partnership-collation-packets.json");
const manifestCsvPath = join(catalogDir, "partnership-collation-packets.csv");
const indexPath = join(outputDir, "00_中英校勘包索引.md");
const reportPath = join(catalogDir, "巴菲特合伙人信中英校勘包生成报告.md");

writeFileSync(manifestJsonPath, `${JSON.stringify({ generatedAt, count: records.length, sourcePdf: pdfPaths[0], records }, null, 2)}\n`);
writeCsv(manifestCsvPath, records);
writeFileSync(indexPath, [
  "# 巴菲特合伙人信中英校勘包索引",
  "",
  `- 生成时间：${generatedAt}`,
  `- 校勘包：${records.length} 份`,
  `- 英文底本：\`${pdfPaths[0]}\``,
  "- 当前状态：全部等待人工逐段核对；未自动改译。",
  "",
  ...records.map((record) => `${record.sequence}. [${record.sourceLabel}](./${basename(record.packet)})：PDF ${record.englishStartPage}—${record.englishEndPage} 页；中文原文哈希复核通过。`),
  "",
].join("\n"));
writeFileSync(reportPath, [
  "# 巴菲特合伙人信中英校勘包生成报告",
  "",
  `- 生成时间：${generatedAt}`,
  `- 已生成：${records.length} 份逐封校勘包`,
  `- 覆盖 PDF 页：${records[0].englishStartPage}—${records.at(-1).englishEndPage}`,
  `- 中文正文哈希复核：${records.filter((record) => record.chineseFidelityPass).length}/${records.length} 通过`,
  "- 状态：仅完成英文页码抽取与中英文并置，尚未完成逐段翻译验收。",
  "",
  "## 输出",
  "",
  "- `editorial/buffett/collation/partnership/00_中英校勘包索引.md`",
  "- `editorial/shared/source-catalog/partnership-collation-packets.csv`",
  "- `editorial/shared/source-catalog/partnership-collation-packets.json`",
  "",
].join("\n"));

console.log(JSON.stringify({
  generatedAt,
  packets: records.length,
  pdfPages: `${records[0].englishStartPage}—${records.at(-1).englishEndPage}`,
  chineseFidelityPassed: records.filter((record) => record.chineseFidelityPass).length,
  index: indexPath.slice(root.length + 1),
  report: reportPath.slice(root.length + 1),
}, null, 2));
