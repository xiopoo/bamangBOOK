#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputRelative = "editorial/shared/source-catalog";
const outputRoot = path.join(root, outputRelative);
const generatedAt = new Date().toISOString();

const ignoredDirectoryNames = new Set([
  ".git",
  ".next",
  "node_modules",
  ".cache",
  ".venv",
  ".playwright-cli",
]);

function slash(value) {
  return value.split(path.sep).join("/");
}

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const absolute = path.join(directory, entry.name);
    const relative = slash(path.relative(root, absolute));
    if (entry.isDirectory()) {
      if (ignoredDirectoryNames.has(entry.name) || relative === outputRelative) continue;
      files.push(...walk(absolute));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(absolute);
    }
  }
  return files;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizedText(text) {
  return text
    .replace(/^---\s*[\s\S]*?\n---\s*/u, "")
    .replace(/<!--[^]*?-->/gu, "")
    .replace(/\{#[^}]+\}/gu, "")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

function firstTitle(text, relative) {
  const name = path.basename(relative, path.extname(relative));
  const shareholder = name.match(/^berkshire_((?:19|20)\d{2})-巴菲特致股东信$/u);
  if (shareholder) {
    return shareholder[1] === "2025"
      ? "2025 年感恩节致股东信"
      : `${shareholder[1]} 年巴菲特致伯克希尔股东信`;
  }
  const partnership = name.match(/^partnership_((?:19|20)\d{2})(?:-([^-]+))?-巴菲特致合伙人信$/u);
  if (partnership) {
    const labels = {
      annual: "年度",
      interim: "年中",
      bond: "免税债券",
      liquidation: "清算",
    };
    const detail = partnership[2] ? (labels[partnership[2]] ?? partnership[2]) : "";
    if (detail === "年度") return `${partnership[1]} 年度致合伙人信`;
    return `${partnership[1]} 年${detail ? ` ${detail}` : ""}致合伙人信`;
  }
  const agreement = name.match(/^partnership_((?:19|20)\d{2})-有限合伙协议$/u);
  if (agreement) return `${agreement[1]} 年有限合伙协议`;
  const heading = text.match(/^#{1,3}\s+(.+?)\s*$/mu)?.[1];
  if (heading) return heading.replace(/\{#[^}]+\}/gu, "").trim();
  const firstNonEmpty = text.split(/\r?\n/u).map((line) => line.trim()).find(Boolean);
  if (firstNonEmpty && firstNonEmpty.length <= 120 && !firstNonEmpty.startsWith("---")) return firstNonEmpty;
  return path.basename(relative, path.extname(relative));
}

function countMatches(text, expression) {
  return [...text.matchAll(expression)].length;
}

function languageFor(text) {
  const sample = text.slice(0, 120000);
  const han = countMatches(sample, /[\p{Script=Han}]/gu);
  const latin = countMatches(sample, /[A-Za-z]/gu);
  const total = han + latin;
  if (total === 0) return "unknown";
  const ratio = han / total;
  if (ratio >= 0.28) return "zh";
  if (ratio <= 0.04) return "en";
  return "mixed";
}

function yearFor(relative, text) {
  const pathYears = [...relative.matchAll(/(?:^|[^0-9])((?:19|20)\d{2})(?![0-9])/gu)].map((match) => Number(match[1]));
  if (pathYears.length) return pathYears[0];
  const headYears = [...text.slice(0, 1600).matchAll(/(?:^|[^0-9])((?:19|20)\d{2})(?![0-9])/gu)].map((match) => Number(match[1]));
  return headYears[0] ?? "";
}

function firstUrl(text) {
  return text.match(/https?:\/\/[^\s)>\]"']+/u)?.[0] ?? "";
}

function workspaceArea(relative) {
  if (relative.startsWith("content/") || relative.startsWith("poor-charlies-almanack/")) return "source-corpus";
  if (relative.startsWith("editorial/") || relative.startsWith("recovery_archive/") || relative.startsWith("reports/") || relative.startsWith("output/")) return "editorial-or-output";
  if (relative.startsWith("tmp/")) return "temporary";
  if (relative.startsWith(".trae/") || relative.startsWith(".codebuddy/") || relative.startsWith(".agently-home/")) return "workspace-infrastructure";
  if (relative.startsWith("docs/")) return "project-documentation";
  return "workspace-other";
}

function speakerSignals(text) {
  const head = text.slice(0, 240000);
  const buffett = countMatches(head, /(?:^|\n)\s*(?:巴菲特|沃伦(?:·|・|\s)?巴菲特|WARREN BUFFETT|Warren Buffett|WB)\s*[：:]/gmu);
  const munger = countMatches(head, /(?:^|\n)\s*(?:芒格|查理(?:·|・|\s)?芒格|CHARLIE MUNGER|Charlie Munger|CM)\s*[：:]/gmu);
  return { buffett, munger };
}

function mentionedPeople(text, relative) {
  const head = `${relative}\n${text.slice(0, 12000)}`;
  return {
    buffett: /巴菲特|沃伦[·・\s]?巴菲特|Warren Buffett|Berkshire Hathaway/iu.test(head),
    munger: /芒格|查理[·・\s]?芒格|Charlie Munger|Wesco/iu.test(head),
  };
}

function attributedPerson(relative, text, speakers) {
  const lower = relative.toLowerCase();
  const name = path.basename(relative);

  if (relative.startsWith("content/partnership/") || relative.startsWith("content/letters/")) return "buffett";
  if (relative.startsWith("content/munger-originals/")) return "munger";
  if (relative.startsWith("content/munger-archive/") || relative.startsWith("content/poor-charlies-almanack/")) {
    if (/berkshire/i.test(name) && speakers.buffett > 0) return "both";
    return "munger";
  }
  if (relative.startsWith("poor-charlies-almanack/")) {
    if (/foreword/i.test(name) && /buffett/i.test(text.slice(0, 12000))) return "both";
    return "munger";
  }
  if (relative.startsWith("content/qa/")) {
    if (/Wesco/i.test(name)) return "munger";
    if (/慈善中国行/u.test(name)) return "buffett";
    if (speakers.buffett > 0 && speakers.munger > 0) return "both";
    if (speakers.buffett > 0) return "buffett";
    if (speakers.munger > 0) return "munger";
    if (/伯克希尔/u.test(name)) return "both";
  }
  if (relative.startsWith("content/buffettfaq_cnbc/")) {
    if (speakers.buffett > 0 && speakers.munger > 0) return "both";
    if (speakers.munger > 0) return "munger";
    return "buffett";
  }
  if (relative.startsWith("content/buffettfaq/")) {
    if (speakers.munger > 0 || /Munger|芒格/iu.test(text.slice(0, 12000))) return "both";
    return "buffett";
  }
  if (relative.startsWith("content/talks/")) {
    if (/施洛斯/u.test(name)) return "other";
    if (/芒格/u.test(name)) return "munger";
    if (/巴菲特/u.test(name)) return "buffett";
    if (speakers.buffett > 0 && speakers.munger > 0) return "both";
    if (speakers.buffett > 0) return "buffett";
    if (speakers.munger > 0) return "munger";
    return "unknown";
  }
  if (relative.startsWith("content/interviews/")) {
    if (/苏珊/u.test(name)) return "other";
    if (/巴菲特/u.test(name)) return "buffett";
    if (/芒格/u.test(name)) return "munger";
  }
  if (relative.startsWith("content/articles/buffett/")) return "buffett";
  if (relative.startsWith("content/articles/munger/")) return "munger";

  if (speakers.buffett >= 3 && speakers.munger >= 3) return "both";
  if (speakers.buffett >= 3) return "buffett";
  if (speakers.munger >= 3) return "munger";
  if (/buffett|berkshire/iu.test(lower) && /munger|wesco/iu.test(lower)) return "both";
  if (/buffett|berkshire/iu.test(lower)) return "buffett-subject";
  if (/munger|wesco|poor-charlies/iu.test(lower)) return "munger-subject";
  return "none";
}

function documentKind(relative, title) {
  const name = path.basename(relative);
  if (relative.startsWith("content/partnership/") && /有限合伙协议/u.test(name)) return "partnership-agreement";
  if (relative.startsWith("content/partnership/")) return "partnership-letter";
  if (relative.startsWith("content/letters/")) return "shareholder-letter";
  if (relative.startsWith("content/munger-originals/")) return "wesco-letter";
  if (relative.startsWith("content/talks/")) return "speech-or-talk";
  if (relative.startsWith("content/interviews/")) return "interview";
  if (relative.startsWith("content/qa/")) {
    if (/Wesco/iu.test(name)) return "wesco-annual-meeting-qa";
    if (/伯克希尔/u.test(name)) return "berkshire-annual-meeting-qa";
    return "qa-record";
  }
  if (relative.startsWith("content/buffettfaq_cnbc/")) {
    if (/_index|README|AUDIT|REPORT/iu.test(name)) return "index-or-audit";
    if (/Morning_Session|Afternoon_Session/iu.test(name)) return "berkshire-annual-meeting-session";
    if (/Highlight_Reel/iu.test(name)) return "video-highlight-metadata";
    return "video-clip-or-transcript";
  }
  if (relative.startsWith("content/buffettfaq/")) return "qa-topic-compilation";
  if (relative.startsWith("content/buffett-quotes/") || relative.startsWith("content/munger-archive/quotes/")) return "quote-compilation";
  if (relative.startsWith("content/munger-archive/recordings/")) {
    if (/daily-journal/iu.test(name)) return "daily-journal-meeting-record";
    if (/berkshire/iu.test(name)) return "berkshire-meeting-record";
    return "munger-speech-or-interview";
  }
  if (relative.startsWith("content/munger-archive/mental-models/")) return "mental-model-card";
  if (relative.startsWith("poor-charlies-almanack/_english-source/")) {
    if (/talk-/iu.test(name)) return "speech-original-language";
    return "book-section-original-language";
  }
  if (relative.startsWith("poor-charlies-almanack/")) {
    if (/talk-/iu.test(name)) return "speech-translation";
    return "book-section-translation";
  }
  if (relative.startsWith("content/poor-charlies-almanack/")) return "book-derived-section";
  if (relative.startsWith("content/articles/buffett/") || relative.startsWith("content/articles/munger/")) return "article-candidate";
  if (relative.startsWith("content/companies/") || relative.startsWith("content/companies-studies/")) return "company-reference";
  if (relative.startsWith("content/concepts/") || relative.startsWith("content/models/")) return "concept-reference";
  if (relative.startsWith("content/books/")) return "book-summary";
  if (workspaceArea(relative) === "editorial-or-output") return "editorial-or-output";
  if (workspaceArea(relative) === "workspace-infrastructure") return "workspace-infrastructure";
  if (workspaceArea(relative) === "temporary") return "temporary-artifact";
  if (workspaceArea(relative) === "project-documentation") return "project-documentation";
  if (/巴菲特|芒格|Buffett|Munger/iu.test(`${relative}\n${title}`)) return "subject-reference";
  return "other";
}

function completenessFor(relative, text, kind) {
  const name = path.basename(relative);
  const head = `${name}\n${text.slice(0, 5000)}`;
  if (/节选|选录|精选|摘录|摘要|结构化摘要|excerpt|abridged|highlight|selections? from|summary/iu.test(head)) return "selection-or-excerpt";
  if (/翻译略过|原文缺失|内容缺失|残缺/u.test(text)) return "incomplete-or-omitted-sections";
  if (/完整(?:逐字文本|全文|原文).{0,40}(?:未能|没有|无法).{0,20}(?:全部)?(?:捕获|抓取|收录)|not fully captured|could not be fully captured/iu.test(text)) return "incomplete-or-omitted-sections";
  if (["partnership-letter", "shareholder-letter", "wesco-letter"].includes(kind)) return "full-candidate";
  if (/session|实录|全文|complete transcript/iu.test(head) && text.length >= 10000) return "full-candidate";
  if (text.length < 900) return "metadata-or-fragment";
  return "unknown";
}

function warningsFor(year, text, speakers, relative) {
  const warnings = [];
  if (Number(year) >= 2024 && speakers.munger > 0) warnings.push("munger-speech-after-2023-check-historical-or-misdated");
  if (/verification:\s*pending/iu.test(text.slice(0, 2400))) warnings.push("source-verification-pending");
  if (/翻译略过|原文缺失|内容缺失|残缺/u.test(text)) warnings.push("explicit-omission-or-missing-text");
  if (/主要内容摘要|结构化摘要|完整(?:逐字文本|全文|原文).{0,40}(?:未能|没有|无法).{0,20}(?:全部)?(?:捕获|抓取|收录)|not fully captured|could not be fully captured/iu.test(text)) warnings.push("local-source-is-summary-or-incomplete-capture");
  if (/并非\s*2025\s*年伯克希尔股东大会的原始实录/u.test(text)) warnings.push("explicitly-not-original-2025-transcript");
  if (Number(year) === 2025 && /新闻稿\s*[·・]?\s*即时发布/u.test(text.slice(0, 1800)) && /感恩节/u.test(text.slice(0, 12000))) {
    warnings.push("2025-thanksgiving-letter-not-annual-report-letter");
    warnings.push("official-press-release-wrapper-not-buffett-letter-body");
  }
  if (relative === "content/letters/berkshire_1990-巴菲特致股东信.md" && /^\[\^1\]:\s*原文：/mu.test(text)) {
    warnings.push("translator-source-language-footnote-not-original-body");
  }
  if (relative === "content/letters/berkshire_2016-巴菲特致股东信.md" && /巴菲特幽默地指出|巴菲特认为|巴菲特对此嗤之以鼻/u.test(text)) {
    warnings.push("translator-explanatory-footnotes-not-original-body");
  }
  if (relative.startsWith("content/letters/") && /^注：[^\n]*(?:对页|对面页|年度报告)/u.test(text)) {
    warnings.push("leading-layout-note-needs-editorial-separation");
  }
  return warnings;
}

function articlePrimaryLikelihood(relative) {
  const name = path.basename(relative, ".md");
  if (/青春时代|合伙公司时代|估值逻辑|推荐过的书籍|企业收藏家|沃伦在担心什么|财富杂志|总设计师/u.test(name)) return "secondary-likely";
  if (/致|给.+信|备忘录|股东手册|合伙契约|我最看好的股票|怀念|巴菲特谈|芒格：|买入美国|美国的未来|所得税|美元效应|股票期权|模糊数学|股息巫术|不看好美元|账房先生|50_周年|收购/u.test(name)) return "primary-likely";
  return "uncertain";
}

function classification(row, text) {
  const { relative, area, kind, language, completeness, speakers, person, warnings, year } = row;
  const name = path.basename(relative);
  const primarySpeakerText = speakers.buffett + speakers.munger >= 3 && text.length >= 1400;

  if (area === "workspace-infrastructure" || area === "project-documentation" || area === "workspace-other") {
    return { evidenceStatus: "non-source", decision: "exclude-non-source", reason: "项目配置、需求文档或工作区基础设施，不是人物原始文献。" };
  }
  if (area === "editorial-or-output" || area === "temporary") {
    return { evidenceStatus: "generated-or-editorial", decision: "exclude-generated-or-editorial", reason: "旧编辑稿、恢复稿、输出物或临时文件，只能用于版本对照。" };
  }
  if (["company-reference", "concept-reference", "mental-model-card", "book-summary", "quote-compilation"].includes(kind)) {
    return { evidenceStatus: "secondary-or-compiled", decision: "reference-only", reason: "卡片、摘要或二次整理，不作为本人文献正文。" };
  }
  if (kind === "index-or-audit") {
    return { evidenceStatus: "index-or-audit", decision: "reference-only", reason: "索引或采集审计文件，不含可直接收录的本人正文。" };
  }
  if (kind === "video-highlight-metadata" || (kind === "video-clip-or-transcript" && completeness === "metadata-or-fragment" && !primarySpeakerText)) {
    return { evidenceStatus: "metadata-only", decision: "reference-only-no-primary-text", reason: "页面只有标题、简介或视频元数据，没有足够的本人逐字文本。" };
  }
  if (kind === "qa-topic-compilation") {
    return { evidenceStatus: "primary-quotes-compiled", decision: "reference-only-source-locator", reason: "按主题拼合的问答资料，可定位原始场次，但不直接作为独立文献收入主书。" };
  }
  if (relative.startsWith("content/munger-archive/quotes/") || relative.startsWith("content/munger-archive/mental-models/")) {
    return { evidenceStatus: "secondary-or-compiled", decision: "reference-only", reason: "语录或模型卡片缺少连续原始语境。" };
  }
  if (relative.startsWith("content/poor-charlies-almanack/")) {
    if (/11-psychology/u.test(name)) {
      return { evidenceStatus: "primary-transcript-translation-candidate", decision: "candidate-primary-review", reason: "内容主体可能是芒格演讲，但需与独立演讲底本和英文源比对。" };
    }
    return { evidenceStatus: "book-derived-or-secondary", decision: "reference-only", reason: "《穷查理宝典》衍生章节，可能混有编者和第三方文字。" };
  }
  if (relative.startsWith("poor-charlies-almanack/_english-source/")) {
    if (kind === "speech-original-language") {
      if (["selection-or-excerpt", "incomplete-or-omitted-sections"].includes(completeness) || warnings.includes("local-source-is-summary-or-incomplete-capture")) {
        return {
          evidenceStatus: "primary-transcript-original-language-fragment",
          decision: "candidate-primary-review",
          reason: "英文文件自身说明为删节、摘要或未完整抓取，只能作网页定位线索，不能充当全文校核底本。",
        };
      }
      return { evidenceStatus: "primary-transcript-original-language-candidate", decision: "candidate-source-version", reason: "芒格演讲英文对照底本，用于核校中文版本。" };
    }
    return { evidenceStatus: "book-section-original-language", decision: "reference-only", reason: "英文书籍章节未必全部由芒格本人撰写，需按内部文献单元拆分。" };
  }
  if (relative.startsWith("poor-charlies-almanack/") && kind === "speech-translation") {
    if (completeness === "selection-or-excerpt") {
      return { evidenceStatus: "primary-transcript-translation-candidate", decision: "candidate-include-selection", reason: "芒格演讲中文节选候选，需用英文对照底本核验删节边界。" };
    }
    if (completeness === "full-candidate") {
      return { evidenceStatus: "primary-transcript-translation-candidate", decision: "candidate-include-full", reason: "芒格演讲中文全文候选，需用英文对照底本校验。" };
    }
    return { evidenceStatus: "primary-transcript-translation-candidate", decision: "candidate-primary-review", reason: "芒格演讲中文译文候选，但文件未证明自身为全文，需与英文底本逐篇比对。" };
  }
  if (["partnership-letter", "shareholder-letter", "wesco-letter"].includes(kind)) {
    if (kind === "shareholder-letter" && Number(year) <= 1969) {
      return {
        evidenceStatus: "corporate-letter-attribution-review",
        decision: "candidate-primary-review",
        reason: "1965—1969 年公司信存在他人署名或仅标注“巴菲特执笔”的情况，需核验正式署名和原始年报底本。",
      };
    }
    return {
      evidenceStatus: language === "en" ? "primary-authored-original-language-candidate" : "primary-authored-translation-candidate",
      decision: language === "en" ? "candidate-source-version" : "candidate-include-full",
      reason: "本人署名信件的完整底本候选。",
    };
  }
  if (kind === "partnership-agreement") {
    return {
      evidenceStatus: "partnership-legal-document-attribution-review",
      decision: "candidate-primary-review",
      reason: "这是合伙法律文件，不是巴菲特个人书信；需核验签署页、完整条款和是否适合作为附录。",
    };
  }
  if (kind === "article-candidate") {
    const likelihood = articlePrimaryLikelihood(relative);
    if (likelihood === "secondary-likely") return { evidenceStatus: "secondary-likely", decision: "reference-only", reason: "文件名和内容形态显示为第三方文章或二次整理。" };
    if (likelihood === "primary-likely") return { evidenceStatus: "primary-authored-candidate", decision: "candidate-primary-review", reason: "可能是本人署名文章、信件或备忘录，需逐篇核验署名和来源。" };
    return { evidenceStatus: "uncertain-article", decision: "requires-source-review", reason: "是否属于本人原始文献尚不能仅凭路径和标题确定。" };
  }
  if (kind === "speech-or-talk") {
    if (person === "other" || person === "unknown") return { evidenceStatus: "not-target-or-uncertain", decision: "exclude-or-review", reason: "说话者不是目标人物或尚无法确认。" };
    if (completeness === "unknown" || completeness === "incomplete-or-omitted-sections") {
      return {
        evidenceStatus: language === "en" ? "primary-transcript-original-language-candidate" : "primary-transcript-translation-candidate",
        decision: "candidate-primary-review",
        reason: completeness === "incomplete-or-omitted-sections" ? "目标人物演讲材料存在明确缺段，需核验完整底本。" : "目标人物演讲或谈话候选，但文件未证明自身为全文。",
      };
    }
    return {
      evidenceStatus: language === "en" ? "primary-transcript-original-language-candidate" : "primary-transcript-translation-candidate",
      decision: completeness === "selection-or-excerpt" ? "candidate-include-selection" : "candidate-include-full",
      reason: "目标人物演讲或谈话实录候选。",
    };
  }
  if (kind === "interview") {
    if (person === "other") return { evidenceStatus: "third-party-interview", decision: "reference-only", reason: "受访者不是巴菲特或芒格本人。" };
    if (completeness === "unknown" || completeness === "incomplete-or-omitted-sections") {
      return {
        evidenceStatus: "primary-interview-translation-candidate",
        decision: "candidate-primary-review",
        reason: completeness === "incomplete-or-omitted-sections" ? "目标人物访谈存在明确缺段，需寻找完整底本。" : "目标人物访谈候选，但文件未证明自身为完整实录。",
      };
    }
    return {
      evidenceStatus: "primary-interview-translation-candidate",
      decision: completeness === "selection-or-excerpt" ? "candidate-include-selection" : "candidate-include-full",
      reason: "目标人物访谈实录候选，需核验是否完整及主持人导语边界。",
    };
  }
  if (["berkshire-annual-meeting-qa", "wesco-annual-meeting-qa", "qa-record"].includes(kind)) {
    if (warnings.includes("explicitly-not-original-2025-transcript")) {
      return {
        evidenceStatus: "explicitly-not-original-transcript",
        decision: "reference-only-source-locator",
        reason: "文件自身明确说明不是对应年份的原始实录，只能作为历年材料线索。",
      };
    }
    if (warnings.includes("munger-speech-after-2023-check-historical-or-misdated")) {
      return {
        evidenceStatus: "chronology-conflict-or-mixed-historical-material",
        decision: "candidate-primary-review",
        reason: "文件年份晚于芒格逝世时间却含有芒格答问，可能混入历史影像或历年问答，必须拆分并核对真实场次。",
      };
    }
    return {
      evidenceStatus: "primary-qa-translation-candidate",
      decision: completeness === "full-candidate" ? "candidate-include-full" : "candidate-include-selection",
      reason: completeness === "full-candidate" ? "股东大会或公开问答完整记录候选。" : "问答选录或完整度未知，必须按完整问答单元处理。",
    };
  }
  if (kind === "berkshire-annual-meeting-session") {
    if (completeness === "metadata-or-fragment" && !primarySpeakerText) {
      return {
        evidenceStatus: "metadata-only",
        decision: "reference-only-no-primary-text",
        reason: "场次文件只有元数据或明确标注无转录数据，没有巴菲特或芒格的可收录逐字文本。",
      };
    }
    return {
      evidenceStatus: "primary-transcript-original-language-candidate",
      decision: "candidate-source-version",
      reason: "CNBC 年会完整英文场次，优先作为中文实录的校核底本。",
    };
  }
  if (kind === "video-clip-or-transcript" && primarySpeakerText) {
    return {
      evidenceStatus: "primary-transcript-fragment-candidate",
      decision: "candidate-source-version",
      reason: "包含本人逐字文本，但属于单段视频或局部转录，优先作为完整会议底本的版本参考。",
    };
  }
  if (["munger-speech-or-interview", "daily-journal-meeting-record", "berkshire-meeting-record"].includes(kind)) {
    return {
      evidenceStatus: language === "en" ? "primary-transcript-original-language-candidate" : "primary-transcript-translation-candidate",
      decision: completeness === "selection-or-excerpt" ? "candidate-include-selection" : "candidate-primary-review",
      reason: "芒格讲话、访谈或会议记录候选，需核验来源、说话者边界和完整度。",
    };
  }
  if (primarySpeakerText) {
    return { evidenceStatus: "embedded-primary-text-candidate", decision: "review-embedded-primary-text", reason: "非核心目录中检测到连续本人说话标记，需判断是否完整转载了原始文献。" };
  }
  return { evidenceStatus: "not-primary-evidence", decision: "exclude-unrelated-or-secondary", reason: "未发现足以进入本人文集的连续、可核验原始文本。" };
}

function workKeyFor(row) {
  const { kind, year, relative, person } = row;
  const name = path.basename(relative).toLowerCase();
  if (["speech-original-language", "speech-translation"].includes(kind)) {
    const talk = name.match(/talk-(one|two|three|four|five|six|seven|eight|nine|ten|eleven)/iu)?.[1] ?? "unknown";
    return `munger-poor-charlie-talk-${talk}`;
  }
  if (!year) return "";
  if (kind === "shareholder-letter") return `buffett-shareholder-letter-${year}`;
  if (kind === "partnership-letter") {
    const month = name.match(/(?:-|_)(\d{1,2})月/u)?.[1] ?? "";
    const suffix = /interim/u.test(name) ? "interim" : /annual/u.test(name) ? "annual" : /liquidation/u.test(name) ? "liquidation" : /bond/u.test(name) ? "bond" : month ? `month-${month}` : "general";
    return `buffett-partnership-${year}-${suffix}`;
  }
  if (kind === "partnership-agreement") return `buffett-partnership-agreement-${year || "undated"}`;
  if (kind === "wesco-letter") return `munger-wesco-letter-${year}`;
  if (kind === "wesco-annual-meeting-qa") return `munger-wesco-meeting-${year}`;
  if (["berkshire-annual-meeting-qa", "berkshire-meeting-record"].includes(kind)) return `berkshire-meeting-${year}`;
  if (kind === "berkshire-annual-meeting-session") {
    const session = /morning/iu.test(name) ? "morning" : /afternoon/iu.test(name) ? "afternoon" : "session";
    return `berkshire-meeting-${year}-${session}`;
  }
  if (kind === "speech-or-talk" || kind === "interview") return `${person}-${kind}-${year}-${sha256(Buffer.from(row.title)).slice(0, 8)}`;
  return "";
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function counts(rows, key) {
  const map = new Map();
  for (const row of rows) map.set(row[key], (map.get(row[key]) ?? 0) + 1);
  return Object.fromEntries([...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "zh-CN")));
}

function topDirectory(relative) {
  if (!relative.includes("/")) return "(root)";
  const parts = relative.split("/");
  if (parts[0] === "content" && parts.length >= 2) return parts.slice(0, 2).join("/");
  return parts[0];
}

const absoluteFiles = walk(root).sort((a, b) => slash(path.relative(root, a)).localeCompare(slash(path.relative(root, b)), "zh-CN"));
const rows = [];

for (const absolute of absoluteFiles) {
  const relative = slash(path.relative(root, absolute));
  const buffer = fs.readFileSync(absolute);
  const text = buffer.toString("utf8");
  const stat = fs.statSync(absolute);
  const speakers = speakerSignals(text);
  const title = firstTitle(text, relative);
  const language = languageFor(text);
  const area = workspaceArea(relative);
  const person = attributedPerson(relative, text, speakers);
  const kind = documentKind(relative, title);
  const completeness = completenessFor(relative, text, kind);
  const warnings = warningsFor(yearFor(relative, text), text, speakers, relative);
  const mentioned = mentionedPeople(text, relative);

  const base = {
    relative,
    title,
    topDirectory: topDirectory(relative),
    area,
    person,
    mentionedBuffett: mentioned.buffett,
    mentionedMunger: mentioned.munger,
    kind,
    year: yearFor(relative, text),
    language,
    completeness,
    warnings,
    chars: [...text].length,
    bytes: buffer.length,
    lines: text.split(/\r?\n/u).length,
    modified: stat.mtime.toISOString(),
    speakerBuffett: speakers.buffett,
    speakerMunger: speakers.munger,
    sourceUrl: firstUrl(text),
    exactHash: sha256(buffer),
    canonicalHash: sha256(Buffer.from(normalizedText(text), "utf8")),
  };
  const categorized = classification({ ...base, speakers }, text);
  const row = { ...base, ...categorized };
  row.workKey = workKeyFor(row);
  rows.push(row);
}

const exactMap = new Map();
const canonicalMap = new Map();
for (const row of rows) {
  if (!exactMap.has(row.exactHash)) exactMap.set(row.exactHash, []);
  exactMap.get(row.exactHash).push(row.relative);
  if (!canonicalMap.has(row.canonicalHash)) canonicalMap.set(row.canonicalHash, []);
  canonicalMap.get(row.canonicalHash).push(row.relative);
}

const duplicateGroups = [];
for (const [hash, files] of exactMap) {
  if (files.length > 1) duplicateGroups.push({ type: "exact", hash, files: files.sort() });
}
for (const [hash, files] of canonicalMap) {
  if (files.length > 1 && !duplicateGroups.some((group) => group.hash === hash)) {
    duplicateGroups.push({ type: "normalized", hash, files: files.sort() });
  }
}
duplicateGroups.sort((a, b) => b.files.length - a.files.length || a.files[0].localeCompare(b.files[0], "zh-CN"));

const candidateDecisions = new Set([
  "candidate-include-full",
  "candidate-include-selection",
  "candidate-primary-review",
  "candidate-source-version",
  "requires-source-review",
  "review-embedded-primary-text",
]);
const candidates = rows.filter((row) => candidateDecisions.has(row.decision));
const directBookCandidates = rows.filter((row) => row.decision === "candidate-include-full" || row.decision === "candidate-include-selection");
const reviewQueue = rows.filter((row) => ["candidate-primary-review", "requires-source-review", "review-embedded-primary-text", "exclude-or-review"].includes(row.decision));
const candidateWarnings = candidates.filter((row) => row.warnings.length > 0);
const workFamilyMap = new Map();
for (const row of candidates) {
  if (!row.workKey) continue;
  if (!workFamilyMap.has(row.workKey)) workFamilyMap.set(row.workKey, []);
  workFamilyMap.get(row.workKey).push(row);
}
const workVersionFamilies = [...workFamilyMap.entries()]
  .filter(([, familyRows]) => familyRows.length > 1)
  .map(([workKey, familyRows]) => ({
    workKey,
    count: familyRows.length,
    files: familyRows.map((row) => ({
      relative: row.relative,
      title: row.title,
      language: row.language,
      completeness: row.completeness,
      decision: row.decision,
    })),
  }))
  .sort((a, b) => b.count - a.count || a.workKey.localeCompare(b.workKey, "zh-CN"));

fs.mkdirSync(outputRoot, { recursive: true });

const inventoryPayload = {
  generatedAt,
  root,
  scanRule: `All Markdown files except dependency/cache directories and ${outputRelative}, which is excluded to keep the scan idempotent.`,
  count: rows.length,
  rows,
};
fs.writeFileSync(path.join(outputRoot, "markdown-inventory.json"), `${JSON.stringify(inventoryPayload, null, 2)}\n`);
fs.writeFileSync(path.join(outputRoot, "primary-document-candidates.json"), `${JSON.stringify({ generatedAt, count: candidates.length, rows: candidates }, null, 2)}\n`);
fs.writeFileSync(path.join(outputRoot, "duplicate-groups.json"), `${JSON.stringify({ generatedAt, count: duplicateGroups.length, groups: duplicateGroups }, null, 2)}\n`);
fs.writeFileSync(path.join(outputRoot, "work-version-families.json"), `${JSON.stringify({ generatedAt, count: workVersionFamilies.length, families: workVersionFamilies }, null, 2)}\n`);

const headers = [
  "relative", "title", "topDirectory", "area", "person", "mentionedBuffett", "mentionedMunger", "kind", "year", "language",
  "completeness", "warnings", "evidenceStatus", "decision", "reason", "workKey", "chars", "bytes", "lines", "modified", "speakerBuffett",
  "speakerMunger", "sourceUrl", "exactHash", "canonicalHash",
];
const toCsv = (items) => `${[headers.join(","), ...items.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n")}\n`;
fs.writeFileSync(path.join(outputRoot, "markdown-inventory.csv"), toCsv(rows));
fs.writeFileSync(path.join(outputRoot, "primary-document-candidates.csv"), toCsv(candidates));
fs.writeFileSync(path.join(outputRoot, "review-queue.csv"), toCsv(reviewQueue));

const reportLines = [
  "# 全量 Markdown 编目与本人原始文献鉴别报告",
  "",
  `- 生成时间：${generatedAt}`,
  `- 扫描根目录：\`${root}\``,
  `- 扫描文件：${rows.length.toLocaleString("zh-CN")} 个 Markdown 文件`,
  `- 输出目录：\`${outputRelative}\`（该目录自身不参与扫描，以保证重复运行时数量稳定）`,
  "- 本报告只做文献鉴别和候选分层，不生成、不改写任何巴菲特或芒格正文。",
  "",
  "## 一、扫描口径结论",
  "",
  "旧编目把临时目录、编辑成品、工具说明与原始资料混在同一个数字中，也会受搜索工具是否遵守 `.gitignore` 影响。本次改为直接遍历文件系统，并明确排除依赖、缓存、Git 元数据及本报告自身的输出目录。",
  "",
  "### 工作区区域统计",
  "",
  "```json",
  JSON.stringify(counts(rows, "area"), null, 2),
  "```",
  "",
  "### 主要目录统计",
  "",
  "```json",
  JSON.stringify(counts(rows, "topDirectory"), null, 2),
  "```",
  "",
  "## 二、本人文献鉴别结果",
  "",
  `- 可直接进入“全文/完整问答候选”层：${directBookCandidates.length.toLocaleString("zh-CN")} 个。`,
  `- 包含英文对照底本、需逐篇核源材料及嵌入式转载在内的全部候选：${candidates.length.toLocaleString("zh-CN")} 个。`,
  `- 需要人工或逐文件进一步复核：${reviewQueue.length.toLocaleString("zh-CN")} 个。`,
  `- 精确或规范化重复组：${duplicateGroups.length.toLocaleString("zh-CN")} 组。`,
  `- 已识别的同一作品/场次版本族：${workVersionFamilies.length.toLocaleString("zh-CN")} 组。`,
  `- 候选材料中含时间矛盾、待核来源或明确缺段警告：${candidateWarnings.length.toLocaleString("zh-CN")} 个。`,
  "",
  "### 处理决定统计",
  "",
  "```json",
  JSON.stringify(counts(rows, "decision"), null, 2),
  "```",
  "",
  "### 候选人物归属",
  "",
  "```json",
  JSON.stringify(counts(candidates, "person"), null, 2),
  "```",
  "",
  "### 候选文献类型",
  "",
  "```json",
  JSON.stringify(counts(candidates, "kind"), null, 2),
  "```",
  "",
  "### 需要优先处理的文献警告",
  "",
  ...candidateWarnings.slice(0, 80).map((row) => `- \`${row.relative}\`：${row.warnings.join("；")}`),
  "",
  "## 三、关键处理规则",
  "",
  "- 巴菲特合伙人信、伯克希尔股东信和芒格/西科信件优先列为署名文献候选。",
  "- 演讲、访谈和股东大会按独立场次处理；完整会议与单段视频不能按同一层级计数。",
  "- CNBC 只有标题、简介或视频元数据的页面仅作定位参考，不算一篇本人文献。",
  "- `buffettfaq` 的主题拼合问答只作来源定位；正式成书优先回到完整会议或完整问答底本。",
  "- 语录卡、概念卡、公司卡、书籍摘要、旧编辑稿和 AI 合成稿不进入本人文集正文。",
  "- 《穷查理宝典》中的演讲与书籍编者文字分开处理；演讲中文本须与英文对照底本建立版本关系。",
  "- 非核心目录中若检测到连续的本人说话标记，进入“嵌入式原文复核队列”，避免漏掉完整转载。",
  "",
  "## 四、当前限制",
  "",
  "- 自动规则只能建立高置信候选和复核队列，不能替代对署名、来源、译本和完整度的逐篇判断。",
  "- `candidate-include-full` 表示“全文收录候选”，不是已批准进入终稿。",
  "- `candidate-source-version` 主要是英文原文、另一译本或局部视频转录，应先与中文主底本建立版本关系。",
  "- 任何来源不明、文本残缺或只有二次概括的材料，在核验完成前都不能进入主书。",
  "",
  "## 五、配套文件",
  "",
  "- `markdown-inventory.csv/json`：全量文件级编目与去向。",
  "- `primary-document-candidates.csv/json`：本人原始文献候选及对照底本。",
  "- `review-queue.csv`：需要进一步核验的材料。",
  "- `duplicate-groups.json`：精确与规范化重复组。",
  "- `work-version-families.json`：同一作品或同一场次的中文、英文、完整场次与选录版本关系。",
  "",
  "## 六、下一步",
  "",
  "先从高确定性的四组材料开始建立正式文献表：巴菲特合伙人信、伯克希尔股东信、芒格演讲、两家公司股东大会记录。逐篇确认标题、日期、场合、完整度、中文底本、英文对照和重复版本，再处理文章、访谈与嵌入式转载。",
  "",
];
fs.writeFileSync(path.join(outputRoot, "全量 Markdown 编目与本人原始文献鉴别报告.md"), `${reportLines.join("\n")}\n`);

console.log(JSON.stringify({
  generatedAt,
  scannedMarkdown: rows.length,
  directBookCandidates: directBookCandidates.length,
  allCandidates: candidates.length,
  reviewQueue: reviewQueue.length,
  duplicateGroups: duplicateGroups.length,
  workVersionFamilies: workVersionFamilies.length,
  area: counts(rows, "area"),
  decisions: counts(rows, "decision"),
}, null, 2));
