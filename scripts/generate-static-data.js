const fs = require('fs')
const path = require('path')

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
      url: `/${route}/${encodeURIComponent(relativePath)}`,
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
      if ((article.wordCount || 0) < 80) continue
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

function generateSearchIndex(index) {
  const items = []
  addEntityItems(items, 'concepts', 'concept', 'concepts', index.concepts)
  addEntityItems(items, 'companies', 'company', 'companies', index.companies)
  addEntityItems(items, 'people', 'person', 'people', index.people)
  addLetterItems(items)
  addPartnershipItems(items)
  addDocumentItems(items, 'articles', 'article', 'articles')
  addDocumentItems(items, 'qa', 'qa', 'qa')
  addDocumentItems(items, 'talks', 'talk', 'talks')
  addDocumentItems(items, 'interviews', 'interview', 'interviews')
  addBloggerItems(items)
  addFlatItems(items, 'books', 'book', 'books')
  addFlatItems(items, 'columns', 'column', 'columns')
  addFlatItems(items, 'models', 'model', 'model')

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'search-index.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2),
    'utf-8'
  )
  console.log(`🔎 静态搜索索引: ${items.length} 条`)
}

function readEntityDescription(directory, id) {
  return descriptionFromContent(readMarkdown(path.join(CONTENT_DIR, directory, `${id}.md`)))
}

function generateGraphData(index) {
  const nodes = []
  const nodeIds = new Set()
  const personAliases = {
    '巴菲特': '沃伦·巴菲特',
    '芒格': '查理·芒格',
    '格雷厄姆': '本杰明·格雷厄姆',
    '费雪': '菲尔·费雪',
  }
  const conceptAliases = {
    'GAAP': '通用会计准则',
    'ROE': '净资产收益率',
  }

  function addNode(type, id, count, years) {
    const canonicalId = type === 'person'
      ? (personAliases[id] || id)
      : type === 'concept' ? (conceptAliases[id] || id) : id
    const nodeId = `${type}_${canonicalId}`
    if (nodeIds.has(nodeId)) return
    nodeIds.add(nodeId)
    nodes.push({
      id: nodeId,
      name: canonicalId,
      type,
      count: count || 0,
      years: years || [],
      category: type === 'concept' ? '投资概念' : type === 'company' ? '公司' : '人物',
      description: readEntityDescription(type === 'concept' ? 'concepts' : type === 'company' ? 'companies' : 'people', canonicalId),
    })
  }

  ;(index.concepts || []).forEach(item => addNode('concept', item.id, item.count, item.years))
  ;(index.companies || []).forEach(item => addNode('company', item.id, item.count, item.years))
  ;(index.people || []).forEach(item => addNode('person', item.id, item.count, item.years))

  const linkMap = new Map()

  function addLink(source, target, type, weight, label) {
    if (!nodeIds.has(source) || !nodeIds.has(target) || source === target) return
    const [left, right] = source < target ? [source, target] : [target, source]
    const key = `${left}|${right}|${type}`
    const existing = linkMap.get(key)
    if (existing) {
      existing.weight += Math.max(1, weight || 1)
      return
    }
    linkMap.set(key, {
      source: left,
      target: right,
      type,
      weight: Math.max(1, weight || 1),
      label,
    })
  }

  for (const item of index.cooccurrence || []) {
    if (!Array.isArray(item.concepts) || item.concepts.length !== 2) continue
    const source = `concept_${item.concepts[0]}`
    const target = `concept_${item.concepts[1]}`
    addLink(source, target, 'cooccurrence', item.count, '在年度资料中共同出现')
  }

  // 年度知识图谱已经记录了经过整理的相关概念和人物，优先复用这些显式关系。
  const graphDir = path.join(CONTENT_DIR, 'graph')
  if (fs.existsSync(graphDir)) {
    for (const fileName of fs.readdirSync(graphDir).filter(name => name.endsWith('.json'))) {
      const graph = readJson(path.join(graphDir, fileName), {})
      for (const concept of graph.concepts || []) {
        const conceptName = concept.name || concept.id
        const source = `concept_${conceptAliases[conceptName] || conceptName}`
        for (const related of concept.relatedConcepts || []) {
          const relatedName = related.name || related.id
          addLink(source, `concept_${conceptAliases[relatedName] || relatedName}`, 'cooccurrence', related.count, '在股东信中共同出现')
        }
        for (const person of concept.relatedPeople || []) {
          const personName = personAliases[person.name || person.id] || person.name || person.id
          addLink(source, `person_${personName}`, 'mention', person.count, '在股东信中相关')
        }
      }
    }
  }

  // 公司档案中的 [[概念]] 标签是编辑确认过的关系，可直接用于公司—概念连线。
  const companyDir = path.join(CONTENT_DIR, 'companies')
  if (fs.existsSync(companyDir)) {
    for (const fileName of fs.readdirSync(companyDir).filter(name => name.endsWith('.md'))) {
      const company = path.basename(fileName, '.md')
      const content = readMarkdown(path.join(companyDir, fileName))
      for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
        addLink(`company_${company}`, `concept_${conceptAliases[match[1]] || match[1]}`, 'mention', 1, '公司档案主题')
      }
    }
  }

  const links = Array.from(linkMap.values())
    .sort((a, b) => b.weight - a.weight || a.source.localeCompare(b.source, 'zh-CN'))

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
