import { readFileSync, existsSync } from 'fs'
import path from 'path'

export interface DocumentItem {
  title: string
  year: number | null
  wordCount: number
  contentLength: number
  fileName: string
  person: string | string[]
  /** 索引迁移前的主题目录路径（如 01-投资理念/…），用于主题分类展示 */
  origFileName?: string
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
  },
  articles: {
    dir: 'content/articles',
    indexFile: 'content/articles-index.json',
    title: '专题文章',
    icon: '📖'
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
    
    if (personId) {
      return documents.filter(doc => {
        const persons = Array.isArray(doc.person) ? doc.person : [doc.person]
        return persons.includes(personId)
      })
    }
    
    return documents
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
