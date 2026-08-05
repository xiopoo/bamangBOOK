import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "editorial/shared/audit");

const books = [
  {
    id: "buffett",
    name: "《所有者的眼光》巴菲特卷",
    files: [
      "editorial/buffett/manuscript/出版分章/01_第一章 股票背后是一家企业.md",
      "editorial/buffett/manuscript/出版分章/02_第二章 价值不在报价屏上.md",
      "editorial/buffett/manuscript/出版分章/03_第三章 穿过会计看所有者收益.md",
      "editorial/buffett/manuscript/出版分章/04_第四章 安全边际与能力圈.md",
      "editorial/buffett/manuscript/出版分章/05_第五章 伯克希尔纺织：便宜为何仍会昂贵.md",
      "editorial/buffett/manuscript/出版分章/06_第六章 喜诗糖果：企业质量改变资本配置.md",
      "editorial/buffett/manuscript/出版分章/07_第七章 护城河必须经得住时间.md",
      "editorial/buffett/manuscript/出版分章/08_第八章 选择经理人：能力、精力与正直.md",
      "editorial/buffett/manuscript/出版分章/09_第九章 信任、声誉与去中心化.md",
      "editorial/buffett/manuscript/出版分章/10_第十章 经理人的第二项工作.md",
      "editorial/buffett/manuscript/出版分章/11_第十一章 回购、收购与价格纪律.md",
      "editorial/buffett/manuscript/出版分章/12_第十二章 浮存金：资本优势不是免费午餐.md",
      "editorial/buffett/manuscript/出版分章/13_第十三章 风险不是一条波动曲线.md",
      "editorial/buffett/manuscript/出版分章/14_第十四章 现金与恐慌中的选择权.md",
      "editorial/buffett/manuscript/出版分章/15_第十五章 把个人判断变成可传承的复利制度.md",
    ],
  },
  {
    id: "munger",
    name: "《理性的格栅》芒格卷",
    files: fs.readdirSync(path.join(root, "editorial/munger/manuscript/连续生产"))
      .filter((file) => /^\d{2}_.+\.md$/u.test(file))
      .sort((a, b) => a.localeCompare(b, "zh-CN"))
      .map((file) => `editorial/munger/manuscript/连续生产/${file}`),
  },
];

const exactRules = [
  {
    id: "F01",
    feature: "生产过程语言进入正文",
    severity: "strong",
    pattern: /编辑部|编辑框架|编辑判断|编辑示例|本项目|项目中文|内容身份|本章首次|全书首次|来源性质|主引文|交付标准|字符目标|形式审计|模型稿/gu,
  },
  {
    id: "F02",
    feature: "无效的材料缺失声明",
    severity: "strong",
    pattern: /现有(?:资料|摘要|文本)|资料(?:显示|称|将)|(?:资料|摘要)(?:没有|未)(?:记录|提供|提到)|本章不(?:补写|复原|还原|搬进|搬入)|摘要里?没有/gu,
  },
  {
    id: "F11",
    feature: "来源管理话术进入读者正文",
    severity: "strong",
    pattern: /(?:这份|该|上述|现有)(?:材料|资料)(?:的身份|是|显示|说明|称|提供|记录|未|没有)|项目(?:语录页|资料)|同一主题的另一处语录|(?:资料|材料)(?:摘要|综述)|另一处语录|正文里合成|来源性质|内容身份/gu,
  },
  {
    id: "F03",
    feature: "替读者虚构误解",
    severity: "medium",
    pattern: /你可能(?:会)?(?:以为|认为|觉得)|有人(?:可能)?会说|读者可能(?:会)?(?:以为|认为)|乍看之下|看起来似乎|很容易把.+?理解为/gu,
  },
  {
    id: "F04",
    feature: "概念命名仪式",
    severity: "medium",
    pattern: /不妨把.+?(?:称为|叫作)|可以把.+?(?:称为|叫作)|这里把.+?(?:称为|叫作)|这就是所谓的/gu,
  },
  {
    id: "F05",
    feature: "过度升维或伪深刻收束",
    severity: "medium",
    pattern: /本质上|归根结底|说到底|最终定义了|真正的答案是|这才是.+?真正|这就是.+?本质/gu,
  },
  {
    id: "F06",
    feature: "固定位置的弱连接词",
    severity: "weak",
    pattern: /值得注意的是|需要指出的是|毋庸置疑|不言而喻|显而易见|总的来说|总体而言|换句话说|事实上|实际上|此外|与此同时|当然/gu,
  },
  {
    id: "F07",
    feature: "章节生产导航过密",
    severity: "medium",
    pattern: /本章(?:要|将|只|仅|先|讲|讨论|回答|采用|整理|补充)|这一章(?:要|将|先|讲|讨论|回答)|回顾本书|本书到目前为止/gu,
  },
  {
    id: "F08",
    feature: "模板化收束句",
    severity: "weak",
    pattern: /走到这里|到这里，|由此可见|这也正是|这就解释了为什么|答案已经很清楚|问题的答案是/gu,
  },
  {
    id: "F09",
    feature: "不必要的绝对化判断",
    severity: "medium",
    pattern: /毫无疑问|必然会|注定会|唯一的答案|全部证明了/gu,
  },
];

