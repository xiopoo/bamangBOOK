import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "editorial", "theme-manifest");
fs.mkdirSync(OUT, { recursive: true });

function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function hashBody(file) {
  const parsed = matter(read(file));
  return crypto.createHash("sha256").update(parsed.content.replace(/\s+/g, " ").trim()).digest("hex");
}
function walk(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(full, entry.name);
    return entry.isDirectory() ? walk(path.relative(ROOT, p)) : entry.name.endsWith(".md") ? [path.relative(ROOT, p)] : [];
  });
}
function reportSources(file) {
  const text = read(file);
  const out = [];
  for (const match of text.matchAll(/（((?:content|poor-charlies-almanack)\/[^）]+\.md)）/g)) out.push(match[1]);
  return out;
}
function title(file) {
  const parsed = matter(read(file));
  if (parsed.data?.title) return String(parsed.data.title).trim();
  const h = parsed.content.match(/^#\s+(.+)$/m);
  return h ? h[1].replace(/\*\*/g, "").trim() : path.basename(file, ".md");
}

const csv = read("editorial/shared/内容去向与覆盖表_700篇.csv");
function parseCsvLine(line) {
  const cells = [];
  let cell = "", quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') { cell += '"'; i += 1; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { cells.push(cell); cell = ""; }
    else cell += ch;
  }
  cells.push(cell);
  return cells;
}
const csvLines = csv.trim().split(/\r?\n/);
const headers = parseCsvLine(csvLines[0]);
const coverage = new Map();
for (const line of csvLines.slice(1)) {
  const cells = parseCsvLine(line);
  const row = Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  if (row["文件路径"]) coverage.set(row["文件路径"], row);
}

const duplicateRows = read("editorial/shared/duplicate-groups.csv").trim().split(/\r?\n/).slice(1)
  .map((line) => parseCsvLine(line)).filter((x) => x.length >= 3)
  .filter((x) => x[0] === "exact").map((x) => ({ group: x[1], file: x[2] }));
const exactGroups = new Map();
for (const row of duplicateRows) {
  if (!exactGroups.has(row.group)) exactGroups.set(row.group, []);
  exactGroups.get(row.group).push(row.file);
}
const duplicateToPrimary = new Map();
for (const files of exactGroups.values()) {
  const primary = [...files].sort((a, b) => {
    const score = (f) => f.startsWith("poor-charlies-almanack/") ? 0 : f.startsWith("content/models/") ? 1 : 2;
    return score(a) - score(b) || a.localeCompare(b, "zh-CN");
  })[0];
  for (const file of files) duplicateToPrimary.set(file, primary);
}

const buffettFiles = [...new Set(reportSources("output/ebook/巴菲特文集_编目报告.md"))];
const mungerReportFiles = reportSources("output/ebook/芒格文集_编目报告.md");
const mungerFiles = [...new Set([...mungerReportFiles, ...walk("content/models")])];

