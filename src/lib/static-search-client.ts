export type StaticSearchItemType =
  | 'concept'
  | 'company'
  | 'person'
  | 'letter'
  | 'partnership'
  | 'article'
  | 'qa'
  | 'talk'
  | 'interview'
  | 'blogger'
  | 'book'
  | 'column'
  | 'model'
  | 'meeting'
  | 'faq'

export interface StaticSearchItem {
  id: string
  name: string
  type: StaticSearchItemType
  description: string
  count: number
  years: number[]
  url: string
  content: string
}

// P-01：两层索引。lite 层（标题/类型/url/计数/年份/短描述）首屏与建议先加载；
// content 层（正文片段）仅在明确搜索正文或结果不足时懒加载。
let cachedLiteItems: StaticSearchItem[] | null = null
let cachedContentItems: StaticSearchItem[] | null = null

async function fetchItems(url: string): Promise<StaticSearchItem[]> {
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data.items) ? data.items : []
}

export async function loadStaticSearchItems(): Promise<StaticSearchItem[]> {
  if (cachedLiteItems) return cachedLiteItems
  cachedLiteItems = await fetchItems('/search-index-lite.json')
  return cachedLiteItems
}

export async function loadContentSearchItems(): Promise<StaticSearchItem[]> {
  if (cachedContentItems) return cachedContentItems
  cachedContentItems = await fetchItems('/search-index-content.json')
  return cachedContentItems
}

function scoreItem(item: StaticSearchItem, query: string): number {
  const q = query.toLowerCase()
  const name = item.name.toLowerCase()
  const description = item.description.toLowerCase()
  const content = (item.content || '').toLowerCase()
  let score = 0

  if (name === q) score += 100
  if (name.includes(q)) score += 50
  if (description.includes(q)) score += 20
  if (content.includes(q)) score += 10

  // 只有真正命中文本才算匹配：count 只用于同类结果内的排序加权，
  // 不能让「提及次数」单独把无关条目送进结果集（否则任意关键词都返回全量）。
  if (score === 0) return 0
  score += Math.min(item.count || 0, 20)
  return score
}

/**
 * 执行搜索。
 * - 默认先使用 lite 索引（标题/描述命中）。
 * - 结果为空或过少时，懒加载 content 层做全文命中兜底。
 * - 显式传入 includeContent: true 时直接加载 content 层（正文搜索）。
 */
export async function searchStaticContent(
  query: string,
  type: StaticSearchItemType | 'all' = 'all',
  limit = 100,
  includeContent = false
): Promise<StaticSearchItem[]> {
  const q = query.trim()
  if (!q) return []

  const baseItems = includeContent ? await loadContentSearchItems() : await loadStaticSearchItems()
  let matches = baseItems
    .map(item => ({ item, score: scoreItem(item, q) }))
    .filter(({ item, score }) => score > 0 && (type === 'all' || item.type === type))
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'zh'))
    .slice(0, limit)
    .map(({ item }) => item)

  // 结果不足（含 0 结果）时懒加载 content 层兜底，避免首屏加载 3.4MB 全量索引
  if (!includeContent && matches.length < Math.min(limit, 8)) {
    const contentItems = await loadContentSearchItems()
    const contentMatches = contentItems
      .map(item => ({ item, score: scoreItem(item, q) }))
      .filter(({ item, score }) => score > 0 && (type === 'all' || item.type === type))
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'zh'))
      .slice(0, limit)
      .map(({ item }) => item)

    // 合并去重：优先保留已有（lite）结果，再用 content 层补充
    const seen = new Set(matches.map(m => m.url))
    for (const item of contentMatches) {
      if (seen.has(item.url)) continue
      seen.add(item.url)
      matches.push(item)
      if (matches.length >= limit) break
    }
  }

  return matches
}

export async function suggestStaticContent(query: string, limit = 8): Promise<StaticSearchItem[]> {
  return searchStaticContent(query, 'all', limit, false)
}
