import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { copyFileSync } from "node:fs";

const root = resolve(import.meta.dirname, "..");
const tmp = join(root, "tmp", "pdfs", "original-compilation-release");
const output = join(root, "output", "pdf");
mkdirSync(tmp, { recursive: true });
mkdirSync(output, { recursive: true });
copyFileSync(join(root, "public", "qrcode.jpeg"), join(tmp, "qrcode.jpeg"));

const books = [
  {
    key: "buffett",
    title: "所有者的眼光",
    person: "巴菲特",
    cover: join(root, "output", "ebook", ".巴菲特文集_封面临时.pdf"),
    body: join(root, "output", "ebook", ".巴菲特文集_正文临时.pdf"),
    output: join(output, "所有者的眼光.pdf"),
    copyright: ["丛书　复利书房经典（第一卷）", "书名　所有者的眼光——巴菲特论企业、资本与长期复利", "作者　华少（金家岭小胖）", "出品　复利书房 · fulilab.com", "版本　精编汇编版（2026）", "数字制作　本电子书由复利书房基于原始汇编材料自动排版生成。", "版权声明", "本书由华少（金家岭小胖）从沃伦·巴菲特数十年公开文字（致股东信、股东会问答、公开演讲与访谈）中整理、编排而成，为非商业个人学习作品，非官方授权著作，不代表巴菲特本人或伯克希尔·哈撒韦公司的立场。", "书中引文与原始材料的著作权归原作者及原权利人所有。本书的选编、结构与编排成果版权归作者所有。", "未经书面许可，不得以任何方式将本书整体或片段用于商业用途。个人学习、研究与交流可自由传播，请保留本版权页与完整署名。", "阅读原典，形成自己的判断。", "关于引文出处：全书沿用原汇编材料的出处与链接，作者已尽力核对，若有疏漏，以原始公开文献为准。", "欢迎关注公众号「金家岭小胖」，获取本系列更新与修订。", "fulilab.com"],
  },
  {
    key: "munger",
    title: "理性的格栅",
    person: "芒格",
    cover: join(root, "output", "ebook", ".芒格文集_封面临时.pdf"),
    body: join(root, "output", "ebook", ".芒格文集_正文临时.pdf"),
    output: join(output, "理性的格栅.pdf"),
    copyright: ["丛书　复利书房经典（第二卷）", "书名　理性的格栅——芒格论思维模型、商业判断与人生智慧", "作者　华少（金家岭小胖）", "出品　复利书房 · fulilab.com", "版本　精编汇编版（2026）", "数字制作　本电子书由复利书房基于原始汇编材料自动排版生成。", "版权声明", "本书由华少（金家岭小胖）从查理·芒格数十年公开文字、演讲与访谈中整理、编排而成，为非商业个人学习作品，非官方授权著作，不代表芒格本人、伯克希尔·哈撒韦公司或任何相关机构的立场。", "书中引文与原始材料的著作权归原作者及原权利人所有。本书的选编、结构与编排成果版权归作者所有。", "未经书面许可，不得以任何方式将本书整体或片段用于商业用途。个人学习、研究与交流可自由传播，请保留本版权页与完整署名。", "阅读原典，形成自己的判断。", "关于引文出处：全书沿用原汇编材料的出处与链接，作者已尽力核对，若有疏漏，以原始公开文献为准。", "欢迎关注公众号「金家岭小胖」，获取本系列更新与修订。", "fulilab.com"],
  },
];

function typstEscape(text) {
  return text.replaceAll("\\", "\\\\").replaceAll("[", "\\[").replaceAll("]", "\\]");
}

for (const book of books) {
  const body = book.copyright.map((line, index) => index === 1 ? `#text(size: 15pt, weight: "bold")[${typstEscape(line)}]` : index === 6 ? `#text(size: 12pt, weight: "bold", fill: rgb("AB1942"))[${typstEscape(line)}]` : `#text(size: 10.5pt)[${typstEscape(line)}]`).join("\n#v(5mm)\n");
  const qr = "qrcode.jpeg";
  const typ = `#set page(paper: "a4", margin: (top: 24mm, bottom: 22mm, left: 24mm, right: 24mm), header: none, footer: none)\n#set text(font: ("Songti SC", "LiSong Pro", "STSong"), size: 11pt, lang: "zh", fill: rgb("151515"))\n#set par(leading: 0.9em, justify: true)\n#text(font: "Songti SC", size: 21pt, weight: "bold", fill: rgb("AB1942"))[版权页]\n#line(length: 100%, stroke: 0.6pt + rgb("AB1942"))\n#v(9mm)\n${body}\n#v(7mm)\n#align(center)[#image("${qr}", width: 28mm)]\n`;
  const typPath = join(tmp, `${book.key}-copyright.typ`);
  const copyrightPdf = join(tmp, `${book.key}-copyright.pdf`);
  writeFileSync(typPath, typ, "utf8");
  execFileSync("typst", ["compile", typPath, copyrightPdf], { stdio: "inherit" });
  const total = book.key === "buffett" ? 4585 : 1905;
  execFileSync("/Users/lucas/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3", [join(root, "scripts", "merge-original-compilation-fixed.py"), book.cover, copyrightPdf, book.body, book.output, book.title, book.person, book.key === "buffett" ? "1956—2025" : "1924—2023", String(total)], { stdio: "inherit" });
  console.log(`${book.title}: ${book.output}`);
}
