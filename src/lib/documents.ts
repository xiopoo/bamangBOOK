import { readFileSync, existsSync } from 'fs'
import path from 'path'

export interface DocumentItem {
  title: string
  year: number | null
  wordCount: number
  contentLength: number
  fileName: string
  person: string | string[]
}

export interface DocumentData {
  title: string
  content: string
  year: number | null
  wordCount: number
  person: string | string[]
}

const categories = {
  talks: {
    dir: 'content/talks',
    indexFile: 'content/talks-index.json',
    title: '演讲',
    icon: '🎤'
  },
  interviews: {
    dir: 'content/interviews',
    indexFile: 'content/interviews-index.json',
    title: '访谈',
    icon: '🎙️'
  },
  qa: {
    dir: 'content/qa',
    indexFile: 'content/qa-index.json',
    title: '股东大会问答',
    icon: '❓'
  }
}

export type DocumentCategory = keyof typeof categories

export function getDocuments(category: DocumentCategory, personId?: string): DocumentItem[] {
  const indexPath = path.join(process.cwd(), categories[category].indexFile)
  if (!existsSync(indexPath)) {
    return []
  }
  try {
    const documents: DocumentItem[] = JSON.parse(readFileSync(indexPath, 'utf-8'))

    const filtered = personId
      ? documents.filter(doc => {
          const persons = Array.isArray(doc.person) ? doc.person : [doc.person]
          return persons.includes(personId)
        })
      : documents

    // 按年份倒序排列（最新在前），无年份的排末尾
    return filtered.slice().sort((a, b) => {
      const ya = a.year ?? Number.NEGATIVE_INFINITY
      const yb = b.year ?? Number.NEGATIVE_INFINITY
      if (ya !== yb) return yb - ya
      return a.fileName.localeCompare(b.fileName)
    })
  } catch {
    return []
  }
}

export function countDocumentsByPerson(category: DocumentCategory, personId: string): number {
  return getDocuments(category, personId).length
}

export function getDocumentByFileName(category: DocumentCategory, fileName: string): DocumentData | null {
  const dir = path.join(process.cwd(), categories[category].dir)
  const normalizedFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`
  const filePath = path.join(dir, normalizedFileName)

  if (!existsSync(filePath)) {
    return null
  }

  const content = readFileSync(filePath, 'utf-8')
  const documents = getDocuments(category)
  const doc = documents.find(d => d.fileName === normalizedFileName || d.fileName === fileName)

  return {
    title: doc?.title || normalizedFileName.replace('.md', ''),
    content,
    year: doc?.year || null,
    wordCount: doc?.wordCount || 0,
    person: doc?.person || []
  }
}

export function getCategoryTitle(category: DocumentCategory): string {
  return categories[category].title
}

export function getCategoryIcon(category: DocumentCategory): string {
  return categories[category].icon
}

export interface AdjacentDocument {
  prev: DocumentItem | null
  next: DocumentItem | null
}

/**
 * 按年份排序（无年份的排末尾），返回与给定 fileName 相邻的上一篇/下一篇。
 * 用于详情页底部的“上一封 / 下一封”导航。
 */
export function getAdjacentDocuments(category: DocumentCategory, fileName: string): AdjacentDocument {
  const sorted = getDocuments(category)
    .slice()
    .sort((a, b) => {
      const ya = a.year ?? Number.POSITIVE_INFINITY
      const yb = b.year ?? Number.POSITIVE_INFINITY
      if (ya !== yb) return ya - yb
      return a.fileName.localeCompare(b.fileName)
    })

  const idx = sorted.findIndex(d => d.fileName === fileName || d.fileName.replace(/\.md$/, '') === fileName)
  if (idx === -1) return { prev: null, next: null }

  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  }
}
