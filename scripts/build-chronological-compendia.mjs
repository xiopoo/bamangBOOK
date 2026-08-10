import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { chromium } from "playwright";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "editorial", "theme-manifest");
const OUT = path.join(ROOT, "output", "pdf");
const esc = (s = "") => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function csvRows(file) {
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const parse = (line) => { const out = []; let cur = "", q = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (c === "," && !q) { out.push(cur); cur = ""; } else cur += c; } out.push(cur); return out; };
  const head = parse(lines.shift());
  return lines.map((line) => Object.fromEntries(parse(line).map((v, i) => [head[i], v])));
}

function yearOf(row, body = "") {
  const text = `${row.year || ""} ${row.file || ""} ${row.title || ""}`;
  const hit = text.match(/(?:19|20)\d{2}/) || body.slice(0, 1200).match(/(?:19|20)\d{2}/);
  return hit ? Number(hit[0]) : 0;
}

function titleOf(file, body, data) {
  if (data.title) return String(data.title).trim();
  const h = body.match(/^#\s+(.+)$/m);
  if (h) return h[1].replace(/\*\*/g, "").trim();
  return path.basename(file, ".md")
    .replace(/^partnership_(\d{4})-annual-巴菲特致合伙人信$/, "$1 年度致合伙人信")
    .replace(/^partnership_(\d{4})-interim-巴菲特致合伙人信$/, "$1 年中致合伙人信")
    .replace(/^partnership_(\d{4})-(.+)-巴菲特致合伙人信$/, "$1 年 $2 致合伙人信")
    .replace(/^partnership_(\d{4})-巴菲特致合伙人信$/, "$1 年致合伙人信")
    .replace(/^partnership_(\d{4})-有限合伙协议$/, "$1 年有限合伙协议")
    .replace(/^berkshire_(\d{4})-巴菲特致股东信$/, "$1 年致股东信")
    .replace(/^daily-journal-(\d{4})-fireside$/, "$1 年每日期刊会后炉边谈话")
    .replace(/^daily-journal-(\d{4})$/, "$1 年每日期刊股东大会")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();
}
function withoutLeadingTitle(body, title) {
  const lines = body.split(/\r?\n/);
  const i = lines.findIndex((line) => line.trim());
  if (i >= 0 && /^#\s+/.test(lines[i])) {
    const candidate = lines[i].replace(/^#\s+/, "").replace(/\*\*/g, "").trim();
    if (candidate === title) lines.splice(i, 1);
  }
  return lines.join("\n");
}

function render(node) {
  const kids = () => (node.children || []).map(render).join("");
  switch (node.type) {
    case "root": return kids();
    case "text": return esc(node.value);
    case "paragraph": return `<p>${kids()}</p>`;
    case "heading": return `<h${Math.min(6, node.depth + 1)}>${kids()}</h${Math.min(6, node.depth + 1)}>`;
    case "strong": return `<strong>${kids()}</strong>`;
    case "emphasis": return `<em>${kids()}</em>`;
    case "delete": return `<del>${kids()}</del>`;
    case "inlineCode": return `<code>${esc(node.value)}</code>`;
    case "code": return `<pre><code>${esc(node.value)}</code></pre>`;
    case "blockquote": return `<blockquote>${kids()}</blockquote>`;
    case "list": return `<${node.ordered ? "ol" : "ul"}>${kids()}</${node.ordered ? "ol" : "ul"}>`;
    case "listItem": return `<li>${kids()}</li>`;
    case "link": return `<a href="${esc(node.url)}">${kids()}</a>`;
    case "image": return `<span class="image-note">〔原文插图：${esc(node.alt || "未命名")}〕</span>`;
    case "break": return "<br>";
    case "thematicBreak": return "<hr>";
    case "table": return `<div class="table-wrap"><table>${kids()}</table></div>`;
    case "tableRow": return `<tr>${kids()}</tr>`;
    case "tableCell": return `<td>${kids()}</td>`;
    case "html": return `<div class="raw-note">${esc(node.value)}</div>`;
    default: return kids();
  }
}
function mdToHtml(body) { return render(unified().use(remarkParse).use(remarkGfm).parse(body)); }

const css = `
@page { size: A4; margin: 17mm 16mm 18mm; }
* { box-sizing: border-box; }
body { margin: 0; color: #171717; font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif; font-size: 10.5pt; line-height: 1.72; }
.cover { min-height: 245mm; display:flex; flex-direction:column; justify-content:flex-start; padding: 30mm 0 0 14mm; border-top: 6mm solid #ab1942; page-break-after:always; }
.cover::before { content:""; position:absolute; left:0; top:30mm; height:155mm; width:2.3mm; background:#ab1942; }
.kicker { color:#ab1942; letter-spacing:.16em; font: 11pt Arial,sans-serif; text-transform:uppercase; }
h1 { font-size: 27pt; line-height:1.2; margin: 16mm 0 6mm; }
.cover h1 { margin: 8mm 0 5mm; font-size: 31pt; }
.cover-subtitle { font-size: 13pt; letter-spacing:.03em; }
.cover-years { margin-top: 10mm; font: 44pt Georgia,serif; font-weight:700; color:#111; }
.cover-years span { display:block; margin-top:2mm; font-size:20pt; color:#ab1942; }
.cover-rule { width:120mm; height:1.2mm; background:#111; margin-top:18mm; }
.cover-credit { margin-top:auto; display:flex; justify-content:space-between; align-items:center; font-size:10pt; }
.cover-mark { width:17mm; height:17mm; border-radius:50%; background:#ab1942; color:#fff; display:flex; align-items:center; justify-content:center; font:bold 18pt Georgia,serif; }
.copyright { page-break-after:always; padding-top:12mm; }
.copyright h2 { page-break-before:avoid; color:#111; border-bottom:1px solid #222; padding-bottom:3mm; }
.copyright p { text-align:left; }
h2 { color:#ab1942; font-size:18pt; margin: 12mm 0 6mm; page-break-before:avoid; }
h3 { font-size: 15pt; margin: 8mm 0 4mm; }
.note { border-top:1px solid #bbb; border-bottom:1px solid #bbb; padding:4mm 0; color:#666; }
.toc { page-break-after:always; columns:2; column-gap:10mm; }
.toc h2 { column-span:all; page-break-before:avoid; }
.toc-item { break-inside:avoid; border-bottom:1px solid #ddd; padding:2mm 0; }
.toc-page { float:right; color:#555; }
.article { page-break-before:always; }
.article-head { border-bottom:1px solid #222; margin-bottom:7mm; padding-bottom:4mm; }
.meta { color:#777; font: 8.5pt Arial,sans-serif; }
p { margin: 0 0 4mm; text-align: justify; }
blockquote { margin: 5mm 0; padding: 2mm 5mm; border-left: 3px solid #ab1942; color:#444; }
pre { white-space: pre-wrap; background:#f5f5f5; padding:3mm; font-size:8.5pt; }
.table-wrap { overflow:hidden; margin:4mm 0; } table { border-collapse:collapse; width:100%; font-size:9pt; } td { border:1px solid #ccc; padding:2mm; }
.raw-note { color:#777; font-size:8.5pt; }
.image-note { color:#777; font-style:italic; }
`;

function makeHtml({ person, bookTitle, subtitle, years, rows }) {
  const label = person === "巴菲特" ? "THE WARREN BUFFETT READER" : "THE CHARLIE MUNGER READER";
  const sections = rows.map((r, i) => `<section class="article"><div class="article-head"><div class="meta">第${String(i + 1).padStart(3, "0")}篇 · ${r.year || "未标年"} · ${esc(r.type)}</div><h3>${esc(r.title)}</h3></div>${mdToHtml(r.body)}</section>`).join("\n");
  const toc = rows.map((r, i) => `<div class="toc-item" data-index="${i}"><b>${r.year || "未标年"}</b>　${esc(r.title)}<span class="toc-page"></span></div>`).join("");
  const copyright = person === "巴菲特"
    ? "本书由华少（金家岭小胖）从沃伦·巴菲特数十年公开文字中整理、编排与校订而成，为非商业个人学习作品，非官方授权著作，不代表巴菲特本人或伯克希尔·哈撒韦公司的立场。书中原文著作权归原作者及原权利人所有；本书的选编、结构与编辑成果版权归作者所有。"
    : "本书由华少（金家岭小胖）从查理·芒格数十年公开文字中整理、编排与校订而成，为非商业个人学习作品，非官方授权著作，不代表芒格本人或任何相关机构的立场。书中原文著作权归原作者及原权利人所有；本书的选编、结构与编辑成果版权归作者所有。";
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${css}</style></head><body><main><section class="cover"><div class="kicker">${label}</div><h1>${esc(bookTitle)}</h1><div class="cover-subtitle">${esc(subtitle)}</div><div class="cover-years">${esc(years.split("—")[0])}<span>— ${esc(years.split("—")[1] || "")}</span></div><div class="cover-rule"></div><div class="cover-credit"><span>巴芒书院资料库 · 精读编排版</span><span class="cover-mark">${person === "巴菲特" ? "B" : "M"}</span></div></section><section class="copyright"><h2>版权页</h2><p><strong>书名：</strong>${esc(bookTitle)}</p><p><strong>作者：</strong>华少（金家岭小胖）</p><p><strong>版本：</strong>精编典藏版（2026）</p><p><strong>出品：</strong>复利书房</p><p>${copyright}</p><p>阅读原典，形成自己的判断。</p></section><section class="toc"><h2>目录</h2>${toc}</section>${sections}</main></body></html>`;
}

function findArticlePages(pdfPath, rows) {
  const py = [
    "import json, re, sys",
    "from pypdf import PdfReader",
    "pdf, titles = sys.argv[1], json.loads(sys.argv[2])",
    "def norm(s): return re.sub(r'\\s+', '', (s or '')).lower()",
    "pages = [norm(p.extract_text() or '') for p in PdfReader(pdf).pages]",
    "out=[]; cursor=0",
    "for title in titles:",
    "    needle=norm(title); found=None",
    "    for i in range(cursor, len(pages)):",
    "        if needle and needle in pages[i]: found=i+1; break",
    "    if found is None:",
    "        short=needle[:18]",
    "        for i in range(cursor, len(pages)):",
    "            if short and short in pages[i]: found=i+1; break",
    "    out.append(found or 0)",
    "    if found: cursor=found-1",
    "print(json.dumps(out, ensure_ascii=False))",
  ].join("\n");
  const pyPath = "/Users/lucas/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
  const result = spawnSync(pyPath, ["-c", py, pdfPath, JSON.stringify(rows.map((_r, i) => `第${String(i + 1).padStart(3, "0")}篇`))], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`TOC page audit failed: ${result.stderr}`);
  return JSON.parse(result.stdout.trim());
}

function injectTocPages(html, pages) {
  return html.replace(/(<div class="toc-item" data-index="(\d+)">[\s\S]*?<\/div>)/g, (full, _unused, index) => full.replace('<span class="toc-page"></span>', `<span class="toc-page">${pages[Number(index)] || "—"}</span>`));
}

async function renderPdf(html, pdfPath, person, bookTitle, years) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
  await page.setContent(html, { waitUntil: "load" });
  const label = person === "巴菲特" ? "THE WARREN BUFFETT READER" : "THE CHARLIE MUNGER READER";
  const headerTemplate = `<div style="width:100%;font:8px Arial,sans-serif;color:#9b1742;padding:0 16mm;display:flex;justify-content:space-between;"><span>${esc(bookTitle)}</span><span>${label}</span></div>`;
  const footerTemplate = `<div style="width:100%;font:8px Arial,sans-serif;color:#777;padding:0 16mm;display:flex;justify-content:space-between;"><span>${esc(years)}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate, footerTemplate, margin: { top: "17mm", right: "16mm", bottom: "18mm", left: "16mm" } });
  await browser.close();
}

