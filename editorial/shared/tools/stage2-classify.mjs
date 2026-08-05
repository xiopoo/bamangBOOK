import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";

const ROOT = process.cwd();
const EDITORIAL = path.join(ROOT, "editorial");
const INVENTORY = path.join(EDITORIAL, "shared/candidate-content-inventory.csv");

function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line) {
  const result = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      result.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  result.push(value);
  return result;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const headers = Object.keys(rows[0] || {});
  const text = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(file, `${text}\n`);
}

function readDoc(relativePath) {
  const raw = fs.readFileSync(path.join(ROOT, relativePath), "utf8").replace(/^\uFEFF/, "");
  try {
    const parsed = matter(raw);
    return { raw, body: parsed.content, data: parsed.data || {} };
  } catch {
    return { raw, body: raw, data: {} };
  }
}

const inventory = parseCsv(fs.readFileSync(INVENTORY, "utf8"));

const exactMainByAlternate = new Map([
  ["content/articles/munger/芒格：2003_年的金融大丑闻.md", "poor-charlies-almanack/poor-charlies-almanack-talk-eight.md"],
  ["content/talks/芒格：财务总监联合会演讲_1998.md", "poor-charlies-almanack/poor-charlies-almanack-talk-six.md"],
  ["content/talks/芒格：慈善圆桌会议讲话_2000.md", "poor-charlies-almanack/poor-charlies-almanack-talk-seven.md"],
  ["content/talks/芒格：关于实践思维的现实思考_1996.md", "poor-charlies-almanack/poor-charlies-almanack-talk-four.md"],
  ["content/talks/芒格：哈佛法学院演讲_1998.md", "poor-charlies-almanack/poor-charlies-almanack-talk-five.md"],
  ["content/talks/芒格：哈佛中学演讲_1986.md", "poor-charlies-almanack/poor-charlies-almanack-talk-one.md"],
  ["content/talks/芒格：论学院派经济学_2003.md", "poor-charlies-almanack/poor-charlies-almanack-talk-nine.md"],
  ["content/talks/芒格：南加大法学院演讲_2007.md", "poor-charlies-almanack/poor-charlies-almanack-talk-ten.md"],
  ["content/talks/芒格：南加大商学院演讲_1994.md", "poor-charlies-almanack/poor-charlies-almanack-talk-two.md"],
  ["content/talks/芒格：斯坦福法学院演讲_1996.md", "poor-charlies-almanack/poor-charlies-almanack-talk-three.md"],
]);

