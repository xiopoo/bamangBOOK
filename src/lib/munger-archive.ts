import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import recordings from '../../content/munger-archive-recordings.json'
import publicCatalog from '../../content/munger-public-catalog.json'
import { getCanonicalModelSlugForArchiveSlug } from './models'

const LOCAL_ARCHIVE_DIR = path.join(process.cwd(), 'content/munger-archive')

export type MungerArchiveLocalStatus = 'local' | 'partial' | 'missing'

export interface MungerArchiveRecording {
  id: string
  title: string
  titleZh: string
  year: number
  date: string
  type: string
  medium: string
  duration: string
  localStatus: MungerArchiveLocalStatus
  localUrl?: string
  archiveUrl: string
}

export type MungerCatalogStatus = 'local' | 'partial-local' | 'missing-fulltext' | 'metadata-only' | 'book-reference'

export interface MungerPublicCatalogItem {
  section: string
  year: number
  title: string
  type: string
  status: MungerCatalogStatus
}

export interface MungerLocalArchiveItem {
  slug: string
  title: string
  section: string
  fileName: string
  source?: string
}

export interface MungerLocalArchiveDetail extends MungerLocalArchiveItem {
  content: string
}

const LOCAL_SECTION_LABELS: Record<string, string> = {
  root: '生平与事业',
  recordings: '演讲与访谈',
  'mental-models': '思维模型',
  quotes: '主题语录',
}

const HIDDEN_ARCHIVE_INDEX_SLUGS = new Set([
  'home',
  'about',
  'recordings',
  'mental-models',
  'quotes',
])

function walkMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkMarkdownFiles(fullPath)
    if (entry.isFile() && entry.name.endsWith('.md')) return [fullPath]
    return []
  })
}

function slugFromFile(filePath: string): string {
  return path.relative(LOCAL_ARCHIVE_DIR, filePath).replace(/\.md$/, '').split(path.sep).join('/')
}

function sectionFromSlug(slug: string): string {
  const first = slug.split('/')[0]
  return slug.includes('/') ? first : 'root'
}

function toLocalArchiveItem(filePath: string): MungerLocalArchiveItem {
  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const slug = slugFromFile(filePath)
  const fallbackTitle = slug.split('/').pop()?.replace(/-/g, ' ') || slug
  const markdownTitle = content.match(/^\s*#\s+(.+)$/m)?.[1]?.trim()
  const section = sectionFromSlug(slug)

  return {
    slug,
    title: typeof data.title === 'string' && data.title.trim()
      ? data.title.trim()
      : markdownTitle || fallbackTitle,
    section,
    fileName: path.relative(LOCAL_ARCHIVE_DIR, filePath),
    source: typeof data.source === 'string' ? data.source : undefined,
  }
}

export const MUNGER_ARCHIVE_DRAWERS = [
  {
    label: '影音',
    count: '35',
    href: '/munger/archive',
    externalHref: 'https://mungerarchive.com/zh/recordings/',
    description: '演讲、年会、访谈与播客的可核实索引',
  },
  {
    label: '每日期刊',
    count: '10',
    href: '/munger/archive?type=Daily%20Journal',
    externalHref: 'https://mungerarchive.com/daily-journal/',
    description: '2014-2023 年 Daily Journal 个人问答专场',
  },
  {
    label: '思维模型',
    count: '232',
    href: '/model',
    externalHref: 'https://mungerarchive.com/zh/mental-models/',
    description: '统一的多元思维模型、人类误判心理学与跨学科工具库',
  },
  {
    label: '书籍',
    count: '26',
    href: '/books',
    externalHref: 'https://mungerarchive.com/zh/books/',
    description: '芒格所著及关于芒格的书目',
  },
  {
    label: '语录',
    count: '376',
    href: '/munger',
    externalHref: 'https://mungerarchive.com/zh/quotes/',
    description: '按主题分类、标注出处的芒格语录',
  },
  {
    label: '生平',
    count: '1924-2023',
    href: '/people/munger',
    externalHref: 'https://mungerarchive.com/zh/life/',
    description: '年表、公司、建筑、慈善与家庭资料',
  },
]

export function getMungerArchiveRecordings(): MungerArchiveRecording[] {
  return [...(recordings as MungerArchiveRecording[])].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year
    return b.date.localeCompare(a.date)
  })
}

export function getMungerArchiveStats() {
  const all = getMungerArchiveRecordings()
  return {
    total: all.length,
    missing: all.filter(item => item.localStatus === 'missing').length,
    partial: all.filter(item => item.localStatus === 'partial').length,
    local: all.filter(item => item.localStatus === 'local').length,
    types: new Set(all.map(item => item.type)).size,
    media: new Set(all.map(item => item.medium)).size,
  }
}

export function getMungerPublicCatalog(): MungerPublicCatalogItem[] {
  return [...(publicCatalog as MungerPublicCatalogItem[])].sort((a, b) => {
    if (a.section !== b.section) return a.section.localeCompare(b.section)
    if (a.year !== b.year) return a.year - b.year
    return a.title.localeCompare(b.title)
  })
}

export function getMungerPublicCatalogGroups() {
  const all = getMungerPublicCatalog()
  return Array.from(new Set(all.map(item => item.section))).map(section => ({
    section,
    items: all.filter(item => item.section === section),
  }))
}

export function getMungerPublicCatalogStats() {
  const all = getMungerPublicCatalog()
  return {
    total: all.length,
    local: all.filter(item => item.status === 'local' || item.status === 'partial-local').length,
    missingFulltext: all.filter(item => item.status === 'missing-fulltext').length,
    sections: new Set(all.map(item => item.section)).size,
  }
}

