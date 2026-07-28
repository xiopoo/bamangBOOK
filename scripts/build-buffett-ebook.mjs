import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import JSZip from "jszip";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "output", "ebook");
const EPUB_PATH = path.join(OUT_DIR, "巴菲特文集_1956-2025.epub");
const REPORT_PATH = path.join(OUT_DIR, "巴菲特文集_编目报告.md");
const PREVIEW_PATH = path.join(OUT_DIR, "巴菲特文集_样章预览.html");
const PRINT_COVER_PATH = path.join(OUT_DIR, "巴菲特文集_PDF封面.html");
const PRINT_BODY_PATH = path.join(OUT_DIR, "巴菲特文集_PDF正文.html");
const ACCENT = "#AB1942";
const INK = "#111111";
const PAPER = "#FFFFFF";

const esc = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const slug = (value) =>
  value
    .normalize("NFKC")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 80);

function walk(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full, predicate) : predicate(full) ? [full] : [];
    });
}

function cleanFilename(file) {
  return path
    .basename(file, ".md")
    .replace(/^berkshire_(\d{4})-巴菲特致股东信$/, "$1 年致股东信")
    .replace(/^partnership_(\d{4})-annual-巴菲特致合伙人信$/, "$1 年度致合伙人信")
    .replace(/^partnership_(\d{4})-interim-巴菲特致合伙人信$/, "$1 年中致合伙人信")
    .replace(/^partnership_(\d{4})-(.+)-巴菲特致合伙人信$/, "$1 年 $2 致合伙人信")
    .replace(/^partnership_(\d{4})-巴菲特致合伙人信$/, "$1 年致合伙人信")
    .replace(/^partnership_(\d{4})-有限合伙协议$/, "$1 年有限合伙协议")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractYear(file) {
  const m = path.basename(file).match(/(?:19|20)\d{2}/);
  return m ? Number(m[0]) : 0;
}

function titleFromMarkdown(file, body, data) {
  if (typeof data.title === "string" && data.title.trim()) return data.title.trim();
  const heading = body.match(/^#\s+(.+)$/m);
  return heading ? heading[1].replace(/\*\*/g, "").trim() : cleanFilename(file);
}

function renderInlineChildren(node) {
  return (node.children || []).map(renderNode).join("");
}

function renderNode(node) {
  switch (node.type) {
    case "root":
      return node.children.map(renderNode).join("\n");
    case "text":
      return esc(node.value);
    case "paragraph":
      return `<p>${renderInlineChildren(node)}</p>`;
    case "heading": {
      const level = Math.min(6, node.depth + 1);
      return `<h${level}>${renderInlineChildren(node)}</h${level}>`;
    }
    case "strong":
      return `<strong>${renderInlineChildren(node)}</strong>`;
    case "emphasis":
      return `<em>${renderInlineChildren(node)}</em>`;
    case "delete":
      return `<del>${renderInlineChildren(node)}</del>`;
    case "inlineCode":
      return `<code>${esc(node.value)}</code>`;
    case "code":
      return `<pre><code>${esc(node.value)}</code></pre>`;
    case "blockquote":
      return `<blockquote>${node.children.map(renderNode).join("\n")}</blockquote>`;
    case "list": {
      const tag = node.ordered ? "ol" : "ul";
      const start = node.ordered && node.start && node.start !== 1 ? ` start="${node.start}"` : "";
      return `<${tag}${start}>${node.children.map(renderNode).join("")}</${tag}>`;
    }
    case "listItem":
      return `<li>${node.children.map(renderNode).join("\n")}</li>`;
    case "link": {
      const href = /^https?:\/\//i.test(node.url) ? node.url : "#";
      return `<a href="${esc(href)}">${renderInlineChildren(node)}</a>`;
    }
    case "image":
      return `<span class="image-note">〔图：${esc(node.alt || "原文插图")}〕</span>`;
    case "break":
      return "<br />";
    case "thematicBreak":
      return "<hr />";
    case "table":
      return `<div class="table-wrap"><table>${node.children.map(renderNode).join("")}</table></div>`;
    case "tableRow":
      return `<tr>${node.children.map(renderNode).join("")}</tr>`;
    case "tableCell":
      return `<td>${renderInlineChildren(node)}</td>`;
    case "html":
      return `<p class="raw-note">${esc(node.value)}</p>`;
    case "footnoteDefinition":
      return `<aside class="footnote" id="fn-${esc(node.identifier)}">${node.children.map(renderNode).join("")}</aside>`;
    case "footnoteReference":
      return `<sup>${esc(node.label || node.identifier)}</sup>`;
    default:
      return node.children ? node.children.map(renderNode).join("") : "";
  }
}

function markdownToXhtml(markdown) {
  const parsed = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  return renderNode(parsed);
}

function stripDuplicateTitle(markdown, title) {
  const lines = markdown.split(/\r?\n/);
  const firstMeaningful = lines.findIndex((line) => line.trim());
  if (firstMeaningful >= 0 && /^#\s+/.test(lines[firstMeaningful])) {
    const candidate = lines[firstMeaningful].replace(/^#\s+/, "").replace(/\*\*/g, "").trim();
    if (candidate === title || candidate === cleanFilename(title)) lines.splice(firstMeaningful, 1);
  }
  return lines.join("\n").replace(/\[\[([^\]]+)\]\]/g, "$1");
}

const mdFiles = (dir) => walk(path.join(ROOT, dir), (file) => file.endsWith(".md"));
const byYearThenName = (a, b) => extractYear(a) - extractYear(b) || a.localeCompare(b, "zh-CN");

const volumes = [
  {
    title: "卷一　人物、方法与商业判断",
    short: "人物与方法",
    description: "从生平、投资框架、企业分析与资本配置切入，建立理解巴菲特的基础坐标。",
    files: [
      path.join(ROOT, "content", "people", "沃伦·巴菲特.md"),
      ...mdFiles("content/articles/buffett").sort(byYearThenName),
    ],
  },
  {
    title: "卷二　合伙人时代",
    short: "合伙人信",
    description: "1956 至 1970 年的合伙协议与致合伙人信，记录早期策略、业绩尺度与受托责任。",
    files: mdFiles("content/partnership").sort(byYearThenName),
  },
  {
    title: "卷三　伯克希尔股东信",
    short: "股东信",
    description: "1965 至 2025 年的伯克希尔文本，呈现企业经营、保险浮存金、资本配置与长期主义。",
    files: mdFiles("content/letters").sort(byYearThenName),
  },
  {
    title: "卷四　股东大会问答",
    short: "股东大会",
    description: "收录伯克希尔股东大会问答、实录与巴菲特专题问答；排除 Wesco 专场。",
    files: mdFiles("content/qa")
      .filter((file) => !/Wesco|发布会/.test(path.basename(file)))
      .sort(byYearThenName),
  },
  {
    title: "卷五　公开演讲",
    short: "演讲",
    description: "面向大学、商学院与公共论坛的演讲，聚焦投资、职业选择、诚信与人生。",
    files: mdFiles("content/talks")
      .filter((file) => /巴菲特/.test(path.basename(file)))
      .sort(byYearThenName),
  },
  {
    title: "卷六　访谈与对话",
    short: "访谈",
    description: "巴菲特接受媒体、商学院与公共机构访谈的记录；不收录以其他人物为主体的专访。",
    files: mdFiles("content/interviews")
      .filter((file) => /巴菲特/.test(path.basename(file)) && !/苏珊/.test(path.basename(file)))
      .sort(byYearThenName),
  },
];

const seenHashes = new Set();
let chapterIndex = 0;
for (const volume of volumes) {
  volume.chapters = [];
  for (const file of volume.files) {
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    const parsed = matter(raw);
    const normalized = parsed.content.replace(/\s+/g, " ").trim();
    const hash = crypto.createHash("sha256").update(normalized).digest("hex");
    if (!normalized || seenHashes.has(hash)) continue;
    seenHashes.add(hash);
    const title = titleFromMarkdown(file, parsed.content, parsed.data);
    chapterIndex += 1;
    volume.chapters.push({
      id: `chapter-${String(chapterIndex).padStart(3, "0")}`,
      href: `text/chapter-${String(chapterIndex).padStart(3, "0")}.xhtml`,
      title,
      source: path.relative(ROOT, file),
      year: extractYear(file),
      markdown: stripDuplicateTitle(parsed.content, title),
      chars: normalized.length,
    });
  }
}

const allChapters = volumes.flatMap((volume) => volume.chapters);
const totalChars = allChapters.reduce((sum, chapter) => sum + chapter.chars, 0);
const identifier = `urn:uuid:${crypto.randomUUID()}`;
const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

const css = `
:root { color-scheme: light; }
html, body { margin: 0; padding: 0; background: ${PAPER}; color: ${INK}; }
body {
  font-family: "Songti SC", "Noto Serif CJK SC", "STSong", serif;
  line-height: 1.78;
  text-align: justify;
  overflow-wrap: anywhere;
}
main { max-width: 42em; margin: 0 auto; padding: 8vh 7vw 10vh; }
p { margin: 0 0 0.9em; }
h1, h2, h3, h4, h5, h6 {
  font-family: "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  text-align: left;
  page-break-after: avoid;
}
h1 { font-size: 1.72em; line-height: 1.3; margin: 0 0 1.3em; color: ${INK}; }
h2 { font-size: 1.34em; margin: 2.2em 0 0.8em; border-left: 0.25em solid ${ACCENT}; padding-left: 0.65em; }
h3 { font-size: 1.13em; margin: 1.8em 0 0.65em; color: ${ACCENT}; }
h4, h5, h6 { font-size: 1em; margin: 1.4em 0 0.55em; }
a { color: ${ACCENT}; text-decoration: none; }
strong { font-weight: 700; }
blockquote {
  margin: 1.4em 0;
  padding: 0.25em 0 0.25em 1.1em;
  border-left: 0.22em solid ${ACCENT};
  color: #333333;
}
blockquote p:last-child { margin-bottom: 0; }
hr { border: 0; border-top: 1px solid ${ACCENT}; width: 3.5em; margin: 2.4em auto; }
ul, ol { padding-left: 1.5em; margin: 0.6em 0 1em; }
li { margin: 0.25em 0; }
li p { margin: 0.2em 0; }
code, pre { font-family: ui-monospace, "SFMono-Regular", monospace; }
code { background: #f3f3f3; padding: 0.08em 0.25em; }
pre { white-space: pre-wrap; background: #f5f5f5; padding: 1em; border-left: 0.2em solid ${ACCENT}; }
.table-wrap { overflow-x: auto; margin: 1.2em 0 1.5em; }
table { width: 100%; border-collapse: collapse; font-size: 0.88em; }
td, th { border-bottom: 1px solid #c8c8c8; padding: 0.55em 0.45em; vertical-align: top; }
tr:first-child td { font-weight: 700; border-top: 2px solid ${INK}; border-bottom: 1px solid ${INK}; }
tr:last-child td { border-bottom: 2px solid ${INK}; }
.chapter-kicker, .volume-kicker, .eyebrow {
  font-family: "PingFang SC", "Noto Sans CJK SC", sans-serif;
  color: ${ACCENT};
  font-size: 0.78em;
  font-weight: 700;
  letter-spacing: 0.16em;
  margin-bottom: 1em;
}
.chapter-source { color: #666666; font-size: 0.78em; border-top: 1px solid #dddddd; padding-top: 0.8em; margin-top: 2.4em; }
.volume-page, .title-page { min-height: 72vh; display: flex; flex-direction: column; justify-content: center; text-align: left; }
.volume-page h1 { font-size: 2em; margin-bottom: 0.65em; }
.volume-page p { max-width: 30em; color: #444444; }
.red-rule { width: 4.5em; height: 0.34em; background: ${ACCENT}; margin: 0 0 1.8em; }
.toc h1 { margin-bottom: 1.4em; }
.toc h2 { border: 0; padding: 0; color: ${ACCENT}; font-size: 1.12em; margin: 1.6em 0 0.5em; }
.toc ol { list-style: none; padding: 0; }
.toc li { border-bottom: 1px solid #eeeeee; padding: 0.45em 0; }
.note { border-top: 0.35em solid ${ACCENT}; background: #f6f6f6; padding: 1.2em 1.3em; margin: 1.5em 0; }
.raw-note, .image-note { color: #666666; font-size: 0.85em; }
@page { margin: 6%; }
`;

const wrapXhtml = (title, body, cls = "") => `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN" xml:lang="zh-CN">
<head><meta charset="utf-8" /><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="../styles/book.css" /></head>
<body class="${cls}"><main>${body}</main></body></html>`;

const coverSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2560" viewBox="0 0 1600 2560">
<rect width="1600" height="2560" fill="#FFFFFF"/>
<rect x="0" y="0" width="1600" height="72" fill="${ACCENT}"/>
<rect x="126" y="210" width="18" height="1540" fill="${ACCENT}"/>
<text x="220" y="460" font-family="Noto Sans CJK SC, PingFang SC, sans-serif" font-size="92" font-weight="700" fill="#111111">巴菲特文集</text>
<text x="224" y="585" font-family="Noto Sans CJK SC, PingFang SC, sans-serif" font-size="38" fill="${ACCENT}" letter-spacing="8">THE WARREN BUFFETT READER</text>
<line x1="224" y1="690" x2="1260" y2="690" stroke="#111111" stroke-width="3"/>
<text x="224" y="830" font-family="Noto Serif CJK SC, Songti SC, serif" font-size="48" fill="#111111">合伙人信 · 股东信 · 股东大会</text>
<text x="224" y="905" font-family="Noto Serif CJK SC, Songti SC, serif" font-size="48" fill="#111111">演讲 · 访谈 · 专题文章</text>
<text x="224" y="1130" font-family="Georgia, serif" font-size="210" font-weight="700" fill="#111111">1956</text>
<text x="224" y="1320" font-family="Georgia, serif" font-size="90" fill="${ACCENT}">— 2025</text>
<rect x="224" y="1500" width="860" height="12" fill="#111111"/>
<text x="224" y="2200" font-family="Noto Sans CJK SC, PingFang SC, sans-serif" font-size="38" fill="#111111">巴芒书院资料库 · 整理版</text>
<circle cx="1350" cy="2200" r="78" fill="${ACCENT}"/>
<text x="1350" y="2224" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#FFFFFF">B</text>
</svg>`;

const titlePage = wrapXhtml(
  "扉页",
  `<section class="title-page">
    <div class="eyebrow">THE WARREN BUFFETT READER</div>
    <div class="red-rule"></div>
    <h1>巴菲特文集</h1>
    <p>1956—2025</p>
    <p>合伙人信 · 股东信 · 股东大会 · 演讲 · 访谈 · 专题文章</p>
    <p class="chapter-source">依据本地“巴芒书院”资料库整理<br />配色：${ACCENT} / 黑 / 白</p>
  </section>`,
  "frontmatter",
);

const editorialNote = wrapXhtml(
  "编者说明",
  `<div class="eyebrow">编者说明</div>
  <h1>如何阅读这部文集</h1>
  <p>这不是一本替读摘要，而是一部按阅读路径重新编排的巴菲特资料集。全书以原始文稿为主体，把散落在资料库中的合伙人信、伯克希尔股东信、股东大会记录、演讲、访谈与专题文章统一到一套目录中。</p>
  <div class="note"><strong>三条推荐路径</strong><p>初读者可从“人物与方法”进入；研究投资框架可依次阅读“合伙人时代”与“伯克希尔股东信”；查找现场观点可直接进入“股东大会”“演讲”或“访谈”。</p></div>
  <p>整理时排除了以芒格、Wesco、施洛斯等其他人物为主体的专篇，以及网站生成的 HTML/TXT 重复文件。正文只做结构与版式标准化，不改写原文观点。个别原稿中的内部链接、图像占位与网页语法，在电子书中转为可读文本提示。</p>
  <p>年份依据文件名和资料库编目；不同来源的译名、标点与事实表述可能存在差异，引用或用于研究时仍应回查原始出处。</p>`,
  "frontmatter",
);

const navSections = volumes
  .map(
    (volume, index) => `<li><a href="text/volume-${index + 1}.xhtml">${esc(volume.title)}</a>
      <ol>${volume.chapters.map((chapter) => `<li><a href="${chapter.href}">${esc(chapter.title)}</a></li>`).join("")}</ol>
    </li>`,
  )
  .join("");

const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="zh-CN">
<head><meta charset="utf-8" /><title>目录</title><link rel="stylesheet" type="text/css" href="styles/book.css" /></head>
<body><main class="toc"><nav epub:type="toc" id="toc"><h1>目录</h1><ol>${navSections}</ol></nav>
<nav epub:type="landmarks" hidden=""><ol><li><a epub:type="cover" href="cover.xhtml">封面</a></li><li><a epub:type="bodymatter" href="text/volume-1.xhtml">正文</a></li></ol></nav>
</main></body></html>`;

const ncxPoints = volumes
  .flatMap((volume, index) => {
    const volumePoint = `<navPoint id="v${index + 1}" playOrder="${index + 1}"><navLabel><text>${esc(volume.title)}</text></navLabel><content src="text/volume-${index + 1}.xhtml"/></navPoint>`;
    return [volumePoint, ...volume.chapters.map((chapter, chapterOffset) => `<navPoint id="${chapter.id}" playOrder="${100 + index * 1000 + chapterOffset}"><navLabel><text>${esc(chapter.title)}</text></navLabel><content src="${chapter.href}"/></navPoint>`)];
  })
  .join("");

const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${identifier}"/></head><docTitle><text>巴菲特文集</text></docTitle><navMap>${ncxPoints}</navMap></ncx>`;

const manifestChapters = allChapters.map((chapter) => `<item id="${chapter.id}" href="${chapter.href}" media-type="application/xhtml+xml"/>`).join("\n");
const manifestVolumes = volumes.map((_, index) => `<item id="volume-${index + 1}" href="text/volume-${index + 1}.xhtml" media-type="application/xhtml+xml"/>`).join("\n");
const spineItems = volumes
  .flatMap((volume, index) => [`<itemref idref="volume-${index + 1}"/>`, ...volume.chapters.map((chapter) => `<itemref idref="${chapter.id}"/>`)])
  .join("\n");

const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="zh-CN">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="bookid">${identifier}</dc:identifier>
  <dc:title>巴菲特文集：1956—2025</dc:title>
  <dc:language>zh-CN</dc:language>
  <dc:creator>沃伦·巴菲特等</dc:creator>
  <dc:publisher>巴芒书院资料库</dc:publisher>
  <dc:description>合伙人信、伯克希尔股东信、股东大会、演讲、访谈与专题文章整理版。</dc:description>
  <meta property="dcterms:modified">${modified}</meta>
  <meta name="cover" content="cover-image"/>
</metadata>
<manifest>
  <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
  <item id="cover-image" href="images/cover.svg" media-type="image/svg+xml" properties="cover-image"/>
  <item id="css" href="styles/book.css" media-type="text/css"/>
  <item id="titlepage" href="text/titlepage.xhtml" media-type="application/xhtml+xml"/>
  <item id="editorial-note" href="text/editorial-note.xhtml" media-type="application/xhtml+xml"/>
  ${manifestVolumes}
  ${manifestChapters}
</manifest>
<spine toc="ncx"><itemref idref="cover"/><itemref idref="titlepage"/><itemref idref="nav"/><itemref idref="editorial-note"/>${spineItems}</spine>
</package>`;

const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;

fs.mkdirSync(OUT_DIR, { recursive: true });
const zip = new JSZip();
zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
zip.file("META-INF/container.xml", containerXml);
zip.file("OEBPS/package.opf", opf);
zip.file("OEBPS/nav.xhtml", navXhtml);
zip.file("OEBPS/toc.ncx", ncx);
zip.file("OEBPS/styles/book.css", css);
zip.file("OEBPS/images/cover.svg", coverSvg);
zip.file(
  "OEBPS/cover.xhtml",
  `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>封面</title><meta name="viewport" content="width=1600,height=2560"/></head><body style="margin:0;padding:0;text-align:center;"><img src="images/cover.svg" alt="巴菲特文集封面" style="max-width:100%;height:auto;"/></body></html>`,
);
zip.file("OEBPS/text/titlepage.xhtml", titlePage);
zip.file("OEBPS/text/editorial-note.xhtml", editorialNote);

for (const [volumeIndex, volume] of volumes.entries()) {
  zip.file(
    `OEBPS/text/volume-${volumeIndex + 1}.xhtml`,
    wrapXhtml(
      volume.title,
      `<section class="volume-page"><div class="volume-kicker">VOLUME ${String(volumeIndex + 1).padStart(2, "0")}</div><div class="red-rule"></div><h1>${esc(volume.title)}</h1><p>${esc(volume.description)}</p><p class="chapter-source">本卷收录 ${volume.chapters.length} 篇</p></section>`,
      "volume",
    ),
  );
  for (const chapter of volume.chapters) {
    const body = `<div class="chapter-kicker">${esc(volume.short)}${chapter.year ? ` · ${chapter.year}` : ""}</div>
      <h1>${esc(chapter.title)}</h1>
      ${markdownToXhtml(chapter.markdown)}
      <p class="chapter-source">资料库来源：${esc(chapter.source)}</p>`;
    zip.file(`OEBPS/${chapter.href}`, wrapXhtml(chapter.title, body, "chapter"));
  }
}

const epubBuffer = zip.generate({
  type: "nodebuffer",
  compression: "DEFLATE",
  compressionOptions: { level: 9 },
});
fs.writeFileSync(EPUB_PATH, epubBuffer);

const reportRows = volumes
  .map((volume) => `| ${volume.title} | ${volume.chapters.length} | ${volume.chapters.reduce((sum, c) => sum + c.chars, 0).toLocaleString("zh-CN")} |`)
  .join("\n");
const report = `# 《巴菲特文集：1956—2025》编目报告

## 成书概况

- 格式：EPUB 3（含 EPUB 2 兼容目录）
- 主配色：\`${ACCENT}\`、黑、白
- 总篇数：${allChapters.length}
- 正文字符数（约）：${totalChars.toLocaleString("zh-CN")}
- 重复处理：按正文 SHA-256 精确去重
- 内容边界：以巴菲特为主体；排除 Wesco、芒格、施洛斯等其他人物专篇和网站构建副本

| 分卷 | 篇数 | 字符数 |
|---|---:|---:|
${reportRows}

## 编辑结构

1. 人物、方法与商业判断
2. 合伙人时代
3. 伯克希尔股东信
4. 股东大会问答
5. 公开演讲
6. 访谈与对话

## 版式系统

- 封面与分卷页：黑白大留白，以 \`${ACCENT}\` 作纵向标识与强调
- 正文：中文衬线字体栈，1.78 倍行距，可由阅读器重排
- 标题：无衬线字体；二级标题使用红色左边线；三级标题使用红色字
- 引文：红色左边线；表格：黑白细线，无大面积彩色底
- 导航：书级目录、分卷目录、逐篇目录，支持章节跳转

## 收录明细

${volumes.map((volume) => `### ${volume.title}\n\n${volume.chapters.map((chapter) => `- ${chapter.title}（${chapter.source}）`).join("\n")}`).join("\n\n")}
`;
fs.writeFileSync(REPORT_PATH, report);

const sampleChapter = volumes[2].chapters.find((chapter) => chapter.year === 1989) || volumes[2].chapters[0];
const preview = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}
body.preview { background:#e9e9e9; } .spread { width:min(100%, 900px); margin:30px auto; background:#fff; box-shadow:0 12px 40px #0002; }
.cover-preview { max-width:520px; margin:30px auto; box-shadow:0 12px 40px #0003; } .cover-preview svg {display:block;width:100%;height:auto}
</style><title>巴菲特文集样章预览</title></head><body class="preview">
<div class="cover-preview">${coverSvg}</div>
<article class="spread"><main><div class="chapter-kicker">股东信 · ${sampleChapter.year}</div><h1>${esc(sampleChapter.title)}</h1>${markdownToXhtml(sampleChapter.markdown).slice(0, 18000)}</main></article>
</body></html>`;
fs.writeFileSync(PREVIEW_PATH, preview);

const printCss = `${css}
@page { size: A4; margin: 19mm 18mm 21mm; }
html, body { background: #ffffff; }
body { font-size: 10.5pt; line-height: 1.72; }
main { max-width: none; margin: 0; padding: 0; }
.print-title { min-height: 235mm; display:flex; flex-direction:column; justify-content:center; page-break-after:always; }
.print-title h1 { font-size: 30pt; margin: 0 0 8mm; }
.print-toc { page-break-after: always; }
.print-toc h1 { font-size: 22pt; }
.print-toc h2 { font-size: 13pt; margin-top: 8mm; }
.print-toc ol { columns: 2; column-gap: 10mm; list-style: none; padding: 0; }
.print-toc li { break-inside: avoid; border-bottom: 0.2mm solid #e5e5e5; padding: 1.4mm 0; text-align: left; }
.print-toc a { color: #111111; }
.print-volume { min-height: 235mm; display:flex; flex-direction:column; justify-content:center; page-break-before:always; page-break-after:always; }
.print-volume h1 { font-size: 25pt; max-width: 125mm; }
.print-chapter { page-break-before: always; }
.print-chapter > h1 { font-size: 20pt; line-height: 1.32; margin-bottom: 9mm; }
.print-chapter h2 { font-size: 14pt; margin-top: 8mm; }
.print-chapter h3 { font-size: 11.5pt; margin-top: 6mm; }
.print-chapter p { orphans: 3; widows: 3; }
.print-chapter blockquote, .print-chapter table, .print-chapter pre { break-inside: avoid; }
.chapter-source { font-size: 8pt; }
`;

const printToc = volumes
  .map(
    (volume, index) => `<section><h2>${esc(volume.title)}</h2><ol>${volume.chapters
      .map((chapter) => `<li><a href="#${chapter.id}">${esc(chapter.title)}</a></li>`)
      .join("")}</ol></section>`,
  )
  .join("");

const printContent = volumes
  .map(
    (volume, index) => `<section class="print-volume">
      <div class="volume-kicker">VOLUME ${String(index + 1).padStart(2, "0")}</div>
      <div class="red-rule"></div><h1>${esc(volume.title)}</h1>
      <p>${esc(volume.description)}</p><p class="chapter-source">本卷收录 ${volume.chapters.length} 篇</p>
    </section>
    ${volume.chapters
      .map(
        (chapter) => `<article class="print-chapter" id="${chapter.id}">
          <div class="chapter-kicker">${esc(volume.short)}${chapter.year ? ` · ${chapter.year}` : ""}</div>
          <h1>${esc(chapter.title)}</h1>
          <p class="chapter-source">资料库来源：${esc(chapter.source)}</p>
          ${markdownToXhtml(chapter.markdown)}
        </article>`,
      )
      .join("\n")}`,
  )
  .join("\n");

const printCover = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
@page { size:A4; margin:0; } html,body{margin:0;width:210mm;height:297mm;overflow:hidden;background:#fff}
svg{display:block;width:210mm;height:336mm;transform:scaleY(.884);transform-origin:top left}
</style><title>巴菲特文集封面</title></head><body>${coverSvg}</body></html>`;
fs.writeFileSync(PRINT_COVER_PATH, printCover);

const printBody = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${printCss}</style>
<title>巴菲特文集：1956—2025</title></head><body><main>
<section class="print-title"><div class="eyebrow">THE WARREN BUFFETT READER</div><div class="red-rule"></div>
<h1>巴菲特文集</h1><p>1956—2025</p><p>合伙人信 · 股东信 · 股东大会 · 演讲 · 访谈 · 专题文章</p>
<p class="chapter-source">依据本地“巴芒书院”资料库整理<br />配色：${ACCENT} / 黑 / 白</p></section>
<section class="print-toc"><div class="eyebrow">CONTENTS</div><h1>目录</h1>${printToc}</section>
<section class="print-chapter"><div class="eyebrow">编者说明</div><h1>如何阅读这部文集</h1>
<p>这不是一本替读摘要，而是一部按阅读路径重新编排的巴菲特资料集。全书以原始文稿为主体，把散落在资料库中的合伙人信、伯克希尔股东信、股东大会记录、演讲、访谈与专题文章统一到一套目录中。</p>
<div class="note"><strong>三条推荐路径</strong><p>初读者可从“人物与方法”进入；研究投资框架可依次阅读“合伙人时代”与“伯克希尔股东信”；查找现场观点可直接进入“股东大会”“演讲”或“访谈”。</p></div>
<p>整理时排除了以芒格、Wesco、施洛斯等其他人物为主体的专篇，以及网站生成的 HTML/TXT 重复文件。正文只做结构与版式标准化，不改写原文观点。</p></section>
${printContent}</main></body></html>`;
fs.writeFileSync(PRINT_BODY_PATH, printBody);

console.log(JSON.stringify({
  epub: EPUB_PATH,
  report: REPORT_PATH,
  preview: PREVIEW_PATH,
  printCover: PRINT_COVER_PATH,
  printBody: PRINT_BODY_PATH,
  volumes: volumes.map((v) => ({ title: v.title, chapters: v.chapters.length })),
  chapters: allChapters.length,
  chars: totalChars,
  bytes: epubBuffer.length,
}, null, 2));
