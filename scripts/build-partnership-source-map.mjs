#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = "content/source-documents/buffett-partnership-letters/ivey-buffett-partnership-letters.pdf";
const sourceUrl = "https://www.ivey.uwo.ca/media/2975913/buffett-partnership-letters.pdf";
const outputDir = path.join(root, "editorial/shared/source-catalog");
const generatedAt = new Date().toISOString();

const mapped = (startPage, endPage, sourceLabel, note = "") => ({ status: "page-mapped", startPage, endPage, sourceLabel, note });
const missing = (note) => ({ status: "not-found-in-ivey-compilation", startPage: "", endPage: "", sourceLabel: "", note });
const duplicate = (duplicateOf, note) => ({ status: "duplicate-markdown-version", startPage: "", endPage: "", sourceLabel: "", duplicateOf, note });

const definitions = {
  "content/partnership/partnership_1956-有限合伙协议.md": missing("法律协议，不是 Ivey 合编本中的一封书信；需另找带签署页的完整协议扫描件。"),
  "content/partnership/partnership_1957-巴菲特致合伙人信.md": mapped(1, 3, "1957 Letter"),
  "content/partnership/partnership_1958-巴菲特致合伙人信.md": mapped(4, 6, "1958 Letter", "中文文件含一条校对注，正式成书时必须与本人正文隔离。"),
  "content/partnership/partnership_1959-巴菲特致合伙人信.md": mapped(7, 8, "1959 Letter"),
  "content/partnership/partnership_1960-巴菲特致合伙人信.md": mapped(9, 13, "1960 Letter / annual"),
  "content/partnership/partnership_1961-interim-巴菲特致合伙人信.md": mapped(14, 16, "July 1961 interim letter"),
  "content/partnership/partnership_1961-annual-巴菲特致合伙人信.md": mapped(17, 25, "January 24, 1962 / 1961 annual"),
  "content/partnership/partnership_1962-interim-巴菲特致合伙人信.md": mapped(26, 29, "July 6, 1962 interim letter"),
  "content/partnership/partnership_1962-11月-巴菲特致合伙人信.md": mapped(30, 31, "November 1, 1962"),
  "content/partnership/partnership_1962-annual-巴菲特致合伙人信.md": mapped(32, 41, "January 18, 1963 / 1962 annual"),
  "content/partnership/partnership_1962-12月-巴菲特致合伙人信.md": missing("1962 年 12 月 24 日税务信未出现在 Ivey 合编本。"),
  "content/partnership/partnership_1963-interim-巴菲特致合伙人信.md": mapped(42, 48, "July 10, 1963 interim letter"),
  "content/partnership/partnership_1963-11月-巴菲特致合伙人信.md": mapped(49, 50, "November 6, 1963"),
  "content/partnership/partnership_1963-annual-巴菲特致合伙人信.md": mapped(51, 62, "January 18, 1964 / 1963 annual"),
  "content/partnership/partnership_1963-12月-巴菲特致合伙人信.md": missing("1963 年 12 月 26 日税务信未出现在 Ivey 合编本。"),
  "content/partnership/partnership_1964-interim-巴菲特致合伙人信.md": mapped(63, 66, "July 8, 1964 interim letter"),
  "content/partnership/partnership_1964-annual-巴菲特致合伙人信.md": mapped(67, 78, "January 18, 1965 / 1964 annual"),
  "content/partnership/partnership_1965-interim-巴菲特致合伙人信.md": mapped(79, 82, "July 9, 1965 interim letter"),
  "content/partnership/partnership_1965-11月-巴菲特致合伙人信.md": mapped(83, 84, "November 1, 1965", "中文文件在原信签名及附言之后追加了 1963 年‘基本原则’和美国运通解释；这些不是本信正文，正式成书必须剥离。"),
  "content/partnership/partnership_1965-annual-巴菲特致合伙人信.md": mapped(85, 94, "January 20, 1966 / 1965 annual", "中文文件含译者扩充说明脚注，需与英文逐句核对并与本人正文隔离。"),
  "content/partnership/partnership_1966-interim-巴菲特致合伙人信.md": mapped(95, 99, "July 12, 1966 interim letter"),
  "content/partnership/partnership_1966-11月-巴菲特致合伙人信.md": missing("1966 年 11 月承诺书信未出现在 Ivey 合编本。"),
  "content/partnership/partnership_1966-annual-巴菲特致合伙人信.md": mapped(100, 107, "January 25, 1967 / 1966 annual"),
  "content/partnership/partnership_1967-interim-巴菲特致合伙人信.md": mapped(108, 110, "July 12, 1967 interim letter"),
  "content/partnership/partnership_1967-10月-巴菲特致合伙人信.md": mapped(111, 114, "October 9, 1967"),
  "content/partnership/partnership_1967-11月-巴菲特致合伙人信.md": missing("1967 年 11 月承诺书信未出现在 Ivey 合编本。"),
  "content/partnership/partnership_1967-annual-巴菲特致合伙人信.md": mapped(115, 119, "January 24, 1968 / 1967 annual"),
  "content/partnership/partnership_1968-interim-巴菲特致合伙人信.md": mapped(120, 122, "July 11, 1968 interim letter"),
  "content/partnership/partnership_1968-11月-巴菲特致合伙人信.md": missing("1968 年 11 月承诺书信未出现在 Ivey 合编本。"),
  "content/partnership/partnership_1968-annual-巴菲特致合伙人信.md": mapped(123, 128, "January 22, 1969 / 1968 annual"),
  "content/partnership/partnership_1969-5月-巴菲特致合伙人信.md": mapped(129, 131, "May 29, 1969"),
  "content/partnership/partnership_1969-annual-巴菲特致合伙人信.md": duplicate("content/partnership/partnership_1969-5月-巴菲特致合伙人信.md", "正文对应同一封 1969 年 5 月 29 日信，不应作为第二封年度信重复收入。"),
  "content/partnership/partnership_1969-10月-巴菲特致合伙人信.md": mapped(132, 136, "October 9, 1969"),
  "content/partnership/partnership_1969-12月-巴菲特致合伙人信.md": mapped(137, 140, "December 5, 1969"),
  "content/partnership/partnership_1969-12月26日-巴菲特致合伙人信.md": mapped(141, 144, "December 26, 1969"),
  "content/partnership/partnership_1969-liquidation-巴菲特致合伙人信.md": duplicate("content/partnership/partnership_1969-12月26日-巴菲特致合伙人信.md", "正文对应同一封 1969 年 12 月 26 日清算信，不应重复收入。"),
  "content/partnership/partnership_1970-bond-巴菲特致合伙人信.md": mapped(145, 152, "February 25, 1970 tax-exempt bond letter"),
};