function loadRows(kind) {
  const file = path.join(MANIFEST, `${kind}-theme-order.csv`);
  return csvRows(file).filter((r) => r.status === "primary").map((r) => {
    const f = path.join(ROOT, r.file); const raw = fs.readFileSync(f, "utf8"); const parsed = matter(raw);
    const title = titleOf(f, parsed.content, parsed.data);
    return { ...r, file: r.file, body: withoutLeadingTitle(parsed.content, title), title, year: yearOf(r, parsed.content), type: r.file.includes("letters/") ? "股东信" : r.file.includes("partnership/") ? "合伙人信" : r.file.includes("recordings/") ? "演讲/问答" : "文章" };
  }).sort((a, b) => (a.year || 9999) - (b.year || 9999) || a.file.localeCompare(b.file, "zh-CN"));
}

const core = {
  buffett: [
    "content/articles/buffett/我最看好的股票：GEICO_保险_1951.md", "content/partnership/partnership_1956-有限合伙协议.md", "content/partnership/partnership_1957-巴菲特致合伙人信.md", "content/letters/berkshire_1977-巴菲特致股东信.md", "content/letters/berkshire_1985-巴菲特致股东信.md", "content/letters/berkshire_1989-巴菲特致股东信.md", "content/letters/berkshire_1994-巴菲特致股东信.md", "content/articles/buffett/伯克希尔股东手册_1996.md", "content/letters/berkshire_2008-巴菲特致股东信.md", "content/letters/berkshire_2014-巴菲特致股东信.md", "content/letters/berkshire_2023-巴菲特致股东信.md"
  ],
  munger: [
    "poor-charlies-almanack/poor-charlies-almanack-talk-one.md", "poor-charlies-almanack/poor-charlies-almanack-talk-two.md", "poor-charlies-almanack/poor-charlies-almanack-talk-three.md", "poor-charlies-almanack/poor-charlies-almanack-talk-five.md", "poor-charlies-almanack/poor-charlies-almanack-talk-ten.md", "content/talks/芒格：DJ_年会_2013.md", "content/munger-archive/recordings/daily-journal-2017.md", "content/munger-archive/recordings/daily-journal-2023.md", "content/munger-archive/recordings/michigan-2011.md", "content/munger-archive/recordings/michigan-ross-2017.md", "content/munger-archive/recordings/cnbc-final-interview-2023.md"
  ]
};

