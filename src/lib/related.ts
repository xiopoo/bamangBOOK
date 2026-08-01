import fs from 'fs'
import path from 'path'
import { getAllPartnershipLetters } from './partnership'

const JSON_PATH = path.join(process.cwd(), 'reports', 'site-classification.json')

let cache: { links: Record<string, RelatedRaw[]> } | null = null
function loadData() {
  if (cache) return cache
  try {
    cache = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
  } catch {
    cache = { links: {} }
  }
  return cache as { links: Record<string, RelatedRaw[]> }
}

// 合伙人信 fileName -> 数字 id（详情页路由使用数字 id）
const partnershipIdMap = (() => {
  const m = new Map<string, number>()
  try {
    for (const l of getAllPartnershipLetters()) m.set(l.filename, l.id)
  } catch {
    /* ignore */
  }
  return m
})()

function resolveHref(id: string): string | null {
  const idx = id.indexOf('/')
  const source = idx === -1 ? id : id.slice(0, idx)
  const fileName = idx === -1 ? '' : id.slice(idx + 1)
  switch (source) {
    case 'talks':
    case 'interviews':
    case 'qa':
      return `/${source}/${encodeURIComponent(fileName)}`
    case 'letters': {
      const m = fileName.match(/berkshire_(\d{4})/)
      return m ? `/letters/${m[1]}` : null
    }
    case 'models':
      return `/model/${fileName.replace(/\.md$/, '')}`
    case 'partnership': {
      const pid = partnershipIdMap.get(fileName)
      return pid != null ? `/partnership/${pid}` : null
    }
    case 'bloggers': {
      const account = fileName.split('/')[0]
      return `/bloggers/${encodeURIComponent(account)}`
    }
    default:
      return null
  }
}

interface RelatedRaw {
  id: string
  title: string
  column: string
  sub: string
  sharedKeywords: string[]
}

export interface RelatedLink {
  title: string
  href: string
  column: string
  sub: string
  sharedKeywords: string[]
}

/**
 * 根据文章 id（格式：source/fileName）返回其相关文章的内链映射。
 */
export function getRelatedLinks(id: string, limit = 6): RelatedLink[] {
  const data = loadData()
  const raw = data.links?.[id] || []
  const result: RelatedLink[] = []
  for (const l of raw) {
    const href = resolveHref(l.id)
    if (!href) continue
    result.push({
      title: l.title,
      href,
      column: l.column,
      sub: l.sub,
      sharedKeywords: l.sharedKeywords || [],
    })
    if (result.length >= limit) break
  }
  return result
}

/** 由 source + fileName 拼出 link-map 的 key */
export function articleKey(source: string, fileName: string): string {
  return `${source}/${fileName}`
}
