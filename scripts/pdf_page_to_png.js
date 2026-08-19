// 用 pdf.js 渲染 PDF 单页为 PNG
const path = require('path');
const fs = require('fs');
(async () => {
  const pdfjs = require('/Users/lucas/Documents/bamangB/bamangBOOK/node_modules/pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(process.argv[2]));
  const doc = await pdfjs.getDocument({ data }).promise;
  const pageNum = parseInt(process.argv[3] || '1');
  const page = await doc.getPage(pageNum);
  const vp = page.getViewport({ scale: 1.5 });
  const { createCanvas } = require('/Users/lucas/Documents/bamangB/bamangBOOK/node_modules/canvas');
  const canvas = createCanvas(vp.width, vp.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  fs.writeFileSync(process.argv[4], canvas.toBuffer('image/png'));
  console.log('rendered page', pageNum, 'to', process.argv[4]);
})().catch(e => { console.error(e); process.exit(1); });
