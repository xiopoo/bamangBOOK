import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";

const ROOT = process.cwd();
const EDITORIAL = path.join(ROOT, "editorial");
const SHARED = path.join(EDITORIAL, "shared");

const candidateRoots = [
  "content/articles/buffett",
  "content/articles/munger",
  "content/articles/other",
  "content/letters",
  "content/partnership",
  "content/qa",
  "content/talks",
  "content/interviews",
  "content/munger-archive",
  "content/munger-originals",
  "content/models",
  "content/people",
  "content/books",
  "content/poor-charlies-almanack",
  "poor-charlies-almanack",
];

function walk(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, predicate) : predicate(full) ? [full] : [];
  });
}

const rel = (file) => path.relative(ROOT, file).split(path.sep).join("/");
const mdFiles = (dir) => walk(path.join(ROOT, dir), (file) => file.endsWith(".md"));
const namedFiles = (dir, names) => names.map((name) => path.join(ROOT, dir, name));
const sha = (text) => crypto.createHash("sha256").update(text).digest("hex");
const extractYear = (file) => Number(path.basename(file).match(/(?:19|20)\d{2}/)?.[0] || 0);
const byYearThenName = (a, b) => extractYear(a) - extractYear(b) || a.localeCompare(b, "zh-CN");

function readMarkdown(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  let parsed;
  try {
    parsed = matter(raw);
  } catch {
    parsed = { data: {}, content: raw };
  }
  const h1s = [...parsed.content.matchAll(/^#\s+(.+)$/gm)].map((m) => m[1].trim());
  const title = String(parsed.data.title || h1s[0] || path.basename(file, ".md")).trim();
  const normalized = parsed.content.replace(/\s+/g, " ").trim();
  const canonical = normalized
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/www\.\S+/gi, "")
    .replace(/[“”"'‘’`*_#\[\]()（）<>《》【】—–\-:：,，.。!！?？;；、\s]/g, "")
    .toLowerCase();
  return { raw, data: parsed.data || {}, body: parsed.content, h1s, title, normalized, canonical };
}

const candidateFiles = [...new Set(candidateRoots.flatMap(mdFiles))].sort((a, b) => rel(a).localeCompare(rel(b), "zh-CN"));
const records = candidateFiles.map((file) => {
  const doc = readMarkdown(file);
  const externalUrls = [...doc.raw.matchAll(/(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi)].map((m) => m[0]);
  const externalMarkdownLinks = [...doc.raw.matchAll(/!?\[[^\]]*\]\((https?:\/\/[^)]+)\)/gi)].map((m) => m[1]);
  const internalMarkdownLinks = [...doc.raw.matchAll(/!?\[[^\]]*\]\((?!https?:\/\/|mailto:|\/\/)([^)]+)\)/gi)].map((m) => m[1]);
  const imageRefs = [...doc.raw.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]);
  const footnoteDefs = (doc.body.match(/^\[\^[^\]]+\]:/gm) || []).length;
  const footnoteRefs = (doc.body.match(/\[\^[^\]]+\](?!:)/g) || []).length;
  const tableRows = doc.body.split(/\r?\n/).filter((line) => /^\s*\|.*\|\s*$/.test(line)).length;
  const replacementChars = (doc.raw.match(/\uFFFD/g) || []).length;
  const sourceFields = ["source", "sourceUrl", "original", "author", "translator", "date", "year"]
    .filter((key) => doc.data[key] !== undefined && doc.data[key] !== "");
  return {
    path: rel(file),
    root: candidateRoots.find((root) => rel(file) === root || rel(file).startsWith(`${root}/`)) || "",
    title: doc.title,
    chars: doc.normalized.length,
    bytes: Buffer.byteLength(doc.raw),
    lines: doc.raw.split(/\r?\n/).length,
    h1Count: doc.h1s.length,
    headings: (doc.body.match(/^#{1,6}\s+/gm) || []).length,
    tables: tableRows,
    footnoteDefs,
    footnoteRefs,
    images: imageRefs.length,
    externalUrls: externalUrls.length,
    externalMarkdownLinks: externalMarkdownLinks.length,
    internalMarkdownLinks: internalMarkdownLinks.length,
    replacementChars,
    frontmatter: Object.keys(doc.data).length > 0,
    sourceFields: sourceFields.join("|"),
    exactHash: sha(doc.normalized),
    canonicalHash: sha(doc.canonical),
    empty: doc.normalized.length === 0,
    veryShort: doc.normalized.length > 0 && doc.normalized.length < 800,
    veryLong: doc.normalized.length > 120000,
    sourceRisk: /(?:转载|译自|来源|原文|编译|摘自)/.test(doc.raw) && sourceFields.length === 0,
    externalModelSource: /^content\/models\//.test(rel(file)) && /mungermodels\.com/i.test(doc.raw),
  };
});

