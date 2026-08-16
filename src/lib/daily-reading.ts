import matter from 'gray-matter'
import { getDocuments, getDocumentByFileName } from './documents'
import { documentHref } from './content-routes'

export interface DailyReading {
  title: string
  href: string
  /** 中文类别：演讲 / 访谈 / 股东大会问答 / Wesco 问答 */
  typeLabel: string
  year: number | null
  readMinutes: number
  /** 导语摘录（从正文首段提取） */
  excerpt: string
}

const TYPE_LABEL: Record<string, string> = {
  talks: '演讲',
  interviews: '访谈',
  qa: '股东大会问答',
}

/** 从 markdown 正文提取导语：去 frontmatter / H1 / 日期行，取第一段实质内容 */
function extractExcerpt(content: string, maxLen = 120): string {
  const body = matter(content).content
  const paragraph = body
    .replace(/^#\s+.+$/m, '')
    .replace(/^\d{4}\s*年.*$/m, '')
    .split(/\n\s*\n+/)
    .map(s => s.trim())
    .find(s => s.length > 20)
  if (!paragraph) return ''
  return paragraph.length > maxLen ? `${paragraph.slice(0, maxLen)}…` : paragraph
}

/** 今日一读精选池：演讲 + 访谈 + 股东大会问答（含 Wesco），确定性洗牌保证每天类型分散 */
export function getDailyReadings(): DailyReading[] {
  const pool: DailyReading[] = []
  for (const category of ['talks', 'interviews', 'qa'] as const) {
    for (const doc of getDocuments(category)) {
      const data = getDocumentByFileName(category, doc.fileName)
      if (!data) continue
      const excerpt = extractExcerpt(data.content)
      if (!excerpt) continue
      const isWesco = doc.fileName.startsWith('Wesco_')
      pool.push({
        title: doc.title,
        href: isWesco ? `/munger/wesco/${doc.year}` : documentHref(category, doc),
        typeLabel: isWesco ? 'Wesco 问答' : TYPE_LABEL[category],
        year: doc.year,
        readMinutes: doc.readMinutes,
        excerpt,
      })
    }
  }
  // 固定 seed 洗牌：同一构建下每天展示的内容稳定，且避免连续多天同类型
  let seed = 20260816
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

/** 以日期为 seed 的确定性索引：每天一条，次日顺移 */
export function dailyReadingForDate(readings: DailyReading[], date: Date): DailyReading | null {
  if (readings.length === 0) return null
  const days = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  return readings[((days % readings.length) + readings.length) % readings.length]
}
