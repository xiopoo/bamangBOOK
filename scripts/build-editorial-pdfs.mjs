import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const buildDir = join(root, "tmp", "pdfs", "editorial-build");
const outputDir = join(root, "output", "pdf");

const books = [
  {
    key: "buffett",
    title: "所有者的眼光",
    subtitle: "巴菲特论企业、资本与长期复利",
    source: join(root, "editorial", "buffett", "manuscript", "全卷", "所有者的眼光_巴菲特卷全卷连续正文.md"),
    output: join(outputDir, "所有者的眼光_巴菲特卷_出版校样.pdf"),
  },
  {
    key: "munger",
    title: "理性的格栅",
    subtitle: "芒格论思维模型、商业判断与人生智慧",
    source: join(root, "editorial", "munger", "manuscript", "全卷", "理性的格栅_芒格卷全卷连续生产稿.md"),
    output: join(outputDir, "理性的格栅_芒格卷_出版校样.pdf"),
  },
];

mkdirSync(buildDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

function typstEscape(text) {
  return text.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function publicationBody(markdown) {
  const normalized = markdown.replaceAll("\r\n", "\n");
  const firstPart = normalized.search(/^# 第一篇/m);
  if (firstPart < 0) throw new Error("未找到第一篇标题，无法切分出版正文");
  return normalized.slice(firstPart).trim() + "\n";
}

function typstCaption(text) {
  // Caption text inside Typst content brackets: escape structural characters.
  return text.replaceAll("\\", "\\\\").replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function normalizePandocTypst(typst) {
  // GFM keeps footnote boundaries correctly for these manuscripts, but treats
  // heading attributes as visible text. Turn them into real Typst labels.
  let normalized = typst.replace(
    /^(=+ .+?) \{\\#([^}]+)\}\n<[^>]+>$/gm,
    "$1\n<$2>",
  );
  const labels = new Set(
    [...normalized.matchAll(/^<([^>]+)>$/gm)].map((match) => match[1]),
  );
  // A historical appendix link remains in the prose although that appendix is
  // outside the publication body. Keep its readable title without a dead link.
  normalized = normalized.replace(
    /#link\(<([^>]+)>\)\[([^\]]+)\]/g,
    (whole, label, text) => labels.has(label) ? whole : text,
  );
  // Wrap pandoc's raw image boxes into figures: centered, content width,
  // 1px light-grey border (visual-system.md), caption below the image.
  // The manuscript path is relative to the project root, so it must be
  // re-based with a leading "/" for Typst's --root resolution.
  normalized = normalized.replace(
    /#box\(image\(\s*"([^"]+)",\s*alt:\s*"([^"]*)"\s*\)\s*\)/g,
    (whole, path, caption) => {
      const absPath = path.startsWith("/") ? path : `/${path}`;
      const cap = typstCaption(caption);
      return `#figure(\n  block(\n    width: 100%,\n    inset: (x: 4pt, y: 6pt),\n    stroke: 0.5pt + rgb("E7E3DF"),\n    radius: 2pt,\n    align(center)[#image("${absPath}", width: 100%)],\n  ),\n  caption: [${cap}],\n)`;
    },
  );
  return normalized;
}

function wrapper(book, bodyFile) {
  const title = typstEscape(book.title);
  const subtitle = typstEscape(book.subtitle);
  return `#set page(
  paper: "a5",
  margin: (top: 19mm, bottom: 20mm, left: 17mm, right: 17mm),
  numbering: "1",
  number-align: bottom + center,
  fill: rgb("FAF8F4"),
)
#set text(font: ("Songti SC", "LiSong Pro", "STSong"), size: 10pt, lang: "zh", fill: rgb("151515"))
#set par(justify: true, leading: 0.78em, first-line-indent: 2em)
#set heading(numbering: none)
#set list(indent: 1.5em, body-indent: 0.6em)
#set enum(indent: 1.5em, body-indent: 0.6em)
#set table(stroke: 0.35pt + rgb("8A8A8A"), inset: 4pt)
#set figure.caption(position: bottom)
#show figure: set align(center)
#show figure.caption: set text(font: "Hiragino Sans GB", size: 8pt, fill: rgb("8A8A8A"))

#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  set text(font: "Songti SC", size: 18pt, weight: "bold", fill: rgb("AB1942"))
  set par(first-line-indent: 0em, leading: 0.82em)
  block(above: 8mm, below: 7mm)[#it.body]
}
#show heading.where(level: 2): it => {
  set text(font: "Hiragino Sans GB", size: 13pt, weight: "bold", fill: rgb("454545"))
  set par(first-line-indent: 0em)
  block(above: 1.1em, below: 0.55em)[#it.body]
}
#show heading.where(level: 3): it => {
  set text(font: "Hiragino Sans GB", size: 11pt, weight: "bold")
  set par(first-line-indent: 0em)
  block(above: 0.9em, below: 0.4em)[#it.body]
}
#show quote: it => block(
  inset: (left: 9pt, right: 4pt, y: 5pt),
  stroke: (left: 2pt + rgb("AB1942")),
  fill: rgb("E7E3DF"),
  radius: 2pt,
  width: 100%,
)[#set par(first-line-indent: 0em); #it.body]
#show link: it => text(fill: rgb("AB1942"), it)

#set page(numbering: none)
#align(center + horizon)[
  #block(width: 100%)[
    #text(font: "Songti SC", size: 27pt, weight: "bold", fill: rgb("AB1942"))[${title}]
    #v(9mm)
    #text(font: "Kaiti SC", size: 14pt, fill: rgb("454545"))[${subtitle}]
    #v(35mm)
    #line(length: 35mm, stroke: 0.8pt + rgb("AB1942"))
    #v(6mm)
    #text(size: 10pt, fill: rgb("8A8A8A"))[复利书房 · 巴芒经典]
    #v(3mm)
    #text(size: 8.5pt, fill: rgb("8A8A8A"))[出版校样 · 2026年8月]
  ]
]

#pagebreak()
#set page(numbering: "1")
#counter(page).update(1)
#set par(first-line-indent: 0em)
#align(center)[#text(font: "Hiragino Sans GB", size: 20pt, weight: "bold")[目录]]
#v(7mm)
#outline(title: none, depth: 2, indent: auto)
#pagebreak()
#set par(first-line-indent: 2em)
#include "${basename(bodyFile)}"
`;
}

for (const book of books) {
  const markdownPath = join(buildDir, `${book.key}.publication.md`);
  const bodyPath = join(buildDir, `${book.key}.body.typ`);
  const wrapperPath = join(buildDir, `${book.key}.book.typ`);
  const markdown = publicationBody(readFileSync(book.source, "utf8"));
  writeFileSync(markdownPath, markdown, "utf8");
  execFileSync("pandoc", [
    markdownPath,
    "-f", "gfm",
    "-t", "typst",
    "-o", bodyPath,
  ], { stdio: "inherit" });
  writeFileSync(bodyPath, normalizePandocTypst(readFileSync(bodyPath, "utf8")), "utf8");
  writeFileSync(wrapperPath, wrapper(book, bodyPath), "utf8");
  execFileSync("typst", ["compile", "--root", root, wrapperPath, book.output], { stdio: "inherit" });
  console.log(`${book.title}: ${book.output}`);
}
