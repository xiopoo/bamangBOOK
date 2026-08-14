#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogDir = path.join(root, "editorial/shared/source-catalog");
const catalogPath = path.join(catalogDir, "primary-document-candidates.json");
const generatedAt = new Date().toISOString();

if (!fs.existsSync(catalogPath)) {
  throw new Error(`Missing catalog: ${catalogPath}. Run scripts/catalog-primary-documents.mjs first.`);
}

const candidates = JSON.parse(fs.readFileSync(catalogPath, "utf8")).rows;
const partnershipMapPath = path.join(catalogDir, "partnership-source-map.json");
const partnershipSourceMap = fs.existsSync(partnershipMapPath)
  ? new Map(JSON.parse(fs.readFileSync(partnershipMapPath, "utf8")).rows.map((row) => [row.relative, row]))
  : new Map();
const buffettChineseCompilation = "content/巴菲特致股东信60年合集1950-2025（芒格书院精译）.pdf";
const buffettChineseCompilationExists = fs.existsSync(path.join(root, buffettChineseCompilation));
const stripeRenderedManifestPath = path.join(root, "content/source-documents/poor-charlies-almanack-stripe/rendered/manifest.json");
const stripeRenderedBySlug = fs.existsSync(stripeRenderedManifestPath)
  ? new Map(JSON.parse(fs.readFileSync(stripeRenderedManifestPath, "utf8")).records.map((row) => [row.slug, row]))
  : new Map();
const stripeRenderedSlugByWorkKey = new Map([
  ["munger-poor-charlie-talk-three", "talk-three"],
  ["munger-poor-charlie-talk-five", "talk-five"],
  ["munger-poor-charlie-talk-nine", "talk-nine"],
  ["munger-poor-charlie-talk-eleven", "talk-eleven"],
]);

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function countBy(rows, key) {
  const result = {};
  for (const row of rows) result[row[key]] = (result[row[key]] ?? 0) + 1;
  return Object.fromEntries(Object.entries(result).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN")));
}

function workFamilyMap(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!row.workKey) continue;
    if (!map.has(row.workKey)) map.set(row.workKey, []);
    map.get(row.workKey).push(row);
  }
  return map;
}

const families = workFamilyMap(candidates);
const berkshireSessionsByYear = new Map();
for (const row of candidates.filter((row) => row.kind === "berkshire-annual-meeting-session")) {
  const year = String(row.year);
  if (!berkshireSessionsByYear.has(year)) berkshireSessionsByYear.set(year, []);
  berkshireSessionsByYear.get(year).push(row);
}

function englishPoorCharliePeer(row) {
  if (!row.workKey?.startsWith("munger-poor-charlie-talk-")) return undefined;
  return (families.get(row.workKey) ?? []).find((peer) => peer.relative.startsWith("poor-charlies-almanack/_english-source/"));
}

