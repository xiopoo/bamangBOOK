import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { chromium } from "playwright";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "output", "pdf");
fs.mkdirSync(OUT_DIR, { recursive: true });

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function renderInline(node) { return (node.children || []).map(renderNode).join(""); }
function renderNode(node) {
  switch (node.type) {
    case "root": return node.children.map(renderNode).join("\n");
    case "text": return esc(node.value);
    case "paragraph": return `<p>${renderInline(node)}</p>`;
    case "heading": return `<h${Math.min(6, node.depth + 1)}>${renderInline(node)}</h${Math.min(6, node.depth + 1)}>`;
    case "strong": return `<strong>${renderInline(node)}</strong>`;
    case "emphasis": return `<em>${renderInline(node)}</em>`;
    case "delete": return `<del>${renderInline(node)}</del>`;
    case "inlineCode": return `<code>${esc(node.value)}</code>`;
    case "code": return `<pre><code>${esc(node.value)}</code></pre>`;
    case "blockquote": return `<blockquote>${node.children.map(renderNode).join("\n")}</blockquote>`;
    case "list": return `<${node.ordered ? "ol" : "ul"}>${node.children.map(renderNode).join("")}</${node.ordered ? "ol" : "ul"}>`;
    case "listItem": return `<li>${node.children.map(renderNode).join("\n")}</li>`;
    case "link": return `<a href="${esc(node.url)}">${renderInline(node)}</a>`;
    case "image": return `<figure class="image-note"><figcaption>〔${esc(node.alt || "原文图片")}〕</figcaption></figure>`;
    case "break": return "<br>";
    case "thematicBreak": return "<hr>";
    case "table": return `<div class="table-wrap"><table>${node.children.map(renderNode).join("")}</table></div>`;
    case "tableRow": return `<tr>${node.children.map(renderNode).join("")}</tr>`;
    case "tableCell": return `<td>${renderInline(node)}</td>`;
    case "html": return node.value;
    case "footnoteDefinition": return `<aside class="footnote">${node.children.map(renderNode).join("\n")}</aside>`;
    case "footnoteReference": return `<sup>[${esc(node.identifier)}]</sup>`;
    default: return node.children ? node.children.map(renderNode).join("") : "";
  }
}
function markdownToHtml(markdown) {
  return renderNode(unified().use(remarkParse).use(remarkGfm).parse(markdown));
}
function sourceTitle(file, content) {
  const parsed = matter(content);
  if (parsed.data?.title) return String(parsed.data.title).trim();
  const match = parsed.content.match(/^#\s+(.+)$/m);
  return match ? match[1].replace(/\*\*/g, "").trim() : path.basename(file, ".md");
}
function yearOf(file) { return Number((file.match(/(?:19|20)\d{2}/) || [0])[0]); }

const configs = [
  {
    person: "buffett",
    manifest: "editorial/theme-manifest/buffett-theme-order.json",
    title: "巴菲特文集",
    subtitle: "所有者的眼光·主题编辑汇编版",
    years: "1956—2025",
    output: "巴菲特文集_所有者的眼光主题汇编.pdf",
    footer: "THE WARREN BUFFETT READER",
  },
  {
    person: "munger",
    manifest: "editorial/theme-manifest/munger-theme-order.json",
    title: "芒格文集",
    subtitle: "理性的格栅·主题编辑汇编版",
    years: "1924—2023",
    output: "芒格文集_理性的格栅主题汇编.pdf",
    footer: "THE CHARLIE MUNGER READER",
  },
];

const css = `
@page { size: A4; margin: 18mm 17mm 21mm; }
html, body { margin:0; padding:0; color:#171717; background:#fff; }
body { font-family:"Songti SC","STSong","Noto Serif CJK SC",serif; font-size:10.5pt; line-height:1.72; text-align:justify; }
main { max-width:100%; margin:0 auto; }
p { margin:0 0 0.85em; }
h1,h2,h3,h4 { font-family:"PingFang SC","Noto Sans CJK SC",sans-serif; text-align:left; page-break-after:avoid; }
h1 { font-size:22pt; line-height:1.3; margin:0 0 8mm; }
h2 { font-size:15pt; color:#AB1942; border-left:3px solid #AB1942; padding-left:5mm; margin:9mm 0 4mm; }
h3 { font-size:12pt; margin:6mm 0 2mm; }
blockquote { margin:4mm 0; padding:2mm 4mm; border-left:3px solid #AB1942; color:#444; }
blockquote p:last-child { margin-bottom:0; }
ul,ol { padding-left:7mm; }
li { margin:1mm 0; }
a { color:#8d1738; text-decoration:none; }
pre { white-space:pre-wrap; background:#f4f4f4; padding:3mm; }
code { background:#f3f3f3; padding:0 1mm; }
table { width:100%; border-collapse:collapse; font-size:9pt; }
td { border-bottom:0.2mm solid #bbb; padding:1.5mm; vertical-align:top; }
.table-wrap { overflow:visible; margin:3mm 0 5mm; }
.image-note { border:0.2mm dashed #aaa; min-height:8mm; padding:2mm; color:#777; text-align:center; }
.footnote { font-size:8.5pt; color:#555; border-top:0.2mm solid #bbb; margin-top:3mm; padding-top:2mm; }
.title { min-height:245mm; display:flex; flex-direction:column; justify-content:center; page-break-after:always; }
.title .kicker,.theme .kicker,.article .kicker { color:#AB1942; font-family:"PingFang SC",sans-serif; font-weight:700; letter-spacing:.12em; }
.title .kicker { font-size:12pt; }
.title h1 { font-size:32pt; margin:8mm 0 3mm; }
.title p { font-size:14pt; text-align:left; }
.theme { min-height:245mm; display:flex; flex-direction:column; justify-content:center; page-break-before:always; page-break-after:always; }
.theme h1 { font-size:27pt; max-width:140mm; }
.theme .count { color:#666; }
.toc { page-break-after:always; }
.toc h1 { font-size:25pt; }
.toc h2 { border:0; padding:0; margin-top:5mm; font-size:13pt; }
.toc ol { columns:2; column-gap:9mm; list-style:none; padding:0; }
.toc li { border-bottom:.2mm solid #ddd; padding:1.2mm 0; break-inside:avoid; }
.article { page-break-before:always; }
.article .kicker { font-size:8pt; margin-bottom:3mm; }
.article h1 { font-size:19pt; }
.source-card { border-top:.2mm solid #bbb; border-bottom:.2mm solid #bbb; padding:2mm 0; margin:0 0 5mm; color:#666; font-size:8.5pt; text-align:left; }
`;

async function build(config) {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, config.manifest), "utf8"));
  const primaries = manifest.entries.filter((x) => x.status === "primary").sort((a, b) => a.order - b.order);
  const themes = [...new Map(primaries.map((x) => [x.themeId, { id:x.themeId, name:x.theme }])).values()]
    .sort((a, b) => a.id.localeCompare(b.id));
  const grouped = new Map(themes.map((x) => [x.id, primaries.filter((p) => p.themeId === x.id)]));
  const toc = themes.map((theme) => `<h2>${esc(theme.name)}</h2><ol>${grouped.get(theme.id).map((item) => `<li>${esc(item.title)}${item.year ? `（${item.year}）` : ""}</li>`).join("")}</ol>`).join("");
  const content = themes.map((theme) => {
    const items = grouped.get(theme.id);
    return `<section class="theme"><div class="kicker">THEME ${theme.id}</div><h1>${esc(theme.name)}</h1><p class="count">本主题收录 ${items.length} 篇文章。文章正文保持原文件内容，只调整编排位置。</p></section>${items.map((item) => {
      const raw = fs.readFileSync(path.join(ROOT, item.file), "utf8");
      const parsed = matter(raw);
      const body = markdownToHtml(parsed.content);
      return `<article class="article"><div class="kicker">${esc(theme.name)} · ${item.year || "资料"}</div><h1>${esc(item.title)}</h1><div class="source-card">来源：${esc(item.file)}<br>材料正文哈希：${esc(item.hash)}</div>${body}</article>`;
    }).join("\n")}`;
  }).join("\n");
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${css}</style><title>${esc(config.title)}</title></head><body><main><section class="title"><div class="kicker">${esc(config.footer)}</div><h1>${esc(config.title)}</h1><p>${esc(config.subtitle)}</p><p>${esc(config.years)}</p><p class="source-card">主题编辑汇编版：文章正文不改写，只按主题调整顺序；重复版本按主版本规则处理。</p></section><section class="toc"><h1>目录</h1>${toc}</section>${content}</main></body></html>`;
  const htmlPath = path.join(OUT_DIR, `${config.output.replace(/\.pdf$/, "")}.html`);
  fs.writeFileSync(htmlPath, html);
  const pdfPath = path.join(OUT_DIR, config.output);
  const browser = await chromium.launch({ headless:true });
  try {
    const page = await browser.newPage({ viewport:{ width:1200, height:1697 } });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil:"load", timeout:120000 });
    await page.emulateMedia({ media:"print" });
    await page.pdf({ path:pdfPath, format:"A4", printBackground:true, preferCSSPageSize:true, displayHeaderFooter:true, headerTemplate:`<div style="font-size:8px;color:#777;width:100%;padding:0 17mm;font-family:Arial,sans-serif;display:flex;justify-content:space-between;"><span>${esc(config.title)}</span><span style="color:#AB1942">${esc(config.footer)}</span></div>`, footerTemplate:`<div style="font-size:8px;color:#777;width:100%;padding:0 17mm;font-family:Arial,sans-serif;display:flex;justify-content:space-between;"><span>${esc(config.years)}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`, margin:{ top:"17mm", right:"17mm", bottom:"20mm", left:"17mm" }, timeout:0 });
  } finally { await browser.close(); }
  console.log(JSON.stringify({ person:config.person, articles:primaries.length, themes:themes.length, html:htmlPath, pdf:pdfPath }, null, 2));
}

for (const config of configs) await build(config);
