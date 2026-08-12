import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contentRoot = path.join(root, 'content')
const outputDir = path.join(contentRoot, 'rebuild')

const items = []
const includedSourcePaths = new Set()
const idFor = (sourcePath) => crypto.createHash('sha1').update(sourcePath).digest('hex').slice(0, 16)
const publicSlug = (sourcePath) => crypto.createHash('sha1').update(sourcePath).digest('hex').slice(0, 12)
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
const relative = (filePath) => path.relative(root, filePath).split(path.sep).join('/')

function walk(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

function frontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  if (!match) return {}
  return Object.fromEntries(match[1].split('\n').flatMap((line) => {
    const separator = line.indexOf(':')
    if (separator < 1) return []
    return [[line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')]]
  }))
}

function titleFromFile(filePath, raw) {
  return raw.match(/^#\s+(.+)$/m)?.[1]?.trim()
    || frontmatter(raw).title
    || path.basename(filePath, path.extname(filePath)).replace(/^\d{4,8}[_-]/, '')
}

function add({ sourcePath, person, collection, kind, title, year, date, wordCount, sourceUrl, legacyPaths = [], tags = [], summary }) {
  if (includedSourcePaths.has(sourcePath)) return
  includedSourcePaths.add(sourcePath)
  const id = idFor(sourcePath)
  items.push({
    id,
    sourcePath,
    targetPath: `/read/${person}/${collection}/${publicSlug(sourcePath)}`,
    legacyPaths,
    title,
    person,
    collection,
    kind,
    year: Number.isInteger(year) ? year : null,
    date: date || null,
    wordCount: Number.isFinite(wordCount) ? wordCount : null,
    sourceUrl: sourceUrl || null,
    tags,
    summary: summary || null,
    status: '待核对',
    completeness: '未知',
  })
}

function addUnindexedMarkdown(directory, config) {
  for (const filePath of walk(directory).filter((file) => file.endsWith('.md'))) {
    if (config.include && !config.include(filePath)) continue
    const sourcePath = relative(filePath)
    if (includedSourcePaths.has(sourcePath)) continue
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = frontmatter(raw)
    const inferredYear = Number((data.year || data.date || path.basename(filePath)).match(/(?:19|20)\d{2}/)?.[0])
    add({
      sourcePath,
      person: config.person,
      collection: config.collection,
      kind: config.kind,
      title: titleFromFile(filePath, raw),
      year: inferredYear,
      date: data.date,
      sourceUrl: data.source_url || data.sourceUrl,
      legacyPaths: [config.legacyPath(filePath)].filter(Boolean),
    })
  }
}

function addIndexed(relativeDir, indexRelative, person, collection, kind, legacyPath) {
  for (const entry of readJson(indexRelative)) {
    const sourcePath = `${relativeDir}/${entry.fileName}`
    add({ sourcePath, person, collection, kind, title: entry.title, year: entry.year, wordCount: entry.wordCount, legacyPaths: [legacyPath(entry)].filter(Boolean) })
  }
}

addIndexed('content/partnership', 'content/indexes/partnership-index.json', 'buffett', 'partnership-letters', '合伙人信', () => '')
addIndexed('content/letters', 'content/indexes/letters-index.json', 'buffett', 'shareholder-letters', '股东信', (entry) => `/letters/${entry.year}`)

for (const entry of readJson('content/indexes/qa-index.json')) {
  const wesco = entry.fileName.startsWith('Wesco_')
  add({
    sourcePath: `content/qa/${entry.fileName}`,
    person: wesco ? 'munger' : 'buffett',
    collection: wesco ? 'wesco-daily-journal' : 'annual-meetings',
    kind: wesco ? '西科 / 每日期刊股东信与会议资料' : '股东大会实录',
    title: entry.title,
    year: entry.year,
    wordCount: entry.wordCount,
    legacyPaths: [wesco ? `/munger/wesco/${entry.year}` : `/qa/${encodeURIComponent(entry.fileName)}`],
  })
}

for (const [indexRelative, kind, collection, legacyBase] of [
  ['content/indexes/talks-index.json', '演讲', 'speeches', '/talks'],
  ['content/indexes/interviews-index.json', '访谈', 'interviews', '/interviews'],
]) {
  for (const entry of readJson(indexRelative)) {
    if (!['buffett', 'munger'].includes(entry.person)) continue
    add({ sourcePath: `content/${collection === 'speeches' ? 'talks' : 'interviews'}/${entry.fileName}`, person: entry.person, collection, kind, title: entry.title, year: entry.year, wordCount: entry.wordCount, legacyPaths: [`${legacyBase}/${encodeURIComponent(entry.fileName)}`] })
  }
}

for (const section of ['qa', 'blog']) {
  for (const filePath of walk(path.join(contentRoot, 'duanyongping', section)).filter((file) => file.endsWith('.md'))) {
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = frontmatter(raw)
    const sourcePath = relative(filePath)
    const fileSlug = crypto.createHash('md5').update(path.basename(filePath)).digest('hex').slice(0, 16)
    add({ sourcePath, person: 'duan-yongping', collection: section === 'qa' ? 'qa' : 'netease-blog', kind: section === 'qa' ? '问答录' : '网易博客', title: titleFromFile(filePath, raw), year: Number((data.year || data.date || '').slice(0, 4)), date: data.date, sourceUrl: data.source_url, legacyPaths: [`/duanyongping/${section}/${fileSlug}`] })
  }
}

for (const blogger of readJson('content/bloggers/bloggers-index.json')) {
  for (const article of blogger.articles) {
    add({ sourcePath: `content/bloggers/${blogger.name}/${article.fileName}.md`, person: 'writer', collection: 'writers', kind: '微信公众号文章', title: article.title, year: article.year, date: article.date, wordCount: article.wordCount, sourceUrl: article.url, tags: article.tags || [], legacyPaths: [`/bloggers/${encodeURIComponent(blogger.name)}/${encodeURIComponent(article.fileName)}`], summary: blogger.name })
  }
}

for (const filePath of walk(path.join(contentRoot, 'munger-archive', 'mental-models')).filter((file) => file.endsWith('.md'))) {
  const raw = fs.readFileSync(filePath, 'utf8')
  add({ sourcePath: relative(filePath), person: 'munger', collection: 'mental-models', kind: '思维模型', title: titleFromFile(filePath, raw), legacyPaths: [`/munger/archive/mental-models/${path.basename(filePath, '.md')}`] })
}

for (const filePath of walk(path.join(contentRoot, 'poor-charlies-almanack')).filter((file) => file.endsWith('.md'))) {
  const raw = fs.readFileSync(filePath, 'utf8')
  add({ sourcePath: relative(filePath), person: 'munger', collection: 'poor-charlies-almanack', kind: '《穷查理宝典》', title: titleFromFile(filePath, raw), legacyPaths: [`/poor-charlies-almanack/${path.basename(filePath, '.md')}`] })
}

for (const [directory, collection, kind, oldBase] of [
  ['business-history', 'business-history', '商业史', '/business-history'],
  ['companies', 'company-research', '公司研究', '/companies'],
  ['companies-studies', 'company-research', '公司研究', '/companies'],
]) {
  for (const filePath of walk(path.join(contentRoot, directory)).filter((file) => file.endsWith('.md'))) {
    const raw = fs.readFileSync(filePath, 'utf8')
    const sourcePath = relative(filePath)
    add({ sourcePath, person: 'research', collection, kind, title: titleFromFile(filePath, raw), legacyPaths: [`${oldBase}/${encodeURIComponent(path.basename(filePath, '.md'))}`] })
  }
}

// 迁移必须以真实资料文件为准，而不能把旧索引中遗漏的文件遗失在新站之外。
addUnindexedMarkdown(path.join(contentRoot, 'partnership'), {
  person: 'buffett', collection: 'partnership-letters', kind: '合伙人信', legacyPath: () => '',
})
addUnindexedMarkdown(path.join(contentRoot, 'letters'), {
  person: 'buffett', collection: 'shareholder-letters', kind: '股东信', legacyPath: (filePath) => {
    const year = path.basename(filePath).match(/(?:19|20)\d{2}/)?.[0]
    return year ? `/letters/${year}` : '/letters'
  },
})
addUnindexedMarkdown(path.join(contentRoot, 'models'), {
  person: 'munger', collection: 'mental-models', kind: '思维模型', legacyPath: (filePath) => `/model/${path.basename(filePath, '.md')}`,
})
addUnindexedMarkdown(path.join(contentRoot, 'munger-originals'), {
  person: 'munger', collection: 'wesco-daily-journal', kind: '西科股东信', legacyPath: (filePath) => `/munger/originals/${path.basename(filePath, '.md')}`,
})
addUnindexedMarkdown(path.join(contentRoot, 'munger-archive', 'recordings'), {
  person: 'munger', collection: 'wesco-daily-journal', kind: '每日期刊资料', include: (filePath) => path.basename(filePath).startsWith('daily-journal-'), legacyPath: (filePath) => `/munger/archive/recordings/${path.basename(filePath, '.md')}`,
})

items.sort((a, b) => a.person.localeCompare(b.person) || a.collection.localeCompare(b.collection) || (a.year || 9999) - (b.year || 9999) || a.title.localeCompare(b.title, 'zh-CN'))
const byCollection = Object.entries(Object.groupBy(items, (item) => `${item.person}/${item.collection}`)).map(([collection, entries]) => ({ collection, count: entries.length })).sort((a, b) => a.collection.localeCompare(b.collection))
const report = [
  '# 新站内容迁移盘点',
  '',
  `生成时间：${new Date().toISOString()}`,
  '',
  `本次纳入 ${items.length} 条可迁移内容记录；索引文件见 \`content/rebuild/migration-manifest.json\`。`,
  '',
  '| 新站栏目 | 条目数 |',
  '| --- | ---: |',
  ...byCollection.map((entry) => `| ${entry.collection} | ${entry.count} |`),
  '',
  '说明：本清单是迁移基线而非来源认证结论。缺少来源、完整度或状态的数据保持“待核对 / 未知”，后续在迁移中补齐。',
  '',
].join('\n')

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(path.join(outputDir, 'migration-manifest.json'), JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), total: items.length, collections: byCollection, items }, null, 2) + '\n')
fs.writeFileSync(path.join(root, 'docs', '新站内容迁移盘点.md'), report)
console.log(`migration manifest: ${items.length} items across ${byCollection.length} collections`)