const versionRelations = [
  ...[...exactMainByAlternate].map(([alternate, main], index) => ({
    group: `EX-${String(index + 1).padStart(2, "0")}`,
    type: "精确重复",
    main,
    alternate,
    decision: "保留《穷查理宝典》编排版为主版本；替代版本不进入主书。",
    preserve: "否；正文哈希完全相同。",
  })),
  {
    group: "SV-01", type: "同题异版", main: "content/munger-archive/mental-models/circle-of-competence.md",
    alternate: "content/models/circle-of-competence.md", decision: "档案短文作芒格证据锚点；模型长文作编辑扩展素材。",
    preserve: "是；身份与用途不同。",
  },
  {
    group: "SV-02", type: "同题异版", main: "content/munger-archive/mental-models/inversion.md",
    alternate: "content/models/inversion.md", decision: "档案短文作原始思想入口；模型稿仅作机制扩展。",
    preserve: "是；模型稿不得冒充原话。",
  },
  {
    group: "SV-03", type: "同题异版", main: "content/munger-archive/mental-models/margin-of-safety.md",
    alternate: "content/models/margin-of-safety.md", decision: "档案版作为芒格使用证据；长稿归入编辑扩展。",
    preserve: "是；需保留格雷厄姆思想源流。",
  },
  {
    group: "SV-04", type: "同题异版", main: "content/munger-archive/mental-models/opportunity-cost.md",
    alternate: "content/models/opportunity-cost.md", decision: "档案版作证据锚点，模型版作案例与解释素材。",
    preserve: "是；二者篇幅与身份不同。",
  },
  {
    group: "SV-05", type: "同题异版", main: "poor-charlies-almanack/poor-charlies-almanack-talk-eleven.md",
    alternate: "content/models/psychology-of-human-misjudgment.md", decision: "原始演讲为主；模型稿只用于图表与编者解释。",
    preserve: "是；不得用扩展稿替代原始体系。",
  },
  {
    group: "SV-06", type: "同题异版", main: "content/munger-archive/mental-models/two-track-analysis.md",
    alternate: "content/models/two-track-analysis.md", decision: "档案版作芒格证据，模型版作编辑扩展。",
    preserve: "是；身份不同。",
  },
  {
    group: "SV-07", type: "同题异版", main: "poor-charlies-almanack/poor-charlies-almanack-chapter-one.md",
    alternate: "content/poor-charlies-almanack/01-portrait.md", decision: "完整章节为主，短版作索引或导读备选。",
    preserve: "否；短版信息密度较低。",
  },
  {
    group: "NV-01", type: "语义近似/翻译异版", main: "poor-charlies-almanack/poor-charlies-almanack-talk-one.md",
    alternate: "content/munger-archive/recordings/harvard-1986-misery.md", decision: "宝典版主用，档案转录版保留作译文校对。",
    preserve: "是；比较语气与段落差异。",
  },
  {
    group: "NV-02", type: "语义近似/翻译异版", main: "poor-charlies-almanack/poor-charlies-almanack-talk-two.md",
    alternate: "content/munger-archive/recordings/usc-1994-worldly-wisdom.md", decision: "宝典版主用，录音档案版用于补场合信息。",
    preserve: "是；保留现场语境。",
  },
  {
    group: "NV-03", type: "语义近似/翻译异版", main: "poor-charlies-almanack/poor-charlies-almanack-talk-eleven.md",
    alternate: "content/munger-archive/recordings/psychology-of-human-misjudgment-1995.md", decision: "宝典修订版主用，1995 录音版用于思想演变。",
    preserve: "是；这是重要演变差异。",
  },
  {
    group: "NV-04", type: "语义近似/翻译异版", main: "poor-charlies-almanack/poor-charlies-almanack-talk-three.md",
    alternate: "content/munger-archive/recordings/stanford-1996-worldly-wisdom.md", decision: "宝典版主用，档案版补现场信息。",
    preserve: "是；核对标题与场合。",
  },
  {
    group: "NV-05", type: "语义近似/翻译异版", main: "poor-charlies-almanack/poor-charlies-almanack-talk-five.md",
    alternate: "content/munger-archive/recordings/harvard-law-1998-multidisciplinary.md", decision: "宝典版主用，档案版作校对。",
    preserve: "是；比较翻译差异。",
  },
  {
    group: "NV-06", type: "语义近似/翻译异版", main: "poor-charlies-almanack/poor-charlies-almanack-talk-nine.md",
    alternate: "content/munger-archive/recordings/ucsb-2003-academic-economics.md", decision: "宝典版主用，档案版补录音语境。",
    preserve: "是；案例段落可能不同。",
  },
  {
    group: "NV-07", type: "语义近似/翻译异版", main: "poor-charlies-almanack/poor-charlies-almanack-talk-ten.md",
    alternate: "content/munger-archive/recordings/usc-law-2007.md", decision: "宝典版主用，档案版作翻译校对。",
    preserve: "是；保持现场表达差异。",
  },
  {
    group: "NV-08", type: "汇编与原件重合", main: "content/partnership/partnership_1956-有限合伙协议.md",
    alternate: "content/articles/buffett/巴菲特合伙契约_1956.md", decision: "原始协议文件为主，专题汇编不单独收入。",
    preserve: "否；汇编仅作查找入口。",
  },
  {
    group: "NV-09", type: "汇编与原件重合", main: "content/partnership",
    alternate: "content/articles/buffett/巴菲特合伙公司时代.md", decision: "逐年合伙人信为主，汇编稿只作编辑参考。",
    preserve: "是；若汇编含独立背景，只转入编者导读。",
  },
  {
    group: "NV-10", type: "汇编与原件重合", main: "content/letters",
    alternate: "content/articles/buffett/巴菲特估值逻辑.md", decision: "以可定位的信件和讲话为主，汇编稿拆为观点线索。",
    preserve: "是；不把汇编概括当原话。",
  },
  {
    group: "NV-11", type: "精选与逐年原件重合", main: "content/qa",
    alternate: "content/qa/历年股东问答精选_2025.md", decision: "逐年会议记录为证据源，精选稿仅作检索入口。",
    preserve: "否；避免精选内容重复计入。",
  },
];

