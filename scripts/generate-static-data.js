const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ROOT = path.join(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'content')
const PUBLIC_DIR = path.join(ROOT, 'public')

function ensurePublicDir() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return fallback
  }
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir)
    .filter(name => !name.startsWith('.'))
    .flatMap(name => {
      const fullPath = path.join(dir, name)
      return fs.statSync(fullPath).isDirectory()
        ? markdownFiles(fullPath)
        : name.endsWith('.md') ? [fullPath] : []
    })
}

function readMarkdown(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function titleFromContent(content, fallback) {
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || fallback
}

function descriptionFromContent(content, length = 200) {
  return content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/^---\s*$/gm, '')
    .replace(/^#\s+.*$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[{2}([^\]]+)\]{2}/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, length)
}

function addEntityItems(items, directory, type, route, indexItems = []) {
  for (const filePath of markdownFiles(path.join(CONTENT_DIR, directory))) {
    const id = path.basename(filePath, '.md')
    const content = readMarkdown(filePath)
    const indexed = indexItems.find(item => item.id === id)
    items.push({
      id,
      name: titleFromContent(content, id),
      type,
      description: descriptionFromContent(content),
      count: indexed?.count || 0,
      years: indexed?.years || [],
      url: `/${route}/${encodeURIComponent(id)}`,
      content,
    })
  }
}

function addDocumentItems(items, directory, type, route) {
  const root = path.join(CONTENT_DIR, directory)
  for (const filePath of markdownFiles(root)) {
    const relativePath = path.relative(root, filePath).split(path.sep).join('/')
    const id = relativePath.replace(/\.md$/, '')
    const content = readMarkdown(filePath)
    const year = id.match(/(?:19|20)\d{2}/)?.[0]
    items.push({
      id,
      name: titleFromContent(content, path.basename(id)),
      type,
      description: descriptionFromContent(content),
      count: 1,
      years: year ? [Number(year)] : [],
      url: `/${route}/${encodeURIComponent(id)}`,
      content,
    })
  }
}

function addLetterItems(items) {
  const files = markdownFiles(path.join(CONTENT_DIR, 'letters'))
  const grouped = new Map()

  for (const filePath of files) {
    const year = path.basename(filePath).match(/(?:19|20)\d{2}/)?.[0]
    if (!year) continue
    grouped.set(year, [...(grouped.get(year) || []), filePath])
  }

  for (const [year, letterFiles] of grouped) {
    const content = letterFiles.map(readMarkdown).join('\n\n')
    items.push({
      id: year,
      name: `${year}年巴菲特致股东信`,
      type: 'letter',
      description: descriptionFromContent(content) || `${year}年伯克希尔哈撒韦股东信`,
      count: letterFiles.length,
      years: [Number(year)],
      url: `/letters/${year}`,
      content,
    })
  }
}

function addPartnershipItems(items) {
  const root = path.join(CONTENT_DIR, 'partnership')
  markdownFiles(root).forEach((filePath, index) => {
    const fileName = path.basename(filePath)
    const year = fileName.match(/(?:19|20)\d{2}/)?.[0]
    const content = readMarkdown(filePath)
    items.push({
      id: String(index + 1),
      name: titleFromContent(content, `${year || ''}年巴菲特致合伙人信`),
      type: 'partnership',
      description: descriptionFromContent(content),
      count: 1,
      years: year ? [Number(year)] : [],
      url: `/partnership/${index + 1}`,
      content,
    })
  })
}

function addBloggerItems(items) {
  const bloggers = readJson(path.join(CONTENT_DIR, 'bloggers', 'bloggers-index.json'), [])
  for (const blogger of bloggers) {
    for (const article of blogger.articles || []) {
      const searchableText = [article.title, article.author, blogger.name, ...(article.tags || [])]
        .filter(Boolean)
        .join(' ')
      items.push({
        id: `${blogger.name}/${article.fileName}`,
        name: article.title,
        type: 'blogger',
        description: `${article.author || blogger.name} · ${blogger.name}${article.tags?.length ? ` · ${article.tags.join('、')}` : ''}`,
        count: 1,
        years: article.year ? [article.year] : [],
        url: `/bloggers/${encodeURIComponent(blogger.name)}/${encodeURIComponent(article.fileName)}`,
        content: searchableText,
      })
    }
  }
}

function addFlatItems(items, directory, type, route) {
  for (const filePath of markdownFiles(path.join(CONTENT_DIR, directory))) {
    const id = path.basename(filePath, '.md')
    const content = readMarkdown(filePath)
    items.push({
      id,
      name: titleFromContent(content, id),
      type,
      description: descriptionFromContent(content),
      count: 1,
      years: [],
      url: `/${route}/${encodeURIComponent(id)}`,
      content,
    })
  }
}

// ============================================================================
// 人物专题档案（李嘉诚 / 段永平）补入搜索索引
//
// 站点的静态搜索索引原先只覆盖「按内容类型」组织的部分（ concept/company/人物词条/
// 股东信/问答/演讲/访谈/博主…），两位人物的专题档案整套不在索引里 —— 搜不到豆瓣。
//
// 关键约束：URL slug 必须与运行时数据层取法完全一致，否则搜索结果会指向 404。
//   - 李嘉诚：md5(相对路径 fileName).slice(0, 10)，见 src/lib/li-ka-shing.ts
//   - 段永平：md5(文件名 fileName).slice(0, 16)，见 src/lib/duanyongping.ts
// 栏目归属规则也与 src/lib/li-ka-shing.ts 的 LI_CATEGORIES 对应，改一处要改两处。
// ============================================================================

function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex')
}

