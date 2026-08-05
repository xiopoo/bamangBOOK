import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const chapterDir = path.join(root, "editorial/munger/manuscript/连续生产");
const output = path.join(root, "editorial/munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md");
const backmatter = [
  "editorial/munger/appendices/附录一_模型身份与思想源流对照表.md",
  "editorial/munger/appendices/附录二_双轨判断检查清单5组.md",
  "editorial/munger/appendices/附录三_25种心理倾向速查表.md",
  "editorial/munger/indexes/典藏A_芒格年表1924-2023.md",
  "editorial/munger/indexes/典藏B_关键人物与关键企业索引.md",
  "editorial/munger/indexes/典藏C_概念问题案例三类索引.md",
];

const parts = new Map([
  ["01", ["第一篇　从一元思维到多元格栅", "为什么单一工具会扭曲现实，以及知识怎样连接成可调用、可更新的判断结构。"]],
  ["04", ["第二篇　概率、逆向与反证", "把故事改写成可以检验的判断，并用逆向、反证和清单控制错误。"]],
  ["07", ["第三篇　误判心理学", "理解判断者自身的心理倾向，以及激励、群体和权威怎样彼此增强。"]],
  ["11", ["第四篇　商业判断与资本配置", "把多元模型带进会计、企业质量、机会成本与资本配置。"]],
  ["14", ["第五篇　合作、品格与人生", "把判断方法推进到合作、避错、责任和一生尺度。"]],
]);

const files = fs.readdirSync(chapterDir)
  .filter((name) => /^\d{2}_.+\.md$/u.test(name))
  .sort((a, b) => a.localeCompare(b, "zh-CN"));

if (files.length !== 16) throw new Error(`连续生产章节应为16个，实际为${files.length}个`);

function readerFacing(text) {
  return text
    .replace(/`(?:content|poor-charlies-almanack|editorial)\/[^`]+\.md`/gu, "")
    .replace(/本章引文(?:（[^）]*）|·(?:定义|转折|判断))?/gu, "引文")
    .replace(/第(?:一|二|三|四|五|六|七|八|九|十|十一|十二|十三|十四|十五|十六)章引文(?:·(?:定义|转折|判断))?/gu, "相关引文")
    .replace(/(?:本章|本节)(?:为)?首次(?:完整)?(?:使用|引用|展开|分析)?/gu, "")
    .replace(/来源性质为/gu, "来源为")
    .replace(/属编者的概括，非逐字原话/gu, "为概括，并非逐字原话")
    .replace(/编辑整理/gu, "资料整理")
    .replace(/资料显示["“]思维模型的栅格["”]表述首次出现在1994年演讲/gu, "“思维模型的栅格”这一表述见于1994年演讲")
    .replace(/(?:两)?模型稿/gu, "相关资料")
    .replace(/本章(?:只|仅)取/gu, "此处引用")
    .replace(/本章不重复/gu, "相关内容参见前文，本文不重复")
    .replace(/本章(?:只|仅)交叉引用/gu, "相关内容参见前文")
    .replace(/为本书运用([^，。；]+)的推演/gu, "为依据$1所作的分析")
    .replace(/正文以编辑论述呈现/gu, "正文未作直接引语")
    .replace(/通用模型与编辑扩展/gu, "通用模型及延伸分析")
    .replace(/为编辑转述大意/gu, "为转述大意")
    .replace(/为编辑归纳/gu, "为归纳")
    .replace(/引文，。/gu, "引文。")
    .replace(/本节为与分析/gu, "并在本节展开分析")
    .replace(/本章案例三，。/gu, "")
    .replace(/概括。。/gu, "概括。")
    .replace(/([；、])\s*(?=[，；、])/gu, "")
    .replace(/，\s*，/gu, "，")
    .replace(/；\s*；/gu, "；")
    .replace(/、\s*、/gu, "、")
    .replace(/^(\[\^[^\]]+\]:)\s*[，；、]\s*/gmu, "$1 ")
    .replace(/资料页\s+(?=亦|确认|记录|注明|显示)/gu, "")
    .replace(/[ \t]+([，。；：])/gu, "$1");
}

const body = [];
for (const file of files) {
  const id = file.slice(0, 2);
  const part = parts.get(id);
  if (part) {
    const partNo = [...parts.keys()].indexOf(id) + 1;
    body.push("", "---", "", `# ${part[0]} {#munger-part-0${partNo}}`, "", "## 篇首导读", "", part[1], "");
  }
  body.push(readerFacing(fs.readFileSync(path.join(chapterDir, file), "utf8")).trim(), "");
}

body.push("", "---", "", "# 附录与典藏层 {#munger-backmatter}", "");
for (const relative of backmatter) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) throw new Error(`缺少附录或典藏文件：${relative}`);
  body.push(readerFacing(fs.readFileSync(absolute, "utf8")).trim(), "");
}

const front = [
  "# 理性的格栅——芒格论思维模型、商业判断与人生智慧",
  "",
  "系列：复利书房·巴芒经典",
  "",
];

fs.writeFileSync(output, `${front.join("\n")}${body.join("\n").replace(/\n{4,}/gu, "\n\n\n").trim()}\n`);
console.log(output);
