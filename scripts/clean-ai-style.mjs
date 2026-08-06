#!/usr/bin/env node
/**
 * clean-ai-style.mjs —— 全书 AI 味书面腔自动清理脚本（方案 1 保守版）
 *
 * 设计边界（与 audit-book-ai-style.mjs 的本质区别）：
 *   - audit 脚本：只读扫描报警，不死文件
 *   - clean 脚本：按"精确模式表 + 白名单跳过"自动替换，但默认 --dry-run 预览，确认后才写
 *
 * 模式表分两层：
 *   L1 自动改（零误删）：只命中"把结论硬包装成抽象名词"的短语，如
 *       "判断标准|判断纪律|判断框架|判断体系|判断产物|判断落点|判断的尺度"
 *       → "标准|看家本领|检查清单|尺度"
 *       "把同一?判断|同一?个判断|核心判断|这个判断|那个判断|这套判断|一项判断|最终判断|整体判断|基本判断|关键判断"
 *       → "把同一个意思 / 核心没变 / 这个意思 / 那套意思..."
 *       "收束|收口|收尾|归结[为到]|凝练|锚定|勾勒|串[起成]全卷"
 *       → "最后撂下这么一句 / 收口成..."
 *   L2 白名单跳过（输出人工复核清单，不自动砍）：
 *       - 所有"这个判断/那个判断/最终判断/核心判断"里可能指代前文结论的（如"这个判断后来证明一半对一半错"）
 *       - 芒格"晚年收束/反复收束/收束为一句话"真实叙事描述芒格行为
 *       - "最终判断权"（法律术语）、"独立判断的产物"（巴菲特原话精神）
 *
 * 安全机制：
 *   1. 默认 --dry-run 预览，打印每处命中 + 所在文件 + 拟改后文本，不动任何文件
 *   2. 只动"活正本"（出版分章 / 全卷 / 第三轮精编 / 人与制度 / 连续生产），跳过 .bak_* 和审计报告产物
 *   3. 每条替换都先确认 old_str 在当前文件中唯一，否则报错不替换（避免误伤）
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const DRY_RUN = process.argv.includes("--dry-run") || !process.argv.includes("--apply");
const APPLY = process.argv.includes("--apply");

// ---- L1 自动改精确模式表（零误删） ----
// 每条：{ from: 旧短语正则/字符串, to: 新短语, rule: 归类, note: 说明 }
// 注意：from 用字面字符串匹配（确保唯一），不用正则模糊匹配，避免误伤
const AUTO_FIX = [
  // 第4章 能力圈 —— "判断纪律"
  { from: "安全边际不是一套选股公式，而是一种可迁移的判断纪律", to: "安全边际不是一套选股公式，而是一种能搬着用的看家本领", rule: "F12-判断纪律", note: "看家本领" },
  // 第3章 斯科特费泽 —— "这笔账怎么看" 标题（已改，跳过若已改）
  // 第9章 所罗门 —— "判断标准也随之转变"
  { from: "判断标准也随之转变：公司的目标是以一流的方式开展一流的业务", to: "看人看事的方式也跟着变了：公司的目标是以一流的方式开展一流的业务", rule: "F13-判断标准", note: "看人看事的方式" },
  // 第3章 报表 —— "逐项判断/判断标准是/暴露判断位置"
  { from: "逐项判断哪项对应真实消耗、哪项只是时间分配，形成(b)。第三步，估算(c)：把历年资本开支里\"维持现有规模和地位\"的部分挑出来——判断标准是\"如果停掉这笔开支，产量、质量或竞争力会不会在几年内下降\"，再按多年平均。第四步，用(a)+(b)-(c)得到所有者收益，并把结果与报告利润对照：差距方向指向口径问题的性质，差距大小提示报告的失真程度。这套步骤不要求精确，却强制分析者暴露自己的判断位置——每一处\"我估计\"都成为可以复核的假设。", to: "逐项看清哪项对应真实消耗、哪项只是时间分配，形成(b)。第三步，估算(c)：把历年资本开支里\"维持现有规模和地位\"的部分挑出来——标准是\"如果停掉这笔开支，产量、质量或竞争力会不会在几年内下降\"，再按多年平均。第四步，用(a)+(b)-(c)得到所有者收益，并把结果与报告利润对照：差距方向指向口径问题的性质，差距大小提示报告的失真程度。这套步骤不要求精确，却逼着分析者亮出自己估的地方——每一处\"我估计\"都成为可以复核的假设。", rule: "F13-逐项判断", note: "逐项看清 / 标准是 / 逼分析者亮出自己估的地方" },
  // 第3章 斯科特费泽 —— "回到巴菲特的判断"（短锚点，覆盖全卷/锁定/出版/第三轮各副本）
  { from: "这恰好回到巴菲特的判断", to: "这恰好回到巴菲特看问题的角度", rule: "F13-回到巴菲特的判断", note: "回到巴菲特看问题的角度" },
  // 第8章 能力圈 —— "同一判断的两个过滤器"（B-2：判断抽象名词化，改"同一分析框架"）
  { from: "而是同一判断的两个过滤器", to: "而是同一个分析框架的两个过滤器", rule: "F13-同一判断的两个过滤器", note: "同一个分析框架的两个过滤器" },
  // 第8章 人与制度卷变体 —— "构成同一判断的两个过滤器"
  { from: "构成同一判断的两个过滤器", to: "构成同一个分析框架的两个过滤器", rule: "F13-同一判断的两个过滤器", note: "同一个分析框架的两个过滤器" },
  // 第6章 喜诗 —— "收购前的判断落在"
  { from: "收购前的判断落在产品本身和顾客的反应上", to: "收购前，他们盯的是产品本身和顾客的反应", rule: "F13-收购前的判断", note: "收购前，他们盯的是" },
  // 第6章 喜诗 —— "改了四件连在一起的判断"
  { from: "它改了四件连在一起的判断：比净资产高未必就贵", to: "它改了四件连在一起的事：比净资产高未必就贵", rule: "F13-改了四件连在一起的判断", note: "改了四件连在一起的事" },
  // 第9章 头版检验 —— "变成每个人都能执行的判断 / 判断的标准统一了"
  { from: "头版检验把抽象的声誉变成每个人都能执行的判断——如果这件事上了报纸，我是否愿意面对？判断的标准统一了，声誉就从一个模糊的集体概念，变成每个经理人日常决策里的具体约束。", to: "头版检验把抽象的声誉变成每个人都能照着做的一道题——如果这件事上了报纸，我是否愿意面对？这道题的标准统一了，声誉就从一个模糊的集体概念，变成每个经理人日常决策里的具体约束。", rule: "F13-头版检验", note: "变成每个人都能照着做的一道题 / 这道题的标准统一了" },
  // 第10章 价钱太好 —— "方法的改变不是判断标准变了"
  { from: "方法的改变不是判断标准变了，是资金规模变后", to: "方法变了，不是因为看人的尺子变了，是资金规模变后", rule: "F13-方法的改变不是判断标准变了", note: "方法变了，不是因为看人的尺子变了" },
  // 第13章 杠杆 —— "核心判断没有变"（短锚点，独立改）
  { from: "核心判断没有变：避免不能恢复的损失", to: "核心没变：避免不能恢复的损失", rule: "F13-核心判断没变", note: "核心没变" },
  // 第13章 杠杆 —— "把同一判断写成最直白的形式"
  { from: "把同一判断写成最直白的形式", to: "把同一个意思写成最直白的话", rule: "F13-把同一判断写成最直白的形式", note: "把同一个意思写成最直白的话" },
  // 第13章 杠杆 —— "同一个判断在半个多世纪里反复出现"
  { from: "同一个判断在半个多世纪里反复出现", to: "这同一个意思在半个多世纪里反复出现", rule: "F13-同一个判断反复出现", note: "这同一个意思反复出现" },
  // 第13章 杠杆 —— "把四条合成一个可以逐项检查的判断框架"
  { from: "把四条合成一个可以逐项检查的判断框架：期限、杠杆、流动性。", to: "把四条合成一个可以逐项检查的检查清单：期限、杠杆、流动性。", rule: "F13-判断框架", note: "检查清单" },
  // 第13章 杠杆最容易想错的地方 —— "本章判断框架的使用说明"
  { from: "这三条反过来，就是本章判断框架的使用说明。", to: "这三条反过来，就是怎么用本章这套检查清单。", rule: "F13-判断框架的使用说明", note: "怎么用本章这套检查清单" },
  // 第9章 把名声押上去 —— "2006年经理人备忘录以一句话收束"
  { from: "2006年经理人备忘录以一句话收束：“伯克希尔的声誉掌握在你们手中。”", to: "2006年经理人备忘录最后就撂下这么一句：“伯克希尔的声誉掌握在你们手中。”", rule: "F12-收束", note: "最后就撂下这么一句" },
  // 第4章 能力圈 —— "可以用巴菲特自己的一句话收束"（已改？检查）
  // 第15章 把个人判断变成可传承的复利制度 —— "第一章的所有者视角在这里收束为全卷制度"
  { from: "第一章的所有者视角在这里收束为全卷制度：", to: "第一章的所有者视角到了这里，正好收口成全卷制度：", rule: "F12-收束", note: "收口成全卷制度" },
  // 芒格卷 第3章 终身学习 —— "缺判断标准"
  { from: "第三，写清缺的是什么——缺数据、缺理解、还是缺判断标准，三者的补法完全不同；", to: "第三，写清缺的是什么——缺数据、缺理解、还是缺标尺，三者的补法完全不同；", rule: "F13-缺判断标准", note: "缺标尺" },
  // 芒格卷 第6章 反证、检查清单 —— "同一个判断流程"
  { from: "他的贡献是把它们装进同一个判断流程：先得出一个答案，然后系统性地尝试推翻它。", to: "他的贡献是把它们装进同一套流程：先得出一个答案，然后系统性地尝试推翻它。", rule: "F13-同一个判断流程", note: "同一套流程" },
  // 芒格卷 第9章 群体、权威 —— "判断标准是背后有没有独立证据链"
  { from: "- **群体总是错的**：人群有时是真信号，判断标准是背后有没有独立证据链。", to: "- **群体总是错的**：人群有时是真信号，标准是背后有没有独立证据链。", rule: "F13-判断标准是背后", note: "标准是背后" },
  // 芒格卷 第11章 穿过会计看商业现实 —— "判断标准落在管理层"
  { from: "2019年，他再次谈\"如何分辨稳健的银行与危险的银行\"——判断标准落在管理层对假设的态度。", to: "2019年，他再次谈\"如何分辨稳健的银行与危险的银行\"——标准落在管理层对假设的态度。", rule: "F13-判断标准落在管理层", note: "标准落在管理层" },
  // 芒格卷 第12章 好企业让少行动成为优势 —— "企业的判断标准"
  { from: "未利用的提价能力（迪士尼、喜诗、可口可乐）是企业的判断标准，", to: "未利用的提价能力（迪士尼、喜诗、可口可乐）是企业的标尺，", rule: "F13-企业的判断标准", note: "企业的标尺" },
  // 芒格卷 第5章 持续维护的判断纪律
  { from: "持续维护的判断纪律", to: "持续维护的看家本领", rule: "F12-判断纪律", note: "持续维护的看家本领" },
];

// ---- L2 白名单跳过（输出人工复核清单，不自动砍） ----
// 这些"判断/收束"在源书稿里是指代正当或真实叙事，脚本跳过并列出供人工复核
const WHITELIST_SKIP = [
  "这个判断后来证明",           // 指代前文结论（口语正常）
  "把判断外包给评级机构",       // 叙事正常
  "风险判断",                   // 叙事正常
  "独立判断的产物",             // 巴菲特原话精神
  "相信自己的判断",             // 巴菲特原话精神
  "最终判断权",                 // 法律术语
  "涉及他人的判断时",           // 指代正当
  "同一个判断错误",             // 指代正当（芒格卷）
  "这个判断最长的样本",         // 指代正当（第7章第1篇）
  "判断\"饱和\"的依据",         // 指代正当
  "晚年收束",                   // 芒格真实叙事
  "反复收束",                   // 芒格真实叙事
  "收束为一句话",               // 芒格真实叙事（描述把主张浓缩）
];

// ---- 活正本范围（只动这些，跳过 .bak_* 和审计报告产物） ----
const LIVE_CANON_DIRS = [
  "editorial/buffett/manuscript/出版分章",
  "editorial/buffett/manuscript/全卷",
  "editorial/buffett/manuscript/第三轮精编",
  "editorial/buffett/manuscript/第三篇_人与制度",
  "editorial/buffett/manuscript/第二篇_好企业如何创造价值",
  "editorial/buffett/manuscript/第一篇_所有者的起点",
  "editorial/buffett/manuscript/第四篇_资本配置",
  "editorial/buffett/manuscript/第五篇_风险时间与复利",
  "editorial/munger/manuscript/出版分章",
  "editorial/munger/manuscript/全卷",
  "editorial/munger/manuscript/连续生产",
  "editorial/munger/manuscript/附录",
];

function isLiveCanon(relativePath) {
  const normalized = relativePath.replace(/\\/gu, "/");
  if (normalized.includes(".bak_")) return false;
  if (normalized.includes("审计")) return false;
  if (normalized.includes("audit")) return false;
  if (normalized.includes("shared/audit")) return false;
  return LIVE_CANON_DIRS.some((dir) => normalized.startsWith(dir.replace(/\\/gu, "/")));
}

// ---- 主逻辑 ----
const stats = {
  mode: DRY_RUN ? "DRY-RUN（预览，不动文件）" : "APPLY（正式写入）",
  autoFixed: 0,
  skippedByWhitelist: 0,
  notFoundInThisPass: 0,
  details: [],
};

for (const fix of AUTO_FIX) {
  // 在所有活正本目录里找包含该 old_str 的文件
  const candidates = [];
  for (const dir of LIVE_CANON_DIRS) {
    const absDir = path.join(root, dir);
    if (!fs.existsSync(absDir)) continue;
    for (const file of walkMd(absDir)) {
      const rel = path.relative(root, file).replace(/\\/gu, "/");
      if (!isLiveCanon(rel)) continue;
      const content = fs.readFileSync(file, "utf8");
      if (content.includes(fix.from)) {
        candidates.push({ file, rel, count: content.split(fix.from).length - 1 });
      }
    }
  }

  for (const cand of candidates) {
    const content = fs.readFileSync(cand.file, "utf8");
    // 唯一性检查：确保 old_str 在当前文件中只出现一次（避免误伤）
    const occurrences = content.split(fix.from).length - 1;
    if (occurrences !== 1) {
      stats.details.push({
        status: "SKIP-非唯一",
        rule: fix.rule,
        file: cand.rel,
        from: fix.from.slice(0, 40) + "…",
        note: `old_str 在当前文件出现 ${occurrences} 次，不自动替换（避免误伤）`,
      });
      continue;
    }

    // 白名单检查：如果该 from 命中了白名单跳过项，则列出供人工复核，不自动改
    const skipHit = WHITELIST_SKIP.find((s) => fix.from.includes(s));
    if (skipHit) {
      stats.skippedByWhitelist += 1;
      stats.details.push({
        status: "SKIP-白名单",
        rule: fix.rule,
        file: cand.rel,
        from: fix.from.slice(0, 40) + "…",
        note: `命中白名单跳过项「${skipHit}」，列出供人工复核，不自动改`,
      });
      continue;
    }

    // 执行替换（仅 APPLY 模式才写文件）
    if (APPLY) {
      const updated = content.replace(fix.from, fix.to);
      fs.writeFileSync(cand.file, updated, "utf8");
      stats.autoFixed += 1;
      stats.details.push({
        status: "FIXED",
        rule: fix.rule,
        file: cand.rel,
        from: fix.from.slice(0, 40) + "…",
        to: fix.to.slice(0, 40) + "…",
        note: fix.note,
      });
    } else {
      stats.notFoundInThisPass += 0;
      stats.details.push({
        status: "PREVIEW",
        rule: fix.rule,
        file: cand.rel,
        from: fix.from.slice(0, 40) + "…",
        to: fix.to.slice(0, 40) + "…",
        note: fix.note,
      });
    }
  }
}

// ---- 辅助：遍历目录下所有 .md 文件 ----
function walkMd(dir) {
  const result = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".bak_") || entry.name === "node_modules" || entry.name === ".git") continue;
        stack.push(full);
      } else if (entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith(".bak_")) {
        result.push(full);
      }
    }
  }
  return result;
}

// ---- 输出 ----
console.log("═".repeat(72));
console.log(`  全书 AI 味书面腔自动清理脚本 〔方案 1 保守版〕`);
console.log("═".repeat(72));
console.log(`  运行模式：${stats.mode}`);
console.log(`  精确模式表条目数：${AUTO_FIX.length}`);
console.log(`  白名单跳过项：${WHITELIST_SKIP.length}`);
console.log(`  活正本目录数：${LIVE_CANON_DIRS.length}`);
console.log("─".repeat(72));
console.log();
if (DRY_RUN) {
  console.log("  【DRY-RUN 预览】以下为命中 + 拟改文本，不写入任何文件。");
  console.log("  确认无误后，运行 `node scripts/clean-ai-style.mjs --apply` 正式执行。");
  console.log();
}
for (const d of stats.details) {
  const tag = { FIXED: "✅ 已改", PREVIEW: "👁 预览", "SKIP-白名单": "⛔ 白名单跳过", "SKIP-非唯一": "⚠️ 非唯一跳过" }[d.status] ?? d.status;
  console.log(`  [${tag}] ${d.rule}`);
  console.log(`    文件：${d.file}`);
  console.log(`    旧：${d.from}`);
  console.log(`    新：${d.to}`);
  console.log(`    说明：${d.note}`);
  console.log(`  ${"─".repeat(60)}`);
}
console.log();
console.log(`  ── 统计 ──`);
console.log(`  自动改（FIXED）：${stats.autoFixed}`);
console.log(`  白名单跳过（不自动改）：${stats.skippedByWhitelist}`);
console.log(`  预览命中（PREVIEW，未写文件）：${stats.details.filter((d) => d.status === "PREVIEW").length}`);
console.log("═".repeat(72));
if (!APPLY) {
  console.log("  ⚠️  当前为 DRY-RUN 预览模式，未写入任何文件。");
  console.log("      确认命中无误后，加 --apply 参数重新运行以正式写入。");
} else {
  console.log("  ✅ 已正式写入修改。");
}
console.log("═".repeat(72));