// 媒体素材/文字稿/ 下同时存在纪录片逐字稿与杂志专题报道，按文件名细分栏目。
// 与 src/lib/li-ka-shing.ts 中 media-transcripts 的 fileNames 保持同步。
const LI_TRANSCRIPT_FILES = new Set([
  '杰出华人李嘉诚(RTHK)-普通话对照.md',
  '杰出华人李嘉诚(RTHK)-转写.md',
  '相约东南(福建东南电视台)访谈录像-转写.md',
])

const LI_CATEGORY_SLUGS = {
  '01_年报主席报告书': 'annual-addresses',
  '02_汕大演讲': 'shantou-university',
  '03_长江商学院': 'ckgsb',
  '04_访谈实录': 'interviews',
  '05_声明信函': 'letters',
  '06_股东会记者会': 'agm',
  '媒体素材': 'media-archive',
}

function liCategorySlug(fileName) {
  const base = path.basename(fileName)
  if (LI_TRANSCRIPT_FILES.has(base)) return 'media-transcripts'
  return LI_CATEGORY_SLUGS[fileName.split('/')[0]] || null
}

function addLiKaShingItems(items) {
  const root = path.join(CONTENT_DIR, '李嘉诚原典')
  const entries = readJson(path.join(root, '李嘉诚原典-index.json'), [])
  if (!Array.isArray(entries)) return

  for (const entry of entries) {
    const filePath = path.join(root, entry.fileName)
    if (!fs.existsSync(filePath)) continue
    const categorySlug = liCategorySlug(entry.fileName)
    if (!categorySlug) continue
    const content = readMarkdown(filePath)
    const fileName = path.basename(entry.fileName, '.md')
    items.push({
      id: `li-ka-shing/${entry.fileName}`,
      name: entry.title || titleFromContent(content, fileName),
      type: 'li-ka-shing',
      description: descriptionFromContent(content),
      count: 1,
      years: entry.year ? [entry.year] : [],
      url: `/li-ka-shing/${categorySlug}/${md5(entry.fileName).slice(0, 10)}`,
      content,
    })
  }
}

// 段永平档案：blog / talks / milestones 全量进索引。
// qa（雪球问答）9k+ 篇独立 md，全部纳入会让 lite 索引翻两倍以上（估算 ~6MB），
// 首屏建议的懒加载成本远高于搜索收益，故暂不纳入；后续如要做，
// 建议在 addDuanYongpingItems 里按年份/主题聚合后再补。
const DY_SECTIONS = ['blog', 'talks', 'milestones']

