import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BOOKS_DIR = path.join(process.cwd(), 'content/books')

export interface BookMeta {
  slug: string
  title: string
  author: string
  originalAuthor?: string
  rating: number
  readTime: string
  chapters: number
  category: string
  oneLiner: string
  tags: string[]
  status: string
  date: string | null
}

export interface BookDetail extends BookMeta {
  content: string
}

/**
 * 路径安全校验：拒绝分隔符 / 上跳 / 空字节，并断言解析后的路径仍落在
 * books 目录内，防止 [slug] 动态段被用于目录穿越读取任意文件。
 */
function resolveBookPath(slug: string): string | null {
  if (!slug || /[\\/\0]/.test(slug) || slug.includes('..')) return null
  const resolved = path.resolve(BOOKS_DIR, `${slug}.md`)
  if (resolved !== path.join(BOOKS_DIR, `${slug}.md`)) return null
  if (!resolved.startsWith(BOOKS_DIR + path.sep)) return null
  return resolved
}

function titleFromContent(content: string, fallback: string): string {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

/** frontmatter 中的标签既支持数组，也兼容用逗号/顿号分隔的字符串。 */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

function parseBook(slug: string, raw: string): BookDetail {
  const { data, content } = matter(raw)
  const title = typeof data.title === 'string' && data.title.trim()
    ? data.title.trim()
    : titleFromContent(content, slug)

  return {
    slug,
    title,
    author: typeof data.author === 'string' ? data.author : '',
    originalAuthor: typeof data.originalAuthor === 'string' ? data.originalAuthor : undefined,
    rating: typeof data.rating === 'number' ? data.rating : Number(data.rating) || 0,
    readTime: typeof data.readTime === 'string' ? data.readTime : '',
    chapters: typeof data.chapters === 'number' ? data.chapters : Number(data.chapters) || 0,
    category: typeof data.category === 'string' && data.category.trim() ? data.category.trim() : '未分类',
    oneLiner: typeof data.oneLiner === 'string' ? data.oneLiner : '',
    tags: toStringArray(data.tags),
    status: typeof data.status === 'string' && data.status.trim() ? data.status.trim() : '已拆解',
    date: data.date ? String(data.date).slice(0, 10) : null,
    content,
  }
}

function toMeta(detail: BookDetail): BookMeta {
  return {
    slug: detail.slug,
    title: detail.title,
    author: detail.author,
    originalAuthor: detail.originalAuthor,
    rating: detail.rating,
    readTime: detail.readTime,
    chapters: detail.chapters,
    category: detail.category,
    oneLiner: detail.oneLiner,
    tags: detail.tags,
    status: detail.status,
    date: detail.date,
  }
}

/** 读取全部书籍元信息，按日期（新→旧）、评分（高→低）排序。 */
export function getBooks(): BookMeta[] {
  if (!existsSync(BOOKS_DIR)) return []
  return readdirSync(BOOKS_DIR)
    .filter(name => name.endsWith('.md') && !name.startsWith('.'))
    .map(name => {
      const slug = name.replace(/\.md$/, '')
      return toMeta(parseBook(slug, readFileSync(path.join(BOOKS_DIR, name), 'utf-8')))
    })
    .sort((a, b) => {
      if (a.date && b.date && a.date !== b.date) return b.date.localeCompare(a.date)
      return b.rating - a.rating
    })
}

export function getBookBySlug(slug: string): BookDetail | null {
  const filePath = resolveBookPath(slug)
  if (!filePath || !existsSync(filePath)) return null
  try {
    return parseBook(slug, readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

/** 按 category 分组，返回稳定顺序的分组列表，便于列表页分区渲染。 */
export function getBooksByCategory(): Array<{ category: string; books: BookMeta[] }> {
  const groups = new Map<string, BookMeta[]>()
  for (const book of getBooks()) {
    groups.set(book.category, [...(groups.get(book.category) || []), book])
  }
  return Array.from(groups.entries()).map(([category, books]) => ({ category, books }))
}

export function getBookStats() {
  const books = getBooks()
  const totalChapters = books.reduce((sum, b) => sum + b.chapters, 0)
  const avgRating = books.length
    ? books.reduce((sum, b) => sum + b.rating, 0) / books.length
    : 0
  return {
    total: books.length,
    categories: new Set(books.map(b => b.category)).size,
    totalChapters,
    avgRating: Math.round(avgRating * 10) / 10,
  }
}
