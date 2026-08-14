import fs from 'node:fs';

for (const file of ['output/ebook/巴菲特文集_PDF正文.html', 'output/ebook/芒格文集_PDF正文.html']) {
  let html = fs.readFileSync(file, 'utf8');
  const start = html.indexOf('<section class="print-chapter"><div class="eyebrow">编者说明</div>');
  if (start >= 0) {
    const end = html.indexOf('</section>', start);
    if (end >= 0) html = html.slice(0, start) + html.slice(end + '</section>'.length);
  }
  html = html.replace(/<p class="chapter-source">依据本地“复利书房 · fulilab\.com”资料库整理(?: · 精读编排版)?<br \/>配色：#AB1942 \/ 黑 \/ 白<\/p>/g, '');
  fs.writeFileSync(file, html, 'utf8');
}