function duanFiles(section) {
  const dir = path.join(CONTENT_DIR, 'duanyongping', section)
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // attachments / 按年份 是资源与归档视图，不是正文
    if (entry.isDirectory()) {
      if (entry.name === 'attachments' || entry.name === '按年份') continue
      for (const f of fs.readdirSync(path.join(dir, entry.name))) {
        if (f.endsWith('.md')) out.push(path.join(dir, entry.name, f))
      }
    } else if (entry.name.endsWith('.md')) {
      // talks 目录下的「目录」索引页不是单篇正文
      if (!(section === 'talks' && entry.name.includes('目录'))) out.push(path.join(dir, entry.name))
    }
  }
  return out
}

function addDuanYongpingItems(items) {
  for (const section of DY_SECTIONS) {
    for (const filePath of duanFiles(section)) {
      const fileName = path.basename(filePath)
      const content = readMarkdown(filePath)
      const title = content.match(/^title:\s*(.+)$/m)?.[1]?.trim()
      const year = (fileName + content.slice(0, 400)).match(/(?:19|20)\d{2}/)?.[0]
      items.push({
        id: `duanyongping/${section}/${fileName}`,
        name: (title || titleFromContent(content, fileName.replace(/\.md$/, ''))).replace(/记念/g, '纪念'),
        type: 'duanyongping',
        description: descriptionFromContent(content),
        count: 1,
        years: year ? [Number(year)] : [],
        url: `/duanyongping/${section}/${md5(fileName).slice(0, 16)}`,
        content,
      })
    }
  }
}

// 搜索只需关键词命中，无需保留全文。截断到固定长度，
// 既保留基本全文命中能力，又避免索引体积膨胀（全文会撑到 20MB+）。
const SEARCH_CONTENT_LIMIT = 400
function truncateForSearch(text) {
  if (!text) return ''
  const clean = String(text).slice(0, SEARCH_CONTENT_LIMIT)
  return clean.length < String(text).length ? `${clean}…` : clean
}

// lite 索引的短 description：首屏轻量索引只保留可展示的摘要
const LITE_DESCRIPTION_LIMIT = 120
function truncateForLite(text) {
  if (!text) return ''
  const clean = String(text).slice(0, LITE_DESCRIPTION_LIMIT)
  return clean.length < String(text).length ? `${clean}…` : clean
}

// 股东大会英文实录：来自构建时生成的 meetings-index.json（含标题/摘要）
function addMeetingItems(items) {
  const index = readJson(path.join(CONTENT_DIR, 'meetings-index.json'), null)
  if (!index) return
  for (const y of index.years || []) {
    for (const e of [...(y.sessions || []), ...(y.clips || [])]) {
      items.push({
        id: `${y.year}/${e.session}`,
        name: e.title || e.session,
        type: 'meeting',
        description: e.summary || '',
        count: e.itemCount || 1,
        years: [y.year],
        url: `/meetings/${y.year}/${encodeURIComponent(e.session)}`,
        content: `${e.title || ''} ${e.summary || ''}`,
      })
    }
  }
}

