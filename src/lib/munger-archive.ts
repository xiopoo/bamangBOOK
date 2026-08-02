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
  transcriptUrl?: string
  embedUrl?: string
  sourceUrl?: string
  sourceLabel?: string
}

const RECORDING_LOCAL_SLUGS: Record<string, string> = {
  'final-cnbc-interview-2023': 'cnbc-final-interview-2023',
  'invest-like-the-best-john-collison-2023': 'invest-like-the-best-2023',
  'berkshire-2023': 'berkshire-2023-annual-meeting',
  'todd-combs-2022': 'singleton-prize-2022',
  'cnbc-investing-2019': 'cnbc-2019',
  'yahoo-china-elon-musk-2019': 'yahoo-2019-china',
  'life-choices-build-wealth-2019': 'yahoo-2019-wealth',
  'munger-unplugged-wsj-2019': 'wsj-unplugged-2019',
  'daily-journal-fireside-2017': 'daily-journal-2017-fireside',
  'bbc-boom-bust-2009': 'bbc-boom-and-bust-2009',
  'stanford-crisis-2009': 'stanford-grundfest-2009',
  'caltech-dubridge-2008': 'caltech-2008',
  'academic-economics-2003': 'ucsb-2003-academic-economics',
  'harvard-law-1998': 'harvard-law-1998-multidisciplinary',
  'psychology-human-misjudgment-1995': 'psychology-of-human-misjudgment-1995',
  'harvard-school-1986': 'harvard-1986-misery',
}

// 播放器来源独立配置：以后迁移到 B 站时，只需要替换这里的地址。
const RECORDING_MEDIA: Record<string, Pick<MungerArchiveRecording, 'embedUrl' | 'sourceUrl' | 'sourceLabel'>> = {
  'daily-journal-2023': {
    embedUrl: 'https://www.youtube-nocookie.com/embed/9VVPO3KWj3A?rel=0',
    sourceUrl: 'https://www.youtube.com/watch?v=9VVPO3KWj3A',
    sourceLabel: 'Daily Journal / CNBC',
  },
  'final-cnbc-interview-2023': {
    embedUrl: 'https://www.youtube-nocookie.com/embed/H5Oom5Rjp_Y?rel=0',
    sourceUrl: 'https://www.youtube.com/watch?v=H5Oom5Rjp_Y',
    sourceLabel: 'CNBC',
  },
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
    count: '36',
    href: '/munger/archive',
    externalHref: 'https://mungerarchive.com/zh/recordings/',
    description: '演讲、年会、访谈与播客的可核实索引',
  },
  {
    label: '每日期刊',
    count: '11',
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
  return [...(recordings as MungerArchiveRecording[])].map(recording => {
    const localSlug = RECORDING_LOCAL_SLUGS[recording.id] ?? recording.id
    const transcriptPath = path.join(LOCAL_ARCHIVE_DIR, 'recordings', `${localSlug}.md`)
    return {
      ...recording,
      ...(existsSync(transcriptPath) ? { transcriptUrl: `/munger/archive/recordings/${localSlug}` } : {}),
      ...RECORDING_MEDIA[recording.id],
    }
  }).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year
    return b.date.localeCompare(a.date)
  })
}

export function getMungerArchiveRecordingBySlug(slug: string): MungerArchiveRecording | null {
  return getMungerArchiveRecordings().find(recording => recording.transcriptUrl?.endsWith(`/recordings/${slug}`)) ?? null
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

/** mungerarchive.com 的 topic 筛选标签 → 中文主题词（站内无对应筛选页，降级为纯文本） */
const RECORDING_TOPIC_LABELS: Record<string, string> = {
  accounting: '会计',
  'annual meetings': '年会',
  banking: '银行业',
  berkshire: '伯克希尔',
  'berkshire hathaway': '伯克希尔哈撒韦',
  bitcoin: '比特币',
  bubbles: '泡沫',
  buffett: '巴菲特',
  business: '商业',
  caltech: '加州理工',
  candid: '直言不讳',
  'capital allocation': '资本配置',
  'career advice': '职业建议',
  china: '中国',
  civilization: '文明',
  'cognitive bias': '认知偏差',
  collison: '科利森',
  costco: '好市多',
  'daily journal': '每日期刊',
  'decision-making': '决策',
  'deserved trust': '应得的信任',
  economics: '经济学',
  education: '教育',
  'efficient-market critique': '有效市场批判',
  engineering: '工程思维',
  fed: '美联储',
  'financial crisis': '金融危机',
  'his only podcast': '唯一播客',
  ibm: 'IBM',
  incentives: '激励',
  inflation: '通货膨胀',
  interdisciplinary: '跨学科',
  inversion: '逆向思考',
  investing: '投资',
  'late-life': '晚年',
  latticework: '思维格栅',
  law: '法律',
  leadership: '领导力',
  learning: '学习',
  legacy: '遗产',
  'li lu': '李录',
  life: '人生',
  'life advice': '人生建议',
  lollapalooza: '多重因素叠加',
  'mental models': '思维模型',
  michigan: '密歇根',
  misery: '痛苦',
  multidisciplinary: '多学科',
  musk: '马斯克',
  partnership: '伙伴关系',
  patience: '耐心',
  "poor charlie's almanack": '穷查理宝典',
  'problem-solving': '解决问题',
  professions: '行业',
  psychology: '心理学',
  'q&a': '问答',
  rationality: '理性',
  reading: '阅读',
  regulation: '监管',
  reliability: '可信赖',
  robinhood: '罗宾汉',
  singleton: '辛格尔顿',
  spacs: 'SPAC',
  'stock-picking': '选股',
  stripe: 'Stripe',
  succession: '继任',
  temperament: '性情',
  tesla: '特斯拉',
  unhappiness: '不幸福',
  'value investing': '价值投资',
  'warren buffett': '沃伦·巴菲特',
  wealth: '财富',
  'worldly wisdom': '普世智慧',
  wsj: '华尔街日报',
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

  // topic 筛选标签在站内没有对应页面，先翻译成中文纯文本（不保留链接）
  cleaned = cleaned.replace(
    /\[([^\]]+)\]\(https?:\/\/(?:www\.)?mungerarchive\.com\/zh\/recordings\/\?topic=([^)\s]*)\)/g,
    (_match, label: string, topic: string) => {
      const key = decodeURIComponent(topic).toLowerCase()
      return RECORDING_TOPIC_LABELS[key] ?? label
    }
  )

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
