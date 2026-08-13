import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import Fuse from 'fuse.js'

export type SearchItemType =
  | 'concept'
  | 'company'
  | 'person'
  | 'letter'
  | 'partnership'
  | 'article'
  | 'qa'
  | 'talk'
  | 'interview'
  | 'blogger'
  | 'book'
  | 'column'
  | 'model'

export interface SearchItem {
  id: string
  name: string
  type: SearchItemType
  description: string
  count: number
  years: number[]
  url: string
  content: string
}

interface IndexItem {
  id: string
  count: number
  years: number[]
}

interface IndexData {
  concepts?: IndexItem[]
  people?: IndexItem[]
  companies?: IndexItem[]
}

const CONTENT_DIR = path.join(process.cwd(), 'content')

function markdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter(name => !name.startsWith('.'))
    .flatMap(name => {
      const fullPath = path.join(dir, name)
      return statSync(fullPath).isDirectory()
        ? markdownFiles(fullPath)
        : name.endsWith('.md') ? [fullPath] : []
    })
}

function readMarkdown(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function titleFromContent(content: string, fallback: string): string {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

export function extractDescription(content: string, length = 200): string {
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

function loadIndexData(): IndexData {
  try {
    return JSON.parse(readFileSync(path.join(CONTENT_DIR, 'index.json'), 'utf-8'))
  } catch {
    return {}
  }
}

function addEntityItems(
  items: SearchItem[],
  directory: 'concepts' | 'companies' | 'people',
  type: 'concept' | 'company' | 'person',
  route: string,
  indexItems: IndexItem[] = []
) {
  for (const filePath of markdownFiles(path.join(CONTENT_DIR, directory))) {
    const id = path.basename(filePath, '.md')
    const content = readMarkdown(filePath)
    const indexed = indexItems.find(item => item.id === id)
    items.push({
      id,
      name: titleFromContent(content, id),
      type,
      description: extractDescription(content),
      count: indexed?.count || 0,
      years: indexed?.years || [],
      url: `/${route}/${encodeURIComponent(id)}`,
      content,
    })
  }
}

function addDocumentItems(
  items: SearchItem[],
  directory: 'qa' | 'talks' | 'interviews',
  type: 'article' | 'qa' | 'talk' | 'interview',
  route: string
) {
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
      description: extractDescription(content),
      count: 1,
      years: year ? [Number(year)] : [],
      url: `/${route}/${encodeURIComponent(id)}`,
      content,
    })
  }
}

function addLetterItems(items: SearchItem[]) {
  const files = markdownFiles(path.join(CONTENT_DIR, 'letters'))
  const grouped = new Map<string, string[]>()

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
      description: extractDescription(content) || `${year}年伯克希尔·哈撒韦股东信`,
      count: letterFiles.length,
      years: [Number(year)],
      url: `/letters/${year}`,
      content,
    })
  }
}

function addPartnershipItems(items: SearchItem[]) {
  const root = path.join(CONTENT_DIR, 'partnership')
  const files = markdownFiles(root)
  files.forEach((filePath, index) => {
    const fileName = path.basename(filePath)
    const year = fileName.match(/(?:19|20)\d{2}/)?.[0]
    const content = readMarkdown(filePath)
    items.push({
      id: String(index + 1),
      name: titleFromContent(content, `${year || ''}年巴菲特致合伙人信`),
      type: 'partnership',
      description: extractDescription(content),
      count: 1,
      years: year ? [Number(year)] : [],
      url: `/partnership/${index + 1}`,
      content,
    })
  })
}

function addBloggerItems(items: SearchItem[]) {
  try {
    const bloggers: Array<{
      name: string
      articles: Array<{
        title: string
        fileName: string
        author?: string
        year?: number | null
        tags?: string[]
      }>
    }> = JSON.parse(readFileSync(path.join(CONTENT_DIR, 'bloggers', 'bloggers-index.json'), 'utf-8'))

    for (const blogger of bloggers) {
      for (const article of blogger.articles) {
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
  } catch {
    // Blogger search remains optional when its generated index is unavailable.
  }
}

// 拆书与专栏均为 content 下的扁平 Markdown 目录，用 slug（文件名）作为路由 id。
function addFlatItems(
  items: SearchItem[],
  directory: 'books' | 'columns' | 'models' | 'articles',
  type: 'book' | 'column' | 'model' | 'article',
  route: string
) {
  for (const filePath of markdownFiles(path.join(CONTENT_DIR, directory))) {
    const id = path.basename(filePath, '.md')
    const content = readMarkdown(filePath)
    items.push({
      id,
      name: titleFromContent(content, id),
      type,
      description: extractDescription(content),
      count: 1,
      years: [],
      url: `/${route}/${encodeURIComponent(id)}`,
      content,
    })
  }
}

let cachedItems: SearchItem[] | null = null
let cachedFuse: Fuse<SearchItem> | null = null

export function getSearchItems(): SearchItem[] {
  if (cachedItems) return cachedItems

  const index = loadIndexData()
  const items: SearchItem[] = []
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
  cachedItems = items
  return items
}

export function searchContent(query: string, limit?: number): Array<{ item: SearchItem; score?: number }> {
  if (!cachedFuse) {
    cachedFuse = new Fuse(getSearchItems(), {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'description', weight: 0.3 },
        { name: 'content', weight: 0.2 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
    })
  }

  return limit ? cachedFuse.search(query, { limit }) : cachedFuse.search(query)
}
