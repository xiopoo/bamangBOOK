import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BUSINESS_HISTORY_DIR = path.join(process.cwd(), 'content/business-history')

export interface BusinessHistoryMeta {
  slug: string
  title: string
  company: string
  sourcePdf?: string
  date: string | null
  summary: string
  tags: string[]
  readMinutes: number
}

export interface BusinessHistoryDetail extends BusinessHistoryMeta {
  content: string
}

function resolveBusinessHistoryPath(slug: string): string | null {
  if (!slug || /[\\/\0]/.test(slug) || slug.includes('..')) return null
  const resolved = path.resolve(BUSINESS_HISTORY_DIR, `${slug}.md`)
  if (resolved !== path.join(BUSINESS_HISTORY_DIR, `${slug}.md`)) return null
  if (!resolved.startsWith(BUSINESS_HISTORY_DIR + path.sep)) return null
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

function estimateReadMinutes(content: string): number {
  const plain = content.replace(/\s+/g, '')
  return Math.max(1, Math.round(plain.length / 400))
}

function parseBusinessHistory(slug: string, raw: string): BusinessHistoryDetail {
  const { data, content } = matter(raw)
  const title = typeof data.title === 'string' && data.title.trim()
    ? data.title.trim()
    : titleFromContent(content, slug)

  return {
    slug,
    title,
    company: typeof data.company === 'string' && data.company.trim() ? data.company.trim() : title.split('：')[0],
    sourcePdf: typeof data.sourcePdf === 'string' && data.sourcePdf.trim() ? data.sourcePdf.trim() : undefined,
    date: data.date ? String(data.date).slice(0, 10) : null,
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    tags: toStringArray(data.tags),
    readMinutes: estimateReadMinutes(content),
    content,
  }
}

function toMeta(detail: BusinessHistoryDetail): BusinessHistoryMeta {
  return {
    slug: detail.slug,
    title: detail.title,
    company: detail.company,
    sourcePdf: detail.sourcePdf,
    date: detail.date,
    summary: detail.summary,
    tags: detail.tags,
    readMinutes: detail.readMinutes,
  }
}

export function getBusinessHistories(): BusinessHistoryMeta[] {
  if (!existsSync(BUSINESS_HISTORY_DIR)) return []
  return readdirSync(BUSINESS_HISTORY_DIR)
    .filter(name => name.endsWith('.md') && !name.startsWith('.'))
    .map(name => {
      const slug = name.replace(/\.md$/, '')
      return toMeta(parseBusinessHistory(slug, readFileSync(path.join(BUSINESS_HISTORY_DIR, name), 'utf-8')))
    })
    .sort((a, b) => {
      const orderA = Number(a.slug.match(/^\d+/)?.[0] || 0)
      const orderB = Number(b.slug.match(/^\d+/)?.[0] || 0)
      if (orderA !== orderB) return orderA - orderB
      return a.title.localeCompare(b.title)
    })
}

export function getBusinessHistoryBySlug(slug: string): BusinessHistoryDetail | null {
  const filePath = resolveBusinessHistoryPath(slug)
  if (!filePath || !existsSync(filePath)) return null
  try {
    return parseBusinessHistory(slug, readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

export function getBusinessHistoryStats() {
  const items = getBusinessHistories()
  return {
    total: items.length,
    companies: new Set(items.map(item => item.company)).size,
    tags: new Set(items.flatMap(item => item.tags)).size,
  }
}
