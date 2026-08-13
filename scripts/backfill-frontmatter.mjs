#!/usr/bin/env node
/**
 * 批量补齐 frontmatter（阶段 1b）
 * --------------------------------------------------
 * 只处理「原典档案层」中被站点消费且缺失 frontmatter 的目录。
 * 只填写可确认字段（title/content_type/person/year），
 * 绝不猜测 source_url、verification 等未知字段（保持留空）。
 *
 * 字段优先级：
 *   1. 现有索引 json（letters/partnership/qa/talks/interviews-index.json）为权威
 *   2. 未命中索引 → 文件名规则推断（person/year）+ H1/文件名（title）
 * 已有 frontmatter 的文件：跳过，不做任何覆盖。
 *
 * 用法：node scripts/backfill-frontmatter.mjs [--dry-run]
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const dryRun = process.argv.includes('--dry-run')
const CONTENT = path.join(process.cwd(), 'content')

// 目录 → content_type
const TYPE_BY_DIR = {
  letters: 'letter',
  partnership: 'partnership',
  qa: 'qa',
  talks: 'talk',
  interviews: 'interview',
  companies: 'company',
  concepts: 'concept',
  people: 'person',
  'business-history': 'article',
}

const TARGET_DIRS = Object.keys(TYPE_BY_DIR)

// 英文 person → 中文
const PERSON_ZH = { buffett: '巴菲特', munger: '芒格', duanyongping: '段永平' }

// 加载索引 json 作为权威字段来源
function loadIndexes() {
  const map = new Map() // key: fileName(去 .md) → { title, year, person }
  const files = [
    'letters-index.json',
    'partnership-index.json',
    'qa-index.json',
    'talks-index.json',
    'interviews-index.json',
  ]
  for (const f of files) {
    const p = path.join(CONTENT, f)
    if (!fs.existsSync(p)) continue
    let arr
    try {
      arr = JSON.parse(fs.readFileSync(p, 'utf-8'))
    } catch {
      continue
    }
    if (!Array.isArray(arr)) continue
    for (const item of arr) {
      if (!item.fileName) continue
      const key = item.fileName.replace(/\.md$/, '')
      map.set(key, {
        title: item.title ?? null,
        year: item.year != null ? String(item.year) : null,
        person: item.person ? PERSON_ZH[item.person] ?? null : null,
      })
    }
  }
  return map
}

const indexMap = loadIndexes()

function extractTitle(raw) {
  for (const line of raw.split('\n')) {
    const m = line.match(/^#{1,3}\s+(.+?)\s*$/)
    if (m && m[1].trim()) return m[1].trim()
  }
  return null
}

function inferPerson(dir, fileName) {
  if (dir === 'letters' || dir === 'partnership') return '巴菲特'
  if (dir === 'qa') {
    if (/Wesco/i.test(fileName)) return '芒格'
    if (/伯克希尔/.test(fileName)) return '巴菲特'
    return null
  }
  if (dir === 'talks' || dir === 'interviews') {
    if (/芒格/.test(fileName)) return '芒格'
    if (/巴菲特/.test(fileName)) return '巴菲特'
    return null
  }
  return null
}

function inferYear(dir, fileName) {
  const matches = fileName.match(/\d{4}/g)
  if (!matches) return null
  if (dir === 'talks' || dir === 'qa') {
    const head = fileName.match(/^(\d{4})/)
    return head ? head[1] : matches[0]
  }
  if (dir === 'interviews') {
    const tail = fileName.match(/(\d{4})(?=\.md$)/)
    return tail ? tail[1] : matches[matches.length - 1]
  }
  return matches[0]
}

let updated = 0
let skippedHasFm = 0
let skippedError = 0
let usedIndex = 0
const report = []

for (const dir of TARGET_DIRS) {
  const dirPath = path.join(CONTENT, dir)
  if (!fs.existsSync(dirPath)) continue
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'))
  for (const file of files) {
    const filePath = path.join(dirPath, file)
    let raw
    try {
      raw = fs.readFileSync(filePath, 'utf-8')
    } catch {
      skippedError++
      continue
    }
    const parsed = matter(raw)
    if (Object.keys(parsed.data).length > 0) {
      skippedHasFm++
      continue
    }

    // 1) 索引命中 → 权威字段
    const idx = indexMap.get(file.replace(/\.md$/, ''))
    let title = idx?.title ?? null
    let person = idx?.person ?? null
    let year = idx?.year ?? null
    if (idx) usedIndex++

    // 2) 回退推断
    if (!title) title = extractTitle(parsed.content) || file.replace(/\.md$/, '')
    if (!person) person = inferPerson(dir, file)
    if (!year) year = inferYear(dir, file)

    const data = { title, content_type: TYPE_BY_DIR[dir] }
    if (person) data.person = person
    if (year) data.year = year

    const yaml = Object.entries(data)
      .map(([k, v]) => `${k}: ${JSON.stringify(String(v))}`)
      .join('\n')

    const newRaw = `---\n${yaml}\n---\n\n${parsed.content}`
    if (!dryRun) fs.writeFileSync(filePath, newRaw, 'utf-8')
    updated++
    report.push({ file: path.relative(process.cwd(), filePath), title, person, year })
  }
}

console.log(dryRun ? `\n[dry-run] 将更新 ${updated} 个文件（其中 ${usedIndex} 个命中索引权威字段）` : `\n已更新 ${updated} 个文件（其中 ${usedIndex} 个命中索引权威字段）`)
console.log(`跳过（已有 frontmatter）: ${skippedHasFm}，跳过（读取失败）: ${skippedError}`)
console.log('\n按目录统计:')
const byDir = new Map()
for (const r of report) {
  const dir = r.file.split('/')[1] || '(root)'
  byDir.set(dir, (byDir.get(dir) || 0) + 1)
}
for (const [d, n] of [...byDir.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${d}`)
}
if (dryRun) {
  console.log('\n样例（前 10 条）:')
  for (const r of report.slice(0, 10)) {
    console.log(`  ${r.file} | title=${r.title} | person=${r.person} | year=${r.year}`)
  }
}
