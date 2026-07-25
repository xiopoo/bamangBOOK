import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

const COLUMNS_DIR = path.join(process.cwd(), 'content/columns')

export interface ColumnMeta {
  slug: string
  title: string
  series: string
  order: number
  date: string | null
  tags: string[]
  summary: string
  readMinutes: number
}

export interface ColumnDetail extends ColumnMeta {
  content: string
}

/**
 * 路径安全校验：与书库一致，拒绝目录穿越，断言解析结果落在 columns 目录内。
 */
function resolveColumnPath(slug: string): string | null {
  if (!slug || /[\\/\0]/.test(slug) || slug.includes('..')) return null
  const resolved = path.resolve(COLUMNS_DIR, `${slug}.md`)
  if (resolved !== path.join(COLUMNS_DIR, `${slug}.md`)) return null
  if (!resolved.startsWith(COLUMNS_DIR + path.sep)) return null
  return resolved
}

function titleFromContent(content: string, fallback: string): string {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

/** 估算中文阅读时长：约 400 字/分钟，最少 1 分钟。 */
function estimateReadMinutes(content: string): number {
  const plain = content.replace(/\s+/g, '')
  return Math.max(1, Math.round(plain.length / 400))
}

function parseColumn(slug: string, raw: string): ColumnDetail {
  const { data, content } = matter(raw)
  const title = typeof data.title === 'string' && data.title.trim()
    ? data.title.trim()
    : titleFromContent(content, slug)

  return {
    slug,
    title,
    series: typeof data.series === 'string' && data.series.trim() ? data.series.trim() : '独立随笔',
    order: typeof data.order === 'number' ? data.order : Number(data.order) || 0,
    date: data.date ? String(data.date).slice(0, 10) : null,
    tags: toStringArray(data.tags),
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    readMinutes: estimateReadMinutes(content),
    content,
  }
}

function toMeta(detail: ColumnDetail): ColumnMeta {
  return {
    slug: detail.slug,
    title: detail.title,
    series: detail.series,
    order: detail.order,
    date: detail.date,
    tags: detail.tags,
    summary: detail.summary,
    readMinutes: detail.readMinutes,
  }
}

/** 读取全部专栏文章元信息，按日期（新→旧）排序。 */
export function getColumns(): ColumnMeta[] {
  if (!existsSync(COLUMNS_DIR)) return []
  return readdirSync(COLUMNS_DIR)
    .filter(name => name.endsWith('.md') && !name.startsWith('.'))
    .map(name => {
      const slug = name.replace(/\.md$/, '')
      return toMeta(parseColumn(slug, readFileSync(path.join(COLUMNS_DIR, name), 'utf-8')))
    })
    .sort((a, b) => {
      if (a.date && b.date && a.date !== b.date) return b.date.localeCompare(a.date)
      return a.title.localeCompare(b.title)
    })
}

export function getColumnBySlug(slug: string): ColumnDetail | null {
  const filePath = resolveColumnPath(slug)
  if (!filePath || !existsSync(filePath)) return null
  try {
    return parseColumn(slug, readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

/**
 * 按系列分组：系列内按 order 升序，便于「专栏 → 系列 → 篇章」的结构化浏览。
 */
export function getColumnsBySeries(): Array<{ series: string; columns: ColumnMeta[] }> {
  const groups = new Map<string, ColumnMeta[]>()
  for (const column of getColumns()) {
    groups.set(column.series, [...(groups.get(column.series) || []), column])
  }
  return Array.from(groups.entries()).map(([series, columns]) => ({
    series,
    columns: columns.sort((a, b) => a.order - b.order),
  }))
}

/** 取同系列的相邻篇章（上一篇 / 下一篇），用于详情页顺序导航。 */
export function getSeriesNeighbors(slug: string): { prev: ColumnMeta | null; next: ColumnMeta | null } {
  const current = getColumnBySlug(slug)
  if (!current) return { prev: null, next: null }
  const series = getColumns()
    .filter(c => c.series === current.series)
    .sort((a, b) => a.order - b.order)
  const index = series.findIndex(c => c.slug === slug)
  return {
    prev: index > 0 ? series[index - 1] : null,
    next: index >= 0 && index < series.length - 1 ? series[index + 1] : null,
  }
}

export function getColumnStats() {
  const columns = getColumns()
  return {
    total: columns.length,
    series: new Set(columns.map(c => c.series)).size,
    tags: new Set(columns.flatMap(c => c.tags)).size,
  }
}
