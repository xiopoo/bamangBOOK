// 仅渲染 HTML -> PDF（不带页眉页脚页码；页码由 build_dyp_pdf_chunked.py 用 pypdf+reportlab 全局加盖）
const { chromium } = require('/Users/lucas/Documents/bamangB/bamangBOOK/node_modules/playwright-core');
const path = require('path');

(async () => {
  const htmlPath = process.argv[2];
  const pdfPath = process.argv[3];
  if (!htmlPath || !pdfPath) {
    console.error('usage: node html_to_pdf_chunk.js <in.html> <out.pdf>');
    process.exit(2);
  }
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
           '--font-render-hinting=none', '--disable-accelerated-2d-canvas'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '22mm', bottom: '22mm', left: '20mm', right: '20mm' },
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
  });
  await browser.close();
  console.log('rendered', pdfPath);
})().catch((e) => {
  console.error('RENDER_ERROR', e && e.message ? e.message : e);
  process.exit(1);
});
