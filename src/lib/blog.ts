import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getColumns, type ColumnMeta } from './columns'
import { getBusinessHistories, type BusinessHistoryMeta } from './business-history'
import { getBooks, type BookMeta } from './books'
import { getAllArticles, getArticleBySlug, type ArticleMeta } from './articles'
import { formatDateValue } from './date-format'

/**
 * 博客统一视图层（B-01/B-02）
 *
 * 「博客做入口，档案做底盘」：本站不是全站博客化，而是在既有档案之上
 * 增加一层「主理人写作流」。本模块把 columns / business-history / books /
 * 精选 articles / 新增 content/blog 归一为 BlogPost 视图模型。
 *
 * 链接纪律：
 * - 旧内容（columns/business-history/books/articles）聚合卡片直接链接旧 URL，
 *   不改变 canonical（第一期方案 1）；
 * - 新写内容走 /blog/[slug]；
 * - 无 date 的旧内容不进入默认博客流，避免旧资料污染「最近写作」。
 */

export type BlogPostType =
  | 'note'            // 主理人短札
  | 'essay'           // 长文观点
  | 'reading-note'    // 原典导读/阅读笔记
  | 'company-study'   // 公司研究
  | 'concept-note'    // 概念解释
  | 'book-note'       // 拆书/读书笔记
  | 'archive-guide'   // 档案导览

export interface BlogArchiveLink {
  label: string
  href: string
  reason?: string
}

export interface BlogPost {
  slug: string
  title: string
  subtitle?: string
  summary: string
  type: BlogPostType
  date: string
  updatedAt?: string
  author: string
  tags: string[]
  series?: string
  entities: string[]
  sourcePath: string
  /** 主 URL（旧内容 = 旧 URL；新内容 = /blog/[slug]），卡片与 canonical 都用它 */
  canonicalPath: string
  relatedArchiveLinks: BlogArchiveLink[]
  readingMinutes: number
  featured: boolean
  hidden: boolean
}

export const BLOG_AUTHOR = '金融街小胖'

export const BLOG_TYPE_LABELS: Record<BlogPostType, string> = {
  note: '短札',
  essay: '观点文章',
  'reading-note': '原典导读',
  'company-study': '公司研究',
  'concept-note': '概念笔记',
  'book-note': '拆书',
  'archive-guide': '原典导览',
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function parseRelatedArchive(value: unknown): BlogArchiveLink[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return { label: item, href: item }
      if (item && typeof item === 'object') {
        const href = String((item as { href?: unknown }).href || '').trim()
        if (!href) return null
        return {
          href,
          label: String((item as { label?: unknown }).label || href),
          reason: (item as { reason?: unknown }).reason ? String((item as { reason?: unknown }).reason) : undefined,
        }
      }
      return null
    })
    .filter((item): item is BlogArchiveLink => Boolean(item))
}

function dateFromFrontmatter(data: Record<string, unknown>): string | null {
  return formatDateValue(data.date)
}

/** 从内容目录（frontmatter）读取通用博客字段，兼容旧字段 content_type / year */
function commonBlogFields(slug: string, raw: string): {
  postType: BlogPostType | null
  date: string | null
  featured: boolean
  hidden: boolean
  tags: string[]
  entities: string[]
  series?: string
  subtitle?: string
  author: string
  relatedArchiveLinks: BlogArchiveLink[]
} {
  const { data } = matter(raw)
  const mappedType = String(data.post_type || data.content_type || '').trim() as BlogPostType
  const validTypes: BlogPostType[] = ['note', 'essay', 'reading-note', 'company-study', 'concept-note', 'book-note', 'archive-guide']
  return {
    postType: validTypes.includes(mappedType) ? mappedType : null,
    date: dateFromFrontmatter(data),
    featured: Boolean(data.blog_featured),
    hidden: Boolean(data.blog_hidden),
    tags: toStringArray(data.tags),
    entities: toStringArray(data.entities),
    series: typeof data.series === 'string' && data.series.trim() ? data.series.trim() : undefined,
    subtitle: typeof data.subtitle === 'string' && data.subtitle.trim() ? data.subtitle.trim() : undefined,
    author: typeof data.author === 'string' && data.author.trim() ? data.author.trim() : BLOG_AUTHOR,
    relatedArchiveLinks: parseRelatedArchive(data.related_archive),
  }
}

