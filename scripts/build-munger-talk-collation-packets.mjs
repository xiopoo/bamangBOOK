import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalogDir = join(root, "editorial", "shared", "source-catalog");
const register = JSON.parse(readFileSync(join(catalogDir, "core-document-register.json"), "utf8")).register;
const outputDir = join(root, "editorial", "munger", "collation", "poor-charlie-talks");

const boundaryNotes = {
  "munger-poor-charlie-talk-one": "开头含第三人称编者导语，文末另有《穷查理宝典》来源尾注；需与演讲正文隔离。",
  "munger-poor-charlie-talk-three": "中文覆盖 1996 年演讲与问答，但缺 Stripe Press 书页另附的 2006 年 ‘Talk Three — Revisited’；文末还夹有‘孙涤教授在《上海证券报》第一次将巴菲特思想引入中国’说明，不属于本次演讲。不得自行翻译补齐。",
  "munger-poor-charlie-talk-four": "文末夹有‘巴菲特午餐时光：吃汉堡，喝可乐，看电视’图片说明，不属于演讲正文。",
  "munger-poor-charlie-talk-six": "开头含多段第三人称编者导语，正文中另有未标明身份的传记性括注；需逐项隔离。",
  "munger-poor-charlie-talk-seven": "开头含两段第三人称编者导语，文末附‘塞缪尔·约翰逊名言’列表；中文本身又是节选，均需核对边界。",
  "munger-poor-charlie-talk-eight": "开头首段为第三人称作品介绍，不是芒格虚构文章正文。",
  "munger-poor-charlie-talk-nine": "开头含第三人称现场叙述；中文含‘重读第九讲’，但在官方 Revisited 结尾的拉比引语之后又接入第三人称编者评论，需按英文底本切开正文与附加材料。",
  "munger-poor-charlie-talk-ten": "开头含第三人称典礼介绍，正文间穿插孔子、芒格法官和《天路历程》等解释性资料，需标为编者注。",
  "munger-poor-charlie-talk-eleven": "官方英文全文底本现已保存；中文文件仍明确只是二十五种心理倾向的框架摘录，并含编者说明，不是完整演讲正文。",
};

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (path, rows) => {
  const headers = Object.keys(rows[0] || {});
  writeFileSync(path, `${[headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n")}\n`);
};
const visibleChars = (text) => text.replace(/\s+/g, "").length;
const englishWords = (text) => (text.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length;
const hanChars = (text) => (text.match(/[\u3400-\u9fff]/g) || []).length;

const rows = register.filter((row) => row.workKey?.startsWith("munger-poor-charlie-talk-"));
const groups = new Map();
for (const row of rows) {
  if (!groups.has(row.workKey)) groups.set(row.workKey, []);
  groups.get(row.workKey).push(row);
}
if (groups.size !== 11) throw new Error(`Expected 11 Poor Charlie talk families, found ${groups.size}`);

mkdirSync(outputDir, { recursive: true });
const records = [...groups.entries()].map(([workKey, family]) => {
  const chinese = family.find((row) => row.language === "zh");
  const english = family.find((row) => row.language === "en");
  if (!chinese || !english) throw new Error(`Incomplete bilingual family: ${workKey}`);
  const renderedEnglishPath = english.sourceSupport === "official-web-rendered-original-local"
    ? english.sourcePaths.find((sourcePath) => sourcePath.endsWith(".source.txt"))
    : undefined;
  const englishPath = renderedEnglishPath || english.relative;
  const englishCompleteness = renderedEnglishPath ? "official-rendered-full-page" : english.completeness;
  if (!existsSync(join(root, chinese.relative)) || !existsSync(join(root, englishPath))) {
    throw new Error(`Missing local file for ${workKey}`);
  }
  const chineseText = readFileSync(join(root, chinese.relative), "utf8");
  const englishText = readFileSync(join(root, englishPath), "utf8");
  const chineseSha256 = sha256(chineseText);
  const englishSha256 = sha256(englishText);

  let status = "full-pair-candidate-needs-paragraph-collation";
  let gateNote = "中英文均为全文候选，仍需逐段核对，未正式验收。";
  if (english.sourceSupport.includes("fragment")) {
    status = "blocked-english-source-fragment";
    gateNote = "英文对应文件是摘要、删节或未完整抓取，不能用来验收中文全文。";
  } else if (chinese.completeness === "selection-or-excerpt") {
    status = "chinese-selection-not-full-document";
    gateNote = "英文底本较完整，但中文文件明确是节选，只能按节选收录或另找完整中文译本。";
  } else if (workKey === "munger-poor-charlie-talk-three" && renderedEnglishPath) {
    status = "chinese-missing-official-revisited-appendix";
    gateNote = "1996 年中文演讲正文可继续校勘，但当前中文文件缺官方书页所附的 2006 年重读附文，不能作为该版完整中文稿验收。";
  }
  const boundaryNote = boundaryNotes[workKey] || "";
  if (boundaryNote) gateNote = `${gateNote} ${boundaryNote}`;

  const packetRelative = `editorial/munger/collation/poor-charlie-talks/${workKey}_中英校勘包.md`;
  const packetPath = join(root, packetRelative);
  const packet = [
    `# ${chinese.title}｜中英校勘包`,
    "",
    `> 校勘状态：${status}`,
    `> ${gateNote}`,
    `> - 中文候选：\`${chinese.relative}\``,
    `> - 英文候选：\`${englishPath}\``,
    `> - 在线来源：${english.sourceUrl || chinese.sourceUrl}`,
    `> - 中文 SHA-256：\`${chineseSha256}\``,
    `> - 英文 SHA-256：\`${englishSha256}\``,
    "",
    "## 英文候选（原 Markdown 原样嵌入）",
    "",
    `<!-- ENGLISH-BEGIN ${englishPath} ${englishSha256} -->`,
    englishText,
    `<!-- ENGLISH-END ${englishPath} -->`,
    "",
    "## 中文候选（原 Markdown 原样嵌入）",
    "",
    `<!-- CHINESE-BEGIN ${chinese.relative} ${chineseSha256} -->`,
    chineseText,
    `<!-- CHINESE-END ${chinese.relative} -->`,
    "",
    "## 人工校勘记录",
    "",
    "- [ ] 标题、日期、场合与演讲版本一致",
    "- [ ] 英文底本完整度已经确认",
    "- [ ] 段落无整段遗漏、重复或错位",
    "- [ ] 引语、专名、数字和案例逐项核对",
    "- [ ] 译者注、编者注与芒格正文完全隔离",
    "- [ ] 实质性修订已登记校勘日志",
    "",
  ].join("\n");
  writeFileSync(packetPath, packet);

  const saved = readFileSync(packetPath, "utf8");
  const extract = (beginMarker, endMarker) => {
    const begin = saved.indexOf(`${beginMarker}\n`);
    const end = saved.indexOf(`\n${endMarker}`, begin + beginMarker.length + 1);
    return begin >= 0 && end >= 0 ? saved.slice(begin + beginMarker.length + 1, end) : "";
  };
  const extractedEnglish = extract(`<!-- ENGLISH-BEGIN ${englishPath} ${englishSha256} -->`, `<!-- ENGLISH-END ${englishPath} -->`);
  const extractedChinese = extract(`<!-- CHINESE-BEGIN ${chinese.relative} ${chineseSha256} -->`, `<!-- CHINESE-END ${chinese.relative} -->`);
  const fidelityPass = sha256(extractedEnglish) === englishSha256 && sha256(extractedChinese) === chineseSha256;
  if (!fidelityPass) throw new Error(`Packet fidelity failed: ${workKey}`);

  return {
    workKey,
    year: chinese.year,
    title: chinese.title,
    chinesePath: chinese.relative,
    chineseCompleteness: chinese.completeness,
    chineseSha256,
    chineseBytes: Buffer.byteLength(chineseText),
    chineseHanChars: hanChars(chineseText),
    englishPath,
    englishCompleteness,
    englishSourceSupport: english.sourceSupport,
    englishSha256,
    englishBytes: Buffer.byteLength(englishText),
    englishWords: englishWords(englishText),
    englishVisibleChars: visibleChars(englishText),
    sourceUrl: english.sourceUrl || chinese.sourceUrl,
    status,
    boundaryReviewRequired: Boolean(boundaryNote),
    boundaryNote,
    packet: packetRelative,
    fidelityPass,
  };
}).sort((a, b) => Number(a.year || 9999) - Number(b.year || 9999) || a.workKey.localeCompare(b.workKey));

const generatedAt = new Date().toISOString();
const counts = Object.fromEntries([...new Set(records.map((record) => record.status))].map((status) => [status, records.filter((record) => record.status === status).length]));
const jsonPath = join(catalogDir, "munger-talk-collation-packets.json");
const csvPath = join(catalogDir, "munger-talk-collation-packets.csv");
const indexPath = join(outputDir, "00_中英校勘包索引.md");
const reportPath = join(catalogDir, "芒格演讲中英校勘包生成报告.md");

writeFileSync(jsonPath, `${JSON.stringify({ generatedAt, count: records.length, counts, records }, null, 2)}\n`);
writeCsv(csvPath, records);
writeFileSync(indexPath, [
  "# 芒格演讲中英校勘包索引",
  "",
  `- 生成时间：${generatedAt}`,
  `- 版本族：${records.length} 个`,
  `- 可进入逐段校勘的全文候选：${counts["full-pair-candidate-needs-paragraph-collation"] || 0} 个`,
  `- 中文明确为节选：${counts["chinese-selection-not-full-document"] || 0} 个`,
  `- 英文底本残缺，阻塞全文验收：${counts["blocked-english-source-fragment"] || 0} 个`,
  `- 中文缺官方 Revisited 附文：${counts["chinese-missing-official-revisited-appendix"] || 0} 个`,
  `- 发现非正文边界问题：${records.filter((record) => record.boundaryReviewRequired).length} 个`,
  "",
  ...records.map((record, index) => `${index + 1}. [${record.title}](./${basename(record.packet)})：${record.status}${record.boundaryReviewRequired ? "；需隔离编者或附加材料" : ""}`),
  "",
].join("\n"));
writeFileSync(reportPath, [
  "# 芒格演讲中英校勘包生成报告",
  "",
  `- 生成时间：${generatedAt}`,
  `- 中英版本族：${records.length} 个`,
  `- 全文候选：${counts["full-pair-candidate-needs-paragraph-collation"] || 0} 个`,
  `- 中文节选：${counts["chinese-selection-not-full-document"] || 0} 个`,
  `- 英文残缺：${counts["blocked-english-source-fragment"] || 0} 个`,
  `- 中文缺官方 Revisited 附文：${counts["chinese-missing-official-revisited-appendix"] || 0} 个`,
  `- 非正文边界待处理：${records.filter((record) => record.boundaryReviewRequired).length} 个`,
  `- 中英文嵌入哈希复核：${records.filter((record) => record.fidelityPass).length}/${records.length} 通过`,
  "",
  "## 已发现的中文边界问题",
  "",
  ...records.filter((record) => record.boundaryReviewRequired).map((record) => `- \`${record.chinesePath}\`：${record.boundaryNote}`),
  "",
  "十一讲英文底本现均可在本地核对。当前剩余正文缺口位于中文侧：第三讲缺官方 Revisited 附文，第七讲与第十一讲明确为节选；继续寻找既有中文底本，不由 AI 翻译或补写。",
  "",
].join("\n"));

console.log(JSON.stringify({
  generatedAt,
  count: records.length,
  counts,
  fidelityPassed: records.filter((record) => record.fidelityPass).length,
  index: indexPath.slice(root.length + 1),
  report: reportPath.slice(root.length + 1),
}, null, 2));
