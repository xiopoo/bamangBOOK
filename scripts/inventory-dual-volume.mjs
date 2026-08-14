#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const editorialRoot = path.join(root, "editorial");
const outputRoot = path.join(root, "output");
const reportRoot = path.join(editorialRoot, "shared", "audit");
const generatedAt = new Date().toISOString();

const ignoredDirectories = new Set([".git", ".next", "node_modules", ".cache", ".venv", ".playwright-cli"]);
const sourceRoots = [
  "content/articles/buffett", "content/articles/munger", "content/buffett-quotes", "content/buffettfaq",
  "content/buffettfaq_cnbc", "content/interviews", "content/partnership", "content/companies",
  "content/concepts", "content/munger-archive", "content/munger-originals", "content/poor-charlies-almanack",
  "content/letters", "content/talks", "content/qa", "content/companies-studies",
];
const editorialRoots = ["editorial", "recovery_archive", "reports", "output"];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}
function sha(buffer) { return crypto.createHash("sha256").update(buffer).digest("hex"); }
function normalize(text) {
  return text.replace(/^---[\s\S]*?---\s*/u, "").replace(/\{#[^}]+\}/gu, "")
    .replace(/\s+/gu, " ").trim().toLowerCase();
}
function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function firstTitle(text, fallback) {
  const match = text.match(/^#{1,3}\s+(.+?)\s*$/mu);
  return (match?.[1] ?? fallback).replace(/\{#[^}]+\}/u, "").trim();
}
function personFor(relative, text) {
  const p = relative.toLowerCase();
  const buffettPath = /buffett|berkshire|partnership|buffettfaq|buffett-quotes|letters/.test(p);
  const mungerPath = /munger|poor-charlies|munger-originals|wesco/.test(p);
  const head = text.slice(0, 8000);
  const buffettText = /巴菲特|沃伦[·・.]?巴菲特|Warren Buffett|Berkshire Hathaway/.test(head);
  const mungerText = /芒格|查理[·・.]?芒格|Charlie Munger|Wesco/.test(head);
  if ((buffettPath || buffettText) && (mungerPath || mungerText)) return "both";
  if (buffettPath || buffettText) return "buffett";
  if (mungerPath || mungerText) return "munger";
  return "candidate";
}
function sourceType(relative) {
  if (relative.startsWith("content/")) {
    if (relative.includes("faq")) return "faq";
    if (relative.includes("interviews")) return "interview";
    if (relative.includes("partnership")) return "partnership-letter";
    if (relative.includes("companies")) return "company-case";
    if (relative.includes("concepts")) return "concept";
    if (relative.includes("quotes")) return "quote-card";
    if (relative.includes("talks")) return "talk";
    if (relative.includes("letters")) return "shareholder-letter";
    return "article";
  }
  if (relative.startsWith("editorial/")) return "editorial-asset";
  if (relative.startsWith("recovery_archive/")) return "recovery-reference";
  if (relative.startsWith("output/")) return "generated-output";
  return "other";
}
function versionState(relative) {
  const p = relative.toLowerCase();
  if (/\.bak|fillbak|backup|recovery|archive/.test(p)) return "backup-or-archive";
  if (p.startsWith("editorial/")) {
    if (/出版正文|全卷连续正文|连续生产稿|锁定稿|release|正式发布/.test(relative)) return "editorial-canonical-or-locked";
    return "editorial-working-or-reference";
  }
  if (p.startsWith("output/")) return "generated-output";
  return "source-current";
}
function disposition(relative, person) {
  if (relative.startsWith("content/")) return person === "candidate" ? "candidate-review" : "source-candidate";
  if (relative.startsWith("editorial/")) return "editorial-reference-or-final";
  if (relative.startsWith("recovery_archive/")) return "reference-only";
  if (relative.startsWith("output/")) return "generated-output";
  return "exclude-from-book-scan";
}

const rows = [];
for (const absolute of walk(root).filter((file) => file.endsWith(".md"))) {
  const relative = path.relative(root, absolute).split(path.sep).join("/");
  const buffer = fs.readFileSync(absolute);
  const text = buffer.toString("utf8");
  const person = personFor(relative, text);
  const stat = fs.statSync(absolute);
  rows.push({
    path: relative, title: firstTitle(text, path.basename(relative, ".md")), person,
    year: [...text.matchAll(/\b(19|20)\d{2}\b/gu)].map((m) => Number(m[0])).sort((a, b) => a - b)[0] ?? "",
    sourceType: sourceType(relative), chars: [...text].length, bytes: buffer.length,
    lines: text.split("\n").length, modified: stat.mtime.toISOString(),
    versionState: versionState(relative), disposition: disposition(relative, person),
    exactHash: sha(buffer), canonicalHash: sha(Buffer.from(normalize(text), "utf8")),
  });
}
rows.sort((a, b) => a.path.localeCompare(b.path, "zh-CN"));
const exactGroups = new Map();
const canonicalGroups = new Map();
for (const row of rows) {
  if (!exactGroups.has(row.exactHash)) exactGroups.set(row.exactHash, []);
  exactGroups.get(row.exactHash).push(row.path);
  if (!canonicalGroups.has(row.canonicalHash)) canonicalGroups.set(row.canonicalHash, []);
  canonicalGroups.get(row.canonicalHash).push(row.path);
}
const duplicateGroups = [];
for (const [hash, files] of exactGroups) if (files.length > 1) duplicateGroups.push({ type: "exact", hash, files });
for (const [hash, files] of canonicalGroups) if (files.length > 1 && !duplicateGroups.some((g) => g.hash === hash)) duplicateGroups.push({ type: "normalized", hash, files });

fs.mkdirSync(reportRoot, { recursive: true });
fs.writeFileSync(path.join(reportRoot, "full-markdown-inventory.json"), JSON.stringify({ generatedAt, root, count: rows.length, rows }, null, 2) + "\n");
const headers = ["path", "title", "person", "year", "sourceType", "chars", "bytes", "lines", "modified", "versionState", "disposition", "exactHash", "canonicalHash"];
fs.writeFileSync(path.join(reportRoot, "full-markdown-inventory.csv"), [headers.join(","), ...rows.map((row) => headers.map((h) => csvCell(row[h])).join(","))].join("\n") + "\n");
fs.writeFileSync(path.join(reportRoot, "full-duplicate-groups.json"), JSON.stringify({ generatedAt, groups: duplicateGroups }, null, 2) + "\n");

const counts = (key) => Object.fromEntries([...new Set(rows.map((r) => r[key]))].sort().map((value) => [value, rows.filter((r) => r[key] === value).length]));
const report = [
  "# 全量 Markdown 编目报告", "", `- 生成时间：${generatedAt}`, `- 扫描根目录：\`${root}\``, `- Markdown 文件：${rows.length}`, `- 精确/规范化重复组：${duplicateGroups.length}`, "",
  "## 人物归属统计", "", "```json", JSON.stringify(counts("person"), null, 2), "```", "",
  "## 来源类型统计", "", "```json", JSON.stringify(counts("sourceType"), null, 2), "```", "",
  "## 版本状态统计", "", "```json", JSON.stringify(counts("versionState"), null, 2), "```", "",
  "## 处理去向统计", "", "```json", JSON.stringify(counts("disposition"), null, 2), "```", "",
  "## 处理规则", "", "- `content/` 是原始资料候选层；`editorial/`、`recovery_archive/` 和 `output/` 不作为原始证据直接扩写正文。", "- 精确重复按 SHA-256 归组；规范化重复按去 frontmatter、锚点和空白后的指纹归组。", "- `candidate` 不等于自动纳入，仍需在材料去向表中人工复核。", "- 原始资料未被写入；本报告及清单均写入 `editorial/shared/audit/`。", "",
].join("\n");
fs.writeFileSync(path.join(reportRoot, "全量 Markdown 编目报告.md"), report + "\n");

console.log(JSON.stringify({ generatedAt, files: rows.length, duplicateGroups: duplicateGroups.length, person: counts("person"), disposition: counts("disposition") }, null, 2));
