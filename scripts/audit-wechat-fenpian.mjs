#!/usr/bin/env node
/**
 * audit-wechat-fenpian.mjs —— 复用 audit-book-ai-style.mjs 的 F01~F13 规则，
 * 对 xiaopond 公众号分篇 60 篇做 AI 味审计（只读，不改文件）。
 * 输出每篇命中清单，作为人工逐篇修改的"体检表"。
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fenpianDir = path.join(
  "/Users/lucas/Documents/bamangB/xiaopond/outputs/公众号发布/所有者的眼光_全书/适配稿/公众号分篇"
);

const exactRules = [
  { id: "F01", feature: "生产过程语言进入正文", severity: "strong", pattern: /编辑部|编辑框架|编辑判断|编辑示例|本项目|项目中文|内容身份|本章首次|全书首次|来源性质|主引文|交付标准|字符目标|形式审计|模型稿/gu },
  { id: "F02", feature: "无效的材料缺失声明", severity: "strong", pattern: /现有(?:资料|摘要|文本)|资料(?:显示|称|将)|(?:资料|摘要)(?:没有|未)(?:记录|提供|提到)|本章不(?:补写|复原|还原|搬进|搬入)|摘要里?没有/gu },
  { id: "F11", feature: "来源管理话术进入读者正文", severity: "strong", pattern: /(?:这份|该|上述|现有)(?:材料|资料)(?:的身份|是|显示|说明|称|提供|记录|未|没有)|项目(?:语录页|资料)|同一主题的另一处语录|(?:资料|材料)(?:摘要|综述)|另一处语录|正文里合成|来源性质|内容身份/gu },
  { id: "F03", feature: "替读者虚构误解", severity: "medium", pattern: /你可能(?:会)?(?:以为|认为|觉得)|有人(?:可能)?会说|读者可能(?:会)?(?:以为|认为)|乍看之下|看起来似乎|很容易把.+?理解为/gu },
  { id: "F04", feature: "概念命名仪式", severity: "medium", pattern: /不妨把.+?(?:称为|叫作)|可以把.+?(?:称为|叫作)|这里把.+?(?:称为|叫作)|这就是所谓的/gu },
  { id: "F05", feature: "过度升维或伪深刻收束", severity: "medium", pattern: /本质上|归根结底|说到底|最终定义了|真正的答案是|这才是.+?真正|这就是.+?本质|收束|收口|收尾|归结[为到]|凝练成|锚定[在到]|勾勒出|串[起成]全卷/gu },
  { id: "F12", feature: "小结型抽象动词（AI 味书面腔）", severity: "weak", pattern: /收束|收口|收尾|归结[为到]|凝练|锚定|勾勒|串[起成](?:为|全卷)|一笔带过地|一言以蔽[之]/gu },
  { id: "F13", feature: "结论被包装成抽象名词'判断'", severity: "medium", pattern: /判断纪律|判断标准|判断框架|判断体系|判断产物|判断落点|判断的尺度|把同一?判断|同一?个判断|核心判断|这个判断|那个判断|这套判断|一项判断|最终判断|整体判断|基本判断|关键判断/gu },
  { id: "F06", feature: "固定位置的弱连接词", severity: "weak", pattern: /值得注意的是|需要指出的是|毋庸置疑|不言而喻|显而易见|总的来说|总体而言|换句话说|事实上|实际上|此外|与此同时|当然/gu },
  { id: "F07", feature: "章节生产导航过密", severity: "medium", pattern: /本章(?:要|将|只|仅|先|讲|讨论|回答|采用|整理|补充)|这一章(?:要|将|先|讲|讨论|回答)|回顾本书|本书到目前为止/gu },
  { id: "F08", feature: "模板化收束句", severity: "weak", pattern: /走到这里|到这里，|由此可见|这也正是|这就解释了为什么|答案已经很清楚|问题的答案是/gu },
  { id: "F09", feature: "不必要的绝对化判断", severity: "medium", pattern: /毫无疑问|必然会|注定会|唯一的答案|全部证明了/gu },
];

function bodyOnly(text) {
  const notes = text.search(/^## (?:注释|注释与来源映射|来源与引文映射|本篇资料来源)$/mu);
  const body = notes >= 0 ? text.slice(0, notes) : text;
  return body
    .split(/(?=^## )/gmu)
    .filter((section) => {
      const title = section.match(/^## ([^\n]+)/mu)?.[1] ?? "";
      return !/^(?:档案证据|内部交叉链接|编辑说明|插图任务卡摘要)/u.test(title);
    })
    .join("")
    .replace(/^【插图占位[^\n]*】[^\n]*(?:\n图题：[^\n]*)?(?:\n画面：[^\n]*)?(?:\n注意：[^\n]*)?(?:\n|$)/gmu, "");
}

function proseLines(text) {
  return text.split("\n").map((line, index) => ({ line: index + 1, text: line.trim() }))
    .filter((item) => item.text && !item.text.startsWith(">") && !item.text.startsWith("|") && !item.text.startsWith("[^"));
}

function excerpt(text, index, length) {
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + length + 50);
  return text.slice(start, end).replace(/\s+/gu, " ").trim();
}

function lineAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

const files = fs.readdirSync(fenpianDir).filter((f) => f.endsWith(".md")).sort((a, b) => a.localeCompare(b, "zh-CN"));
const report = [];
for (const file of files) {
  const raw = fs.readFileSync(path.join(fenpianDir, file), "utf8");
  const body = bodyOnly(raw);
  const searchable = proseLines(body).map((item) => item.text).join("\n");
  const hits = [];
  for (const rule of exactRules) {
    for (const match of searchable.matchAll(rule.pattern)) {
      hits.push({ rule: rule.id, severity: rule.severity, match: match[0], excerpt: excerpt(searchable, match.index, match[0].length) });
    }
  }
  if (hits.length) {
    report.push({ file, hits });
  }
}

// 控制台输出
console.log(`\n=== 公众号分篇 60 篇 AI 味审计（仅正文/非引用/非表格）===\n`);
for (const r of report) {
  console.log(`\n📄 ${r.file}  —  命中 ${r.hits.length} 处`);
  for (const h of r.hits) {
    console.log(`  [${h.rule}/${h.severity}] "${h.match}"  …  ${h.excerpt.slice(0, 70)}`);
  }
}
console.log(`\n共 ${report.length} 篇有命中。`);
