import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'
import { resolvePersonCanonical } from './entity-resolver'

export interface ArticleMeta {
  slug: string
  title: string
  contentType: string
  person?: string
  year?: string
  entities: string[]
  sourceTitle?: string
  sourceUrl?: string
  filePath: string
  wordCount: number
  /** 正文首段摘要（去掉 frontmatter 与 H1） */
  summary: string
}

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles')

function walkMarkdown(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMarkdown(full, out)
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

function parseFrontmatter(raw: string): { fm: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  const fm: Record<string, string> = {}
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/)
      if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
    }
  }
  return { fm, body: m ? raw.slice(m[0].length) : raw }
}

let cache: ArticleMeta[] | null = null

function loadArticles(): ArticleMeta[] {
  if (cache) return cache
  cache = walkMarkdown(ARTICLES_DIR).map(filePath => {
    const raw = readFileSync(filePath, 'utf8')
    const { fm, body } = parseFrontmatter(raw)
    const slug = path.basename(filePath, '.md')
    const title = fm.title || body.match(/^#\s+(.+)$/m)?.[1]?.trim() || slug
    const entities = (fm.entities || '')
      .split(/[,，]/)
      .map(e => e.trim())
      .filter(Boolean)
    const firstProse = body
      .replace(/^#\s+.+\n+/, '')
      .split(/\n+/)
      .map(l => l.trim())
      .find(l => l.length > 20)
    return {
      slug,
      title,
      contentType: fm.content_type || 'article',
      person: fm.person || undefined,
      year: fm.year || undefined,
      entities,
      sourceTitle: fm.source_title || undefined,
      sourceUrl: fm.source_url || undefined,
      filePath,
      wordCount: body.replace(/[A-Za-z]+/g, ' ').replace(/\s+/g, '').length,
      summary: firstProse ? firstProse.slice(0, 120) : '',
    }
  })
  return cache
}

export function getAllArticles(): ArticleMeta[] {
  return loadArticles()
}

export function getArticleBySlug(slug: string): { meta: ArticleMeta; content: string } | null {
  const meta = loadArticles().find(a => a.slug === slug)
  if (!meta) return null
  const raw = readFileSync(meta.filePath, 'utf8')
  const { body } = parseFrontmatter(raw)
  return { meta, content: body }
}

/**
 * 实体反向索引：实体（概念/公司/人物 canonical）-> 关联文章列表。
 * 用于概念/公司/人物详情页的「延伸阅读」区块。
 */
const entityIndex = (() => {
  const index = new Map<string, ArticleMeta[]>()
  for (const article of loadArticles()) {
    const seen = new Set<string>()
    for (const entity of article.entities) {
      // 人物实体做 canonical 归一（本杰明·格雷厄姆 / Graham -> 格雷厄姆）
      const key = resolvePersonCanonical(entity)
      if (seen.has(key)) continue
      seen.add(key)
      if (!index.has(key)) index.set(key, [])
      index.get(key)!.push(article)
    }
  }
  return index
})()

export function getEntityArticles(entityName: string, limit = 6): ArticleMeta[] {
  const key = resolvePersonCanonical(entityName)
  return (entityIndex.get(key) || []).slice(0, limit)
}
