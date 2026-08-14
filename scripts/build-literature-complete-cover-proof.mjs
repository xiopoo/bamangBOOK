import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const coverDir = join(root, "build_books", "cover");
const sourcePath = join(coverDir, "cover_design.typ");
const proofSourcePath = join(coverDir, "文献全集封面设计.typ");
const proofPdfPath = join(coverDir, "文献全集封面设计.pdf");
const mungerPdfPath = join(coverDir, "芒格文集封面.pdf");
const buffettPdfPath = join(coverDir, "巴菲特文集封面.pdf");
const reportPath = join(root, "editorial", "shared", "source-catalog", "巴菲特文集与芒格文集封面确认报告.md");
const python = "/Users/lucas/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
const source = readFileSync(sourcePath, "utf8");

const proof = source;
for (const [title, expected] of [["芒格文集", 2], ["巴菲特文集", 2]]) {
  const matches = proof.split(title).length - 1;
  if (matches !== expected) throw new Error(`Expected ${expected} occurrences of ${title}, found ${matches}`);
}
const sourceLines = source.split("\n");
const proofLines = proof.split("\n");
if (sourceLines.length !== proofLines.length) throw new Error("Cover source line count changed");
const changedLines = [];
for (let index = 0; index < sourceLines.length; index += 1) {
  if (sourceLines[index] === proofLines[index]) continue;
  changedLines.push({ line: index + 1, from: sourceLines[index], to: proofLines[index] });
}
if (changedLines.length !== 0) throw new Error(`Cover proof must match locked source exactly; found ${changedLines.length} changed lines`);

writeFileSync(proofSourcePath, proof);
execFileSync("typst", ["compile", "--root", root, proofSourcePath, proofPdfPath], { cwd: root, stdio: "inherit" });

const splitCode = [
  "import sys",
  "from pypdf import PdfReader, PdfWriter",
  "source, munger, buffett = sys.argv[1:4]",
  "reader = PdfReader(source)",
  "assert len(reader.pages) == 2, f'expected 2 pages, got {len(reader.pages)}'",
  "for page_index, output in [(0, munger), (1, buffett)]:",
  "    writer = PdfWriter()",
  "    writer.add_page(reader.pages[page_index])",
  "    with open(output, 'wb') as stream: writer.write(stream)",
].join("\n");
execFileSync(python, ["-c", splitCode, proofPdfPath, mungerPdfPath, buffettPdfPath], { cwd: root, stdio: "inherit" });

const sourceBytes = readFileSync(sourcePath);
const proofSourceBytes = readFileSync(proofSourcePath);
const proofPdfBytes = readFileSync(proofPdfPath);
const mungerPdfBytes = readFileSync(mungerPdfPath);
const buffettPdfBytes = readFileSync(buffettPdfPath);
const generatedAt = new Date().toISOString();
const report = [
  "# 巴菲特文集与芒格文集封面确认报告",
  "",
  `- 生成时间：${generatedAt}`,
  "- 母版：`build_books/cover/cover_design.typ`",
  "- 封面书名：`芒格文集`、`巴菲特文集`",
  "- 双页校样：`build_books/cover/文献全集封面设计.pdf`",
  "- 芒格独立封面：`build_books/cover/芒格文集封面.pdf`",
  "- 巴菲特独立封面：`build_books/cover/巴菲特文集封面.pdf`",
  `- 母版 SHA-256：\`${sha256(sourceBytes)}\``,
  `- 新封面源文件 SHA-256：\`${sha256(proofSourceBytes)}\``,
  `- 新封面校样 SHA-256：\`${sha256(proofPdfBytes)}\``,
  `- 芒格独立封面 SHA-256：\`${sha256(mungerPdfBytes)}\``,
  `- 巴菲特独立封面 SHA-256：\`${sha256(buffettPdfBytes)}\``,
  "",
  "## 实际改动",
  "",
  "- 封面校样与锁定母版逐行一致，书名保持为《芒格文集》《巴菲特文集》。",
  "- 之前生成的‘文献全集’校样路径已被正确书名版本覆盖，不再作为有效封面。",
  "- 双页校样已拆成两个独立单页 PDF。",
  "",
  "## 发布前待确认",
  "",
  "背封简介仍保留旧版书名、‘十六章’、‘十五章’及思想重组式结构说明。按当前要求本轮没有改写；正式发布前需另行确认文案，版式不变。",
  "",
].join("\n");
writeFileSync(reportPath, report);

console.log(JSON.stringify({
  generatedAt,
  changedLines,
  outputSource: proofSourcePath.slice(root.length + 1),
  outputPdf: proofPdfPath.slice(root.length + 1),
  outputPdfBytes: proofPdfBytes.length,
  mungerPdf: mungerPdfPath.slice(root.length + 1),
  buffettPdf: buffettPdfPath.slice(root.length + 1),
  report: reportPath.slice(root.length + 1),
}, null, 2));
