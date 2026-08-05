import fs from "node:fs";
import path from "node:path";

const editorial = path.resolve(import.meta.dirname, "../..");
const coverageJson = path.join(editorial, "shared/内容去向与覆盖表_700篇.json");
const coverageCsv = path.join(editorial, "shared/内容去向与覆盖表_700篇.csv");
const ledgerFile = path.join(editorial, "shared/全书精编实际使用台账.json");
const coverage = JSON.parse(fs.readFileSync(coverageJson, "utf8"));
const ledger = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

for (const row of coverage) {
  const uses = ledger.filter((entry) => entry["文件路径"] === row["文件路径"]);
  row["精编实际使用状态"] = uses.length ? uses.map((entry) => entry["状态"]).join("|") : "尚未进入正文精编";
  row["精编实际使用位置"] = uses.length ? [...new Set(uses.map((entry) => entry["实际使用位置"]))].join("|") : "待后续批次";
  row["精编实际使用方式"] = uses.length ? uses.map((entry) => entry["实际使用方式"]).join("；") : "待后续批次";
  row["精编实际身份复核"] = uses.length ? uses.map((entry) => entry["实际内容身份"]).join("；") : "待后续批次";
}

const headers = Object.keys(coverage[0]);
const csv = [
  headers.map(csvEscape).join(","),
  ...coverage.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
].join("\n");
fs.writeFileSync(coverageJson, `${JSON.stringify(coverage, null, 2)}\n`);
fs.writeFileSync(coverageCsv, `${csv}\n`);
console.log(JSON.stringify({
  coverageRows: coverage.length,
  ledgerEntries: ledger.length,
  usedRows: coverage.filter((row) => row["精编实际使用状态"] !== "尚未进入正文精编").length,
}, null, 2));