const relationByPath = new Map();
for (const relation of versionRelations) {
  for (const key of ["main", "alternate"]) {
    const list = relationByPath.get(relation[key]) || [];
    list.push(relation);
    relationByPath.set(relation[key], list);
  }
}

const layer1 = new Set([
  "accounting-as-language-its-limits", "avoiding-stupidity-over-seeking-brilliance",
  "basic-arithmetic-order-of-magnitude-estimation", "bet-seldom-bet-big", "cash-flow-vs-earnings",
  "checklist-method", "circle-of-competence", "circle-of-competence-management-level",
  "circle-of-competence-metacognitive-level", "compound-interest", "concentration-less-is-more",
  "contrast-misreaction-tendency", "curiosity-tendency", "deprival-superreaction-tendency",
  "disliking-hating-tendency", "doubt-avoidance-tendency", "drug-misinfluence-tendency",
  "economies-of-scale", "envy-jealousy-tendency", "excessive-self-regard-tendency",
  "inconsistency-avoidance-tendency", "influence-from-mere-association-tendency",
  "intrinsic-value", "inversion", "kantian-fairness-tendency", "latticework-of-mental-models",
  "liking-loving-tendency", "lollapalooza-tendency", "man-with-a-hammer-syndrome",
  "margin-of-safety", "moat", "mr-market", "multidisciplinary-approach", "opportunity-cost",
  "overoptimism-tendency", "pari-mutuel-system", "probabilistic-thinking-expected-value",
  "psychology-of-human-misjudgment", "reason-respecting-tendency", "reciprocation-tendency",
  "reward-and-punishment-superresponse-tendency", "senescence-misinfluence-tendency",
  "simple-pain-avoiding-psychological-denial", "sit-on-your-ass-investing",
  "social-proof-tendency", "stress-influence-tendency", "too-hard-pile", "twaddle-tendency",
  "two-track-analysis", "use-it-or-lose-it-tendency",
]);

const layer2 = new Set([
  "avoiding-ideology", "brand-power", "burden-of-proof", "corporate-culture-as-asset",
  "darwinian-objectivity", "discounted-cash-flow", "failure-mode-analysis", "falsification",
  "falsifiability-criterion", "incentive-structure-agency-problem", "incentive-structure-design",
  "incentives-economic-view", "independence", "intellectual-humility", "lifelong-learning",
  "lessons-of-history", "map-is-not-the-territory", "moral-hazard", "network-effects",
  "patience-discipline", "premortems", "price-elasticity", "principal-agent-solutions",
  "repeat-what-works", "risk-first", "scale-effects-management-perspective",
  "seamless-web-of-deserved-trust", "second-order-thinking", "simplicity-in-business",
  "sunk-cost-fallacy", "surfing-model", "technology-help-vs-destroy",
]);

const layer3 = new Set([
  "adverse-selection", "agency-costs", "anchoring-bias", "arithmetic-expected-value",
  "asymmetric-information", "asymmetry-convexity", "audit-independent-verification",
  "authority-misinfluence-tendency", "availability-misweighing-tendency", "basic-game-theory",
  "bayesian-updating", "bottleneck-effect-founder-effect", "breakpoints", "catalysts",
  "comparative-advantage", "competitive-destruction", "confidence-calibration",
  "correlation-is-not-causation", "critical-mass", "decision-tree-theory", "delay-effects",
  "depreciation-amortization", "double-entry-bookkeeping", "emergence", "empiricism",
  "engineering-margin-of-safety", "externalities", "feedback-loops", "first-principles-thinking",
  "flywheel-effect", "fragility-antifragility", "goodwill-impairment", "hanlons-razor",
  "herding-behavior", "intellectual-property-moats", "inventory-valuation-methods",
  "limits-of-extrapolation-nonlinearity", "lindy-effect", "marginal-analysis",
  "marginal-cost-marginal-revenue", "marginal-utility", "mental-accounting",
  "monopoly-oligopoly", "moral-hazard-legal-view", "narrative-fallacy", "normal-accidents",
  "occams-razor", "off-balance-sheet-contingent-liabilities", "opportunity-cost-in-accounting",
  "path-dependence-lock-in", "power-laws", "pragmatism", "price-discrimination",
  "prisoners-dilemma", "quality-control", "redundancy", "regression-to-the-mean",
  "regulation-as-moat", "regulatory-capture", "rent-seeking", "search-costs",
  "signaling-theory", "single-point-of-failure", "sunk-cost-economic-perspective",
  "sunk-cost-vs-marginal-cost", "supply-and-demand", "survivorship-bias",
  "switching-costs", "systems-thinking", "theory-of-constraints", "trade-off-analysis",
  "transaction-costs",
]);

