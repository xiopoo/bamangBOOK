import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import matter from 'gray-matter'

const ROOT = path.join(process.cwd(), 'content', 'duanyongping')

export type DYDoc = {
  fileName: string
  title: string
  author: string
  contentType?: string
  date?: string
  publishedAt?: string
  year?: string
  platform?: string
  source?: string
  sourceUrl?: string
  mirror?: string
  articleId?: string
  commentCount?: string
  duanCommentCount?: string
  category: 'blog' | 'qa' | 'talks' | 'milestones'
  slug: string
  content: string
}

export type DYSection = 'blog' | 'qa' | 'talks' | 'milestones'

const docsCache = new Map<DYSection, { metadata?: DYDoc[]; withContent?: DYDoc[] }>()

const PUBLIC_TALKS_ATTACHMENTS = '/duanyongping/talks/attachments/'

function inferSourceYear(data: Record<string, unknown>, fileName: string, title: string, date?: string): string | undefined {
  const explicit = data.year
  if (typeof explicit === 'string' && /^\d{4}$/.test(explicit)) return explicit
  if (typeof explicit === 'number' && /^\d{4}$/.test(String(explicit))) return String(explicit)

  const sourceText = `${title} ${fileName}`
  const match = sourceText.match(/(?:^|[^\d])(19\d{2}|20\d{2})(?=[^\d]|$)/)
  return match?.[1] || date?.slice(0, 4)
}

/**
 * 将段永平访谈 Markdown 中相对于源文件的附件路径，映射到 public 中的公开路径。
 *
 * 只处理明确以 attachments/ 开头的相对路径；外部 URL、根路径、锚点和 data URL
 * 原样保留，避免把正文中的其他链接误改成站内资源。
 */
function resolveTalkAttachmentPaths(content: string): string {
  let inFence = false

  return content
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence
        return line
      }
      if (inFence) return line

      return line.replace(
        /(!\[[^\]]*\]\(\s*(?:<)?)(attachments\/[^)\n>]+)(>?\s*(?:["'][^)]*)?\))/g,
        (_match, prefix: string, relativePath: string, suffix: string) => {
          const segments = relativePath.split('/')
          if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
            return `${prefix}${relativePath}${suffix}`
          }
          const publicPath = segments.slice(1).map((segment) => encodeURIComponent(segment)).join('/')
          return `${prefix}${PUBLIC_TALKS_ATTACHMENTS}${publicPath}${suffix}`
        },
      )
    })
    .join('\n')
}

function sectionDir(section: DYSection): string {
  return path.join(ROOT, section)
}

function shouldIncludeFile(section: DYSection, fileName: string): boolean {
  return fileName.endsWith('.md') && !(section === 'talks' && fileName.includes('目录'))
}

/**
 * 用文件名的稳定短哈希作为 URL slug。
 * 段永平内容含大量中文标题，在 output:'export' 下：
 *  - 原始中文 slug 无法被 generateStaticParams 正确匹配（请求路径被编码）；
 *  - encodeURIComponent 后又会超过文件系统单段 255 字节上限（长标题）。
 * 因此统一用 ASCII 短哈希，保证可匹配、不超长、且文件名不变则 slug 稳定。
 */
function slugFromFileName(fileName: string): string {
  return crypto.createHash('md5').update(fileName).digest('hex').slice(0, 16)
}

/** 收集某栏目下所有 .md 文件的绝对路径（含年份子目录，跳过 attachments / 按年份）。 */
function collectFiles(section: DYSection): string[] {
  const dir = sectionDir(section)
  const out: string[] = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'attachments' || entry.name === '按年份') continue
      const sub = path.join(dir, entry.name)
      for (const f of fs.readdirSync(sub)) {
        if (shouldIncludeFile(section, f)) out.push(path.join(sub, f))
      }
    } else if (shouldIncludeFile(section, entry.name)) {
      out.push(path.join(dir, entry.name))
    }
  }
  return out
}

function readDoc(section: DYSection, filePath: string, includeContent = true): DYDoc {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const fileName = path.basename(filePath)
  const category = section
  const date = resolveDate(data)
  const title = data.title || fileName
  return {
    fileName,
    title: typeof title === 'string' ? title.replace(/记念/g, '纪念') : fileName,
    author: data.author || '段永平',
    contentType: data.content_type,
    date,
    publishedAt: typeof data.published_at === 'string' ? data.published_at : undefined,
    year: inferSourceYear(data, fileName, String(title), date),
    platform: data.platform,
    source: data.source,
    sourceUrl: data.source_url,
    mirror: data.mirror,
    articleId: data.article_id,
    commentCount: data.comment_count,
    duanCommentCount: data.duan_comment_count,
    category,
    slug: slugFromFileName(fileName),
    content: includeContent ? (section === 'talks' ? resolveTalkAttachmentPaths(content) : content) : '',
  }
}

