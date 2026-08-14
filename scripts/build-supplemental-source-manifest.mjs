#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "editorial/shared/source-catalog");
const generatedAt = new Date().toISOString();

const definitions = [
  {
    id: "ivey-buffett-partnership-letters",
    localPath: "content/source-documents/buffett-partnership-letters/ivey-buffett-partnership-letters.pdf",
    sourceUrl: "https://www.ivey.uwo.ca/media/2975913/buffett-partnership-letters.pdf",
    host: "Ivey Business School, Western University",
    evidenceTier: "institutional-compilation",
    pages: 152,
    coverage: "Buffett Partnership materials, 1957—1970; includes letters, agreement-related material and the tax-exempt bond letter.",
    use: "合伙人信英文校核底本候选；必须补逐封页码映射，不得称为逐封原件扫描。",
  },
  {
    id: "empire-berkshire-early-letters",
    localPath: "content/source-documents/berkshire-early-shareholder-letters/buffett-letters-1969-1976-secondary-scan.pdf",
    sourceUrl: "https://assets.empirefinancialresearch.com/uploads/2021/02/Buffett-Letters-1969-76.pdf",
    host: "Empire Financial Research asset host",
    evidenceTier: "secondary-scan-or-ocr-compilation",
    pages: 28,
    coverage: "Berkshire letters for 1969 and 1971—1976; despite the filename, the extracted document skips 1970.",
    use: "早期公司信交叉核对；OCR 中存在可疑年份/数字，不能替代高等级扫描件。",
  },
  {
    id: "safalniveshak-buffett-letters-1957-2012",
    localPath: "content/source-documents/buffett-crosscheck-compilations/safalniveshak-buffett-letters-1957-2012.pdf",
    sourceUrl: "https://www.safalniveshak.com/wp-content/uploads/2013/12/Warren-Buffett-Berkshire-Letters-1957-2012.pdf",
    host: "Safal Niveshak",
    evidenceTier: "third-party-crosscheck-compilation",
    pages: 1095,
    coverage: "Large compilation combining partnership materials and Berkshire letters through 2012; early Berkshire sequence begins with 1969 and also skips 1970.",
    use: "只作版本交叉核对和缺页排查；不作为单独提高证据等级的依据。",
  },
];

const errors = [];
const rows = definitions.map((definition) => {
  const absolute = path.join(root, definition.localPath);
  if (!fs.existsSync(absolute)) {
    errors.push(`missing ${definition.localPath}`);
    return { ...definition, bytes: 0, sha256: "" };
  }
  const buffer = fs.readFileSync(absolute);
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") errors.push(`not a PDF: ${definition.localPath}`);
  return {
    ...definition,
    bytes: buffer.length,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
  };
});

if (errors.length) throw new Error(errors.join("\n"));

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const headers = ["id", "evidenceTier", "host", "pages", "localPath", "sourceUrl", "coverage", "use", "bytes", "sha256"];
const csv = `${[headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n")}\n`;
const report = [
  "# 补充英文底本与交叉核对资料清单",
  "",
  `- 生成时间：${generatedAt}`,
  `- 文件：${rows.length} 份`,
  "- 本清单与“官方原始底本本地化清单”严格分开；这里的文件都不能自动视为官方逐封原件。",
  "",
  ...rows.flatMap((row, index) => [
    `## ${index + 1}. ${row.id}`,
    "",
    `- 证据等级：${row.evidenceTier}`,
    `- 托管方：${row.host}`,
    `- 页数：${row.pages}`,
    `- 本地：\`${row.localPath}\``,
    `- 覆盖：${row.coverage}`,
    `- 用法：${row.use}`,
    "",
  ]),
  "## 使用规则",
  "",
  "- Ivey 合编本可帮助核对英文，但必须先把每个 Markdown 与 PDF 页码逐封对应。",
  "- 早期公司信扫描/OCR 若与中文稿或其他英文版本冲突，以更接近原始年报的扫描件为准。",
  "- 大型第三方合集只提供第二个校对视角，不因体量大就获得更高权威性。",
  "- 缺失年份继续保持缺口，不由 AI 或编辑补写。",
  "",
];

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "supplemental-source-manifest.json"), `${JSON.stringify({ generatedAt, count: rows.length, rows }, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, "supplemental-source-manifest.csv"), csv);
fs.writeFileSync(path.join(outputDir, "补充英文底本与交叉核对资料清单.md"), `${report.join("\n")}\n`);

console.log(JSON.stringify({ generatedAt, count: rows.length, tiers: rows.map((row) => row.evidenceTier) }, null, 2));
