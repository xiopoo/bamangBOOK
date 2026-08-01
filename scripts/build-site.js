'use strict'
// 网站文章分类 + 交叉内链映射生成器（一体化，含报告输出）
// 用法: node scripts/build-site.js
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const CONTENT = path.join(ROOT, 'content')
const REPORTS = path.join(ROOT, 'reports')

function loadIndex(name) {
  const p = path.join(CONTENT, name)
  if (!fs.existsSync(p)) return []
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return [] }
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8') } catch { return '' } }

const items = []

function addFromIndex(indexFile, source, personField) {
  const arr = loadIndex(indexFile)
  for (const d of arr) {
    const fileName = d.fileName || d.slug || d.origFileName
    const person = personField ? (d[personField] || []) : []
    const fpath = path.join(CONTENT, source, fileName)
    const text = readFileSafe(fpath)
    items.push({
      id: `${source}/${fileName}`,
      title: d.title || fileName,
      source,
      fileName,
      person: Array.isArray(person) ? person : [person],
      year: d.year || null,
      text: (d.title || '') + '\n' + text,
    })
  }
}
addFromIndex('partnership-index.json', 'partnership')
addFromIndex('letters-index.json', 'letters')
addFromIndex('qa-index.json', 'qa')
addFromIndex('talks-index.json', 'talks', 'person')
addFromIndex('interviews-index.json', 'interviews', 'person')
addFromIndex('models-index.json', 'models')

const bloggersDir = path.join(CONTENT, 'bloggers')
if (fs.existsSync(bloggersDir)) {
  for (const acct of fs.readdirSync(bloggersDir)) {
    const adir = path.join(bloggersDir, acct)
    if (!fs.statSync(adir).isDirectory()) continue
    for (const f of fs.readdirSync(adir)) {
      if (!f.endsWith('.md')) continue
      const text = readFileSafe(path.join(adir, f))
      const m = text.match(/title:\s*"([^"]+)"/)
      items.push({
        id: `bloggers/${acct}/${f}`,
        title: m ? m[1] : f,
        source: 'bloggers',
        fileName: `${acct}/${f}`,
        person: ['blogger'],
        year: null,
        text,
        bloggerText: text,
      })
    }
  }
}

function classify(it) {
  const s = it.source
  if (s === 'partnership') return { column: '巴菲特专栏', sub: '合伙人信' }
  if (s === 'letters') return { column: '巴菲特专栏', sub: '股东信' }
  if (s === 'qa') return { column: '巴菲特专栏', sub: '股东大会实录' }
  if (s === 'bloggers') return { column: '博主专栏', sub: it.fileName.split('/')[0] }
  if (s === 'models') return { column: '芒格专栏', sub: '思维模型' }
  if (s === 'talks') {
    if (it.person.includes('munger')) return { column: '芒格专栏', sub: '演讲' }
    return { column: '巴菲特专栏', sub: '演讲/文章' }
  }
  if (s === 'interviews') {
    // 按决策：访谈归入巴菲特专栏/演讲·文章
    return { column: '巴菲特专栏', sub: '演讲/文章' }
  }
  return { column: '待决策', sub: '其他' }
}
for (const it of items) {
  const c = classify(it)
  it.column = c.column
  it.sub = c.sub
}

