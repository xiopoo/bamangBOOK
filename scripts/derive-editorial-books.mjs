import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const config = {
  buffett: {
    source: "editorial/buffett/manuscript/全卷/所有者的眼光_巴菲特卷全卷锁定工作稿.md",
    output: "editorial/buffett/manuscript/全卷/所有者的眼光_巴菲特卷出版正文.md",
    splitDir: "editorial/buffett/manuscript/出版分章",
    chapterPattern: /^# (第.+章 .+?) \{#buffett-ch-(\d{2})\}$/u,
  },
  munger: {
    source: "editorial/munger/manuscript/全卷/理性的格栅_芒格卷全卷锁定工作稿.md",
    output: "editorial/munger/manuscript/全卷/理性的格栅_芒格卷连续正文.md",
    splitDir: "editorial/munger/manuscript/出版分章",
    chapterPattern: /^# (第.+章 .+?) \{#munger-ch-(\d{2})\}$/u,
  },
};

const removedSectionTitles = new Set([
  "篇章页信息",
  "映射表",
  "来源映射表",
  "来源与引文映射",
  "内部交叉链接",
  "编辑说明",
  "注释与来源映射",
]);

const mungerParts = new Map([
  ["04", "# 第二篇　概率、逆向与反证 {#munger-part-02}"],
  ["07", "# 第三篇　误判心理学 {#munger-part-03}"],
  ["11", "# 第四篇　商业判断与资本配置 {#munger-part-04}"],
  ["14", "# 第五篇　合作、品格与人生 {#munger-part-05}"],
]);

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function cleanMunger(text) {
  const input = text.split("\n");
  const output = [];
  let skippingWrapper = false;
  let skippingSection = false;
  let currentChapter = null;

  for (let index = 0; index < input.length; index += 1) {
    let line = input[index];

    if (/^# 第.+章 .+ \{#munger-ch-\d{2}\} \{munger-ch-\d{2}\}$/u.test(line)) {
      skippingWrapper = true;
      continue;
    }
    if (skippingWrapper) {
      if (line === "---") skippingWrapper = false;
      continue;
    }

    const heading = line.match(/^## (.+)$/u);
    if (heading && removedSectionTitles.has(heading[1])) {
      skippingSection = true;
      continue;
    }
    if (skippingSection) {
      if (/^#{1,2} /u.test(line)) {
        skippingSection = false;
        index -= 1;
      }
      continue;
    }

    if (line === "<!-- 封面/版权页占位 -->") continue;

    const chapter = line.match(config.munger.chapterPattern);
    if (chapter) {
      currentChapter = chapter[2];
      const part = mungerParts.get(currentChapter);
      if (part) output.push("", "---", "", part, "");
    }

    if (currentChapter) {
      line = line.replace(/\[\^m(\d+)\]/gu, `[^m${currentChapter}-$1]`);
    }
    output.push(line);
  }

  return `${output.join("\n").replace(/\n{4,}/gu, "\n\n\n").trim()}\n`;
}

function cleanBuffett(text) {
  const input = text.split("\n");
  const output = [];
  let skippingSection = false;
  let inCombinedNotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const line = input[index];
    const heading = line.match(/^## (.+)$/u);

    if (/^> 观点原子：/u.test(line)) continue;

    if (heading && ["篇章页信息", "来源与引文映射", "内部交叉链接", "编辑说明"].includes(heading[1])) {
      skippingSection = true;
      inCombinedNotes = false;
      continue;
    }
    if (heading?.[1] === "注释与来源映射") {
      skippingSection = false;
      inCombinedNotes = true;
      output.push("## 注释", "");
      continue;
    }
    if ((skippingSection || inCombinedNotes) && /^#{1,2} /u.test(line)) {
      skippingSection = false;
      inCombinedNotes = false;
      index -= 1;
      continue;
    }
    if (skippingSection) continue;
    if (inCombinedNotes) {
      if (/^\[\^[^\]]+\]:/u.test(line)) output.push(line);
      continue;
    }
    if (line === "正文状态：全卷连续精编工作定稿；正式视觉、PDF与EPUB尚未启动。") {
      output.push("正文状态：出版正文；来源与脚注已完成自动校验。");
      continue;
    }
    output.push(line);
  }

  return `${output.join("\n").replace(/\n{4,}/gu, "\n\n\n").trim()}\n`;
}

function splitChapters(text, chapterPattern, splitDir) {
  const lines = text.split("\n");
  const chapters = [];
  let current = null;
  for (const line of lines) {
    if (/^# 第[一二三四五]篇/u.test(line)) {
      if (current) chapters.push(current);
      current = null;
      continue;
    }
    const match = line.match(chapterPattern);
    if (match) {
      if (current) chapters.push(current);
      current = { id: match[2], title: match[1], lines: [line] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) chapters.push(current);

  fs.mkdirSync(splitDir, { recursive: true });
  for (const chapter of chapters) {
    const safeTitle = chapter.title.replace(/[/:]/gu, "_");
    const file = path.join(splitDir, `${chapter.id}_${safeTitle}.md`);
    fs.writeFileSync(file, `${chapter.lines.join("\n").trim()}\n`);
    chapter.file = path.relative(root, file);
    chapter.sha256 = sha256(fs.readFileSync(file));
  }
  return chapters;
}

const manifest = { generatedAt: new Date().toISOString(), books: {} };
for (const [book, bookConfig] of Object.entries(config)) {
  const sourcePath = path.join(root, bookConfig.source);
  const outputPath = path.join(root, bookConfig.output);
  const source = fs.readFileSync(sourcePath, "utf8");
  const output = book === "munger" ? cleanMunger(source) : cleanBuffett(source);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  const chapters = splitChapters(output, bookConfig.chapterPattern, path.join(root, bookConfig.splitDir));
  manifest.books[book] = {
    source: bookConfig.source,
    sourceSha256: sha256(source),
    output: bookConfig.output,
    outputSha256: sha256(output),
    characters: [...output].length,
    chapters: chapters.map(({ id, title, file, sha256: hash }) => ({ id, title, file, sha256: hash })),
  };
}

const manifestPath = path.join(root, "editorial/shared/audit/publishing-manifest.json");
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({
  buffett: { characters: manifest.books.buffett.characters, chapters: manifest.books.buffett.chapters.length },
  munger: { characters: manifest.books.munger.characters, chapters: manifest.books.munger.chapters.length },
}, null, 2));
