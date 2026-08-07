import fs from 'fs'
import path from 'path'
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
    slug: fileName.replace(/\.md$/, ''),
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
  const dir = sectionDir(section)
  // 直接文件
  const direct = path.join(dir, `${slug}.md`)
  if (fs.existsSync(direct)) return readDoc(section, direct)
  // 年份子目录
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== 'attachments' && entry.name !== '按年份') {
        const cand = path.join(dir, entry.name, `${slug}.md`)
        if (fs.existsSync(cand)) return readDoc(section, cand)
      }
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
