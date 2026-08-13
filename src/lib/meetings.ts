import { readFileSync } from 'fs'
import path from 'path'

export interface MeetingItem {
  year: number
  session: string
  fileName: string
  title: string
  kind: 'highlight' | 'session' | 'clip'
  videoId: string | null
  summary: string
  sectionCount: number | null
  itemCount: number | null
}

interface MeetingIndex {
  total: number
  years: Array<{
    year: number
    sessions: MeetingItem[]
    clips: MeetingItem[]
  }>
}

const INDEX_PATH = path.join(process.cwd(), 'content/meetings-index.json')

let cache: MeetingIndex | null = null
function loadIndex(): MeetingIndex {
  if (cache) return cache
  let loaded: MeetingIndex
  try {
    loaded = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'))
  } catch {
    loaded = { total: 0, years: [] }
  }
  cache = loaded
  return loaded
}

export function getAllMeetingYears(): MeetingIndex['years'] {
  return loadIndex().years
}

export function getMeeting(year: number, session: string): MeetingItem | null {
  const y = loadIndex().years.find(y => y.year === year)
  if (!y) return null
  return [...y.sessions, ...y.clips].find(e => e.session === session) || null
}

export function getMeetingContent(meeting: MeetingItem): string {
  const file = path.join(process.cwd(), 'content/buffettfaq_cnbc', String(meeting.year), meeting.fileName)
  return readFileSync(file, 'utf-8')
}

/** 去掉实录正文顶部的元数据注记（原站时间/会议年份/视频ID/章节数/总条数），保留摘要引言 */
export function stripMeetingMetadata(markdown: string): string {
  return markdown
    .replace(/^#\s+.+\n+/, '')
    .replace(/^\*\*原站时间\*\*[\s\S]*?^\*\*总条数\*\*:\s*\d+\s*\n+/m, '')
    .replace(/^---\n+/, '')
}