const contrastPattern = /(?:不是[^。！？\n]{0,55}而是|并非[^。！？\n]{0,55}而是|不在于[^。！？\n]{0,55}而在于|不是[^。！？\n]{0,55}只是)/gu;

function bodyOnly(text) {
  const notes = text.search(/^## (?:注释|注释与来源映射|来源与引文映射)$/mu);
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
  const start = Math.max(0, index - 36);
  const end = Math.min(text.length, index + length + 72);
  return text.slice(start, end).replace(/\s+/gu, " ").trim();
}

function lineAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

function countSentences(text) {
  return text.split(/[。！？]+/u).map((item) => item.replace(/\s+/gu, "").trim()).filter((item) => item.length >= 8);
}

function clusteredMatchIndexes(matches, windowSize = 800, minimum = 3) {
  const indexes = new Set();
  let left = 0;
  for (let right = 0; right < matches.length; right += 1) {
    while (matches[right].index - matches[left].index > windowSize) left += 1;
    if (right - left + 1 >= minimum) {
      for (let index = left; index <= right; index += 1) indexes.add(index);
    }
  }
  return indexes;
}

function chapterAudit(relative) {
  const raw = fs.readFileSync(path.join(root, relative), "utf8");
  const body = bodyOnly(raw);
  const searchable = proseLines(body).map((item) => item.text).join("\n");
  const hits = [];
  for (const rule of exactRules) {
    for (const match of searchable.matchAll(rule.pattern)) {
      hits.push({
        rule: rule.id,
        feature: rule.feature,
        severity: rule.severity,
        line: lineAt(searchable, match.index),
        match: match[0],
        excerpt: excerpt(searchable, match.index, match[0].length),
      });
    }
  }
  const contrasts = [...searchable.matchAll(contrastPattern)];
  const clusteredContrasts = clusteredMatchIndexes(contrasts);
  for (const index of clusteredContrasts) {
    const match = contrasts[index];
    hits.push({
      rule: "F10",
      feature: "高密度‘不是X而是Y’翻转",
      severity: "medium",
      line: lineAt(searchable, match.index),
      match: match[0],
      excerpt: excerpt(searchable, match.index, match[0].length),
    });
  }
  const sentences = countSentences(searchable);
  const lengths = sentences.map((sentence) => [...sentence].length);
  const mean = lengths.reduce((sum, value) => sum + value, 0) / Math.max(lengths.length, 1);
  const variance = lengths.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / Math.max(lengths.length, 1);
  const sentenceLengthCv = mean ? Math.sqrt(variance) / mean : 0;
  const chars = [...searchable].length;
  const emDashes = (searchable.match(/——/gu) ?? []).length;
  const rhetoricalQuestions = (searchable.match(/[？?]/gu) ?? []).length;
  return {
    file: relative,
    characters: chars,
    sentences: sentences.length,
    sentenceLengthCv: Number(sentenceLengthCv.toFixed(3)),
    emDashes,
    emDashesPer10k: Number((emDashes * 10000 / Math.max(chars, 1)).toFixed(2)),
    rhetoricalQuestions,
    contrasts: contrasts.length,
    clusteredContrasts: clusteredContrasts.size,
    contrastsPer10k: Number((contrasts.length * 10000 / Math.max(chars, 1)).toFixed(2)),
    hits,
  };
}

const results = books.map((book) => {
  const chapters = book.files.map(chapterAudit);
  const hits = chapters.flatMap((chapter) => chapter.hits.map((hit) => ({ file: chapter.file, ...hit })));
  const byRule = Object.fromEntries([...new Set(hits.map((hit) => hit.rule))].sort().map((id) => [id, hits.filter((hit) => hit.rule === id).length]));
  const highContrastChapters = chapters.filter((chapter) => chapter.clusteredContrasts > 0);
  const highDashChapters = chapters.filter((chapter) => chapter.emDashesPer10k > 18);
  const strong = hits.filter((hit) => hit.severity === "strong").length;
  const medium = hits.filter((hit) => hit.severity === "medium").length;
  const weak = hits.filter((hit) => hit.severity === "weak").length;
  return {
    id: book.id,
    name: book.name,
    chapters: chapters.length,
    characters: chapters.reduce((sum, chapter) => sum + chapter.characters, 0),
    summary: { strong, medium, weak, total: hits.length, byRule, highContrastChapters: highContrastChapters.length, highDashChapters: highDashChapters.length },
    chapterResults: chapters,
    hits,
  };
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "双卷AI写作特征审计.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), methodology: "机器筛查只生成候选；引文、专业定义、必要反证及作者固有修辞须人工豁免。", results }, null, 2)}\n`);

const severityLabel = { strong: "强", medium: "中", weak: "弱" };
const markdown = [
  "# 巴菲特卷、芒格卷 AI 写作特征审计",
  "",
  `生成时间：${new Date().toISOString()}`,
  "",
  "本报告用于发现候选问题，不把机器命中直接等同于 AI 写作。人物原话、专业定义、必要反证与有意修辞须人工复核；严禁据此全局替换。",
  "",
  ...results.flatMap((book) => [
    `## ${book.name}`,
    "",
    `- 章节：${book.chapters}`,
    `- 正文扫描字符：${book.characters}`,
    `- 强信号：${book.summary.strong}`,
    `- 中信号：${book.summary.medium}`,
    `- 弱信号：${book.summary.weak}`,
    `- 存在“800 字内三次以上对立模板”聚集的章节：${book.summary.highContrastChapters}`,
    `- 双破折号密度超过 18 次/万字的章节：${book.summary.highDashChapters}`,
    "",
    "| 章文件 | 强 | 中 | 弱 | 对立模板 | 聚集命中 | 每万字 | 双破折号/万字 |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...book.chapterResults.map((chapter) => {
      const count = (severity) => chapter.hits.filter((hit) => hit.severity === severity).length;
      return `| ${path.basename(chapter.file)} | ${count("strong")} | ${count("medium")} | ${count("weak")} | ${chapter.contrasts} | ${chapter.clusteredContrasts} | ${chapter.contrastsPer10k} | ${chapter.emDashesPer10k} |`;
    }),
    "",
    "### 优先人工复核候选",
    "",
    ...book.hits.filter((hit) => hit.severity !== "weak").slice(0, 80).map((hit, index) => `${index + 1}. **${hit.rule} ${hit.feature}（${severityLabel[hit.severity]}）**｜${path.basename(hit.file)}｜“${hit.excerpt}”`),
    "",
  ]),
].join("\n");
fs.writeFileSync(path.join(outDir, "双卷AI写作特征审计.md"), `${markdown}\n`);

console.log(JSON.stringify(Object.fromEntries(results.map((book) => [book.id, book.summary])), null, 2));