function groupDuplicates(key, minimumLength = 1) {
  const groups = new Map();
  for (const record of records) {
    if (record.chars < minimumLength) continue;
    const value = record[key];
    const list = groups.get(value) || [];
    list.push(record.path);
    groups.set(value, list);
  }
  return [...groups.values()].filter((list) => list.length > 1).sort((a, b) => b.length - a.length || a[0].localeCompare(b[0], "zh-CN"));
}

const exactDuplicateGroups = groupDuplicates("exactHash");
const canonicalDuplicateGroups = groupDuplicates("canonicalHash", 200);
const titleGroupsMap = new Map();
for (const record of records) {
  const key = record.title.replace(/\s+/g, "").replace(/[：:（）()《》\-_]/g, "").toLowerCase();
  const list = titleGroupsMap.get(key) || [];
  list.push(record.path);
  titleGroupsMap.set(key, list);
}
const duplicateTitleGroups = [...titleGroupsMap.values()].filter((list) => list.length > 1);

function sanitizeBuffett(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => {
      const text = line.trim();
      if (/^(?:https?:\/\/|www\.)\S+$/i.test(text)) return false;
      if (/^(?:来源|原文链接|参考链接|参考资料|图片来源|视频来源|网址|链接|source)\s*[:：].*(?:https?:\/\/|www\.)/i.test(text)) return false;
      if (/^(?:点击查看|点击阅读|扫码|关注公众号|相关阅读)\b/i.test(text)) return false;
      return true;
    })
    .join("\n")
    .replace(/\[(?:https?:\/\/|www\.)[^\]]+\]\([^)]*\)/gi, "")
    .replace(/https?:\/\/[^\s)>\]]+/gi, "")
    .replace(/www\.[a-z0-9.-]+\.(?:com|org|net|gov|edu|info|biz|cn|co)(?:\/[a-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?/gi, "");
}

function sanitizeMunger(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !/mungermodels\.com|Munger Models|邦比快跑.*思维模型|思维模型.*专题站/i.test(line))
    .join("\n");
}

const introArticleNames = new Set(["巴菲特青春时代.md", "巴菲特：500_亿美元的决定.md", "伯克希尔_50_周年：过去、现在和未来.md"]);
const earlyArticleNames = new Set(["我最看好的股票：GEICO_保险_1951.md", "我最看好的股票：西部保险_1953.md", "我最看好的股票：人寿保险_1957.md", "我最看好的股票：油气资产管理公司_1957.md"]);
const duplicateCompilationNames = new Set(["巴菲特合伙契约_1956.md", "巴菲特合伙公司时代.md", "巴菲特估值逻辑.md", "巴菲特推荐过的书籍.md"]);
const allBuffettArticles = mdFiles("content/articles/buffett");
const partnershipAgreement = path.join(ROOT, "content/partnership/partnership_1956-有限合伙协议.md");
const partnershipLetters = mdFiles("content/partnership").filter((file) => file !== partnershipAgreement);
const supplementalArticles = allBuffettArticles
  .filter((file) => !introArticleNames.has(path.basename(file)))
  .filter((file) => !earlyArticleNames.has(path.basename(file)))
  .filter((file) => !duplicateCompilationNames.has(path.basename(file)));

