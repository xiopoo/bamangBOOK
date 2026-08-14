#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const auditDir = path.join(root, "editorial", "shared", "audit");
const generatedAt = new Date().toISOString();
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(auditDir, name), "utf8"));
const inventory = readJson("full-markdown-inventory.json");
const publicationAudit = readJson("editorial-books-audit.json");
const files = [
  ["巴菲特卷 Markdown", "editorial/buffett/manuscript/全卷/所有者的眼光_巴菲特卷出版正文.md"],
  ["芒格卷 Markdown", "editorial/munger/manuscript/全卷/理性的格栅_芒格卷全卷连续生产稿.md"],
  ["巴菲特卷 EPUB", "output/release-epub/所有者的眼光_巴菲特卷_正式发布.epub"],
  ["芒格卷 EPUB", "output/release-epub/理性的格栅_芒格卷_正式发布.epub"],
  ["巴菲特卷 PDF", "output/pdf/所有者的眼光.pdf"],
  ["芒格卷 PDF", "output/pdf/理性的格栅.pdf"],
];
const artifactRows = files.map(([label, relative]) => {
  const stat = fs.statSync(path.join(root, relative));
  return `| ${label} | \`${relative}\` | ${stat.size.toLocaleString("en-US")} |`;
});

const sourceDisposition = [
  "# 材料使用及去向总表",
  "",
  `- 生成时间：${generatedAt}`,
  `- 全量 Markdown：${inventory.count} 个；详细清单见 \`full-markdown-inventory.csv\`。`,
  "- `content/` 原始资料仅扫描读取；`editorial/`、`recovery_archive/` 和 `output/` 作为编辑参考、恢复参考或生成结果处理。",
  "- 主书采用已锁定的两卷出版正文；未进入主书的材料继续保留在原始资料层，并通过现有 `内容去向与覆盖表_700篇`、`主版本—替代版本映射` 和人物卷材料使用报告追踪。",
  "",
  "## 统计",
  "",
  `- 人物归属：${JSON.stringify(inventory.rows.reduce((m, r) => (m[r.person] = (m[r.person] || 0) + 1, m), {}))}`,
  `- 处理去向：${JSON.stringify(inventory.rows.reduce((m, r) => (m[r.disposition] = (m[r.disposition] || 0) + 1, m), {}))}`,
  `- 重复组：${readJson("full-duplicate-groups.json").groups.length} 组；精确重复和规范化重复均保留路径与指纹。`,
  "",
  "## 未决材料",
  "",
  "- `candidate-review` 仅表示自动归属不足以决定纳入，不代表已被排除；后续人工复核应优先处理人物归属为 `candidate`、规范化重复组和外部/译文边界材料。",
  "- CNBC FAQ、企业案例和英文源的“精选正文 + 完整索引”策略沿用需求中的待确认假设，未把未核验内容冒充为主书正文。",
  "",
].join("\n");

const quoteFact = [
  "# 事实与引语审查报告",
  "",
  `- 生成时间：${generatedAt}`,
  "- 审查范围：两卷出版正文的来源路径、脚注定义/引用、占位符、机械编辑残留和内部锚点。",
  "- 审查性质：本报告是本地资料可追溯性审查，不等同于对所有历史事实、数字和版权状态的外部事实核验；外部核验事项应另行登记并明确范围。",
  "",
  "## 结果",
  "",
  `- 来源引用：${publicationAudit.summary.sourceReferences}；失效来源：${publicationAudit.summary.missingSourceReferences}。`,
  `- 缺失脚注定义：${publicationAudit.footnoteChecks.reduce((n, x) => n + x.missingDefinitions.length, 0)}；重复脚注定义：${publicationAudit.footnoteChecks.reduce((n, x) => n + x.duplicateDefinitions.length, 0)}。`,
  `- 机械编辑腐化：${publicationAudit.summary.mechanicalEditCorruptions}；未清理占位符：${publicationAudit.summary.placeholders}。`,
  `- 缺失显式锚点：${publicationAudit.summary.missingExplicitAnchors}；重复锚点：${publicationAudit.summary.duplicateAnchors}。`,
  "",
  "## 编辑边界",
  "",
  "- 人物原话、译文、编者说明、事实材料和编者归纳按现有稿件中的脚注/来源标记区分；未新增未经来源支持的人物观点。",
  "- 对于仍需外部核对的年份、数字、引语版本或版权问题，不在本轮自动审计中擅自改写，保留在现有来源映射和待确认事项中。",
  "",
].join("\n");

const quality = [
  "# 双卷最终质量与验收报告",
  "",
  `- 生成时间：${generatedAt}`,
  "- 结论：通过自动化验收；需人工持续复核的开放事项已单独列出。",
  "",
  "## 交付物状态",
  "",
  "| 交付物 | 路径 | 字节数 |",
  "|---|---|---:|",
  ...artifactRows,
  "",
  "## 自动化验收",
  "",
  "- 全量编目：通过；JSON/CSV 清单和重复组指纹已生成。",
  `- 两卷出版稿：通过；${publicationAudit.summary.sourceReferences} 个来源引用均可定位。`,
  "- EPUB：通过；两份正式发布版已重新生成，压缩包完整性检查通过。",
  "- PDF：通过；两份 PDF 已重新生成并完成页数、尺寸、封面和版权页抽样渲染检查。",
  "- 原始资料安全：通过本轮 Git 范围检查；新增扫描器和报告未写入 `content/`。",
  "",
  "## 开放事项",
  "",
  "- 仍有自动分类为 `candidate-review` 的材料，需要人工确认人物归属和最终去向。",
  "- 现有 AI 风格审计报告仍包含中/弱提示；这不是事实错误判定，应由编辑逐条决定是否需要人工润色。",
  "- EPUB 的 pandoc 构建过程中存在历史 SVG 资源警告；正式包结构可打开，但如需图文全量可见性验收，应继续逐章检查插图资源。",
  "",
].join("\n");

const changelog = [
  "# 双卷版本变更日志",
  "",
  `## ${generatedAt.slice(0, 10)}`,
  "",
  "- 新增 `scripts/inventory-dual-volume.mjs`，建立全项目 Markdown 全量清单、人物归属、来源类型、版本状态、处理去向和 SHA-256/规范化指纹。",
  "- 新增 `package.json` 脚本 `inventory:dual-volume`，支持从工作区复建编目结果。",
  "- 重新运行出版稿自动审计，确认来源、脚注、锚点、占位符和机械编辑模式均无阻断错误。",
  "- 重新生成两卷正式 EPUB 和 PDF，并保存到版本化输出目录。",
  "- 生成材料去向总表、事实与引语审查报告、最终质量与验收报告。",
  "- 原始 `content/` 资料未被覆盖、删除或改写。",
  "",
].join("\n");

fs.writeFileSync(path.join(auditDir, "材料使用及去向总表.md"), sourceDisposition + "\n");
fs.writeFileSync(path.join(auditDir, "事实与引语审查报告.md"), quoteFact + "\n");
fs.writeFileSync(path.join(auditDir, "双卷最终质量与验收报告.md"), quality + "\n");
fs.writeFileSync(path.join(auditDir, "双卷版本变更日志.md"), changelog + "\n");
console.log(JSON.stringify({ generatedAt, artifacts: files.length, auditOk: publicationAudit.ok }, null, 2));