function toBlogPost(input: {
  slug: string
  title: string
  summary: string
  type: BlogPostType
  date: string | null
  featured: boolean
  hidden: boolean
  tags: string[]
  entities: string[]
  series?: string
  subtitle?: string
  author?: string
  relatedArchiveLinks?: BlogArchiveLink[]
  canonicalPath: string
  sourcePath: string
  readingMinutes: number
}): BlogPost | null {
  // 无 date 的内容不进入默认博客流（详情页仍可通过精选旧文别名访问）
  if (!input.date) return null
  return {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle,
    summary: input.summary,
    type: input.type,
    date: input.date,
    author: input.author || BLOG_AUTHOR,
    tags: input.tags,
    series: input.series,
    entities: input.entities,
    sourcePath: input.sourcePath,
    canonicalPath: input.canonicalPath,
    relatedArchiveLinks: input.relatedArchiveLinks || [],
    readingMinutes: input.readingMinutes,
    featured: input.featured,
    hidden: input.hidden,
  }
}

function titleFromContent(content: string, fallback: string): string {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

function estimateReadMinutes(content: string): number {
  const plain = content.replace(/\s+/g, '')
  return Math.max(1, Math.round(plain.length / 400))
}

// ============ 内容来源聚合 ============

function columnsToPosts(): BlogPost[] {
  return getColumns()
    .map((col: ColumnMeta) => {
      const raw = readFileSync(path.join(process.cwd(), 'content/columns', `${col.slug}.md`), 'utf-8')
      const fields = commonBlogFields(col.slug, raw)
      return toBlogPost({
        slug: col.slug,
        title: col.title,
        summary: col.summary,
        type: fields.postType || 'essay',
        date: fields.date || col.date,
        featured: fields.featured,
        hidden: fields.hidden,
        tags: fields.tags.length > 0 ? fields.tags : col.tags,
        entities: fields.entities,
        series: fields.series || col.series,
        subtitle: fields.subtitle,
        author: fields.author,
        relatedArchiveLinks: fields.relatedArchiveLinks,
        canonicalPath: `/columns/${encodeURIComponent(col.slug)}`,
        sourcePath: `columns/${col.slug}`,
        readingMinutes: col.readMinutes,
      })
    })
    .filter((p): p is BlogPost => Boolean(p))
}

function businessHistoryToPosts(): BlogPost[] {
  return getBusinessHistories()
    .map((study: BusinessHistoryMeta) => {
      const raw = readFileSync(path.join(process.cwd(), 'content/business-history', `${study.slug}.md`), 'utf-8')
      const fields = commonBlogFields(study.slug, raw)
      const entities = fields.entities.length > 0 ? fields.entities : (study.company ? [study.company] : [])
      return toBlogPost({
        slug: study.slug,
        title: study.title,
        summary: study.summary,
        type: fields.postType || 'company-study',
        date: fields.date || study.date,
        featured: fields.featured,
        hidden: fields.hidden,
        tags: fields.tags.length > 0 ? fields.tags : study.tags,
        entities,
        series: fields.series,
        subtitle: fields.subtitle,
        author: fields.author,
        relatedArchiveLinks: fields.relatedArchiveLinks,
        canonicalPath: `/business-history/${encodeURIComponent(study.slug)}`,
        sourcePath: `business-history/${study.slug}`,
        readingMinutes: study.readMinutes,
      })
    })
    .filter((p): p is BlogPost => Boolean(p))
}

function booksToPosts(): BlogPost[] {
  return getBooks()
    .map((book: BookMeta) => {
      const raw = readFileSync(path.join(process.cwd(), 'content/books', `${book.slug}.md`), 'utf-8')
      const fields = commonBlogFields(book.slug, raw)
      return toBlogPost({
        slug: book.slug,
        title: book.title,
        summary: book.oneLiner || book.title,
        type: fields.postType || 'book-note',
        date: fields.date || book.date,
        featured: fields.featured,
        hidden: fields.hidden,
        tags: fields.tags.length > 0 ? fields.tags : book.tags,
        entities: fields.entities,
        series: fields.series,
        subtitle: fields.subtitle,
        author: fields.author || book.author || BLOG_AUTHOR,
        relatedArchiveLinks: fields.relatedArchiveLinks,
        canonicalPath: `/books/${encodeURIComponent(book.slug)}`,
        sourcePath: `books/${book.slug}`,
        readingMinutes: estimateReadMinutes(raw),
      })
    })
    .filter((p): p is BlogPost => Boolean(p))
}

function articlesToPosts(): BlogPost[] {
  return getAllArticles()
    .filter((a) => a.contentType === 'article')
    .map((article: ArticleMeta) => {
      const raw = readFileSync(article.filePath, 'utf-8')
      const fields = commonBlogFields(article.slug, raw)
      // 第一期只纳入显式 blog_featured 的文章（精选进入）
      if (!fields.featured) return null
      return toBlogPost({
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        type: fields.postType || 'archive-guide',
        date: fields.date || (article.year ? `${article.year}-01-01` : null),
        featured: true,
        hidden: fields.hidden,
        tags: fields.tags,
        entities: article.entities.length > 0 ? article.entities : fields.entities,
        series: fields.series,
        subtitle: fields.subtitle,
        author: fields.author,
        relatedArchiveLinks: fields.relatedArchiveLinks,
        canonicalPath: `/articles/${encodeURIComponent(article.slug)}`,
        sourcePath: `articles/${article.slug}`,
        readingMinutes: estimateReadMinutes(raw),
      })
    })
    .filter((p): p is BlogPost => Boolean(p))
}

/** 新增 content/blog/YYYY-MM-DD-slug.md：新写文章默认进入 /blog/[slug] */
function contentBlogToPosts(): BlogPost[] {
  const dir = path.join(process.cwd(), 'content/blog')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !name.startsWith('.'))
    .map((name) => {
      const filePath = path.join(dir, name)
      const raw = readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      const slug = name.replace(/\.md$/, '')
      const title = typeof data.title === 'string' && data.title.trim()
        ? data.title.trim()
        : titleFromContent(content, slug)
      const date = dateFromFrontmatter(data) || (slug.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || null)
      const fields = commonBlogFields(slug, raw)
      return toBlogPost({
        slug,
        title,
        summary: typeof data.summary === 'string' ? data.summary.trim() : '',
        type: fields.postType || 'note',
        date,
        featured: fields.featured,
        hidden: fields.hidden,
        tags: fields.tags,
        entities: fields.entities,
        series: fields.series,
        subtitle: fields.subtitle,
        author: fields.author,
        relatedArchiveLinks: fields.relatedArchiveLinks,
        canonicalPath: `/blog/${encodeURIComponent(slug)}`,
        sourcePath: `blog/${slug}`,
        readingMinutes: estimateReadMinutes(content),
        
      })
    })
    .filter((p): p is BlogPost => Boolean(p))
}