function coreRows(kind, all) {
  const wanted = new Set(core[kind]);
  return all.filter((r) => wanted.has(r.file)).sort((a, b) => (a.year || 9999) - (b.year || 9999) || a.file.localeCompare(b.file, "zh-CN"));
}

async function build(kind, person, bookTitle, subtitle, years) {
  const all = loadRows(kind);
  const mainHtml = makeHtml({ person, bookTitle, subtitle, years, rows: all });
  const stem = bookTitle;
  fs.mkdirSync(OUT, { recursive: true });
  const htmlPath = path.join(OUT, `${stem}.html`);
  const pdfPath = path.join(OUT, `${stem}.pdf`);
  fs.writeFileSync(htmlPath, mainHtml);
  await renderPdf(mainHtml, pdfPath, person, bookTitle, years);
  const pages = findArticlePages(pdfPath, all);
  const finalHtml = injectTocPages(mainHtml, pages);
  fs.writeFileSync(htmlPath, finalHtml);
  await renderPdf(finalHtml, pdfPath, person, bookTitle, years);
  console.log(JSON.stringify({ person, bookTitle, articles: all.length, years, pdf: path.join(OUT, `${stem}.pdf`) }, null, 2));
}

await build("buffett", "巴菲特", "所有者的眼光", "巴菲特论企业、资本与长期复利", "1951—2025");
await build("munger", "芒格", "理性的格栅", "芒格论思维模型、商业判断与人生智慧", "1924—2023");
