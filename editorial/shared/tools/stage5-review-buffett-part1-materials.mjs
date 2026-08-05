import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const editorial = path.join(root, "editorial");
const coverageFile = path.join(editorial, "shared/内容去向与覆盖表_700篇.json");
const coverage = JSON.parse(fs.readFileSync(coverageFile, "utf8"));
const targets = coverage.filter((row) =>
  (row["对应篇级结构"] ?? "").split("|").includes("第一篇 所有者的起点")
  || ["buffett-ch-01", "buffett-ch-02", "buffett-ch-03"].some((id) => (row["对应篇章"] ?? "").split("|").includes(id)),
);

const decisions = new Map([
  ["content/articles/buffett/巴菲特：股票期权与常识_2002.md", ["采用", "buffett-ch-03", "股票期权经济成本与所有者稀释案例"]],
  ["content/articles/buffett/巴菲特：回忆进入证券行业_2005.md", ["采用", "buffett-ch-01", "早期思想形成与格雷厄姆影响"]],
  ["content/articles/buffett/巴菲特：模糊数学与股票期权_2004.md", ["采用", "buffett-ch-03", "不能因估计困难而假装成本不存在的反例"]],
  ["content/articles/buffett/巴菲特估值逻辑.md", ["由主版本承接", "完整典藏层", "内容身份和来源链弱于1992年股东信，不承担直接引文"]],
  ["content/articles/buffett/巴菲特谈投资_1985.md", ["采用", "buffett-ch-01", "所有者视角、市场关闭测试与能力圈"]],
  ["content/articles/buffett/巴菲特谈指数期货_1982.md", ["转入侧栏/索引", "buffett-ch-01", "补充交易刺激与社会成本边界，不展开制度史"]],
  ["content/articles/buffett/我最看好的股票：人寿保险_1957.md", ["采用", "buffett-ch-02", "早期以资产、盈利和价格交叉估值的完整案例"]],
  ["content/articles/other/「所有者收益」vs「自由现金流」.md", ["采用（编辑扩展）", "buffett-ch-03", "现代自由现金流口径对照；不得当作巴菲特原话"]],
  ["content/articles/other/关于市场先生和人性的理解.md", ["转入侧栏/索引", "buffett-ch-01", "二手整理，格雷厄姆原理只作检索，不替代巴菲特主证据"]],
  ["content/books/巴菲特之道-核心要点.md", ["由主版本承接", "完整典藏层", "二手要点由股东信和案例承接"]],
  ["content/books/穷查理宝典-核心要点.md", ["暂不使用", "完整典藏层", "人物与篇章主线不匹配，保留交叉索引"]],
  ["content/interviews/巴菲特：对话_IVEY_商学院学生_2008.md", ["采用", "buffett-ch-02", "同一企业不同市场价格与估值边界"]],
  ["content/partnership/partnership_1958-巴菲特致合伙人信.md", ["采用", "buffett-ch-01", "市场亢奋与独立判断早期语境"]],
  ["content/partnership/partnership_1959-巴菲特致合伙人信.md", ["采用", "buffett-ch-02", "衡量标准和价格纪律演变"]],
  ["content/partnership/partnership_1961-annual-巴菲特致合伙人信.md", ["采用", "buffett-ch-01|buffett-ch-02", "低估、套利、控制三类方法及控制型所有权"]],
  ["content/partnership/partnership_1962-11月-巴菲特致合伙人信.md", ["由主版本承接", "完整典藏层", "以协议与行政说明为主，独立思想增量有限"]],
  ["content/partnership/partnership_1963-12月-巴菲特致合伙人信.md", ["转入附录", "税务附录", "税务行政信息不进入本篇正文"]],
  ["content/partnership/partnership_1963-interim-巴菲特致合伙人信.md", ["转入年表", "合伙人信年表", "阶段业绩和登普斯特进展由完整案例承接"]],
  ["content/partnership/partnership_1964-annual-巴菲特致合伙人信.md", ["采用", "buffett-ch-01|buffett-ch-02", "复利、衡量标准、投资方法与目标"]],
  ["content/partnership/partnership_1965-11月-巴菲特致合伙人信.md", ["采用", "buffett-ch-01", "基本原则、集中上限与合伙人预期管理"]],
  ["content/partnership/partnership_1966-11月-巴菲特致合伙人信.md", ["采用", "buffett-ch-02", "机会稀缺、估值纪律与不行动边界"]],
  ["content/partnership/partnership_1967-11月-巴菲特致合伙人信.md", ["采用", "buffett-ch-02", "方法容量与降低回报预期的思想修正"]],
  ["content/partnership/partnership_1967-interim-巴菲特致合伙人信.md", ["转入年表", "合伙人信年表", "中期业绩资料不承担核心命题"]],
  ["content/partnership/partnership_1968-11月-巴菲特致合伙人信.md", ["采用", "buffett-ch-01|buffett-ch-02", "市场环境变化、方法容量与合伙阶段收束"]],
  ["content/people/本杰明·格雷厄姆.md", ["转入侧栏/索引", "buffett-ch-01", "人物背景和思想源流，不作直接引文"]],
  ["content/people/沃伦·巴菲特.md", ["转入年表/索引", "人物年表", "人物概览由一手材料承接"]],
]);

const review = targets.map((row, index) => {
  const decision = decisions.get(row["文件路径"]) ?? ["暂不使用", "完整典藏层", "未形成独立正文增量"];
  const source = fs.readFileSync(path.join(root, row["文件路径"]), "utf8");
  return {
    "编号": `P1R-${String(index + 1).padStart(2, "0")}`,
    "文件路径": row["文件路径"],
    "原分级": row["原分级"],
    "内容身份": row["内容身份"],
    "原映射": row["对应篇章"],
    "审阅状态": "已逐篇审阅",
    "二次精编决定": decision[0],
    "实际或计划位置": decision[1],
    "决定理由": decision[2],
    "文件字符数": source.length,
    "典藏层": "保留",
  };
});

function esc(value) {
  const text = String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
const headers = Object.keys(review[0]);
fs.writeFileSync(path.join(editorial, "buffett/第一篇二次精编材料审阅表_26篇.csv"), `${headers.join(",")}\n${review.map((row) => headers.map((h) => esc(row[h])).join(",")).join("\n")}\n`);
fs.writeFileSync(path.join(editorial, "buffett/第一篇二次精编材料审阅表_26篇.json"), `${JSON.stringify(review, null, 2)}\n`);

for (const row of coverage) {
  const item = review.find((entry) => entry["文件路径"] === row["文件路径"]);
  row["第一篇二次精编审阅"] = item ? item["审阅状态"] : "不适用";
  row["第一篇二次精编决定"] = item ? `${item["二次精编决定"]}｜${item["实际或计划位置"]}` : "不适用";
}
fs.writeFileSync(coverageFile, `${JSON.stringify(coverage, null, 2)}\n`);
console.log(JSON.stringify({
  reviewed: review.length,
  decisions: Object.fromEntries([...new Set(review.map((row) => row["二次精编决定"]))].map((key) => [key, review.filter((row) => row["二次精编决定"] === key).length])),
}, null, 2));
