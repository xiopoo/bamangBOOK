import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalogDir = join(root, "editorial", "shared", "source-catalog");
const officialManifestPath = join(catalogDir, "official-primary-source-manifest.json");

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function writeCsv(path, rows) {
  const headers = Object.keys(rows[0] || {});
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");
  writeFileSync(path, `${body}\n`);
}

function titleFor(row) {
  if (row.collection === "thanksgiving-shareholder-message") return `${row.year} 年感恩节致股东信`;
  if (row.collection === "berkshire-shareholder-letter") return `${row.year} 年致伯克希尔股东信`;
  if (row.collection === "wesco-shareholder-letter") return `Wesco Financial Corporation Letter to Shareholders ${row.year}`;
  return `${row.year} 年文献`;
}

function verifyAssembly(outputPath, records) {
  const manuscript = readFileSync(outputPath, "utf8");
  const checks = records.map((record) => {
    const beginMarker = `<!-- SOURCE-BEGIN ${record.linkedMarkdown} ${record.linkedMarkdownSha256} -->\n`;
    const endMarker = `\n<!-- SOURCE-END ${record.linkedMarkdown} -->`;
    const begin = manuscript.indexOf(beginMarker);
    const secondBegin = begin < 0 ? -1 : manuscript.indexOf(beginMarker, begin + beginMarker.length);
    const end = begin < 0 ? -1 : manuscript.indexOf(endMarker, begin + beginMarker.length);
    const extracted = begin >= 0 && end >= 0
      ? manuscript.slice(begin + beginMarker.length, end)
      : "";
    const extractedSha256 = extracted ? sha256(extracted) : "";
    return {
      linkedMarkdown: record.linkedMarkdown,
      markerFoundOnce: begin >= 0 && secondBegin < 0,
      endMarkerFound: end >= 0,
      extractedBytes: Buffer.byteLength(extracted, "utf8"),
      expectedBytes: record.linkedMarkdownBytes,
      extractedSha256,
      expectedSha256: record.linkedMarkdownSha256,
      pass: begin >= 0
        && secondBegin < 0
        && end >= 0
        && Buffer.byteLength(extracted, "utf8") === record.linkedMarkdownBytes
        && extractedSha256 === record.linkedMarkdownSha256,
    };
  });
  return {
    checked: checks.length,
    passed: checks.filter((check) => check.pass).length,
    allPassed: checks.every((check) => check.pass),
    checks,
  };
}

function partTitle(row) {
  if (row.collection === "thanksgiving-shareholder-message") return "第二编　感恩节股东寄语";
  if (row.collection === "berkshire-shareholder-letter") return "第一编　伯克希尔年度股东信";
  return "第一编　西科金融致股东信（英文底本）";
}

function assemble(person, sourceRows) {
  const isBuffett = person === "buffett";
  const bookTitle = isBuffett ? "巴菲特文献全集" : "芒格文献全集";
  const outputPath = join(
    root,
    "editorial",
    person,
    "manuscript",
    `${bookTitle}_官方底本工作稿.md`,
  );

  const rows = [...sourceRows]
    .filter((row) => row.person === person)
    .sort((a, b) => Number(a.year) - Number(b.year) || a.linkedMarkdown.localeCompare(b.linkedMarkdown, "zh-CN"));

  if (!rows.length) throw new Error(`No official rows found for ${person}`);

  const seen = new Set();
  const records = rows.map((row, index) => {
    if (!row.linkedMarkdown || !existsSync(join(root, row.linkedMarkdown))) {
      throw new Error(`Missing linked Markdown: ${row.linkedMarkdown || "<empty>"}`);
    }
    if (!row.localPath || !existsSync(join(root, row.localPath))) {
      throw new Error(`Missing local official source: ${row.localPath || "<empty>"}`);
    }
    if (seen.has(row.linkedMarkdown)) throw new Error(`Duplicate linked Markdown: ${row.linkedMarkdown}`);
    seen.add(row.linkedMarkdown);

    const sourceText = readFileSync(join(root, row.linkedMarkdown), "utf8");
    if (!sourceText.endsWith("\n")) {
      throw new Error(`Source Markdown must end with a newline for lossless assembly: ${row.linkedMarkdown}`);
    }
    return {
      person,
      sequence: index + 1,
      year: Number(row.year),
      collection: row.collection,
      title: titleFor(row),
      linkedMarkdown: row.linkedMarkdown,
      linkedMarkdownBytes: Buffer.byteLength(sourceText, "utf8"),
      linkedMarkdownSha256: sha256(sourceText),
      officialSourcePath: row.localPath,
      officialSourceUrl: row.officialUrl,
      officialSourceSha256: row.sha256,
      sourceText,
      part: partTitle(row),
    };
  });

  const parts = [];
  for (const record of records) {
    let part = parts.find((item) => item.title === record.part);
    if (!part) {
      part = { title: record.part, records: [] };
      parts.push(part);
    }
    part.records.push(record);
  }

  const toc = parts.flatMap((part) => [
    `- ${part.title}`,
    ...part.records.map((record) => `  - ${record.year}　${record.title}`),
  ]).join("\n");

  const sections = parts.map((part) => {
    const documents = part.records.map((record) => [
      `## ${record.title}`,
      "",
      "> 文献元数据",
      `> - 年份：${record.year}`,
      `> - 类型：${record.collection}`,
      `> - 本地正文底稿：\`${record.linkedMarkdown}\``,
      `> - 本地官方底本：\`${record.officialSourcePath}\``,
      `> - 官方来源：${record.officialSourceUrl}`,
      `> - 正文底稿 SHA-256：\`${record.linkedMarkdownSha256}\``,
      "",
      `<!-- SOURCE-BEGIN ${record.linkedMarkdown} ${record.linkedMarkdownSha256} -->`,
      record.sourceText,
      `<!-- SOURCE-END ${record.linkedMarkdown} -->`,
    ].join("\n"));
    return [`# ${part.title}`, "", documents.join("\n\n")].join("\n");
  }).join("\n\n");

  const scopeNote = isBuffett
    ? "本工作稿只装配已经对应到伯克希尔官方底本的 1977—2024 年年度股东信，以及 2025 年感恩节致股东信。早期公司信、合伙人信、演讲、访谈和问答尚未并入。"
    : "本工作稿只装配已经对应到伯克希尔官方西科金融 PDF 的 1997—2009 年英文原文。它是底本工作稿，不是中文阅读定稿；演讲、访谈、问答及其他文献尚未并入。";

  const manuscript = [
    `# ${bookTitle}`,
    "",
    "> 编者说明（工作稿）",
    `> ${scopeNote}`,
    "> 本文件由脚本按来源清单机械装配。各文献正文保持对应 Markdown 原文，不增写导读、过渡、总结或解释。每篇正文前只增加文献元数据。",
    "",
    "## 目录",
    "",
    toc,
    "",
    sections,
    "",
  ].join("\n");

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, manuscript);

  const fidelityAudit = verifyAssembly(outputPath, records);
  if (!fidelityAudit.allPassed) {
    const failed = fidelityAudit.checks.filter((check) => !check.pass).map((check) => check.linkedMarkdown);
    throw new Error(`Source fidelity audit failed for ${person}: ${failed.join(", ")}`);
  }

  return {
    person,
    bookTitle,
    outputPath: outputPath.slice(root.length + 1),
    count: records.length,
    years: `${records[0].year}—${records.at(-1).year}`,
    bytes: Buffer.byteLength(manuscript, "utf8"),
    fidelityAudit: {
      checked: fidelityAudit.checked,
      passed: fidelityAudit.passed,
      allPassed: fidelityAudit.allPassed,
    },
    records: records.map(({ sourceText: _sourceText, part: _part, ...record }) => ({
      ...record,
      workingManuscript: outputPath.slice(root.length + 1),
    })),
  };
}

