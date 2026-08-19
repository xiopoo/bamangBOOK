const { chromium } = require('/Users/lucas/Documents/bamangB/bamangBOOK/node_modules/playwright-core');
const path = require('path');
(async () => {
  const html = process.argv[2];
  const out = process.argv[3];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 794, height: 1123 }); // A4 @96dpi
  await page.goto('file://' + html, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.screenshot({ path: out, fullPage: false });
  await browser.close();
  console.log('shot:', out);
})();
