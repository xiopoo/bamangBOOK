import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const root = process.cwd()
const outputDir = path.join(root, 'content/source-documents/poor-charlies-almanack-stripe/rendered')
const catalogDir = path.join(root, 'editorial/shared/source-catalog')
const slugs = ['talk-three', 'talk-five', 'talk-nine', 'talk-eleven']
const sha256 = value => createHash('sha256').update(value, 'utf8').digest('hex')

mkdirSync(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.route('**/*.{m4a,mp3,wav,mp4,webm,jpg,jpeg,png,gif,webp,woff,woff2,otf}', route => route.abort())

const records = []
try {
  for (const slug of slugs) {
    const sourceUrl = `https://www.stripe.press/poor-charlies-almanack/${slug}`
    await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await page.waitForFunction(
      () => document.querySelectorAll('main')[1]?.innerText.length > 5_000,
      null,
      { timeout: 60_000 },
    )

    const extracted = await page.evaluate(() => {
      const rootMain = document.querySelectorAll('main')[1]
      if (!rootMain) throw new Error('Rendered book main element not found')
      const articles = [...rootMain.querySelectorAll('article')]
        .filter(article => !article.parentElement?.closest('article'))
        .filter(article => article.innerText.length > 1_000)
      return {
        pageTitle: document.title,
        articleCount: articles.length,
        articles: articles.map((article, index) => ({
          index: index + 1,
          text: article.innerText,
          html: article.outerHTML,
        })),
      }
    })

    const text = extracted.articles
      .map(article => `===== SOURCE ARTICLE ${article.index} =====\n\n${article.text.trim()}\n`)
      .join('\n')
    const html = [
      '<!doctype html>',
      '<html lang="en"><head><meta charset="utf-8">',
      `<title>${extracted.pageTitle.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</title>`,
      `<meta name="source" content="${sourceUrl}">`,
      '</head><body>',
      ...extracted.articles.map(article => `<!-- SOURCE ARTICLE ${article.index} -->\n${article.html}`),
      '</body></html>',
      '',
    ].join('\n')

    const textFile = path.join(outputDir, `${slug}.source.txt`)
    const htmlFile = path.join(outputDir, `${slug}.source.html`)
    writeFileSync(textFile, text)
    writeFileSync(htmlFile, html)

    records.push({
      slug,
      sourceUrl,
      pageTitle: extracted.pageTitle,
      articleCount: extracted.articleCount,
      textPath: path.relative(root, textFile),
      textBytes: Buffer.byteLength(text),
      textSha256: sha256(text),
      htmlPath: path.relative(root, htmlFile),
      htmlBytes: Buffer.byteLength(html),
      htmlSha256: sha256(html),
    })
    console.log(`${slug}: ${extracted.articleCount} article(s), ${Buffer.byteLength(text)} text bytes`)
  }
} finally {
  await browser.close()
}

const generatedAt = new Date().toISOString()
const manifest = { generatedAt, count: records.length, records }
writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
writeFileSync(path.join(catalogDir, 'stripe-rendered-talk-sources.json'), `${JSON.stringify(manifest, null, 2)}\n`)

const report = `# Stripe Press 芒格演讲渲染底本提取报告

- 提取时间：${generatedAt}
- 官方页面：${records.length} 个
- 正文文章块：${records.reduce((sum, record) => sum + record.articleCount, 0)} 个
- 提取方式：由浏览器执行出版社页面自身的 JavaScript 后，仅保存书页主区域中长度超过 1,000 字符的顶层 \`article\`；导航、菜单、播放器、出版社页脚不进入底本。
- 保存格式：每页同时保存渲染后的 HTML 和可逐段校勘的纯文本，并登记 SHA-256。
- 编辑原则：此步骤只抓取原文，不翻译、不改写、不补写。

| 页面 | 正文块 | 纯文本字节 | 纯文本 SHA-256 | HTML 字节 | HTML SHA-256 |
|---|---:|---:|---|---:|---|
${records.map(record => `| ${record.slug} | ${record.articleCount} | ${record.textBytes} | \`${record.textSha256}\` | ${record.htmlBytes} | \`${record.htmlSha256}\` |`).join('\n')}
`
writeFileSync(path.join(catalogDir, 'Stripe Press芒格演讲渲染底本提取报告.md'), report)

console.log(JSON.stringify(manifest, null, 2))
