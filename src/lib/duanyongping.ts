import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import matter from 'gray-matter'

const ROOT = path.join(process.cwd(), 'content', 'duanyongping')

export type DYDoc = {
  fileName: string
  title: string
  author: string
  date?: string
  year?: string
  platform?: string
  source?: string
  mirror?: string
  articleId?: string
  commentCount?: string
  duanCommentCount?: string
  category: 'blog' | 'qa' | 'talks' | 'milestones'
  slug: string
  content: string
}

export type DYSection = 'blog' | 'qa' | 'talks' | 'milestones'

function sectionDir(section: DYSection): string {
  return path.join(ROOT, section)
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
        if (f.endsWith('.md')) out.push(path.join(sub, f))
      }
    } else if (entry.name.endsWith('.md')) {
      out.push(path.join(dir, entry.name))
    }
  }
  return out
}

function readDoc(section: DYSection, filePath: string): DYDoc {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const fileName = path.basename(filePath)
  const category = section
  return {
    fileName,
    title: data.title || fileName,
    author: data.author || '段永平',
    date: data.date,
    year: data.year,
    platform: data.platform,
    source: data.source,
    mirror: data.mirror,
    articleId: data.article_id,
    commentCount: data.comment_count,
    duanCommentCount: data.duan_comment_count,
    category,
    slug: slugFromFileName(fileName),
    content,
  }
}

/** 列出某栏目的全部文档，blog/qa 按年份分目录。返回按日期/序号降序。 */
export function getDYDocs(section: DYSection): DYDoc[] {
  const dir = sectionDir(section)
  if (!fs.existsSync(dir)) return []
  const out: DYDoc[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'attachments' || entry.name === '按年份') continue
      const sub = path.join(dir, entry.name)
      for (const f of fs.readdirSync(sub)) {
        if (f.endsWith('.md')) out.push(readDoc(section, path.join(sub, f)))
      }
    } else if (entry.name.endsWith('.md')) {
      out.push(readDoc(section, path.join(dir, entry.name)))
    }
  }
  out.sort((a, b) => {
    const ka = a.date || a.year || ''
    const kb = b.date || b.year || ''
    if (ka !== kb) return kb.localeCompare(ka)
    return a.slug.localeCompare(b.slug)
  })
  return out
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
  return getDYDocs(section).map((d) => d.slug)
}

/** 按年份聚合（用于列表页分组）。 */
export function groupByYear(docs: DYDoc[]): { year: string; docs: DYDoc[] }[] {
  const map = new Map<string, DYDoc[]>()
  for (const d of docs) {
    const y = (d.date || d.year || '未知').slice(0, 4)
    if (!map.has(y)) map.set(y, [])
    map.get(y)!.push(d)
  }
  return Array.from(map.entries())
    .map(([year, ds]) => ({ year, docs: ds }))
    .sort((a, b) => b.year.localeCompare(a.year))
}
