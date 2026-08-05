import fs from "node:fs";
import path from "node:path";

const editorial = path.resolve(import.meta.dirname, "../..");
const ledgerFile = path.join(editorial, "shared/全书精编实际使用台账.json");
const reviewFile = path.join(editorial, "buffett/第一篇二次精编材料审阅表_26篇.json");
const ledger = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));
const review = JSON.parse(fs.readFileSync(reviewFile, "utf8"));

for (const item of review.filter((row) => row["二次精编决定"].startsWith("采用"))) {
  const existing = ledger.find((row) => row["文件路径"] === item["文件路径"]);
  const update = {
    "文件路径": item["文件路径"],
    "精编批次": "巴菲特卷第一篇二次精编",
    "实际使用位置": item["实际或计划位置"],
    "实际使用方式": item["决定理由"],
    "实际内容身份": item["内容身份"],
    "状态": "已进入第一篇二次精编修订稿",
  };
  if (existing) Object.assign(existing, update);
  else ledger.push(update);
}

fs.writeFileSync(ledgerFile, `${JSON.stringify(ledger, null, 2)}\n`);
console.log(JSON.stringify({
  ledgerEntries: ledger.length,
  part1RevisionEntries: ledger.filter((row) => row["状态"] === "已进入第一篇二次精编修订稿").length,
}, null, 2));