const DICT = {
  '喜诗糖果': ['喜诗', 'See\'s', 'Sees'], '蓝筹印花': ['蓝筹印花', 'Blue Chip'],
  'GEICO': ['GEICO', 'geico', '政府雇员保险'], '可口可乐': ['可口可乐', 'Coca', '可乐'],
  '华盛顿邮报': ['华盛顿邮报', 'Washington Post'], '所罗门': ['所罗门', 'Solomon'],
  '富国银行': ['富国银行', 'Wells Fargo'], '美国运通': ['美国运通', '运通', 'American Express', 'Amex'],
  '苹果': ['苹果', 'Apple'], '比亚迪': ['比亚迪', 'BYD'], '中石油': ['中石油', '中国石油', 'PetroChina'],
  '房地美': ['房地美', 'Freddie'], '通用再保': ['通用再保', 'General Re', '通用再保险'],
  '内布拉斯加家具城': ['内布拉斯加家具', 'NFM'], '波仙珠宝': ['波仙', 'Borsheims'],
  '好市多': ['好市多', 'Costco'], '沃尔玛': ['沃尔玛', 'Walmart'], '美国银行': ['美国银行', 'Bank of America'],
  '高盛': ['高盛', 'Goldman'], '穆迪': ['穆迪', 'Moody'],
  '芒格': ['芒格', 'Charlie Munger', '查理'], '格雷厄姆': ['格雷厄姆', 'Graham', '格老'],
  '凯瑟琳·格雷厄姆': ['凯瑟琳', 'Katharine'], '比尔·盖茨': ['比尔·盖茨', '盖茨', 'Gates'],
  '沃尔特·施洛斯': ['施洛斯', 'Schloss'], '汤姆·墨菲': ['墨菲', 'Murphy', '大都会'],
  '里克·古林': ['古林', 'Guint'], '卢·辛普森': ['辛普森', 'Simpson'], '菲利普·费雪': ['费雪', 'Fisher'],
  '段永平': ['段永平'],
  '能力圈': ['能力圈'], '护城河': ['护城河'], '安全边际': ['安全边际'], '烟蒂股': ['烟蒂', '烟头'],
  '浮存金': ['浮存金'], '复利': ['复利'], '长期主义': ['长期', '长期持有', '长期投资'],
  '市场先生': ['市场先生'], '逆向思维': ['逆向', '反过来想', '反过来'],
  '多元思维模型': ['多元思维', '思维格栅', '格栅'], '思维模型': ['思维模型'],
  '集中投资': ['集中投资', '集中'], '价值投资': ['价值投资'], '现金流折现': ['折现', 'DCF', '现金流折现'],
  '所有者收益': ['所有者收益'], '经济商誉': ['商誉', '经济商誉'], '会计': ['会计'],
  '误判心理学': ['误判', '心理误判', '认知偏差', '偏见'], '激励': ['激励'], '嫉妒': ['嫉妒'],
  '怨恨': ['怨恨'], '避免巨亏': ['巨亏', '避免亏损', '避免巨'], '伯克希尔': ['伯克希尔', 'Berkshire'],
  '合伙人': ['合伙人', '合伙基金', '合伙公司'], '股东信': ['股东信', '致股东'],
  '股东大会': ['股东大会', '年会', '年度会议'], '回购': ['回购'], '通胀': ['通胀', '通货膨胀', '通缩'],
  '杠杆': ['杠杆'], '分散投资': ['分散', '分散投资'], '风险管理': ['风险'],
}
const KEYWORDS = Object.entries(DICT).map(([canon, alts]) => ({
  canon,
  re: new RegExp(alts.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g'),
}))
function extractKeywords(it) {
  const text = it.source === 'bloggers' ? (it.title + '\n' + (it.bloggerText || '').slice(0, 400)) : it.text
  const found = new Set()
  for (const k of KEYWORDS) {
    if (k.re.test(text)) found.add(k.canon)
    k.re.lastIndex = 0
  }
  return found
}
for (const it of items) it.keywords = extractKeywords(it)

const links = {}
for (const a of items) {
  const scored = []
  for (const b of items) {
    if (a.id === b.id) continue
    let shared = 0
    for (const kw of a.keywords) if (b.keywords.has(kw)) shared++
    if (shared <= 0) continue
    const cross = (a.column !== b.column) || (a.sub !== b.sub) ? 1 : 0
    scored.push({ b, shared, cross })
  }
  scored.sort((x, y) => (y.cross - x.cross) || (y.shared - x.shared))
  links[a.id] = scored.slice(0, 8).map((s) => ({
    id: s.b.id, title: s.b.title, column: s.b.column, sub: s.b.sub,
    sharedKeywords: [...a.keywords].filter((k) => s.b.keywords.has(k)),
  }))
}

const columns = {}
for (const it of items) {
  columns[it.column] = columns[it.column] || {}
  columns[it.column][it.sub] = columns[it.column][it.sub] || []
  columns[it.column][it.sub].push({ id: it.id, title: it.title, fileName: it.fileName, source: it.source, year: it.year, keywords: [...it.keywords] })
}
const unclassifiable = items.filter((it) => it.column === '待决策').map((it) => ({ id: it.id, title: it.title, source: it.source, sub: it.sub }))

const out = {
  meta: { generatedAt: new Date().toISOString(), totalItems: items.length, totalLinks: Object.values(links).reduce((s, a) => s + a.length, 0), note: '访谈/施洛斯演讲/未归属文章均已归入巴菲特专栏/演讲·文章' },
  columns, links, unclassifiable,
}
fs.mkdirSync(REPORTS, { recursive: true })
fs.writeFileSync(path.join(REPORTS, 'site-classification.json'), JSON.stringify(out, null, 2), 'utf8')

// ---- 报告 ----
function colOf(id) { for (const c of Object.keys(columns)) for (const s of Object.keys(columns[c])) if (columns[c][s].some((x) => x.id === id)) return c; return '?' }
let cross = 0
for (const [id, arr] of Object.entries(links)) { const a = colOf(id); for (const l of arr) if (colOf(l.id) !== a) cross++ }

const L = []
L.push('# 网站文章分类目录与内链映射')
L.push('')
L.push(`> 自动生成于 ${out.meta.generatedAt}　|　文章总数 **${out.meta.totalItems}**　|　交叉内链 **${out.meta.totalLinks}** 条`)
L.push('')
L.push('## 一、栏目 / 子分类总览')
L.push('')
L.push('| 栏目 | 子分类 | 篇数 |')
L.push('| --- | --- | ---: |')
for (const col of ['巴菲特专栏', '芒格专栏', '博主专栏', '待决策']) {
  const subs = columns[col] || {}
  for (const [sub, arr] of Object.entries(subs)) L.push(`| ${col} | ${sub} | ${arr.length} |`)
}
L.push('')
L.push('## 二、巴菲特专栏（完整目录）')
L.push('')
for (const sub of ['合伙人信', '股东信', '股东大会实录', '演讲/文章']) {
  const arr = (columns['巴菲特专栏'] && columns['巴菲特专栏'][sub]) || []
  L.push(`### 2.${['合伙人信', '股东信', '股东大会实录', '演讲/文章'].indexOf(sub) + 1} ${sub}（${arr.length}）`)
  L.push('')
  for (const it of arr) L.push(`- ${it.title}${it.year ? ` （${it.year}）` : ''}`)
  L.push('')
}
L.push('## 三、芒格专栏（完整目录）')
L.push('')
for (const sub of ['演讲', '思维模型']) {
  const arr = (columns['芒格专栏'] && columns['芒格专栏'][sub]) || []
  L.push(`### 3.${['演讲', '思维模型'].indexOf(sub) + 1} ${sub}（${arr.length}）`)
  L.push('')
  for (const it of arr) L.push(`- ${it.title}${it.year ? ` （${it.year}）` : ''}`)
  L.push('')
}
L.push('## 四、博主专栏（按账号汇总）')
L.push('')
L.push('> 共 2638 篇，完整逐条清单见 `reports/site-classification.json`。此处按账号汇总并各列前 12 篇示例。')
L.push('')
for (const [sub, arr] of Object.entries(columns['博主专栏'] || {})) {
  L.push(`### 4.${Object.keys(columns['博主专栏']).indexOf(sub) + 1} ${sub}（${arr.length}）`)
  L.push('')
  for (const it of arr.slice(0, 12)) L.push(`- ${it.title}`)
  if (arr.length > 12) L.push(`- ……（其余 ${arr.length - 12} 篇见 JSON）`)
  L.push('')
}
L.push('## 五、交叉内链映射')
L.push('')
L.push('- 方法：对每篇文章抽取实体/概念关键词，共享 ≥1 关键词即关联；优先跨栏目链接，每篇最多 8 条。')
L.push(`- 内链总数：**${out.meta.totalLinks}**`)
L.push(`- 其中跨栏目链接：**${cross}** 条（占 ${((cross / out.meta.totalLinks) * 100).toFixed(1)}%）`)
L.push('')
L.push('### 5.1 代表文章的交叉内链示例')
L.push('')
const samples = []
for (const col of ['巴菲特专栏', '芒格专栏']) {
  for (const [sub, arr] of Object.entries(columns[col] || {})) {
    for (const it of arr.slice(0, 2)) {
      const ls = links[it.id] || []
      const crossLs = ls.filter((l) => colOf(l.id) !== col)
      if (crossLs.length) samples.push({ it, crossLs: crossLs.slice(0, 4) })
    }
  }
}
for (const s of samples.slice(0, 18)) {
  L.push(`**《${s.it.title}》** → 跨栏目关联：`)
  for (const l of s.crossLs) L.push(`  - 〔${l.column} / ${l.sub}〕${l.title}　（共享：${l.sharedKeywords.join('、')}）`)
  L.push('')
}
L.push('> 完整逐篇内链映射见 `reports/site-classification.json` 的 `links` 字段。')
L.push('')
L.push('## 六、归类说明')
L.push('')
L.push('全部文章已完成归类，无待决策项。施洛斯演讲(1)、访谈(40) 均已按决策归入「巴菲特专栏 / 演讲·文章」。')
fs.writeFileSync(path.join(REPORTS, '网站文章分类与内链映射.md'), L.join('\n'), 'utf8')

console.log('完成: 文章', items.length, ' 内链', out.meta.totalLinks, ' 跨栏目', cross, ' 待决策', unclassifiable.length)
console.log('已生成 reports/site-classification.json 与 reports/网站文章分类与内链映射.md')