function sourceSupport(row) {
  const stripeSlug = stripeRenderedSlugByWorkKey.get(row.workKey);
  const stripeRendered = stripeRenderedBySlug.get(stripeSlug);
  if (stripeRendered && fs.existsSync(path.join(root, stripeRendered.textPath)) && fs.existsSync(path.join(root, stripeRendered.htmlPath))) {
    return {
      status: "official-web-rendered-original-local",
      paths: [stripeRendered.textPath, stripeRendered.htmlPath],
      url: stripeRendered.sourceUrl,
      note: `已由浏览器执行 Stripe Press 官方页面并提取书页正文 article；本地同时保存渲染 HTML、纯文本和 SHA-256。含原版图注与 “Revisited” 附文，进入中文稿前仍须逐段校勘边界。`,
    };
  }

  if (["partnership-letter", "partnership-agreement"].includes(row.kind)) {
    const mapping = partnershipSourceMap.get(row.relative);
    if (mapping?.status === "page-mapped") {
      return {
        status: "institutional-english-compilation-page-mapped",
        paths: [mapping.sourcePath],
        url: mapping.sourceUrl,
        note: `已定位到 Ivey 英文合编本 PDF 物理页 ${mapping.startPage}—${mapping.endPage}；仍需逐段校核中文，且不能冒充逐封原件扫描。${mapping.note ? ` ${mapping.note}` : ""}`,
      };
    }
    if (mapping?.status === "duplicate-markdown-version") {
      return {
        status: "duplicate-markdown-of-mapped-source",
        paths: [],
        url: "",
        note: `与 ${mapping.duplicateOf} 对应同一封信，书中不得重复收入。`,
      };
    }
    return { status: "no-local-original-language-base", paths: [], url: "", note: mapping?.note ?? "Ivey 英文合编本中未定位到对应文献。" };
  }

  if (row.kind === "shareholder-letter" && [1969, 1971, 1972, 1973, 1974, 1975, 1976].includes(Number(row.year))) {
    const relative = "content/source-documents/berkshire-early-shareholder-letters/buffett-letters-1969-1976-secondary-scan.pdf";
    if (fs.existsSync(path.join(root, relative))) {
      return {
        status: "secondary-english-scan-local",
        paths: [relative],
        url: "https://assets.empirefinancialresearch.com/uploads/2021/02/Buffett-Letters-1969-76.pdf",
        note: "本地有第三方英文扫描/OCR 合集；文件实际覆盖 1969、1971—1976，缺 1970，需逐年与更高等级原件复核。",
      };
    }
  }

  if (row.kind === "shareholder-letter" && Number(row.year) === 2025 && row.warnings.includes("2025-thanksgiving-letter-not-annual-report-letter")) {
    const relative = "content/source-documents/berkshire-shareholder-letters/2025-thanksgiving-message.pdf";
    if (fs.existsSync(path.join(root, relative))) {
      return {
        status: "official-original-pdf-local",
        paths: [relative],
        url: "https://berkshirehathaway.com/news/nov1025.pdf",
        note: "本地有伯克希尔官网 2025 感恩节致股东信；这不是年度报告股东信。",
      };
    }
  }

  if (row.kind === "shareholder-letter" && Number(row.year) >= 1977 && Number(row.year) <= 2024) {
    const year = Number(row.year);
    const sourceName = year <= 1997
      ? `${year}.html`
      : year === 1998
        ? "1998pdf.pdf"
        : year === 1999
          ? "final1999pdf.pdf"
          : year <= 2002
            ? `${year}pdf.pdf`
            : `${year}ltr.pdf`;
    const relative = `content/source-documents/berkshire-shareholder-letters/${sourceName}`;
    if (fs.existsSync(path.join(root, relative))) {
      return {
        status: year <= 1997 ? "official-original-html-local" : "official-original-pdf-local",
        paths: [relative],
        url: `https://berkshirehathaway.com/letters/${sourceName}`,
        note: "本地有伯克希尔官方股东信原文底本。",
      };
    }
  }

  if (row.kind === "wesco-letter" && row.year) {
    const relative = `content/source-pdfs/wesco/wesco-${row.year}.pdf`;
    if (fs.existsSync(path.join(root, relative))) {
      return { status: "official-original-pdf-local", paths: [relative], url: row.sourceUrl, note: "本地有伯克希尔官方 Wesco 英文 PDF。" };
    }
  }

  if (row.kind === "berkshire-annual-meeting-qa" && row.year) {
    const sessions = berkshireSessionsByYear.get(String(row.year)) ?? [];
    if (sessions.length) {
      return {
        status: "local-english-session-candidates",
        paths: sessions.map((session) => session.relative),
        url: sessions.find((session) => session.sourceUrl)?.sourceUrl ?? "",
        note: `本地有 ${sessions.length} 个 CNBC 英文场次文件，仍需与中文问答逐段对齐。`,
      };
    }
  }

  if (row.relative.startsWith("poor-charlies-almanack/") && !row.relative.includes("/_english-source/")) {
    const peer = englishPoorCharliePeer(row);
    if (peer) {
      const fragment = peer.decision === "candidate-primary-review" || peer.warnings.includes("local-source-is-summary-or-incomplete-capture");
      return {
        status: fragment ? "local-english-peer-fragment" : "local-english-peer-candidate",
        paths: [peer.relative],
        url: peer.sourceUrl,
        note: fragment ? "英文对应文件是删节、摘要或未完整抓取，不能作全文底本。" : "本地有英文对应文件，仍需逐段校核中文译文。",
      };
    }
  }

  if (row.language === "en" && ["candidate-source-version", "candidate-primary-review"].includes(row.decision)) {
    const fragment = row.warnings.includes("local-source-is-summary-or-incomplete-capture") || ["selection-or-excerpt", "incomplete-or-omitted-sections"].includes(row.completeness);
    return {
      status: fragment ? "local-original-language-fragment" : row.sourceUrl ? "local-original-language-text-with-url" : "local-original-language-text-no-url",
      paths: [row.relative],
      url: row.sourceUrl,
      note: fragment ? "本地英文文件不完整。" : "文件自身为英文逐字文本候选；来源权威性仍按 URL 和元数据复核。",
    };
  }

  return { status: "no-local-original-language-base", paths: [], url: "", note: "本地未找到可直接对应的原文或官方底本。" };
}