// ============ 查询接口 ============

let cachedPosts: BlogPost[] | null = null

export function getAllBlogPosts(): BlogPost[] {
  if (cachedPosts) return cachedPosts
  const all = [
    ...columnsToPosts(),
    ...businessHistoryToPosts(),
    ...booksToPosts(),
    ...articlesToPosts(),
    ...contentBlogToPosts(),
  ]
    .filter((p) => !p.hidden)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      return b.date.localeCompare(a.date)
    })
  cachedPosts = all
  return all
}

export function getFeaturedBlogPosts(limit: number = 3): BlogPost[] {
  return getAllBlogPosts().filter((p) => p.featured).slice(0, limit)
}

/** 最近文章：排除精选（精选在首页单独置顶展示，避免重复出现）。 */
export function getRecentBlogPosts(limit: number = 8): BlogPost[] {
  return getAllBlogPosts().filter((p) => !p.featured).slice(0, limit)
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return getAllBlogPosts().find((p) => p.slug === decodeURIComponent(slug)) || null
}

/**
 * /blog/[slug] 的静态参数：新写 content/blog 文章 + 精选旧文（blog_featured）。
 * 普通旧内容（columns/business-history/books）卡片直接链接旧 URL（第一期方案 1），
 * 不为其生成 /blog/[slug] 别名页，避免重复收录。
 */