const buffettVolumes = [
  ["卷01", [path.join(ROOT, "content/people/沃伦·巴菲特.md"), ...namedFiles("content/articles/buffett", [...introArticleNames])]],
  ["卷02", [...namedFiles("content/articles/buffett", ["我最看好的股票：GEICO_保险_1951.md", "我最看好的股票：西部保险_1953.md"]), partnershipAgreement, ...namedFiles("content/articles/buffett", ["我最看好的股票：人寿保险_1957.md", "我最看好的股票：油气资产管理公司_1957.md"]), ...partnershipLetters]],
  ["卷03", mdFiles("content/letters").sort(byYearThenName)],
  ["卷04", mdFiles("content/qa").filter((file) => !/Wesco|发布会/.test(path.basename(file))).sort(byYearThenName)],
  ["卷05", supplementalArticles],
  ["卷06", mdFiles("content/talks").filter((file) => /巴菲特/.test(path.basename(file))).sort(byYearThenName)],
  ["卷07", mdFiles("content/interviews").filter((file) => /巴菲特/.test(path.basename(file)) && !/苏珊/.test(path.basename(file))).sort(byYearThenName)],
];

const almanackNames = [
  "poor-charlies-almanack-forewords.md", "poor-charlies-almanack-chapter-one.md",
  "poor-charlies-almanack-chapter-two.md", "poor-charlies-almanack-chapter-three.md",
  ...Array.from({ length: 11 }, (_, i) => `poor-charlies-almanack-talk-${["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"][i]}.md`),
  "poor-charlies-almanack-recommended-reading.md",
];
const almanackFiles = namedFiles("poor-charlies-almanack", almanackNames);
const classicRecordingDuplicates = new Set([
  "harvard-1986-misery.md", "usc-1994-worldly-wisdom.md", "psychology-of-human-misjudgment-1995.md",
  "stanford-1996-worldly-wisdom.md", "harvard-law-1998-multidisciplinary.md",
  "ucsb-2003-academic-economics.md", "usc-law-2007.md",
]);
const recordingFiles = mdFiles("content/munger-archive/recordings");
const dailyJournalFiles = [
  path.join(ROOT, "content/munger-archive/daily-journal.md"),
  path.join(ROOT, "content/talks/芒格：DJ_年会_2013.md"),
  ...recordingFiles.filter((file) => /^daily-journal-\d{4}/.test(path.basename(file))),
];
const annualMeetingGuide = path.join(ROOT, "content/munger-archive/recordings/berkshire-hathaway-annual-meetings.md");
const dialogueFiles = [
  ...recordingFiles
    .filter((file) => !/^daily-journal-/.test(path.basename(file)))
    .filter((file) => !classicRecordingDuplicates.has(path.basename(file)))
    .filter((file) => file !== annualMeetingGuide),
  annualMeetingGuide,
];
const modelFiles = mdFiles("content/models");
const modelData = (file) => readMarkdown(file).data;
const modelsFor = (...disciplines) => modelFiles.filter((file) => disciplines.includes(modelData(file).discipline));
const mungerVolumes = [
  ["卷01", namedFiles("", [
    "content/people/查理·芒格.md", "content/munger-archive/life.md", "content/munger-archive/family.md",
    "content/articles/munger/查理芒格：伯克希尔的总设计师.md", "content/munger-archive/companies.md",
    "content/munger-archive/investing-philosophy.md", "content/munger-archive/architecture.md",
    "content/munger-archive/philanthropy.md", "content/munger-archive/books.md",
  ])],
  ["卷02", almanackFiles],
  ["卷03", mdFiles("content/qa").filter((file) => /^Wesco_股东大会_/.test(path.basename(file)))],
  ["卷04", dailyJournalFiles],
  ["卷05", dialogueFiles],
  ["卷06", modelsFor("meta")],
  ["卷07", modelsFor("math")],
  ["卷08", modelsFor("psych")],
  ["卷09", modelsFor("econ", "mgmt")],
  ["卷10", modelsFor("accounting", "invest")],
  ["卷11", modelsFor("physics", "bio", "eng", "complex")],
  ["卷12", modelsFor("history", "law", "decision")],
  ["卷13", mdFiles("content/munger-archive/quotes")],
];

