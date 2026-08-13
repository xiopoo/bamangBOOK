/**
 * 生成股东大会英文原档索引 content/meetings-index.json
 * 来源：content/buffettfaq_cnbc/<year>/*.md（跳过 _index.md）
 * 挂载：prebuild.js + dev script，构建时自动刷新
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'content/buffettfaq_cnbc')
const OUT = path.join(ROOT, 'content/meetings-index.json')

const entries = []
const years = fs.readdirSync(SRC)
  .filter(name => /^\d{4}$/.test(name))
  .sort()

for (const year of years) {
  const dir = path.join(SRC, year)
  const files = fs.readdirSync(dir)
    .filter(name => name.endsWith('.md') && !name.startsWith('_'))
    .sort()

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8')
    const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() || file.replace(/\.md$/, '')
    const videoId = raw.match(/\*\*视频ID\*\*:\s*(\d+)/)?.[1] || null
    const summary = raw.match(/^>\s*(.+)$/m)?.[1]?.trim() || ''
    const sectionCount = raw.match(/\*\*章节数\*\*:\s*(\d+)/)?.[1] || null
    const itemCount = raw.match(/\*\*总条数\*\*:\s*(\d+)/)?.[1] || null

    const base = file.replace(/\.md$/, '')
    const isSession = /(?:Morning|Afternoon)_Session|Meeting$|Meeting_Highlight/i.test(base)
    const isHighlight = /Highlight_Reel/i.test(base)

    entries.push({
      year: Number(year),
      session: base,
      fileName: file,
      title,
      kind: isHighlight ? 'highlight' : isSession ? 'session' : 'clip',
      videoId,
      summary,
      sectionCount: sectionCount ? Number(sectionCount) : null,
      itemCount: itemCount ? Number(itemCount) : null,
    })
  }
}

const grouped = {}
for (const e of entries) {
  if (!grouped[e.year]) grouped[e.year] = { year: e.year, sessions: [], clips: [] }
  if (e.kind === 'clip') grouped[e.year].clips.push(e)
  else grouped[e.year].sessions.push(e)
}

const report = {
  generatedAt: new Date().toISOString(),
  total: entries.length,
  years: Object.values(grouped),
}

fs.writeFileSync(OUT, JSON.stringify(report, null, 2))
console.log(`meetings 索引：${entries.length} 条 / ${years.length} 年 -> content/meetings-index.json`)
