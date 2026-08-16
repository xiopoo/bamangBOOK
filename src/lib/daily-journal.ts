import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// 每日期刊（Daily Journal）股东会资料位于芒格归档的 recordings 目录下，
// 文件名形如 daily-journal-2023.md（含一次 2017 年炉边谈话）。
const RECORDINGS_DIR = path.join(process.cwd(), 'content/munger-archive/recordings')
const FILE_PATTERN = /^daily-journal-(\d{4})(-fireside)?\.md$/

export interface DailyJournalItem {
  year: number
  /** 路由段：'2017' / '2017-fireside' / '2023' */
  slug: string
  title: string
  kind: '股东会' | '炉边谈话'
  fileName: string
  wordCount: number
}

export interface DailyJournalDetail extends DailyJournalItem {
  content: string
}

export function getDailyJournalMeetings(): DailyJournalItem[] {
  return readdirSync(RECORDINGS_DIR)
    .filter(fileName => FILE_PATTERN.test(fileName))
    .map((fileName) => {
      const match = fileName.match(FILE_PATTERN)!
      const year = Number(match[1])
      const isFireside = Boolean(match[2])
      const raw = readFileSync(path.join(RECORDINGS_DIR, fileName), 'utf-8')
      return {
        year,
        slug: isFireside ? `${year}-fireside` : String(year),
        title: isFireside ? `${year} 每日期刊炉边谈话` : `${year} 每日期刊股东会`,
        kind: isFireside ? '炉边谈话' as const : '股东会' as const,
        fileName,
        wordCount: raw.length,
      }
    })
    // 年份倒序；同年份（2017 股东会 / 2017 炉边谈话）股东会排前
    .sort((a, b) => b.year - a.year || a.slug.localeCompare(b.slug))
}

export function getDailyJournalMeetingBySlug(slug: string): DailyJournalDetail | null {
  const item = getDailyJournalMeetings().find(meeting => meeting.slug === slug)
  if (!item) return null
  const raw = readFileSync(path.join(RECORDINGS_DIR, item.fileName), 'utf-8')
  const { content } = matter(raw)
  // 与芒格归档处理一致：从第一个一级标题开始，去掉原站面包屑与重复栏目名
  const firstHeading = content.search(/^#\s+/m)
  const body = (firstHeading >= 0 ? content.slice(firstHeading) : content)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return { ...item, content: body }
}
