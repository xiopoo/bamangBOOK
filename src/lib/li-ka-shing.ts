import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { createHash } from 'crypto'

/**
 * 李嘉诚原典数据层。
 *
 * 数据来源：content/李嘉诚原典/李嘉诚原典-index.json（170 篇一手原典）
 * 正文文件：content/李嘉诚原典/<相对路径>.md
 *
 * 媒体素材（mp4 / PDF）体积过大，不进 git/out，本模块只暴露文字原典。
 *
 * URL slug 策略：汕大演讲里有几篇中文文件名超长，URL 编码后会触发
 * ENAMETOOLONG（macOS 单文件名 255 字节上限）。因此对每篇的 fileName
 * 取 10 位 md5 作为稳定短 slug，URL 形如 /li-ka-shing/shantou-university/a1b2c3d4e5。
 * 页面上仍展示原 title。
 */

export interface LiCategory {
  /** URL slug，如 annual-addresses */
  slug: string
  /** 磁盘上的中文目录名前缀，如 01_年报主席报告书 */
  dirPrefix: string
  /** 栏目显示名 */
  title: string
  /** 一句话描述 */
  description: string
  /**
   * 同一目录下再按文件名细分的开关：命中列表的篇归入本栏目，
   * 其余篇回落到 dirPrefix 相同的那个兜底栏目。
   * 例：媒体素材/文字稿/ 下既有纪录片逐字稿，也有杂志专题报道。
   */
  fileNames?: string[]
}

export interface LiDocument {
  /** 相对于 content/李嘉诚原典/ 的路径，含 .md */
  fileName: string
  /** 短 URL slug（md5 前 10 位） */
  slug: string
  title: string
  year: number | null
  wordCount: number
  contentLength: number
  categorySlug: string
  /** 形如 /li-ka-shing/<category>/<slug> */
  href: string
  readMinutes: number
}

/** 栏目顺序即导航顺序。dirPrefix 必须与 content/李嘉诚原典/ 下的目录名前缀一致。 */
export const LI_CATEGORIES: LiCategory[] = [
  {
    slug: 'annual-addresses',
    dirPrefix: '01_年报主席报告书',
    title: '年报主席报告书',
    description: '1972—2018 年长江实业（集团）年报主席报告书，连续四十余年的经营自述。',
  },
  {
    slug: 'shantou-university',
    dirPrefix: '02_汕大演讲',
    title: '汕头大学演讲',
    description: '汕头大学毕业典礼及相关场合致辞，1981—2025 年完整记录。',
  },
  {
    slug: 'ckgsb',
    dirPrefix: '03_长江商学院',
    title: '长江商学院',
    description: '长江商学院相关讲话与题词。',
  },
  {
    slug: 'interviews',
    dirPrefix: '04_访谈实录',
    title: '访谈实录',
    description: '南方周末、财新、福布斯、亚洲周刊等媒体专访原文。',
  },
  {
    slug: 'letters',
    dirPrefix: '05_声明信函',
    title: '声明与信函',
    description: '退休信、致毕业生信等公开署名文件。',
  },
  {
    slug: 'agm',
    dirPrefix: '06_股东会记者会',
    title: '股东会记者会答问',
    description: '长和系年度业绩发布会现场答问实录。',
  },
  {
    slug: 'media-transcripts',
    dirPrefix: '媒体素材',
    title: '纪录片与访谈逐字稿',
    description: 'RTHK《杰出华人系列》、《相约东南》等纪录片与访谈录像的逐字转写，是他最长篇的口语化自述。',
    fileNames: [
      '杰出华人李嘉诚(RTHK)-普通话对照.md',
      '杰出华人李嘉诚(RTHK)-转写.md',
      '相约东南(福建东南电视台)访谈录像-转写.md',
    ],
  },
  {
    slug: 'media-archive',
    dirPrefix: '媒体素材',
    title: '媒体报道存档',
    description: '《商业周刊》第1047期「李嘉诚传奇」等专题报道存档；除〈万变社会 不变承诺〉为其署名专栏外，其余均为第三方叙述，非一手发言。',
  },
]

const CATEGORY_BY_SLUG = new Map(LI_CATEGORIES.map(c => [c.slug, c]))

/**
 * 栏目归属：先按文件名细分（同一目录内区分逐字稿与杂志报道），
 * 再回落到一级目录前缀。
 */