function modelLayer(relativePath) {
  if (!relativePath.startsWith("content/models/")) return "";
  const slug = path.basename(relativePath, ".md");
  if (layer1.has(slug)) return "1";
  if (layer2.has(slug)) return "2";
  if (layer3.has(slug)) return "3";
  return "4";
}

function modelLayerReason(layer) {
  return {
    "1": "芒格在内部原始演讲、问答或访谈中明确提出或反复使用；不等于相关学科概念由芒格原创。",
    "2": "可从芒格反复使用的原则直接推导；当前模型名称或流程含编辑归纳。",
    "3": "后人扩展但与芒格体系兼容；使用时必须标注为编辑扩展。",
    "4": "通用学科模型；现有内部材料尚未建立芒格直接使用证据。",
  }[layer] || "";
}

function modelEvidence(relativePath, layer) {
  const slug = path.basename(relativePath, ".md");
  if (/tendency|psychology|lollapalooza|two-track/.test(slug)) {
    return "poor-charlies-almanack/poor-charlies-almanack-talk-eleven.md";
  }
  if (/latticework|multidisciplinary|inversion|circle-of-competence|man-with-a-hammer|basic-arithmetic|probabilistic/.test(slug)) {
    return "poor-charlies-almanack/poor-charlies-almanack-talk-two.md";
  }
  if (/econom|scale|incentive|moat|technology|surfing/.test(slug)) {
    return "poor-charlies-almanack/poor-charlies-almanack-talk-nine.md";
  }
  if (layer === "1" || layer === "2") {
    return "content/qa/Wesco_股东大会_1996.md；content/munger-archive/recordings/daily-journal-2020.md";
  }
  return "未定位芒格直接原文；仅作为编辑扩展或通用模型候选";
}

const buffettThemeRules = [
  ["所有者思维", /所有者|股东手册|股票.*企业|企业收藏家/],
  ["内在价值与安全边际", /内在价值|估值|安全边际|折现|市场先生/],
  ["企业质量与护城河", /护城河|喜诗|可口可乐|品牌|定价权|优质企业|竞争优势|珠宝/],
  ["管理层与企业文化", /管理层|经理人|企业文化|诚信|信任|去中心化|声誉|所罗门|唐基奥/],
  ["资本配置", /资本配置|回购|股息|分红|收购|并购|留存收益|BNSF|铁路|现金/],
  ["保险与浮存金", /保险|浮存金|GEICO|承保|再保险|FDIC/],
  ["市场、风险与错误", /股市|市场|风险|危机|恐慌|通货膨胀|美元|衍生品|期权|指数期货|错误/],
  ["伯克希尔制度", /伯克希尔|集团|股东信|阿贝尔|阿吉特|业务版图/],
  ["长期复利与品格", /复利|长期|耐心|职业|人生|慈善|教育|青春|未来/],
  ["能力圈与集中投资", /能力圈|集中投资|投资方法|格雷厄姆|费雪|施洛斯/],
];

const mungerThemeRules = [
  ["理性训练与避免愚蠢", /理性|愚蠢|避蠢|谦逊|客观|意识形态|独立/],
  ["知识格栅与多元模型", /格栅|多元|跨学科|模型|铁锤|学科/],
  ["逆向与决策工具", /逆向|检查清单|反证|否证|二阶|机会成本|决策树|能力圈/],
  ["概率与数量思维", /概率|期望值|贝叶斯|回归均值|大数|统计|复利|数量级/],
  ["人类误判心理学", /误判|倾向|心理|偏差|社会认同|权威|嫉妒|剥夺|Lollapalooza|锚定/],
  ["激励与制度", /激励|代理|道德风险|制度|信任|公平|监管|寻租/],
  ["商业判断", /商业|企业|护城河|品牌|规模|竞争|管理|定价权|Costco|喜诗/],
  ["投资与资本配置", /投资|资本配置|安全边际|内在价值|市场先生|集中|会计|现金流|Wesco/],
  ["学习、品格与人生", /阅读|学习|品格|人生|家庭|慈善|耐心|幸福|建筑|合作/],
  ["复杂系统与通用模型", /系统|复杂|反馈|工程|物理|生物|进化|熵|涌现|网络/],
];