function actualInclusion(volumes, sanitizer) {
  const seen = new Set();
  const included = [];
  const skipped = [];
  for (const [volume, files] of volumes) {
    for (const file of files) {
      if (!fs.existsSync(file)) {
        skipped.push({ volume, path: rel(file), reason: "missing" });
        continue;
      }
      const doc = readMarkdown(file);
      const normalized = sanitizer(doc.body).replace(/\s+/g, " ").trim();
      const hash = sha(normalized);
      if (!normalized) {
        skipped.push({ volume, path: rel(file), reason: "empty-after-sanitize" });
      } else if (seen.has(hash)) {
        skipped.push({ volume, path: rel(file), reason: "exact-duplicate-after-sanitize" });
      } else {
        seen.add(hash);
        included.push({ volume, path: rel(file), title: doc.title, chars: normalized.length, hash });
      }
    }
  }
  return { included, skipped };
}

const buffett = actualInclusion(buffettVolumes, sanitizeBuffett);
const munger = actualInclusion(mungerVolumes, sanitizeMunger);
const includedBy = new Map();
for (const item of buffett.included) includedBy.set(item.path, [ ...(includedBy.get(item.path) || []), "buffett" ]);
for (const item of munger.included) includedBy.set(item.path, [ ...(includedBy.get(item.path) || []), "munger" ]);
for (const record of records) record.includedBy = (includedBy.get(record.path) || []).join("|");