function placement(row) {
  if (row.person === "buffett") return "buffett-volume";
  if (row.person === "munger") return "munger-volume";
  if (row.person === "both") return "joint-document-placement-pending";
  return "authorship-review";
}

function gapFlags(row, support) {
  const gaps = [...row.warnings];
  if (row.completeness === "selection-or-excerpt") gaps.push("selection-not-full-document");
  if (row.completeness === "incomplete-or-omitted-sections") gaps.push("explicitly-incomplete-document");
  if (row.completeness === "unknown") gaps.push("completeness-unproven");
  if (!(row.sourceUrl || support.url)) gaps.push("source-url-missing");
  if (support.status === "no-local-original-language-base" && row.language !== "en") gaps.push("local-original-language-base-missing");
  if (support.status.includes("fragment")) gaps.push("local-source-fragment-not-full-base");
  if (support.status === "institutional-english-compilation-page-mapped") gaps.push("institutional-compilation-not-original-scan");
  if (support.status === "duplicate-markdown-of-mapped-source") gaps.push("duplicate-markdown-version-exclude-from-book");
  if (support.status === "secondary-english-scan-local") gaps.push("secondary-scan-needs-higher-grade-source-review");
  if (["candidate-primary-review", "requires-source-review", "review-embedded-primary-text"].includes(row.decision)) gaps.push("manual-authorship-or-source-review-required");
  if ((families.get(row.workKey) ?? []).length > 1) gaps.push("version-family-needs-canonical-choice");
  if (row.person === "both") gaps.push("joint-document-volume-placement-pending");
  return [...new Set(gaps)];
}

function editorialGate(row, support, gaps) {
  if (support.status === "duplicate-markdown-of-mapped-source") return "exclude-duplicate-version-from-book";
  if (row.decision === "candidate-source-version") return "source-reference-not-reading-copy";
  if (gaps.some((gap) => /chronology|verification-pending|explicitly-incomplete|fragment-not-full|not-original|not-buffett-letter-body/iu.test(gap))) return "hold-until-source-or-completeness-fixed";
  if (["candidate-primary-review", "requires-source-review", "review-embedded-primary-text"].includes(row.decision)) return "hold-until-manual-verification";
  if (support.status === "institutional-english-compilation-page-mapped") return "hold-until-bilingual-text-collation";
  if (support.status === "secondary-english-scan-local") return "hold-until-higher-grade-source-review";
  if (row.decision === "candidate-include-selection") return "selection-only-not-full-document";
  if (row.decision === "candidate-include-full" && support.status === "no-local-original-language-base" && row.language !== "en") return "hold-until-original-source-added";
  if (row.decision === "candidate-include-full") return "provisional-full-candidate-not-yet-approved";
  return "hold-for-classification";
}

const register = candidates.map((row) => {
  const support = sourceSupport(row);
  const gaps = gapFlags(row, support);
  const family = families.get(row.workKey) ?? [];
  return {
    person: row.person,
    placement: placement(row),
    year: row.year,
    kind: row.kind,
    title: row.title,
    relative: row.relative,
    language: row.language,
    completeness: row.completeness,
    evidenceStatus: row.evidenceStatus,
    currentDecision: row.decision,
    editorialGate: editorialGate(row, support, gaps),
    sourceSupport: support.status,
    sourcePaths: support.paths,
    sourceSupportNote: support.note,
    sourceUrl: row.sourceUrl || support.url,
    workKey: row.workKey,
    versionFamilyCount: family.length,
    gapFlags: gaps,
    chars: row.chars,
    exactHash: row.exactHash,
  };
});

const headers = [
  "person", "placement", "year", "kind", "title", "relative", "language", "completeness", "evidenceStatus",
  "currentDecision", "editorialGate", "sourceSupport", "sourcePaths", "sourceSupportNote", "sourceUrl", "workKey",
  "versionFamilyCount", "gapFlags", "chars", "exactHash",
];
const csv = `${[headers.join(","), ...register.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n")}\n`;