export function getMungerLocalArchiveItems(): MungerLocalArchiveItem[] {
  return walkMarkdownFiles(LOCAL_ARCHIVE_DIR)
    .map(toLocalArchiveItem)
    .filter(item => !HIDDEN_ARCHIVE_INDEX_SLUGS.has(item.slug))
    .sort((a, b) => {
      const sectionA = a.section === 'root' ? '0' : a.section
      const sectionB = b.section === 'root' ? '0' : b.section
      if (sectionA !== sectionB) return sectionA.localeCompare(sectionB)
      return a.title.localeCompare(b.title, 'zh-Hans-CN')
    })
}

function internalArchiveHref(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl)
    if (url.hostname !== 'mungerarchive.com' && url.hostname !== 'www.mungerarchive.com') return null

    const cleanPath = url.pathname
      .replace(/^\/zh(?:\/|$)/, '/')
      .replace(/^\/+|\/+$/g, '')

    if (!cleanPath) return '/munger/archive'
    if (cleanPath === 'books') return '/books'
    if (cleanPath === 'mental-models') return '/model'
    if (cleanPath === 'about') return '/about'
    if (cleanPath === 'recordings') return '/munger/archive#recordings'
    if (cleanPath === 'quotes') return '/munger/archive#quotes'

    if (cleanPath.startsWith('mental-models/')) {
      const archiveSlug = cleanPath.slice('mental-models/'.length)
      const canonicalSlug = getCanonicalModelSlugForArchiveSlug(archiveSlug)
      return canonicalSlug ? `/model/${canonicalSlug}` : null
    }

    if (cleanPath.startsWith('quotes/')) {
      const quoteSlug = cleanPath.slice('quotes/'.length)
      const localQuoteSlug = `quotes/quotes-${quoteSlug}`
      const localQuoteFile = path.join(LOCAL_ARCHIVE_DIR, `${localQuoteSlug}.md`)
      return existsSync(localQuoteFile) ? `/munger/archive/${localQuoteSlug}` : null
    }

    const localFile = path.join(LOCAL_ARCHIVE_DIR, `${cleanPath}.md`)
    if (localFile.startsWith(LOCAL_ARCHIVE_DIR + path.sep) && existsSync(localFile)) {
      return `/munger/archive/${cleanPath}`
    }

    return null
  } catch {
    return null
  }
}

/**
 * 抓取稿只保留正式正文：
 * - 删除原站面包屑、重复栏目名和页面标题；
 * - 原站链接有本地对应页时改为站内链接；
 * - 没有本地落点的原站导航链接降级为纯文本，避免制造死链。
 */
function cleanArchiveContent(content: string): string {
  const firstHeading = content.search(/^#\s+/m)
  let cleaned = firstHeading >= 0 ? content.slice(firstHeading) : content

  cleaned = cleaned.replace(
    /\[([^\]]+)\]\((https?:\/\/(?:www\.)?mungerarchive\.com\/[^)\s]*)\)/g,
    (_match, label: string, rawUrl: string) => {
      const localHref = internalArchiveHref(rawUrl)
      return localHref ? `[${label}](${localHref})` : label
    }
  )

  // 图片链接套链接等嵌套 Markdown 不能由上一条表达式完整覆盖，再做一次 URL 级替换。
  cleaned = cleaned.replace(
    /https?:\/\/(?:www\.)?mungerarchive\.com\/[^)\s"']*/g,
    (rawUrl) => internalArchiveHref(rawUrl) ?? '/munger/archive'
  )

  return cleaned
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function getMungerLocalArchiveGroups() {
  const items = getMungerLocalArchiveItems().filter(item => item.section !== 'mental-models')
  return Array.from(new Set(items.map(item => item.section))).map(section => ({
    section,
    label: LOCAL_SECTION_LABELS[section] ?? section,
    items: items.filter(item => item.section === section),
  }))
}

export function getMungerArchiveSectionLabel(section: string): string {
  return LOCAL_SECTION_LABELS[section] ?? '芒格资料'
}

export function getMungerLocalArchiveNavigation(slug: string) {
  const items = getMungerLocalArchiveItems()
  const current = items.find(item => item.slug === slug)
  if (!current) return null

  const sameSection = items.filter(item => item.section === current.section)
  const index = sameSection.findIndex(item => item.slug === current.slug)

  return {
    section: current.section,
    sectionLabel: getMungerArchiveSectionLabel(current.section),
    position: index + 1,
    total: sameSection.length,
    previous: index > 0 ? sameSection[index - 1] : null,
    next: index < sameSection.length - 1 ? sameSection[index + 1] : null,
  }
}

export function getMungerLocalArchiveStats() {
  const items = getMungerLocalArchiveItems()
  return {
    total: items.length,
    sections: new Set(items.map(item => item.section)).size,
    recordings: items.filter(item => item.section === 'recordings').length,
    models: items.filter(item => item.section === 'mental-models').length,
    quotes: items.filter(item => item.section === 'quotes').length,
  }
}

export function getMungerLocalArchiveBySlug(slugParts: string[]): MungerLocalArchiveDetail | null {
  const slug = slugParts.join('/')
  if (!slug || slugParts.some(part => !part || part.includes('..') || /[\\/\0]/.test(part))) return null
  const filePath = path.join(LOCAL_ARCHIVE_DIR, `${slug}.md`)
  if (!filePath.startsWith(LOCAL_ARCHIVE_DIR + path.sep) || !existsSync(filePath)) return null

  const raw = readFileSync(filePath, 'utf-8')
  const { content } = matter(raw)
  return {
    ...toLocalArchiveItem(filePath),
    content: cleanArchiveContent(content),
  }
}