export function blogSlugParams(): string[] {
  return getAllBlogPosts()
    .filter((p) => p.sourcePath.startsWith('blog/') || p.featured)
    .map((p) => p.slug)
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  const target = decodeURIComponent(tag)
  return getAllBlogPosts().filter((p) => p.tags.includes(target))
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  const target = decodeURIComponent(category)
  return getAllBlogPosts().filter((p) => BLOG_TYPE_LABELS[p.type] === target || p.type === target)
}

export function getBlogPostsByEntity(entityName: string): BlogPost[] {
  const target = decodeURIComponent(entityName)
  return getAllBlogPosts().filter((p) => p.entities.includes(target))
}

/** 按关联档案 href 匹配（如 /letters/1988、/qa/xxx）：原典页底部「读这份原典的导读文章」 */
export function getBlogPostsByArchiveHref(href: string): BlogPost[] {
  const target = decodeURIComponent(href)
  return getAllBlogPosts().filter((p) => p.relatedArchiveLinks.some((link) => link.href === target))
}

export function getBlogCategories(): Array<{ key: string; label: string; count: number }> {
  const counts = new Map<string, number>()
  for (const p of getAllBlogPosts()) {
    const label = BLOG_TYPE_LABELS[p.type]
    counts.set(label, (counts.get(label) || 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ key: label, label, count }))
    .sort((a, b) => b.count - a.count)
}

export function getBlogTags(limit = 20): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>()
  for (const p of getAllBlogPosts()) {
    for (const tag of p.tags) counts.set(tag, (counts.get(tag) || 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function getBlogSeries(): Array<{ series: string; count: number }> {
  const counts = new Map<string, number>()
  for (const p of getAllBlogPosts()) {
    if (!p.series) continue
    counts.set(p.series, (counts.get(p.series) || 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([series, count]) => ({ series, count }))
    .sort((a, b) => b.count - a.count)
}

export function getBlogStats() {
  const posts = getAllBlogPosts()
  return {
    total: posts.length,
    categories: new Set(posts.map((p) => BLOG_TYPE_LABELS[p.type])).size,
    tags: new Set(posts.flatMap((p) => p.tags)).size,
    series: new Set(posts.map((p) => p.series).filter(Boolean)).size,
  }
}

/** 博客文章正文（用于详情页渲染）；旧内容直接读对应 markdown。 */
export function getBlogPostContent(post: BlogPost): string {
  const filePath = path.join(process.cwd(), 'content', post.sourcePath.replace(/^content\//, ''))
  if (existsSync(filePath)) return readFileSync(filePath, 'utf-8')
  // 兼容 articles 的嵌套路径：articles/{slug} 可能带子目录
  if (post.sourcePath.startsWith('articles/')) {
    const article = getArticleBySlug(post.slug)
    if (article) return article.content
  }
  return ''
}

export function getBlogDetail(post: BlogPost): { post: BlogPost; content: string } | null {
  return { post, content: getBlogPostContent(post) }
}