/** 优先用 date，缺失时回退 published_at（talks 等栏目多用 published_at）。
 *  YAML 裸日期会被解析为 Date 对象，统一转为 ISO 字符串。 */
function resolveDate(data: Record<string, unknown>): string | undefined {
  const d = data.date ?? data.published_at
  if (typeof d === 'string') return d
  if (d instanceof Date) return d.toISOString()
  return undefined
}

/** 列出某栏目的全部文档，blog/qa 按年份分目录。返回按时间正序，适合连续阅读。 */
export function getDYDocs(section: DYSection, includeContent = true): DYDoc[] {
  const cached = docsCache.get(section)?.[includeContent ? 'withContent' : 'metadata']
  if (cached) return [...cached]

  const dir = sectionDir(section)
  if (!fs.existsSync(dir)) return []
  const out: DYDoc[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'attachments' || entry.name === '按年份') continue
      const sub = path.join(dir, entry.name)
      for (const f of fs.readdirSync(sub)) {
        if (shouldIncludeFile(section, f)) out.push(readDoc(section, path.join(sub, f), includeContent))
      }
    } else if (shouldIncludeFile(section, entry.name)) {
      out.push(readDoc(section, path.join(dir, entry.name), includeContent))
    }
  }
  out.sort((a, b) => {
    const ka = section === 'talks' ? `${a.year || '9999'}\u0000${a.title}` : a.date || a.year || ''
    const kb = section === 'talks' ? `${b.year || '9999'}\u0000${b.title}` : b.date || b.year || ''
    if (ka !== kb) return ka.localeCompare(kb)
    return a.slug.localeCompare(b.slug)
  })
  const entry = docsCache.get(section) || {}
  entry[includeContent ? 'withContent' : 'metadata'] = out
  docsCache.set(section, entry)
  return [...out]
}

/** 去掉详情页里已经由元数据显示的转载来源块，避免长 URL 在移动端撑出难看的多行文本。 */
export function stripTalkSourceNote(content: string): string {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  let start = 0
  while (start < lines.length && !lines[start].trim()) start += 1
  if (!/^>\s*(本文转载自|原文链接)/.test(lines[start] || '')) return content

  let end = start
  let hasSourceMarker = false
  while (end < lines.length && (lines[end].trim() === '' || lines[end].startsWith('>'))) {
    if (/本文转载自|原文链接/.test(lines[end])) hasSourceMarker = true
    end += 1
  }
  if (!hasSourceMarker) return content
  return lines.slice(0, start).concat(lines.slice(end)).join('\n').replace(/^\n+/, '')
}

export function getDYDoc(section: DYSection, slug: string): DYDoc | null {
  // URL 中的 slug 可能经过 encodeURIComponent，先解码（已是 ASCII 哈希则不变）。
  let s = slug
  try {
    s = decodeURIComponent(slug)
  } catch {
    s = slug
  }
  for (const fp of collectFiles(section)) {
    if (slugFromFileName(path.basename(fp)) === s) {
      return readDoc(section, fp)
    }
  }
  return null
}

export function getDYSlugs(section: DYSection): string[] {
  return getDYDocs(section, false).map((d) => d.slug)
}

/** 按列表的阅读顺序返回同栏目相邻内容：上一条更早，下一条更晚。 */
export function getDYNeighbors(section: DYSection, slug: string): { previous: DYDoc | null; next: DYDoc | null } {
  const docs = getDYDocs(section, false)
  const index = docs.findIndex((doc) => doc.slug === slug)
  if (index < 0) return { previous: null, next: null }
  return {
    previous: index > 0 ? docs[index - 1] : null,
    next: index < docs.length - 1 ? docs[index + 1] : null,
  }
}

export function getDYYearKey(doc: DYDoc): string {
  return (doc.year || doc.date || '未知').slice(0, 4)
}

export const DY_QA_PAGE_SIZE = 50

export function getDYQAYearPage(year: string, page: number): {
  docs: DYDoc[]
  page: number
  totalPages: number
  total: number
} {
  const allDocs = getDYDocs('qa').filter((doc) => getDYYearKey(doc) === year)
  const totalPages = Math.max(1, Math.ceil(allDocs.length / DY_QA_PAGE_SIZE))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * DY_QA_PAGE_SIZE
  return {
    docs: allDocs.slice(start, start + DY_QA_PAGE_SIZE),
    page: safePage,
    totalPages,
    total: allDocs.length,
  }
}

/** 按年份聚合（用于列表页分组）。 */
export function groupByYear(docs: DYDoc[]): { year: string; docs: DYDoc[] }[] {
  const map = new Map<string, DYDoc[]>()
  for (const d of docs) {
    const y = getDYYearKey(d)
    if (!map.has(y)) map.set(y, [])
    map.get(y)!.push(d)
  }
  return Array.from(map.entries())
    .map(([year, ds]) => ({ year, docs: ds }))
    .sort((a, b) => a.year.localeCompare(b.year))
}
