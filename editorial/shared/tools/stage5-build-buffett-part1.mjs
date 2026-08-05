import fs from "node:fs";
import path from "node:path";

const directory = path.resolve(import.meta.dirname, "../../buffett/manuscript/第一篇_所有者的起点");
const files = [
  "篇首导读.md",
  "第一章_股票背后是一家企业.md",
  "第二章_价值不在报价屏上.md",
  "第三章_穿过会计看所有者收益.md",
  "篇末收束.md",
];
const content = files.map((file) => fs.readFileSync(path.join(directory, file), "utf8").trim()).join("\n\n---\n\n");
fs.writeFileSync(path.join(directory, "第一篇_所有者的起点_完整工作稿.md"), `${content}\n`);

const revisedChapters = [
  ["第一章_股票背后是一家企业.md", "第一章_二次精编扩充.md", "第一章_二次精编修订稿.md"],
  ["第二章_价值不在报价屏上.md", "第二章_二次精编扩充.md", "第二章_二次精编修订稿.md"],
  ["第三章_穿过会计看所有者收益.md", "第三章_二次精编扩充.md", "第三章_二次精编修订稿.md"],
];
for (const [base, expansion, output] of revisedChapters) {
  const revised = `${fs.readFileSync(path.join(directory, base), "utf8").trim()}\n\n${fs.readFileSync(path.join(directory, expansion), "utf8").trim()}\n`;
  fs.writeFileSync(path.join(directory, output), revised);
}
const revisedFiles = [
  "篇首导读.md",
  "第一章_二次精编修订稿.md",
  "第二章_二次精编修订稿.md",
  "第三章_二次精编修订稿.md",
  "篇末收束.md",
];
const revisedContent = revisedFiles.map((file) => fs.readFileSync(path.join(directory, file), "utf8").trim()).join("\n\n---\n\n");
fs.writeFileSync(path.join(directory, "第一篇_所有者的起点_二次精编完整修订稿.md"), `${revisedContent}\n`);
console.log(JSON.stringify({
  files,
  output: path.join(directory, "第一篇_所有者的起点_完整工作稿.md"),
  characters: content.length,
  revisedFiles,
  revisedOutput: path.join(directory, "第一篇_所有者的起点_二次精编完整修订稿.md"),
  revisedCharacters: revisedContent.length,
}, null, 2));
