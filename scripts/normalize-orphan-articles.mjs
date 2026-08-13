/**
 * 孤儿中文文章规范化（阶段：文章纳入）
 *
 * 1. 把 content/li-lu/*.md、content/special/*.md 迁入 content/articles/{li-lu,special}/
 * 2. 为 content/articles/** 下所有 md 补齐 frontmatter（title/content_type/person/year/entities）
 * 3. entities 采用启发式实体标注：在标题+正文中匹配概念/公司/人物实体名
 *
 * 用法：node scripts/normalize-orphan-articles.mjs        # dry-run，只输出报告
 *       node scripts/normalize-orphan-articles.mjs --apply # 执行迁移+写回
 * 输出：scripts/article-normalize-report.json
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
const ARTICLES = path.join(CONTENT, 'articles')
const APPLY = process.argv.includes('--apply')

// ---- 实体候选集：概念 / 公司 / 人物（含别名） ----
const PEOPLE_ALIAS_MAP = {
  巴菲特: ['Buffett', '沃伦·巴菲特', 'Warren Buffett'],
  芒格: ['Munger', '查理·芒格', 'Charlie Munger'],
  格雷厄姆: ['Graham', '本杰明·格雷厄姆'],
  格雷格·阿贝尔: ['Greg Abel', 'Abel', '阿贝尔'],
  汤姆·墨菲: ['Tom Murphy'],
  费雪: ['Fisher', '菲尔·费雪'],
  皮特·利格尔: ['Pete Liegl'],
}

function idsOf(dir) {
  const p = path.join(CONTENT, dir)
  if (!fs.existsSync(p)) return []
  return fs.readdirSync(p).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
}

const ENTITY_CANDIDATES = []
const push = (name, kind) => { if (name && name.length >= 2) ENTITY_CANDIDATES.push({ name, kind }) }
idsOf('concepts').forEach(n => push(n, 'concept'))
idsOf('companies').forEach(n => push(n, 'company'))
idsOf('people').forEach(n => push(n, 'person'))
for (const [canonical, aliases] of Object.entries(PEOPLE_ALIAS_MAP)) {
  push(canonical, 'person')
  aliases.forEach(a => push(a, 'person'))
}

// 按长度降序，优先长实体名（避免"公司"这类泛指词命中）
ENTITY_CANDIDATES.sort((a, b) => b.name.length - a.name.length)

// ---- 文章 person 推断 ----
const OTHER_PERSON_MAP = {
  杰米·戴蒙: '杰米·戴蒙',
  施洛斯: '施洛斯',
  格雷厄姆: '格雷厄姆',
  康布斯: '康布斯',
  考夫曼: '考夫曼',
  卢米斯: '卢米斯',
  李录: '李录',
}

function inferPerson(relDir, fileName, body) {
  if (relDir.startsWith('buffett')) return '巴菲特'
  if (relDir.startsWith('munger')) return '芒格'
  if (relDir.startsWith('li-lu')) return '李录'
  if (relDir.startsWith('special')) return fileName.includes('芒格') ? '芒格' : '巴菲特'
  // other/：先按文件名精确匹配，再按正文开头匹配
  for (const [key, person] of Object.entries(OTHER_PERSON_MAP)) {
    if (fileName.includes(key)) return person
  }
  for (const [key, person] of Object.entries(OTHER_PERSON_MAP)) {
    if (body.slice(0, 200).includes(key)) return person
  }
  // 默认按正文出现频率判断
  const counts = { 巴菲特: 0, 芒格: 0, 格雷厄姆: 0 }
  for (const k of Object.keys(counts)) {
    counts[k] = (body.match(new RegExp(k, 'g')) || []).length
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top && top[1] > 0 ? top[0] : '其他'
}

// ---- 年份推断 ----
function inferYear(fileName, body) {
  const fromName = fileName.match(/(?:19|20)\d{2}/)
  if (fromName) return fromName[0]
  // 仅接受"文档日期头"：H1 之后第一个非空行形如 "2009 年 3 月 23 日"
  // （可带 "致：xxx" 前缀行）。避免把传记中的生平年份当作文章年份。
  const withoutH1 = body.replace(/^#\s+.+\n+/, '')
  const firstLines = withoutH1.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 2)
  for (const line of firstLines) {
    const m = line.match(/^(?:19|20)\d{2}\s*年\s*(?:1[0-2]|0?[1-9])\s*月(?:\s*\d{1,2}\s*日)?$/)
    if (m && Number(m[0].slice(0, 4)) >= 1950) return m[0].slice(0, 4)
  }
  return null
}

// ---- 实体标注 ----
function tagEntities(title, body) {
  const text = `${title}\n${body.slice(0, 6000)}`
  const hits = new Map()
  for (const cand of ENTITY_CANDIDATES) {
    // 概念/公司/人物都要求 ≥2 次正文出现；标题命中即算
    let count = 0
    let idx = 0
    while ((idx = text.indexOf(cand.name, idx)) !== -1) { count += 1; idx += cand.name.length }
    if (count === 0) continue
    if (count < 2 && !title.includes(cand.name)) continue
    // 剔除“人物名是另一实体的子串”重复：仅保留最长命中
    hits.set(cand.name, { count, kind: cand.kind })
  }
  // 保留出现次数多、且非被更长实体包含的；同时用别名合并（如 Graham 归入 格雷厄姆）
  const result = [...hits.entries()]
    .filter(([name]) => ![...hits.keys()].some(other => other !== name && other.includes(name)))
    .map(([name, info]) => {
      // 别名 -> canonical 人物名
      for (const [canonical, aliases] of Object.entries(PEOPLE_ALIAS_MAP)) {
        if (aliases.includes(name) && hits.has(canonical)) return null
      }
      return [name, info]
    })
    .filter(Boolean)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name]) => name)
  return result
}

// ---- 读取 md：拆 frontmatter + body ----
function parseMd(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  const fm = {}
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/)
      if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
    }
  }
  return { fm, body: m ? raw.slice(m[0].length) : raw }
}

function renderFrontmatter(fm) {
  const lines = ['---']
  for (const [k, v] of Object.entries(fm)) {
    lines.push(`${k}: ${/^[\d.-]+$/.test(v) ? v : `"${v}"`}`)
  }
  return lines.join('\n') + '\n---\n\n'
}

// ---- 主流程 ----
const moves = [
  { from: path.join(CONTENT, 'li-lu'), to: path.join(ARTICLES, 'li-lu') },
  { from: path.join(CONTENT, 'special'), to: path.join(ARTICLES, 'special') },
]

// 1) 迁移
const plan = []
for (const { from, to } of moves) {
  if (!fs.existsSync(from)) continue
  for (const f of fs.readdirSync(from).filter(f => f.endsWith('.md'))) {
    plan.push({ op: 'move', from: path.join(from, f), to: path.join(to, f) })
  }
}

// 2) 规范化
const normalized = []
function walkArticles(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkArticles(full)
    else if (entry.name.endsWith('.md')) normalized.push(full)
  }
}
walkArticles(ARTICLES)

// slug 冲突检查
const slugMap = new Map()
for (const f of normalized) {
  const slug = path.basename(f, '.md')
  if (slugMap.has(slug)) {
    console.warn(`⚠️ slug 冲突: "${slug}" 出现在 ${slugMap.get(slug)} 与 ${f}`)
  }
  slugMap.set(slug, f)
}

const records = []
for (const file of normalized) {
  const rel = path.relative(CONTENT, file)
  const relDir = path.relative(ARTICLES, path.dirname(file))
  const { fm, body } = parseMd(file)
  const fileName = path.basename(file, '.md')
  const h1 = body.match(/^#\s+(.+)$/m)
  const title = h1 ? h1[1].trim() : fileName
  const orig = { ...fm }

  fm.title = fm.title || title
  fm.content_type = fm.content_type || 'article'
  if (!fm.person) fm.person = inferPerson(relDir, fileName, body)
  if (!fm.year) {
    const y = inferYear(fileName, body)
    if (y) fm.year = y
  }
  if (!fm.entities) {
    const entities = tagEntities(title, body)
    if (entities.length) fm.entities = entities.join(', ')
  }

  const changed = Object.keys(fm).some(k => fm[k] !== orig[k]) || !fs.existsSync(file)
  records.push({ file: rel, title, person: fm.person, year: fm.year || '', entities: fm.entities || '', changed, content_type: fm.content_type })

  if (APPLY && changed) {
    const fmText = renderFrontmatter(fm)
    fs.writeFileSync(file, fmText + body)
  }
}

// 3) 执行迁移
if (APPLY) {
  for (const m of plan) {
    fs.mkdirSync(path.dirname(m.to), { recursive: true })
    fs.renameSync(m.from, m.to)
    console.log(`迁移: ${path.relative(CONTENT, m.from)} -> ${path.relative(CONTENT, m.to)}`)
  }
}

// 报告
fs.writeFileSync(path.join(ROOT, 'scripts/article-normalize-report.json'), JSON.stringify({ apply: APPLY, plan, records }, null, 2))
const changedCount = records.filter(r => r.changed).length
const withEntities = records.filter(r => r.entities).length
console.log(`\n文章总数 ${records.length}，需写回 ${changedCount}，带 entities ${withEntities}，待迁移 ${plan.length}`)
if (!APPLY) console.log('（dry-run，加 --apply 执行）')
console.log('报告已写入 scripts/article-normalize-report.json')