function resolveCategory(fileName: string): LiCategory | undefined {
  const base = fileName.split('/').pop() || ''
  const byFile = LI_CATEGORIES.find(c => c.fileNames?.includes(base))
  if (byFile) return byFile
  const slashIdx = fileName.indexOf('/')
  const prefix = slashIdx >= 0 ? fileName.slice(0, slashIdx) : ''
  return LI_CATEGORIES.find(c => !c.fileNames && c.dirPrefix === prefix)
}

const ROOT_DIR = path.join(process.cwd(), 'content', '李嘉诚原典')
const INDEX_FILE = path.join(ROOT_DIR, '李嘉诚原典-index.json')

interface RawLiItem {
  fileName: string
  title: string
  year: number | null
  wordCount: number
  contentLength: number
}

let cached: LiDocument[] | null = null
let slugToFileName: Map<string, string> | null = null

function shortSlug(fileName: string): string {
  return createHash('md5').update(fileName).digest('hex').slice(0, 10)
}

function buildHref(category: LiCategory, slug: string): string {
  return `/li-ka-shing/${category.slug}/${slug}`
}

export function getLiDocuments(): LiDocument[] {
  if (cached) return cached
  if (!existsSync(INDEX_FILE)) {
    cached = []
    return []
  }
  const raw: RawLiItem[] = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'))
  const docs: LiDocument[] = []
  slugToFileName = new Map()
  for (const item of raw) {
    const category = resolveCategory(item.fileName)
    if (!category) continue
    const fullPath = path.join(ROOT_DIR, item.fileName)
    if (!existsSync(fullPath)) continue
    const slug = shortSlug(item.fileName)
    slugToFileName.set(slug, item.fileName)
    // 部分条目在 index.json 里 title 为空，用文件名兜底
    const fallbackTitle = item.fileName.replace(/\.md$/, '').split('/').pop()?.replace(/_/g, ' ') || item.fileName
    docs.push({
      fileName: item.fileName,
      slug,
      title: item.title || fallbackTitle,
      year: item.year ?? null,
      wordCount: item.wordCount || 0,
      contentLength: item.contentLength || 0,
      categorySlug: category.slug,
      href: buildHref(category, slug),
      readMinutes: Math.max(1, Math.round((item.wordCount || item.contentLength || 0) / 400)),
    })
  }
  cached = docs
  return docs
}

export function getLiCategories(): Array<LiCategory & { count: number; yearRange: string }> {
  const docs = getLiDocuments()
  return LI_CATEGORIES.map(cat => {
    const items = docs.filter(d => d.categorySlug === cat.slug)
    const years = items.map(d => d.year).filter((y): y is number => Boolean(y))
    const yearRange = years.length
      ? `${Math.min(...years)}—${Math.max(...years)}`
      : '未标年份'
    return { ...cat, count: items.length, yearRange }
  })
}

export function getLiDocumentsByCategory(categorySlug: string): LiDocument[] {
  return getLiDocuments()
    .filter(d => d.categorySlug === categorySlug)
    .sort((a, b) => {
      const ya = a.year ?? Number.POSITIVE_INFINITY
      const yb = b.year ?? Number.POSITIVE_INFINITY
      if (ya !== yb) return ya - yb
      return (a.title || '').localeCompare(b.title || '')
    })
}

export function getLiCategoryBySlug(slug: string): LiCategory | undefined {
  return CATEGORY_BY_SLUG.get(slug)
}

export interface LiFullDocument extends LiDocument {
  content: string
}

export function getLiDocumentBySlug(categorySlug: string, slug: string): LiFullDocument | null {
  const category = CATEGORY_BY_SLUG.get(categorySlug)
  if (!category) return null
  getLiDocuments() // 初始化 slugToFileName
  const fileName = slugToFileName?.get(slug)
  if (!fileName) return null
  const fullPath = path.join(ROOT_DIR, fileName)
  if (!existsSync(fullPath)) return null
  const docs = getLiDocuments()
  const meta = docs.find(d => d.fileName === fileName)
  const content = readFileSync(fullPath, 'utf-8')
  return {
    fileName,
    slug,
    title: meta?.title || fileName,
    year: meta?.year ?? null,
    wordCount: meta?.wordCount || 0,
    contentLength: meta?.contentLength || content.length,
    categorySlug,
    href: buildHref(category, slug),
    readMinutes: meta?.readMinutes || Math.max(1, Math.round(content.length / 900)),
    content,
  }
}

/** 同一栏目内按年份正序的相邻篇（上一篇=更早，下一篇=更新） */
export function getAdjacentLiDocuments(categorySlug: string, fileName: string) {
  const list = getLiDocumentsByCategory(categorySlug)
  const idx = list.findIndex(d => d.fileName === fileName)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  }
}