const byKind = new Map();
for (const row of register) {
  if (!byKind.has(row.kind)) byKind.set(row.kind, []);
  byKind.get(row.kind).push(row);
}
const kindRows = [...byKind.entries()]
  .map(([kind, rows]) => ({
    kind,
    count: rows.length,
    full: rows.filter((row) => row.currentDecision === "candidate-include-full").length,
    selection: rows.filter((row) => row.currentDecision === "candidate-include-selection").length,
    review: rows.filter((row) => ["candidate-primary-review", "requires-source-review", "review-embedded-primary-text"].includes(row.currentDecision)).length,
    source: rows.filter((row) => row.currentDecision === "candidate-source-version").length,
    withUrl: rows.filter((row) => row.sourceUrl).length,
    missingOriginal: rows.filter((row) => row.sourceSupport === "no-local-original-language-base" && row.language !== "en").length,
  }))
  .sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind));

const wescoOfficial = register.filter((row) => row.kind === "wesco-letter" && row.sourceSupport === "official-original-pdf-local");
const buffettOfficial = register.filter((row) => row.kind === "shareholder-letter" && row.sourceSupport.startsWith("official-original-"));
const englishSessions = register.filter((row) => row.kind === "berkshire-annual-meeting-session");
const pccaEnglish = register.filter((row) => row.relative.startsWith("poor-charlies-almanack/_english-source/poor-charlies-almanack-talk-"));
const pccaFragments = pccaEnglish.filter((row) => row.sourceSupport.includes("fragment"));
const shareholderLetters = register.filter((row) => row.kind === "shareholder-letter");
const partnershipLetters = register.filter((row) => row.kind === "partnership-letter");
const partnershipAgreement = register.filter((row) => row.kind === "partnership-agreement");
const partnershipMapped = register.filter((row) => row.sourceSupport === "institutional-english-compilation-page-mapped");
const partnershipDuplicates = register.filter((row) => row.sourceSupport === "duplicate-markdown-of-mapped-source");
const chineseBerkshireQa = register.filter((row) => row.kind === "berkshire-annual-meeting-qa");
const chineseBerkshireExplicitIncomplete = chineseBerkshireQa.filter((row) => row.gapFlags.includes("explicitly-incomplete-document"));

