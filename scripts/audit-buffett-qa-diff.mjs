import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const qaDir = path.join(root, 'content', 'qa')
const cnbcDir = path.join(root, 'content', 'buffettfaq_cnbc')
const out = path.join(cnbcDir, 'QA_DIFF_REPORT.md')

const read = (p) => fs.readFileSync(p, 'utf8')
const size = (p) => fs.statSync(p).size
const years = fs.readdirSync(cnbcDir)
  .filter((name) => /^\d{4}$/.test(name))
  .sort()

function qaFile(year) {
  const preferred = `伯克希尔股东大会实录_${year}.md`
  const exact = path.join(qaDir, preferred)
  if (fs.existsSync(exact)) return exact
  const candidates = fs.readdirSync(qaDir)
    .filter((name) => name.includes(year) && name.endsWith('.md') && !name.startsWith('Wesco_') && !name.includes('精选'))
    .map((name) => path.join(qaDir, name))
  return candidates.sort((a, b) => size(b) - size(a))[0] ?? null
}

function canonicalCnbcFiles(year) {
  const dir = path.join(cnbcDir, year)
  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.md') && name !== '_index.md')
  if (year === '2020') {
    return ['2020_Berkshire_Hathaway_Annual_Meeting_-_Part_1.md', '2020_Berkshire_Hathaway_Annual_Meeting_-_Part_2_-_QA.md']
      .map((name) => path.join(dir, name)).filter(fs.existsSync)
  }
  if (year === '2021') {
    return ['Part_1_-_2021_Meeting.md', 'Part_2_-_2021_Meeting.md']
      .map((name) => path.join(dir, name)).filter(fs.existsSync)
  }
  const pick = (pattern) => {
    const matches = files.filter((name) => pattern.test(name)).map((name) => path.join(dir, name))
    return matches.sort((a, b) => size(b) - size(a))[0]
  }
  return [pick(/Morning_Session/), pick(/Afternoon_Session/)].filter(Boolean)
}

const rows = years.map((year) => {
  const qa = qaFile(year)
  const cnbc = canonicalCnbcFiles(year)
  const qaText = qa ? read(qa) : ''
  const cnbcText = cnbc.map(read).join('\n\n')
  // Ignore the version note at the top; only count omissions in the transcript body.
  const qaBody = qaText.includes('\n## ') ? qaText.slice(qaText.indexOf('\n## ')) : qaText
  const omitted = (qaBody.match(/翻译略过/g) ?? []).length
  const chapters = (cnbcText.match(/^## /gm) ?? []).length
  const speakers = (cnbcText.match(/^(?:WARREN BUFFETT|CHARLIE MUNGER|AUDIENCE MEMBER|BECKY QUICK):|^\*\*(?:巴菲特|芒格)\*\*[:：]/gm) ?? []).length
  const hasTranscriptBody = speakers >= 10 || /\bGood morning\b|\bSo now we're ready\b|我们今天/.test(cnbcText)
  const cnbcIsOutline = cnbcText.length < 20000 && !hasTranscriptBody
  const ratio = qaText.length ? cnbcText.length / qaText.length : 0
  let priority = '抽样核对'
  if (!qa) priority = '缺少中文年度稿'
  else if (cnbcIsOutline) priority = '保留现有中文稿'
  else if (omitted > 0 || ratio >= 5) priority = '高：建议补译'
  else if (ratio >= 3) priority = '中：建议抽样补译'
  return { year, qa, qaChars: qaText.length, cnbcChars: cnbcText.length, ratio, omitted, chapters, speakers, priority }
})

const lines = [
  '# 巴菲特股东大会 QA 差异补译清单',
  '',
  '> 本报告用于决定“哪里需要补译”，不是把英文字符数直接当作中文缺失量。最终仍需按章节和问答逐段确认。',
  '',
  '## 判定规则',
  '',
  '- “高：建议补译”：现有中文稿出现“翻译略过”，或 CNBC 原始逐字稿明显长于中文稿；',
  '- “中：建议抽样补译”：存在较大篇幅差异，但需要人工确认语言长度造成的比例偏差；',
  '- “保留现有中文稿”：CNBC 本地资料主要是章节提纲，不能替代现有中文全文；',
  '- 2026 只作为资料记录，不纳入本轮 1994—2025 翻译范围。',
  '',
  '## 年度清单',
  '',
  '| 年份 | 中文稿字数 | CNBC 主会场字数 | 比例 | 翻译略过 | 章节 | 说话人段落 | 建议 |',
  '|---:|---:|---:|---:|---:|---:|---:|---|',
]

for (const row of rows) {
  lines.push(`| ${row.year} | ${row.qaChars.toLocaleString('en-US')} | ${row.cnbcChars.toLocaleString('en-US')} | ${row.ratio.toFixed(1)}x | ${row.omitted} | ${row.chapters} | ${row.speakers} | ${row.priority} |`)
}

lines.push('', '## 执行顺序', '', '1. 先处理标记为“高：建议补译”的年份；', '2. 每年按 CNBC 章节标题与现有中文标题对齐，只翻译缺失问答；', '3. 完成后再处理“中：建议抽样补译”；', '4. 2025 先保留现有中文全文，CNBC 只作为章节和来源校对。', '')

fs.writeFileSync(out, lines.join('\n'))
console.log(`written ${path.relative(root, out)}`)