const actual = fs.readdirSync(path.join(root, "content/partnership"))
  .filter((name) => name.endsWith(".md"))
  .map((name) => `content/partnership/${name}`)
  .sort((a, b) => a.localeCompare(b, "zh-CN"));
const defined = Object.keys(definitions).sort((a, b) => a.localeCompare(b, "zh-CN"));
const missingDefinitions = actual.filter((relative) => !definitions[relative]);
const staleDefinitions = defined.filter((relative) => !actual.includes(relative));
if (missingDefinitions.length || staleDefinitions.length) {
  throw new Error(`Partnership source-map mismatch\nMissing definitions: ${missingDefinitions.join(", ")}\nStale definitions: ${staleDefinitions.join(", ")}`);
}
if (!fs.existsSync(path.join(root, sourcePath))) throw new Error(`Missing source PDF: ${sourcePath}`);

const rows = actual.map((relative) => ({
  relative,
  ...definitions[relative],
  duplicateOf: definitions[relative].duplicateOf ?? "",
  note: definitions[relative].note ?? "",
  sourcePath: definitions[relative].status === "page-mapped" ? sourcePath : "",
  sourceUrl: definitions[relative].status === "page-mapped" ? sourceUrl : "",
}));

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const headers = ["relative", "status", "startPage", "endPage", "sourceLabel", "duplicateOf", "note", "sourcePath", "sourceUrl"];
const csv = `${[headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n")}\n`;
const counts = Object.fromEntries([...new Set(rows.map((row) => row.status))].map((status) => [status, rows.filter((row) => row.status === status).length]));

const report = [
  "# 巴菲特合伙人资料逐封英文底本页码映射",
  "",
  `- 生成时间：${generatedAt}`,
  `- 本地 Markdown：${rows.length} 个`,
  `- Ivey 英文合编本逐封定位：${counts["page-mapped"] ?? 0} 个`,
  `- 确认重复 Markdown：${counts["duplicate-markdown-version"] ?? 0} 个`,
  `- Ivey 合编本未收录或文类不符：${counts["not-found-in-ivey-compilation"] ?? 0} 个`,
  "- 页码均为 PDF 物理页码（第一页记为 1），不是印刷页脚数字。",
  "",
  "## 已确认的重复版本",
  "",
  ...rows.filter((row) => row.status === "duplicate-markdown-version").map((row) => `- \`${row.relative}\` → \`${row.duplicateOf}\`：${row.note}`),
  "",
  "## 尚无 Ivey 对应底本",
  "",
  ...rows.filter((row) => row.status === "not-found-in-ivey-compilation").map((row) => `- \`${row.relative}\`：${row.note}`),
  "",
  "## 已发现的中文候选边界问题",
  "",
  ...rows.filter((row) => row.status === "page-mapped" && row.note).map((row) => `- \`${row.relative}\`：${row.note}`),
  "",
  "## 编书准入规则",
  "",
  "- 29 个已定位文件可进入逐段中英校核，不代表翻译已经验收。",
  "- 两个重复 Markdown 只保留一个主版本，禁止在书中重复出现。",
  "- 五封税务/承诺书信及 1956 协议继续找独立原件；找不到时只登记缺口。",
  "- Ivey 文件是机构托管的英文合编本，不称为逐封官方扫描件。",
  "",
];

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "partnership-source-map.json"), `${JSON.stringify({ generatedAt, sourcePath, sourceUrl, count: rows.length, counts, rows }, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, "partnership-source-map.csv"), csv);
fs.writeFileSync(path.join(outputDir, "巴菲特合伙人资料逐封英文底本页码映射.md"), `${report.join("\n")}\n`);

console.log(JSON.stringify({ generatedAt, count: rows.length, counts }, null, 2));
