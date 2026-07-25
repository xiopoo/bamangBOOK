import { readdirSync, existsSync } from 'fs'
import path from 'path'
import { getBloggers, getBloggerArticles } from './bloggers'

const CONTENT_DIR = path.join(process.cwd(), 'content')

function listIds(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export function bookParams() {
  return listIds(path.join(CONTENT_DIR, 'books')).map((slug) => ({
    slug: encodeURIComponent(slug),
  }))
}

export function columnParams() {
  return listIds(path.join(CONTENT_DIR, 'columns')).map((slug) => ({
    slug: encodeURIComponent(slug),
  }))
}

export function companyParams() {
  return listIds(path.join(CONTENT_DIR, 'companies')).map((name) => ({
    name: encodeURIComponent(name),
  }))
}

export function conceptParams() {
  return listIds(path.join(CONTENT_DIR, 'concepts')).map((name) => ({
    name: encodeURIComponent(name),
  }))
}

export function personParams() {
  return listIds(path.join(CONTENT_DIR, 'people')).map((name) => ({
    name: encodeURIComponent(name),
  }))
}

export function qaParams() {
  return listIds(path.join(CONTENT_DIR, 'qa')).map((id) => ({
    id: encodeURIComponent(id),
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
  return getBloggers().map((b) => ({ blogger: encodeURIComponent(b.name) }))
}

export function bloggerArticleParams() {
  const result: { blogger: string; id: string }[] = []
  for (const b of getBloggers()) {
    for (const a of getBloggerArticles(b.name)) {
      result.push({
        blogger: encodeURIComponent(b.name),
        id: encodeURIComponent(a.fileName),
      })
    }
  }
  return result
}