const buffettThemes = [
  ["01", "所有者是谁", /^buffett-ch-01$/],
  ["02", "企业值多少钱", /^buffett-ch-(02|03)$/],
  ["03", "什么是好企业", /^buffett-ch-(05|06|07)$/],
  ["04", "资本应该怎样配置", /^buffett-ch-(10|11|12)$/],
  ["05", "谁来经营企业", /^buffett-ch-(08|09)$/],
  ["06", "风险与错误", /^buffett-ch-(04|13|14)$/],
  ["07", "长期复利", /^buffett-ch-15$/],
  ["08", "综合现场与年度索引", /^buffett-(?:app|index)/],
];
const mungerThemes = [
  ["01", "格栅是什么", /^munger-ch-(01|02|03)$/],
  ["02", "数量与概率", /^munger-ch-04$/],
  ["03", "逆向与反证", /^munger-ch-(05|06)$/],
  ["04", "人类为什么误判", /^munger-ch-(07|08|09|10)$/],
  ["05", "商业判断", /^munger-ch-11$/],
  ["06", "投资判断", /^munger-ch-(12|13)$/],
  ["07", "系统与现实", /^munger-ch-02$/],
  ["08", "品格与人生", /^munger-ch-(14|15|16)$/],
  ["09", "综合现场与原始场合索引", /^munger-(?:app|index)/],
];
function chooseTheme(file, person) {
  if (person === "buffett" && /^(content\/qa\/|content\/interviews\/)/.test(file)) {
    return { id: "08", name: "综合现场与年度索引", basis: "document-integrity" };
  }
  if (person === "munger" && /^(content\/qa\/Wesco_|content\/munger-archive\/recordings\/daily-journal-|content\/munger-archive\/daily-journal\.md)/.test(file)) {
    return { id: "09", name: "综合现场与原始场合索引", basis: "document-integrity" };
  }
  const row = coverage.get(file);
  const target = person === "buffett" ? buffettThemes : mungerThemes;
  const label = row?.["对应篇章"] || "";
  for (const [id, name, pattern] of target) if (pattern.test(label)) return { id, name, basis: "coverage" };
  const lower = `${file} ${title(file)} ${read(file)}`;
  if (person === "buffett") {
    const groups = [
      ["01", "所有者是谁", /所有者|股东|合伙人|股票是企业|所有权/g],
      ["02", "企业值多少钱", /内在价值|估值|会计|现金流|价格|所有者收益/g],
      ["03", "什么是好企业", /护城河|定价权|品牌|竞争优势|喜诗|GEICO|企业质量/g],
      ["04", "资本应该怎样配置", /收购|回购|分红|资本配置|浮存金|保险|债务/g],
      ["05", "谁来经营企业", /经理|管理层|激励|文化|声誉|接班|授权/g],
      ["06", "风险与错误", /风险|损失|危机|恐慌|杠杆|流动性|错误/g],
      ["07", "长期复利", /复利|长期|耐心|时间尺度|继任|留存收益/g],
    ];
    const scores = groups.map(([id, name, pattern]) => [id, name, (lower.match(pattern) || []).length]);
    scores.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
    return { id: scores[0][0], name: scores[0][1], basis: "keyword-review" };
  }
  if (/概率|数学|算术|贝叶斯|复利|数量/.test(lower)) return { id: "02", name: "数量与概率", basis: "fallback" };
  if (/逆向|反证|清单|失败|否证/.test(lower)) return { id: "03", name: "逆向与反证", basis: "fallback" };
  if (/心理|误判|倾向|从众|权威/.test(lower)) return { id: "04", name: "人类为什么误判", basis: "fallback" };
  if (/会计|护城河|激励|商业|竞争|定价/.test(lower)) return { id: "05", name: "商业判断", basis: "fallback" };
  if (/品格|人生|学习|独立|谦逊|历史/.test(lower)) return { id: "08", name: "品格与人生", basis: "fallback" };
  return { id: "01", name: "格栅是什么", basis: "fallback" };
}

function build(files, person) {
  const entries = [];
  const seen = new Map();
  for (const file of files) {
    if (!fs.existsSync(path.join(ROOT, file))) continue;
    const primary = duplicateToPrimary.get(file) || file;
    const hash = hashBody(file);
    if (seen.has(hash)) {
      entries.push({ file, primary: seen.get(hash).file, status: "duplicate", duplicateType: "normalized-hash", title: title(file), hash });
      continue;
    }
    const theme = chooseTheme(file, person);
    const entry = { order: 0, file, primary: file, status: "primary", title: title(file), year: Number((file.match(/(?:19|20)\d{2}/) || [0])[0]), hash, themeId: theme.id, theme: theme.name, mappingBasis: theme.basis };
    seen.set(hash, entry);
    entries.push(entry);
  }
  const primaries = entries.filter((x) => x.status === "primary");
  primaries.sort((a, b) => a.themeId.localeCompare(b.themeId) || (a.year || 9999) - (b.year || 9999) || a.title.localeCompare(b.title, "zh-CN"));
  primaries.forEach((x, i) => { x.order = i + 1; });
  return { person, generatedAt: new Date().toISOString(), sourceCount: files.length, primaryCount: primaries.length, duplicateCount: entries.length - primaries.length, entries };
}

for (const [person, files] of [["buffett", buffettFiles], ["munger", mungerFiles]]) {
  const result = build(files, person);
  fs.writeFileSync(path.join(OUT, `${person}-theme-order.json`), JSON.stringify(result, null, 2));
  const rows = result.entries.map((x) => [x.order, x.status, x.themeId || "", x.theme || "", x.year || "", x.title, x.file, x.primary, x.hash, x.mappingBasis || ""].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","));
  fs.writeFileSync(path.join(OUT, `${person}-theme-order.csv`), ["order,status,theme_id,theme,year,title,file,primary,hash,mapping_basis", ...rows].join("\n"));
  console.log(`${person}: sources=${result.sourceCount} primary=${result.primaryCount} duplicates=${result.duplicateCount}`);
}
