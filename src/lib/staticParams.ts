import { readdirSync, existsSync } from 'fs'
import path from 'path'
import { getBloggers, getBloggerArticles } from './bloggers'
import { getBusinessHistories } from './business-history'
import { getDocuments } from './documents'

const CONTENT_DIR = path.join(process.cwd(), 'content')

function listIds(dir: string, options: { keepExtension?: boolean } = {}): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => options.keepExtension ? f : f.replace(/\.md$/, ''))
}

export function bookParams() {
  return listIds(path.join(CONTENT_DIR, 'books')).map((slug) => ({
    slug,
  }))
}

export function columnParams() {
  return listIds(path.join(CONTENT_DIR, 'columns')).map((slug) => ({
    slug,
  }))
}

export function businessHistoryParams() {
  // Next.js owns URL encoding for generated params. Pre-encoding here causes
  // a second encoding pass and silently exports a not-found shell.
  return getBusinessHistories().map(({ slug }) => ({ slug }))
}

export function companyParams() {
  return listIds(path.join(CONTENT_DIR, 'companies')).map((name) => ({
    name,
  }))
}

export function conceptParams() {
  return listIds(path.join(CONTENT_DIR, 'concepts')).map((name) => ({
    name,
  }))
}

export function personParams() {
  return listIds(path.join(CONTENT_DIR, 'people')).map((name) => ({
    name,
  }))
}

export function qaParams() {
  // 必须与详情页的查找键一致（index 的 fileName，而非磁盘文件名——两者可能不同）
  return getDocuments('qa').map((doc) => ({
    id: doc.fileName,
  }))
}

export function talkParams() {
  return getDocuments('talks').map((doc) => ({
    id: doc.fileName,
  }))
}

export function interviewParams() {
  return getDocuments('interviews').map((doc) => ({
    id: doc.fileName,
  }))
}

export function letterYearParams() {
  const dir = path.join(CONTENT_DIR, 'letters')
  if (!existsSync(dir)) return []
  const years = new Set<number>()
  for (const f of readdirSync(dir)) {
    const m = f.match(/(?:19|20)\d{2}/)
    if (m) years.add(parseInt(m[0], 10))
  }
  return Array.from(years)
    .sort((a, b) => a - b)
    .map((y) => ({ year: String(y) }))
}

export function bloggerParams() {
  return getBloggers().map((b) => ({ blogger: b.name }))
}

export function bloggerArticleParams() {
  const result: { blogger: string; id: string }[] = []
  for (const b of getBloggers()) {
    for (const a of getBloggerArticles(b.name)) {
      result.push({
        blogger: b.name,
        id: a.fileName,
      })
    }
  }
  return result
}