function scoreThemes(text, person) {
  const rules = person === "巴菲特" ? buffettThemeRules
    : person === "芒格" ? mungerThemeRules
      : [...buffettThemeRules, ...mungerThemeRules];
  const scores = rules.map(([name, regex]) => {
    const matches = text.match(new RegExp(regex.source, `${regex.flags}g`)) || [];
    return [name, matches.length];
  }).filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  return scores.slice(0, 3).map(([name]) => name).join("|") || "背景资料";
}

function personFor(record, text) {
  const file = record.path;
  if (/^content\/(?:letters|partnership)\//.test(file) || /^content\/articles\/buffett\//.test(file)) return "巴菲特";
  if (/^content\/(?:models|munger-archive|munger-originals)\//.test(file)
    || /^poor-charlies-almanack\//.test(file) || /^content\/poor-charlies-almanack\//.test(file)
    || /^content\/articles\/munger\//.test(file) || /Wesco|芒格/.test(record.title)) return "芒格";
  if (/^content\/qa\/伯克希尔/.test(file)) return "巴菲特与芒格";
  if (/巴菲特/.test(record.title)) return "巴菲特";
  if (/芒格/.test(record.title)) return "芒格";
  if (/伯克希尔|格雷厄姆|费雪|所有者收益|能力圈/.test(record.title + text.slice(0, 500))) return "巴菲特相关";
  return "其他/背景人物";
}

function identityFor(record) {
  const file = record.path;
  if (/\/_english-source\//.test(file) || /^content\/munger-originals\//.test(file)) return "英文原始文献";
  if (/^content\/letters\//.test(file)) return "巴菲特股东信中文翻译";
  if (/^content\/partnership\//.test(file)) return "巴菲特合伙人信/协议中文翻译";
  if (/^content\/qa\//.test(file)) return "会议问答转录与中文整理";
  if (/^content\/interviews\//.test(file)) return "访谈转录与中文整理";
  if (/^content\/talks\//.test(file)) return "演讲中文翻译/转录";
  if (/^poor-charlies-almanack\//.test(file)) return "经典文本中文翻译/编校";
  if (/^content\/poor-charlies-almanack\//.test(file)) return "经典文本摘要/早期整理";
  if (/^content\/models\//.test(file)) return "通用模型与编辑扩展";
  if (/^content\/munger-archive\/recordings\//.test(file)) return "访谈/会议转录与中文翻译";
  if (/^content\/munger-archive\/mental-models\//.test(file)) return "芒格思想档案摘要";
  if (/^content\/munger-archive\/quotes\//.test(file)) return "语录索引与二次编排";
  if (/^content\/munger-archive\//.test(file)) return "人物档案/编辑整理";
  if (/^content\/people\//.test(file)) return "人物背景资料/编辑整理";
  if (/^content\/books\//.test(file)) return "图书要点/二手概括";
  if (/^content\/articles\/other\//.test(file)) return "第三方文章/编辑资料";
  if (/^content\/articles\//.test(file)) return "专题文章中文翻译/编辑整理";
  return "待识别";
}

const landmarkLetters = new Set([1977, 1981, 1983, 1984, 1987, 1989, 1992, 1996, 1999, 2000, 2005, 2007, 2011, 2014, 2016, 2022, 2023, 2024]);
const landmarkPartnership = new Set([1959, 1961, 1962, 1964, 1965, 1966, 1967, 1968, 1969]);
const landmarkMeetings = new Set([1994, 1996, 1998, 2000, 2003, 2005, 2007, 2009, 2011, 2013, 2015, 2017, 2020, 2022, 2023]);
const coreBuffettArticle = /股东手册|喜诗糖果|GEICO|所罗门|买入美国|伯克希尔_50|股票期权与常识|给全体经理人|收购_BNSF|谈股市_1999|谈投资_1988/;
const coreBuffettTalk = /佛罗里达大学|佐治亚大学|哥大商学院演讲_1984|华盛顿大学/;
const coreMungerRecording = /usc-1994|psychology-of-human-misjudgment|harvard-1986|ucsb-2003|daily-journal-2020|daily-journal-2023/;

function yearFor(record) {
  return Number(record.path.match(/(?:19|20)\d{2}/)?.[0] || 0);
}

function gradeRecord(record, person, identity, layer) {
  const file = record.path;
  const title = record.title;
  const year = yearFor(record);
  if (exactMainByAlternate.has(file)) {
    return ["D", "与选定主版本正文完全重复。", "不收入；仅保留版本映射"];
  }
  if (/\/_english-source\//.test(file) || /^content\/munger-originals\//.test(file)) {
    return ["C", "英文原始文献适合校对、注释和典藏，不直接占用中文主书篇幅。", "来源校对/典藏层"];
  }
  if (/^content\/letters\//.test(file)) {
    return landmarkLetters.has(year)
      ? ["A", "包含巴菲特核心概念的成熟或转折性表达，是主书证据主干。", "主书核心引文与案例"]
      : ["C", "完整年度信具有资料价值，但主书按主题抽取，全文进入典藏层。", "典藏层/按主题抽取"];
  }
  if (/^content\/partnership\//.test(file)) {
    return landmarkPartnership.has(year)
      ? ["A", "能展示早期方法、合伙人责任和思想演变。", "主书思想演变与核心引文"]
      : ["C", "保留早期实践资料价值，主书仅按问题抽取。", "典藏层/时间线"];
  }
  if (/^content\/qa\/伯克希尔/.test(file)) {
    if (/精选/.test(title)) return ["D", "跨年精选与逐年会议记录语义重合，且上下文被压缩。", "检索入口，不收入"];
    return landmarkMeetings.has(year)
      ? ["B", "现场问答案例丰富，可支撑多个章节，但不宜整篇收入主书。", "案例/侧栏/延伸阅读"]
      : ["C", "完整会议记录适合典藏和检索，主书按主题摘取。", "典藏层"];
  }
  if (/^content\/qa\/Wesco/.test(file)) {
    return [landmarkMeetings.has(year) ? "A" : "B", "芒格在投资、商业和理性问题上的现场表达，具有较高结构价值。", "核心引文/案例"];
  }
  if (/^content\/models\//.test(file)) {
    if (layer === "1") return ["B", "主题与芒格核心体系直接相关，但稿件身份是模型扩展，需与原始表达分栏。", "机制解释/侧栏/图表素材"];
    if (layer === "2") return ["B", "可从芒格原则直接推导，适合作为编者解释，不标为芒格原创。", "编者解释/检查清单"];
    if (layer === "3") return ["C", "与芒格体系兼容但属于后人扩展，主书只在必要处少量使用。", "附录模型库/延伸阅读"];
    return ["D", "现有内部材料缺少芒格直接使用证据，且对主线贡献有限。", "通用模型典藏/不进入主书"];
  }
  if (/^poor-charlies-almanack\/poor-charlies/.test(file)) {
    return ["A", "完整经典文本或演讲是芒格思想体系的主要证据源。", "主书核心引文/思想演变"];
  }
  if (/^content\/poor-charlies-almanack\//.test(file)) {
    return ["D", "较短的早期整理版已被完整版本覆盖。", "版本参考"];
  }
  if (/^content\/munger-archive\/recordings\//.test(file)) {
    if (coreMungerRecording.test(file)) return ["B", "包含核心思想或演变语境，但需与宝典版和其他转录比较。", "案例/思想演变/译文校对"];
    return ["B", "访谈和会议提供晚年实践语境，适合按主题抽取。", "案例/延伸阅读"];
  }
  if (/^content\/munger-archive\/mental-models\//.test(file)) {
    return ["B", "短篇档案可作为芒格使用某模型的证据锚点，需与扩展稿分开。", "证据锚点/侧栏"];
  }
  if (/^content\/munger-archive\/quotes\//.test(file)) {
    return ["C", "语录适合索引和检索，缺少上下文时不作为主书论证主体。", "语录索引/附录"];
  }
  if (/^content\/munger-archive\/(?:home|about|recordings|mental-models|quotes)\.md$/.test(file)) {
    return ["D", "网站入口或索引页，独立思想内容有限。", "内部导航参考"];
  }
  if (/^content\/munger-archive\//.test(file)) {
    return ["B", "人物、公司和生活背景有助于建立精神坐标，但不是人物原作。", "人物导读/时间线/侧栏"];
  }
  if (/^content\/talks\//.test(file)) {
    if (person === "巴菲特") {
      return coreBuffettTalk.test(file)
        ? ["A", "演讲集中表达投资、职业和品格原则，可作为主书核心证据。", "主书核心引文"]
        : ["B", "演讲提供具体场合下的应用与人生材料。", "案例/延伸阅读"];
    }
    return ["B", "芒格演讲具有核心证据价值；若有宝典主版本则作为替代版本处理。", "核心引文/版本校对"];
  }
  if (/^content\/interviews\//.test(file)) {
    return ["B", "访谈适合补充案例、市场环境和人生主题，不宜整篇进入主书。", "案例/侧栏/延伸阅读"];
  }
  if (/^content\/articles\/buffett\//.test(file)) {
    if (/合伙契约|合伙公司时代|估值逻辑|推荐过的书籍/.test(title)) {
      return ["D", "汇编稿与原始信件或书目资料重合，作者身份也弱于原件。", "编辑检索参考"];
    }
    return coreBuffettArticle.test(file)
      ? ["A", "直接承载企业、资本配置、制度或风险核心命题。", "主书核心正文素材"]
      : ["B", "主题相关且案例具体，适合章节案例或思想演变。", "案例/侧栏/延伸阅读"];
  }
  if (/^content\/articles\/munger\//.test(file)) {
    return ["B", "人物或专题材料有结构价值，但需区分原话与编辑整理。", "人物导读/案例"];
  }
  if (/^content\/articles\/other\//.test(file)) {
    if (/所有者收益|伯克希尔|能力圈|格雷厄姆|企业文化|康布斯/.test(title)) {
      return ["B", "第三方材料能解释核心概念或案例，必须标明第三方身份。", "背景说明/案例侧栏"];
    }
    return ["C", "与双书主线关系间接，保留作背景或典藏。", "背景资料/典藏层"];
  }
  if (/^content\/people\//.test(file)) {
    if (/沃伦·巴菲特|查理·芒格|格雷厄姆|费雪|B夫人|阿吉特|阿贝尔|墨菲/.test(title)) {
      return ["B", "关键人物背景可解释思想来源、管理层判断或伯克希尔制度。", "人物侧栏/索引"];
    }
    return ["D", "与双书主线关系较弱，保留在人物资料库。", "人物索引备查"];
  }
  if (/^content\/books\//.test(file)) {
    return ["C", "二手书摘适合术语和延伸阅读，不作为人物思想直接证据。", "延伸书目/附录"];
  }
  if (identity === "待识别") return ["E", "内容身份尚未由目录与元数据判明，需要人工确认。", "待人工确认"];
  return ["C", "具有资料价值，但当前对主书主线贡献有限。", "典藏层"];
}

function factCheck(record, identity, grade, layer) {
  if (grade === "E") return "是";
  if (/通用模型|二手概括|第三方文章|人物档案|编辑整理/.test(identity)) return "是";
  if (layer === "3" || layer === "4") return "是";
  if (/访谈|会议|演讲/.test(identity) && !record.sourceFields) return "抽检";
  return "否";
}

function attributionRisk(identity, layer, person) {
  if (layer === "3" || layer === "4") return "高";
  if (layer === "1" || layer === "2") return "中";
  if (/编辑|二手|第三方|摘要|语录|模型/.test(identity)) return "中";
  if (person.includes("与")) return "中";
  return "低";
}

const classified = inventory.map((record, index) => {
  const doc = readDoc(record.path);
  const person = personFor(record, doc.body);
  const identity = identityFor(record);
  const layer = modelLayer(record.path);
  const themes = scoreThemes(`${record.title}\n${doc.body}`, person === "巴菲特相关" ? "巴菲特" : person);
  const [grade, reason, use] = gradeRecord(record, person, identity, layer);
  const relations = relationByPath.get(record.path) || [];
  const isAlternate = relations.find((relation) => relation.alternate === record.path);
  const isMain = relations.filter((relation) => relation.main === record.path);
  const mainVersion = isAlternate?.main || (isMain.length ? record.path : record.path);
  const alternatives = isMain.map((relation) => relation.alternate).join("|") || "无";
  return {
    "文件ID": `DOC-${String(index + 1).padStart(3, "0")}`,
    "来源文件": record.path,
    "标题": record.title,
    "字符数": Number(record.chars),
    "所属人物": person,
    "内容身份": identity,
    "分级": grade,
    "分级理由": reason,
    "对应主题": themes,
    "推荐用途": use,
    "主版本": mainVersion,
    "替代版本": alternatives,
    "是否需要事实核验": factCheck(record, identity, grade, layer),
    "是否存在错误归因风险": attributionRisk(identity, layer, person),
    "芒格模型身份层级": layer,
    "模型身份说明": modelLayerReason(layer),
    "编辑可信度": grade === "E" ? "待确认" : attributionRisk(identity, layer, person) === "高" ? "中" : "高",
  };
});

const modelRows = classified.filter((row) => row["来源文件"].startsWith("content/models/")).map((row, index) => ({
  "模型编号": `MM-${String(index + 1).padStart(3, "0")}`,
  "来源文件": row["来源文件"],
  "模型名称": row["标题"],
  "学科": readDoc(row["来源文件"]).data.disciplineName || readDoc(row["来源文件"]).data.discipline || "",
  "身份层级": row["芒格模型身份层级"],
  "身份定义": row["模型身份说明"],
  "芒格直接证据": modelEvidence(row["来源文件"], row["芒格模型身份层级"]),
  "主书建议": row["分级"] === "B" ? "可用，但必须标为模型解释或编辑扩展" : row["分级"] === "C" ? "限附录或延伸阅读" : "不进入主书",
  "分级": row["分级"],
  "需要事实核验": row["是否需要事实核验"],
  "错误归因风险": row["是否存在错误归因风险"],
  "编辑备注": row["芒格模型身份层级"] === "1"
    ? "“明确使用”不代表芒格是该学科概念的原创者。"
    : "不得将模型正文中的编辑叙事写成人物原话。",
}));

const classificationCounts = Object.fromEntries(["A", "B", "C", "D", "E"].map((grade) => [
  grade,
  {
    files: classified.filter((row) => row["分级"] === grade).length,
    chars: classified.filter((row) => row["分级"] === grade).reduce((sum, row) => sum + row["字符数"], 0),
  },
]));
const modelLayerCounts = Object.fromEntries(["1", "2", "3", "4"].map((layer) => [
  layer,
  modelRows.filter((row) => row["身份层级"] === layer).length,
]));
const personCounts = {};
for (const row of classified) personCounts[row["所属人物"]] = (personCounts[row["所属人物"]] || 0) + 1;

const summary = {
  generatedAt: new Date().toISOString(),
  files: classified.length,
  totalChars: classified.reduce((sum, row) => sum + row["字符数"], 0),
  classificationCounts,
  modelLayerCounts,
  personCounts,
  factCheck: {
    yes: classified.filter((row) => row["是否需要事实核验"] === "是").length,
    sample: classified.filter((row) => row["是否需要事实核验"] === "抽检").length,
    no: classified.filter((row) => row["是否需要事实核验"] === "否").length,
  },
  attributionRisk: Object.fromEntries(["高", "中", "低"].map((risk) => [
    risk,
    classified.filter((row) => row["是否存在错误归因风险"] === risk).length,
  ])),
  versionGroups: versionRelations.length,
};

writeCsv(path.join(EDITORIAL, "shared/内容分级表_700篇.csv"), classified);
fs.writeFileSync(path.join(EDITORIAL, "shared/内容分级表_700篇.json"), `${JSON.stringify(classified, null, 2)}\n`);
writeCsv(path.join(EDITORIAL, "munger/audit/芒格模型身份分层表_232篇.csv"), modelRows);
writeCsv(path.join(EDITORIAL, "shared/主版本—替代版本映射.csv"), versionRelations.map((relation) => ({
  "版本组": relation.group,
  "关系类型": relation.type,
  "主版本": relation.main,
  "替代版本": relation.alternate,
  "处理决定": relation.decision,
  "是否保留差异": relation.preserve,
})));
fs.writeFileSync(path.join(EDITORIAL, "shared/stage2-classification-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
