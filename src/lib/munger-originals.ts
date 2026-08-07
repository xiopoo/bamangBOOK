import { existsSync, readFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import originalsIndex from '../../content/munger-originals-index.json'

const ORIGINALS_DIR = path.join(process.cwd(), 'content/munger-originals')

export interface MungerOriginalItem {
  id: string
  title: string
  year: number
  author: string
  category: string
  fileName: string
  sourceUrl: string
  wordCount: number
}

export interface MungerOriginalDetail extends MungerOriginalItem {
  content: string
  source: string
  originalLanguage: string
}

export function getMungerOriginals(): MungerOriginalItem[] {
  return [...(originalsIndex as MungerOriginalItem[])].sort((a, b) => b.year - a.year)
}

export function getMungerOriginalById(id: string): MungerOriginalDetail | null {
  if (!id || /[\\/\0]/.test(id) || id.includes('..')) return null
  const item = getMungerOriginals().find(entry => entry.id === id)
  if (!item) return null
  const filePath = path.join(ORIGINALS_DIR, item.fileName)
  if (!filePath.startsWith(ORIGINALS_DIR + path.sep) || !existsSync(filePath)) return null

  const { data, content } = matter(readFileSync(filePath, 'utf-8'))
  return {
    ...item,
    title: typeof data.title === 'string' ? data.title : item.title,
    year: typeof data.year === 'number' ? data.year : item.year,
    source: typeof data.source === 'string' ? data.source : 'Berkshire Hathaway official Wesco archive',
    sourceUrl: typeof data.sourceUrl === 'string' ? data.sourceUrl : item.sourceUrl,
    originalLanguage: typeof data.originalLanguage === 'string' ? data.originalLanguage : 'en',
    content,
  }
}
