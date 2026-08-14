/**
 * 生成概念共现数据（R-01）
 *
 * 扫描 content/ 下的全部文档，统计「同一篇文档中同时出现的两个概念」，
 * 写入 content/index.json 与 content/indexes/index.json 的 cooccurrence 字段。
 *
 * 契约：{ concepts: [a, b], count, years }
 *  - count：共同出现的文档数（每篇文档内一对概念只记 1 次）
 *  - years：这对概念共同出现的年份列表（来自文档 frontmatter 或文件名）
 *
 * 只纳入 content/concepts/ 下存在的规范概念。
 * 用法：node scripts/generate-cooccurrence.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'content')

// 参与共现统计的文档目录（原典 + 研究 + 概念定义 + 段永平内容）
const SCAN_DIRS = [
  'letters',
  'partnership',
  'qa',
  'talks',
  'interviews',
  'articles',
  'columns',
  'business-history',
  'books',
  'concepts',
  'duanyongping',
  'munger-originals',
  'munger-archive',
  'poor-charlies-almanack',
]

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'attachments') return []
      return markdownFiles(fullPath)
    }
    return entry.name.endsWith('.md') ? [fullPath] : []
  })
}

function extractYear(content, filePath) {
  const fm = content.match(/^---\n([\s\S]*?)\n---/)
  if (fm) {
    const m = fm[1].match(/^year:\s*["']?(\d{4})/m)
    if (m) return Number(m[1])
    const d = fm[1].match(/^date:\s*["']?(\d{4})/)
    if (d) return Number(d[1])
  }
  const fn = path.basename(filePath).match(/(?:19|20)\d{2}/)
  return fn ? Number(fn[0]) : null
}

function readIndex(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

// 规范概念：content/concepts/ 下的文件名
const conceptsDir = path.join(CONTENT_DIR, 'concepts')
const conceptIds = fs.existsSync(conceptsDir)
  ? fs.readdirSync(conceptsDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
  : []

// key: `${min}\u0000${max}` -> { a, b, count, years:Set }
const pairs = new Map()

function pairKey(a, b) {
  return a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`
}

let docsScanned = 0
let docsWithPair = 0

for (const dir of SCAN_DIRS) {
  for (const filePath of markdownFiles(path.join(CONTENT_DIR, dir))) {
    const content = fs.readFileSync(filePath, 'utf-8')
    docsScanned++
    const year = extractYear(content, filePath)

    // 命中该文档的规范概念（同一文档内概念出现多次只计 1 次）
    const found = conceptIds.filter((id) => content.includes(id))
    if (found.length < 2) continue
    docsWithPair++

    for (let i = 0; i < found.length; i++) {
      for (let j = i + 1; j < found.length; j++) {
        const key = pairKey(found[i], found[j])
        let entry = pairs.get(key)
        if (!entry) {
          entry = { a: found[i], b: found[j], count: 0, years: new Set() }
          pairs.set(key, entry)
        }
        entry.count++
        if (year) entry.years.add(year)
      }
    }
  }
}

const cooccurrence = [...pairs.values()]
  .map(({ a, b, count, years }) => ({
    concepts: [a, b],
    count,
    years: [...years].sort((x, y) => x - y),
  }))
  .sort((x, y) => y.count - x.count)

const indexPath = path.join(CONTENT_DIR, 'index.json')
const indexesPath = path.join(CONTENT_DIR, 'indexes', 'index.json')

let updated = 0
for (const target of [indexPath, indexesPath]) {
  const data = readIndex(target)
  if (!data) {
    console.warn(`[warn] 跳过（文件不存在或不可解析）：${target}`)
    continue
  }
  data.cooccurrence = cooccurrence
  data.metadata = { ...(data.metadata || {}), generatedAt: new Date().toISOString(), cooccurrencePairs: cooccurrence.length }
  fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  updated++
}

console.log(
  `🔗 概念共现已生成：扫描 ${docsScanned} 篇文档，${docsWithPair} 篇含概念对，共 ${cooccurrence.length} 对概念关联（写入 ${updated} 个索引文件）`
)
if (cooccurrence.length === 0) {
  console.warn('[warn] cooccurrence 为空，请检查 content/concepts/ 与文档目录')
}
