const { chromium } = require('/Users/lucas/Documents/bamangB/bamangBOOK/node_modules/playwright-core');

(async () => {
  const htmlPath = process.argv[2];
  const pdfPath = process.argv[3];
  const browser = await chromium.launch({
    args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8.5px;width:100%;text-align:center;color:#999;padding-top:6px">做对的事情：段永平文集 · 主题分类全编</div>',
    footerTemplate: '<div style="font-size:8.5px;width:100%;text-align:center;color:#999;padding-bottom:6px">第 <span class="pageNumber"></span> / <span class="totalPages"></span> 页</div>',
    preferCSSPageSize: true,
  });
  await browser.close();
  console.log('PDF 生成完成:', pdfPath);
})();