async function inspectEpub(file) {
  if (!fs.existsSync(file)) return { exists: false, path: rel(file) };
  const names = execFileSync("unzip", ["-Z1", file], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 })
    .split(/\r?\n/)
    .filter(Boolean);
  const xhtmlNames = names.filter((name) => /\.(?:xhtml|html)$/i.test(name));
  let externalLinks = 0;
  let internalLinks = 0;
  let emptyLinks = 0;
  let remoteImages = 0;
  let duplicateIds = 0;
  let chapterDocs = 0;
  const documents = new Map();
  for (const name of xhtmlNames) {
    const text = execFileSync("unzip", ["-p", file, name], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
    if (!text) continue;
    if (/\/chapter-\d+\.xhtml$/i.test(name)) chapterDocs += 1;
    const hrefs = [...text.matchAll(/\bhref\s*=\s*["']([^"']*)["']/gi)].map((m) => m[1]);
    externalLinks += hrefs.filter((href) => /^(?:https?:|mailto:|\/\/)/i.test(href)).length;
    internalLinks += hrefs.filter((href) => href && !/^(?:https?:|mailto:|\/\/)/i.test(href)).length;
    emptyLinks += hrefs.filter((href) => !href).length;
    remoteImages += [...text.matchAll(/\bsrc\s*=\s*["']([^"']+)["']/gi)].filter((m) => /^(?:https?:|\/\/)/i.test(m[1])).length;
    const ids = [...text.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
    duplicateIds += ids.length - new Set(ids).size;
    documents.set(name, { hrefs, ids: new Set(ids) });
  }
  let unresolvedInternalLinks = 0;
  for (const [name, document] of documents) {
    for (const href of document.hrefs) {
      if (!href || /^(?:https?:|mailto:|\/\/)/i.test(href)) continue;
      const [filePart, fragment = ""] = href.split("#", 2);
      const target = filePart
        ? path.posix.normalize(path.posix.join(path.posix.dirname(name), decodeURIComponent(filePart)))
        : name;
      if (!names.includes(target)) {
        unresolvedInternalLinks += 1;
      } else if (fragment && documents.has(target) && !documents.get(target).ids.has(decodeURIComponent(fragment))) {
        unresolvedInternalLinks += 1;
      }
    }
  }
  return {
    exists: true,
    path: rel(file),
    bytes: fs.statSync(file).size,
    entries: names.length,
    xhtmlDocs: xhtmlNames.length,
    chapterDocs,
    externalLinks,
    internalLinks,
    emptyLinks,
    remoteImages,
    duplicateIds,
    unresolvedInternalLinks,
  };
}

const epub = {
  buffett: await inspectEpub(path.join(ROOT, "output/ebook/巴菲特文集_1956-2025.epub")),
  munger: await inspectEpub(path.join(ROOT, "output/ebook/芒格文集_1924-2023.epub")),
};

const summarize = (list) => ({
  files: list.length,
  chars: list.reduce((sum, item) => sum + item.chars, 0),
});
const roots = Object.fromEntries(candidateRoots.map((root) => {
  const list = records.filter((record) => record.root === root);
  return [root, {
    files: list.length,
    chars: list.reduce((sum, record) => sum + record.chars, 0),
    externalUrls: list.reduce((sum, record) => sum + record.externalUrls, 0),
    images: list.reduce((sum, record) => sum + record.images, 0),
  }];
}));
const overlap = [...includedBy.entries()].filter(([, books]) => books.length > 1).map(([file]) => file);
const result = {
  generatedAt: new Date().toISOString(),
  candidateRoots,
  totals: {
    ...summarize(records),
    bytes: records.reduce((sum, record) => sum + record.bytes, 0),
    externalUrls: records.reduce((sum, record) => sum + record.externalUrls, 0),
    filesWithExternalUrls: records.filter((record) => record.externalUrls > 0).length,
    images: records.reduce((sum, record) => sum + record.images, 0),
    tables: records.reduce((sum, record) => sum + record.tables, 0),
    footnoteDefs: records.reduce((sum, record) => sum + record.footnoteDefs, 0),
    footnoteRefs: records.reduce((sum, record) => sum + record.footnoteRefs, 0),
    empty: records.filter((record) => record.empty).length,
    veryShort: records.filter((record) => record.veryShort).length,
    veryLong: records.filter((record) => record.veryLong).length,
    noFrontmatter: records.filter((record) => !record.frontmatter).length,
    noSourceFields: records.filter((record) => !record.sourceFields).length,
    sourceRisk: records.filter((record) => record.sourceRisk).length,
    replacementChars: records.reduce((sum, record) => sum + record.replacementChars, 0),
    externalModelSourceFiles: records.filter((record) => record.externalModelSource).length,
  },
  roots,
  actualBuild: {
    buffett: { ...summarize(buffett.included), skipped: buffett.skipped.length },
    munger: { ...summarize(munger.included), skipped: munger.skipped.length },
    overlapFiles: overlap,
  },
  duplicateSummary: {
    exactGroups: exactDuplicateGroups.length,
    exactFiles: exactDuplicateGroups.flat().length,
    canonicalGroups: canonicalDuplicateGroups.length,
    canonicalFiles: canonicalDuplicateGroups.flat().length,
    duplicateTitleGroups: duplicateTitleGroups.length,
    duplicateTitleFiles: duplicateTitleGroups.flat().length,
  },
  epub,
};

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function writeCsv(file, rows) {
  if (!rows.length) return fs.writeFileSync(file, "");
  const keys = Object.keys(rows[0]);
  fs.writeFileSync(file, [keys.join(","), ...rows.map((row) => keys.map((key) => csvEscape(row[key])).join(","))].join("\n"));
}

fs.mkdirSync(SHARED, { recursive: true });
fs.mkdirSync(path.join(EDITORIAL, "buffett/audit"), { recursive: true });
fs.mkdirSync(path.join(EDITORIAL, "munger/audit"), { recursive: true });
fs.writeFileSync(path.join(SHARED, "stage1-audit-data.json"), `${JSON.stringify(result, null, 2)}\n`);
writeCsv(path.join(SHARED, "candidate-content-inventory.csv"), records);
writeCsv(path.join(EDITORIAL, "buffett/audit/actual-build-scope.csv"), buffett.included);
writeCsv(path.join(EDITORIAL, "munger/audit/actual-build-scope.csv"), munger.included);
writeCsv(path.join(SHARED, "build-skipped-files.csv"), [
  ...buffett.skipped.map((item) => ({ book: "buffett", ...item })),
  ...munger.skipped.map((item) => ({ book: "munger", ...item })),
]);
writeCsv(path.join(SHARED, "duplicate-groups.csv"), [
  ...exactDuplicateGroups.flatMap((files, index) => files.map((file) => ({ type: "exact", group: `E${index + 1}`, file }))),
  ...canonicalDuplicateGroups.flatMap((files, index) => files.map((file) => ({ type: "canonical", group: `C${index + 1}`, file }))),
  ...duplicateTitleGroups.flatMap((files, index) => files.map((file) => ({ type: "title", group: `T${index + 1}`, file }))),
]);

console.log(JSON.stringify(result, null, 2));