const officialManifest = JSON.parse(readFileSync(officialManifestPath, "utf8"));
const books = [
  assemble("buffett", officialManifest.rows),
  assemble("munger", officialManifest.rows),
];

const assemblyRows = books.flatMap((book) => book.records).map((record) => ({
  person: record.person,
  sequence: record.sequence,
  year: record.year,
  collection: record.collection,
  title: record.title,
  linkedMarkdown: record.linkedMarkdown,
  linkedMarkdownBytes: record.linkedMarkdownBytes,
  linkedMarkdownSha256: record.linkedMarkdownSha256,
  officialSourcePath: record.officialSourcePath,
  officialSourceUrl: record.officialSourceUrl,
  officialSourceSha256: record.officialSourceSha256,
  workingManuscript: record.workingManuscript,
}));

const generatedAt = new Date().toISOString();
const jsonPath = join(catalogDir, "official-core-working-manuscript-manifest.json");
const csvPath = join(catalogDir, "official-core-working-manuscript-manifest.csv");
const reportPath = join(catalogDir, "首批官方底本文献装配报告.md");

writeFileSync(jsonPath, `${JSON.stringify({ generatedAt, books: books.map(({ records: _records, ...book }) => book), count: assemblyRows.length, rows: assemblyRows }, null, 2)}\n`);
writeCsv(csvPath, assemblyRows);

const report = [
  "# 首批官方底本文献装配报告",
  "",
  `- 生成时间：${generatedAt}`,
  `- 装配文献：${assemblyRows.length} 篇`,
  `- 巴菲特卷工作稿：${books[0].count} 篇，${books[0].years}，\`${books[0].outputPath}\``,
  `- 芒格卷工作稿：${books[1].count} 篇，${books[1].years}，\`${books[1].outputPath}\``,
  `- 正文逐篇哈希复核：${books.reduce((sum, book) => sum + book.fidelityAudit.passed, 0)}/${assemblyRows.length} 通过`,
  "",
  "## 装配边界",
  "",
  "- 只使用《官方原始底本本地化清单》中已经建立一对一对应关系的 Markdown。",
  "- 巴菲特卷本批为中文工作稿；芒格卷本批为英文官方底本工作稿，不自动翻译。",
  "- 每篇正文以来源标记包围并记录 SHA-256；装配脚本不改写正文。",
  "- 合伙人信虽然已有 29 封完成英文页码定位，但尚未完成逐段中英校核，因此不混入本批工作稿。",
  "- 其他演讲、问答、访谈、文章和来源存疑材料继续留在候选总表，不因本次装配获得正式收录资格。",
  "",
  "## 输出",
  "",
  `- \`${books[0].outputPath}\``,
  `- \`${books[1].outputPath}\``,
  "- `editorial/shared/source-catalog/official-core-working-manuscript-manifest.csv`",
  "- `editorial/shared/source-catalog/official-core-working-manuscript-manifest.json`",
  "",
].join("\n");

writeFileSync(reportPath, report);

console.log(JSON.stringify({
  generatedAt,
  count: assemblyRows.length,
  books: books.map(({ records: _records, ...book }) => book),
  manifest: jsonPath.slice(root.length + 1),
  report: reportPath.slice(root.length + 1),
}, null, 2));