const report = [
  "# 核心文献候选总表与来源缺口报告",
  "",
  `- 生成时间：${generatedAt}`,
  `- 候选材料记录：${register.length} 条（包括中文阅读稿、英文对照稿、选录和待核材料，不等于独立文献数量）`,
  "- 原则：只登记已有材料和证据，不补写正文，不把摘要冒充原文，不把文件名当作作者署名证据。",
  "",
  "## 一、可以确认到什么程度",
  "",
  `1. 已把 ${buffettOfficial.length} 封巴菲特致股东文献的伯克希尔官方原文底本保存到本地：1977—2024 年年度股东信 48 封，另加 2025 年感恩节致股东信 1 封；1977—1997 为官网 HTML，其余为官网 PDF。`,
  `2. 芒格的 Wesco 股东信也已形成完整本地证据链：${wescoOfficial.length} 篇 Markdown 均有官方英文 PDF 对应，年份为 1997—2009。`,
  `3. 巴菲特部分${buffettChineseCompilationExists ? "已有" : "尚未找到"}一份 5,746 页中文合集 PDF（\`${buffettChineseCompilation}\`）。它的目录混有本人文献、第三方文章和会议材料，因此只能作中文版本参照，不能作为英文官方底本。`,
  `4. CNBC 年会目录有 ${englishSessions.length} 个英文场次文件，覆盖 ${[...new Set(englishSessions.map((row) => row.year))].sort().join("、")}；其中 ${englishSessions.filter((row) => row.sourceUrl).length} 个文件内带来源 URL。2009 年上午场另有一份重复版本，正式编排前必须去重。`,
  `5. 《穷查理宝典》演讲有 ${pccaEnglish.length} 个本地英文对应文件，但其中 ${pccaFragments.length} 个明确属于删节、摘要或未完整抓取：${pccaFragments.map((row) => path.basename(row.relative, ".md")).join("、") || "无"}。这些文件不能做“全集”全文底本。`,
  `6. 合伙资料共有 ${partnershipLetters.length} 封信和 ${partnershipAgreement.length} 份 1956 协议；其中 ${partnershipMapped.length} 封已定位到 Ivey 英文合编本的具体 PDF 页码，${partnershipDuplicates.length} 个 Markdown 被确认是重复版本，其余文件未在 Ivey 合编本找到。该合编本不是逐封原件扫描。伯克希尔相关信件中已有 ${buffettOfficial.length} 篇官方底本；1969、1971—1976 另有低一级的第三方扫描/OCR 合集；1965—1968 与 1970 仍无本地英文底本。`,
  `7. 中文伯克希尔问答材料中有 ${chineseBerkshireExplicitIncomplete.length} 篇明确保留“翻译略过”或其他缺段标记，不能标作全文。2024、2025 文件另有时序或混入历年材料问题。`,
  "",
  "## 二、当前编辑闸门",
  "",
  "```json",
  JSON.stringify(countBy(register, "editorialGate"), null, 2),
  "```",
  "",
  "`provisional-full-candidate-not-yet-approved` 仍不是终稿准入。只有署名、日期、完整度、原文底本和中文版本均核清后，才可进入排版书稿。",
  "",
  "## 三、按文献类型统计",
  "",
  "| 文献类型 | 材料数 | 全文候选 | 选录 | 待核 | 原文/版本稿 | 带 URL | 缺本地原文底本 |",
  "|---|---:|---:|---:|---:|---:|---:|---:|",
  ...kindRows.map((row) => `| ${row.kind} | ${row.count} | ${row.full} | ${row.selection} | ${row.review} | ${row.source} | ${row.withUrl} | ${row.missingOriginal} |`),
  "",
  "## 四、必须先补的来源缺口",
  "",
  "- 巴菲特信件：1977—2024 年年度股东信及 2025 年感恩节致股东信的官方底本已经本地化；29 封合伙人信已完成 Ivey 合编本页码映射，下一步逐段核校中英文；公司信继续补 1965—1968、1970，并为 1969、1971—1976 寻找高于第三方 OCR 合集的扫描件。",
  "- 1965—1969 公司信：逐年核对年报扫描件、正式署名和执笔归属。没有证据时只能收入“相关公司文件”，不能直接挂在巴菲特个人全集名下。",
  "- 芒格演讲：优先补齐本地英文文件中明确为摘要或未完整抓取的 Talk Three、Five、Nine、Eleven；中文版必须逐段与完整原文校核。",
  "- 伯克希尔年会：1994 年以后按年份把上午/下午英文场次与中文问答对齐；中文稿凡有“翻译略过”一律降为选录。2020、2021 年需要另找对应的可靠完整底本。",
  "- 访谈、演讲和文章：没有节目页、刊物页、视频或逐字稿来源的，先留在待核队列；不能因为内容像巴菲特或芒格就收入。",
  "- 联合文献：伯克希尔年会同时包含巴菲特和芒格发言，暂标为联合文献。以后是两卷各收完整场次，还是按发言人拆分，必须在不破坏问答语境的前提下另定版例。",
  "",
  "## 五、正式成书前的硬性准入条件",
  "",
  "- 每篇正文必须有可定位的原文件；编辑说明与正文物理分离。",
  "- 标为“全文”的材料必须不存在删节、摘要、翻译略过或抓取不全声明。",
  "- 中文稿必须有原文底本、来源 URL 或扫描件中的至少一种可复核证据；仅有中文合集不够。",
  "- 同一文献多版本只选一个主版本，其余进入版本说明，不重复灌入正文。",
  "- AI 不得撰写、续写、仿写或补齐正文；缺文就是缺文，登记后继续找底本。",
  "",
  "## 六、配套机器可读文件",
  "",
  "- `core-document-register.csv`：逐材料编辑总表，可筛选人物、年份、类型、来源支持和缺口。",
  "- `core-document-register.json`：同一总表的结构化版本。",
  "- 上游文件：`primary-document-candidates.json`、`work-version-families.json`、`review-queue.csv`。",
  "",
];

fs.mkdirSync(catalogDir, { recursive: true });
fs.writeFileSync(path.join(catalogDir, "core-document-register.csv"), csv);
fs.writeFileSync(path.join(catalogDir, "core-document-register.json"), `${JSON.stringify({
  generatedAt,
  sourceCatalog: path.relative(root, catalogPath),
  count: register.length,
  register,
}, null, 2)}\n`);
fs.writeFileSync(path.join(catalogDir, "核心文献候选总表与来源缺口报告.md"), `${report.join("\n")}\n`);

console.log(JSON.stringify({
  generatedAt,
  records: register.length,
  editorialGate: countBy(register, "editorialGate"),
  sourceSupport: countBy(register, "sourceSupport"),
  wescoOfficialPdfPairs: wescoOfficial.length,
  buffettOfficialSourcePairs: buffettOfficial.length,
  berkshireEnglishSessions: englishSessions.length,
  poorCharlieEnglishFiles: pccaEnglish.length,
  poorCharlieFragments: pccaFragments.length,
  shareholderLetters: shareholderLetters.length,
  partnershipLetters: partnershipLetters.length,
}, null, 2));
