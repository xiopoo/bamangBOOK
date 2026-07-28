import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const ebookDir = path.join(root, "output", "ebook");
const coverHtml = path.join(ebookDir, "巴菲特文集_PDF封面.html");
const bodyHtml = path.join(ebookDir, "巴菲特文集_PDF正文.html");
const coverPdf = path.join(ebookDir, ".巴菲特文集_封面临时.pdf");
const bodyPdf = path.join(ebookDir, ".巴菲特文集_正文临时.pdf");

for (const file of [coverHtml, bodyHtml]) {
  if (!fs.existsSync(file)) throw new Error(`Missing print source: ${file}`);
}

const browser = await chromium.launch({ headless: true });
try {
  const coverPage = await browser.newPage({ viewport: { width: 1200, height: 1697 } });
  await coverPage.goto(pathToFileURL(coverHtml).href, { waitUntil: "load" });
  await coverPage.emulateMedia({ media: "print" });
  await coverPage.pdf({
    path: coverPdf,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  const bodyPage = await browser.newPage({ viewport: { width: 1200, height: 1697 } });
  await bodyPage.goto(pathToFileURL(bodyHtml).href, { waitUntil: "load", timeout: 120000 });
  await bodyPage.emulateMedia({ media: "print" });
  await bodyPage.pdf({
    path: bodyPdf,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;color:#777;width:100%;padding:0 18mm;font-family:Arial,sans-serif;display:flex;justify-content:space-between;"><span>巴菲特文集</span><span style="color:#AB1942">THE WARREN BUFFETT READER</span></div>`,
    footerTemplate: `<div style="font-size:8px;color:#777;width:100%;padding:0 18mm;font-family:Arial,sans-serif;display:flex;justify-content:space-between;"><span>1956—2025</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: "19mm", right: "18mm", bottom: "21mm", left: "18mm" },
    timeout: 0,
  });
} finally {
  await browser.close();
}

console.log(JSON.stringify({ coverPdf, bodyPdf }, null, 2));
