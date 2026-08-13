// 全站可记录阅读历史的文档类型。除信件类（letter/partnership/概念/公司/人物，由
// useReadingProgress 写入）外，其余为 ReadingProgress 全局模式按路由推导的补充类型。
export type ReadingProgressType =
  | 'letter' | 'partnership' | 'concept' | 'company' | 'people'
  | 'qa' | 'talks' | 'interviews' | 'model' | 'almanack'
  | 'book' | 'column' | 'blogger' | 'business-history'
  | 'duanyongping' | 'wesco' | 'archive'

export interface ReadingProgress {
  letterId: string
  letterType: ReadingProgressType
  scrollPosition: number
  totalHeight: number
  paragraphIndex: number
  totalParagraphs: number
  progress: number
  lastReadAt: string
  title: string
  year?: string
  sectionIndex?: number
  sectionTitle?: string
}

const STORAGE_KEY = 'reading_progress'

export function saveProgress(data: ReadingProgress): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getAllProgress()
    const index = existing.findIndex((p) => p.letterId === data.letterId)
    if (index >= 0) {
      existing[index] = data
    } else {
      existing.push(data)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (e) {
    console.error('Failed to save reading progress:', e)
  }
}

export function getProgress(letterId: string): ReadingProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const all = getAllProgress()
    return all.find((p) => p.letterId === letterId) || null
  } catch {
    return null
  }
}

export function getAllProgress(): ReadingProgress[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ReadingProgress[]
  } catch {
    return []
  }
}

export function clearProgress(letterId: string): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getAllProgress().filter((p) => p.letterId !== letterId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (e) {
    console.error('Failed to clear reading progress:', e)
  }
}

export function getReadingHistory(): ReadingProgress[] {
  const all = getAllProgress()
  return all.sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
  )
}

export function clearAllProgress(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear all reading progress:', e)
  }
}
