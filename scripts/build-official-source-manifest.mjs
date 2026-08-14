#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "editorial/shared/source-catalog");
const generatedAt = new Date().toISOString();

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function buffettSourceName(year) {
  if (year <= 1997) return `${year}.html`;
  if (year === 1998) return "1998pdf.pdf";
  if (year === 1999) return "final1999pdf.pdf";
  if (year <= 2002) return `${year}pdf.pdf`;
  return `${year}ltr.pdf`;
}

const rows = [];
const errors = [];

for (let year = 1977; year <= 2024; year += 1) {
  const sourceName = buffettSourceName(year);
  const relative = `content/source-documents/berkshire-shareholder-letters/${sourceName}`;
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    errors.push(`missing Buffett source: ${relative}`);
    continue;
  }
  const buffer = fs.readFileSync(absolute);
  const isPdf = buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  const isHtml = /<html|<body|<pre/iu.test(buffer.subarray(0, 5000).toString("latin1"));
  const expectedFormat = year <= 1997 ? "html" : "pdf";
  if ((expectedFormat === "pdf" && !isPdf) || (expectedFormat === "html" && !isHtml)) {
    errors.push(`unexpected format for ${relative}: expected ${expectedFormat}`);
  }
  rows.push({
    person: "buffett",
    collection: "berkshire-shareholder-letter",
    year,
    format: expectedFormat,
    localPath: relative,
    officialUrl: `https://berkshirehathaway.com/letters/${sourceName}`,
    officialIndexUrl: "https://berkshirehathaway.com/letters/letters.html",
    linkedMarkdown: `content/letters/berkshire_${year}-巴菲特致股东信.md`,
    locatorPath: year >= 1998 && year <= 2003 ? `content/source-documents/berkshire-shareholder-letters/${year}.html` : "",
    bytes: buffer.length,
    sha256: sha256(buffer),
  });
}

{
  const year = 2025;
  const relative = "content/source-documents/berkshire-shareholder-letters/2025-thanksgiving-message.pdf";
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    errors.push(`missing Buffett source: ${relative}`);
  } else {
    const buffer = fs.readFileSync(absolute);
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") errors.push(`unexpected format for ${relative}: expected pdf`);
    rows.push({
      person: "buffett",
      collection: "thanksgiving-shareholder-message",
      year,
      format: "pdf",
      localPath: relative,
      officialUrl: "https://berkshirehathaway.com/news/nov1025.pdf",
      officialIndexUrl: "https://berkshirehathaway.com/news/2025news.html",
      linkedMarkdown: "content/letters/berkshire_2025-巴菲特致股东信.md",
      locatorPath: "",
      bytes: buffer.length,
      sha256: sha256(buffer),
    });
  }
}

for (let year = 1997; year <= 2009; year += 1) {
  const relative = `content/source-pdfs/wesco/wesco-${year}.pdf`;
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    errors.push(`missing Wesco source: ${relative}`);
    continue;
  }
  const buffer = fs.readFileSync(absolute);
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") errors.push(`unexpected format for ${relative}: expected pdf`);
  rows.push({
    person: "munger",
    collection: "wesco-shareholder-letter",
    year,
    format: "pdf",
    localPath: relative,
    officialUrl: `https://www.berkshirehathaway.com/wesco/cm${year}.pdf`,
    officialIndexUrl: "https://www.berkshirehathaway.com/wesco/WescoHome.html",
    linkedMarkdown: `content/munger-originals/wesco-letter-${year}.md`,
    locatorPath: "",
    bytes: buffer.length,
    sha256: sha256(buffer),
  });
}

for (const row of rows) {
  if (!fs.existsSync(path.join(root, row.linkedMarkdown))) errors.push(`missing linked Markdown: ${row.linkedMarkdown}`);
  if (row.locatorPath && !fs.existsSync(path.join(root, row.locatorPath))) errors.push(`missing locator page: ${row.locatorPath}`);
}

if (rows.length !== 62) errors.push(`expected 62 official sources, found ${rows.length}`);
if (errors.length) throw new Error(errors.join("\n"));

const headers = [
  "person", "collection", "year", "format", "localPath", "officialUrl", "officialIndexUrl", "linkedMarkdown",
  "locatorPath", "bytes", "sha256",
];
const csv = `${[headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n")}\n`;
const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);

const report = [
  "# 官方原始底本本地化清单",
  "",
  `- 生成时间：${generatedAt}`,
  `- 已核验本地官方底本：${rows.length} 份`,
  `- 总大小：${(totalBytes / 1024 / 1024).toFixed(2)} MiB`,
  "- 每份文件均记录官方 URL、本地路径、对应 Markdown、字节数和 SHA-256。",
  "",
  "## 巴菲特",
  "",
  "- 伯克希尔官方年度股东信：48 份，1977—2024。",
  "- 2025 年感恩节致股东信：1 份，单列保存，不冒充年度报告股东信。",
  "- 1977—1997：官网 HTML 正文。",
  "- 1998—2024：官网 PDF 正文。1998—2003 的年份入口页另保留为 locatorPath，用来证明官网跳转关系。",
  "- 对应中文稿：`content/letters/berkshire_年份-巴菲特致股东信.md`。",
  "",
  "## 芒格",
  "",
  "- 伯克希尔官网 Wesco 档案：13 份 PDF，1997—2009。",
  "- 对应英文 Markdown：`content/munger-originals/wesco-letter-年份.md`。",
  "",
  "## 仍未本地化",
  "",
  "- 巴菲特：1965—1976 年伯克希尔公司信、全部合伙人信。",
  "- 芒格：完整演讲原文、Wesco 年会逐字稿、Daily Journal 年会逐字稿等仍需逐篇补证。",
  "",
  "## 使用边界",
  "",
  "这些文件用于私人阅读、文本校核和版本证明。伯克希尔官方索引页明确提示股东信含经许可转载的版权材料；本地保存不等于获得公开再出版授权。若以后公开发行，必须另做版权审查。",
  "",
];

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "official-primary-source-manifest.json"), `${JSON.stringify({
  generatedAt,
  count: rows.length,
  totalBytes,
  rows,
}, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, "official-primary-source-manifest.csv"), csv);
fs.writeFileSync(path.join(outputDir, "官方原始底本本地化清单.md"), `${report.join("\n")}\n`);

console.log(JSON.stringify({
  generatedAt,
  count: rows.length,
  buffett: rows.filter((row) => row.person === "buffett").length,
  munger: rows.filter((row) => row.person === "munger").length,
  totalBytes,
}, null, 2));