// 巴菲特主题问答：仅索引主题页元信息（标题/摘要/条数），不加载问答全文
const FAQ_LABELS = {
  investing: '投资方法', valuation: '估值', businesses: '如何思考生意',
  alternatives: '普通股之外的选择', accounting: '会计、公司金融与投资',
  foreign: '海外投资', invindustry: '投资行业', industries: '行业',
  specific: '具体企业', berkshire: '伯克希尔', market: '市场',
  management: '管理层', technology: '科技', education: '教育',
  personal: '个人', advice: '建议', picture: '宏观图景',
}
function addBuffettFaqItems(items) {
  const dir = path.join(CONTENT_DIR, 'buffettfaq')
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue
    const slug = f.replace(/\.md$/, '')
    if (slug === 'buffettfaq') continue // 总目录页内嵌全部问答，不单独索引
    const raw = readMarkdown(path.join(dir, f))
    const title = titleFromContent(raw, slug)
    items.push({
      id: slug,
      name: `${FAQ_LABELS[slug] || '主题问答'}（${title}）`,
      type: 'faq',
      description: title,
      count: (raw.match(/^##\s+/gm) || []).length,
      years: [],
      url: `/buffett-faq/${encodeURIComponent(slug)}`,
      content: `${title} ${FAQ_LABELS[slug] || ''}`,
    })
  }
}

function generateSearchIndex(index) {
  const items = []
  addEntityItems(items, 'concepts', 'concept', 'concepts', index.concepts)
  addEntityItems(items, 'companies', 'company', 'companies', index.companies)
  addEntityItems(items, 'people', 'person', 'people', index.people)
  addLetterItems(items)
  addPartnershipItems(items)
  addDocumentItems(items, 'qa', 'qa', 'qa')
  addDocumentItems(items, 'talks', 'talk', 'talks')
  addDocumentItems(items, 'interviews', 'interview', 'interviews')
  addBloggerItems(items)
  addFlatItems(items, 'books', 'book', 'books')
  addFlatItems(items, 'columns', 'column', 'columns')
  addFlatItems(items, 'models', 'model', 'model')
  addFlatItems(items, 'articles', 'article', 'articles')
  addMeetingItems(items)
  addBuffettFaqItems(items)
  addLiKaShingItems(items)
  addDuanYongpingItems(items)

  // 写入前统一截断 content，控制索引体积
  const slimItems = items.map(item => ({ ...item, content: truncateForSearch(item.content) }))

  // P-01：索引拆两层 —— lite 只含标题/类型/url/计数/年份/短描述，首屏与建议先加载它；
  // content 层保留正文片段，仅在明确搜索正文或结果不足时懒加载。
  const liteItems = slimItems.map(({ content: _content, ...rest }) => ({
    ...rest,
    description: truncateForLite(rest.description),
  }))

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'search-index-lite.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), items: liteItems }),
    'utf-8'
  )
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'search-index-content.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), items: slimItems }),
    'utf-8'
  )
  const liteBytes = fs.statSync(path.join(PUBLIC_DIR, 'search-index-lite.json')).size
  const contentBytes = fs.statSync(path.join(PUBLIC_DIR, 'search-index-content.json')).size
  console.log(`🔎 静态搜索索引: ${items.length} 条`)
  console.log(`   lite 索引:    ${(liteBytes / 1024 / 1024).toFixed(2)}MB (search-index-lite.json)`)
  console.log(`   content 索引: ${(contentBytes / 1024 / 1024).toFixed(2)}MB (search-index-content.json)`)
}

function readEntityDescription(directory, id) {
  return descriptionFromContent(readMarkdown(path.join(CONTENT_DIR, directory, `${id}.md`)))
}

function generateGraphData(index) {
  const nodes = []
  const nodeIds = new Set()

  function addNode(type, id, count, years) {
    const nodeId = `${type}_${id}`
    if (nodeIds.has(nodeId)) return
    nodeIds.add(nodeId)
    nodes.push({
      id: nodeId,
      name: id,
      type,
      count: count || 0,
      years: years || [],
      category: type === 'concept' ? '投资概念' : type === 'company' ? '公司' : '人物',
      description: readEntityDescription(type === 'concept' ? 'concepts' : type === 'company' ? 'companies' : 'people', id),
    })
  }

  ;(index.concepts || []).forEach(item => addNode('concept', item.id, item.count, item.years))
  ;(index.companies || []).forEach(item => addNode('company', item.id, item.count, item.years))
  ;(index.people || []).forEach(item => addNode('person', item.id, item.count, item.years))

  const links = []
  for (const item of index.cooccurrence || []) {
    if (!Array.isArray(item.concepts) || item.concepts.length !== 2) continue
    const source = `concept_${item.concepts[0]}`
    const target = `concept_${item.concepts[1]}`
    if (!nodeIds.has(source) || !nodeIds.has(target)) continue
    links.push({
      source,
      target,
      type: 'cooccurrence',
      weight: item.count || 1,
      label: `共同出现 ${item.count || 1} 次`,
    })
  }

  const data = {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalConcepts: nodes.filter(node => node.type === 'concept').length,
      totalPeople: nodes.filter(node => node.type === 'person').length,
      totalCompanies: nodes.filter(node => node.type === 'company').length,
      totalLinks: links.length,
    },
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'graph-nodes.json'), JSON.stringify(data, null, 2), 'utf-8')
  console.log(`🧠 静态知识图谱: ${data.stats.totalNodes} 个节点, ${data.stats.totalLinks} 条关联`)
}

function main() {
  ensurePublicDir()
  const index = readJson(path.join(CONTENT_DIR, 'index.json'), {})
  generateSearchIndex(index)
  generateGraphData(index)
}

main()
