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

let cachedItems: StaticSearchItem[] | null = null

export async function loadStaticSearchItems(): Promise<StaticSearchItem[]> {
  if (cachedItems) return cachedItems

  const res = await fetch('/search-index.json')
  if (!res.ok) {
    cachedItems = []
    return cachedItems
  }

  const data = await res.json()
  const items: StaticSearchItem[] = Array.isArray(data.items) ? data.items : []
  cachedItems = items
  return items
}

function scoreItem(item: StaticSearchItem, query: string): number {
  const q = query.toLowerCase()
  const name = item.name.toLowerCase()
  const description = item.description.toLowerCase()
  const content = item.content.toLowerCase()
  let score = 0

  if (name === q) score += 100
  if (name.includes(q)) score += 50
  if (description.includes(q)) score += 20
  if (content.includes(q)) score += 10
  score += Math.min(item.count || 0, 20)
  return score
}

export async function searchStaticContent(
  query: string,
  type: StaticSearchItemType | 'all' = 'all',
  limit = 100
): Promise<StaticSearchItem[]> {
  const q = query.trim()
  if (!q) return []

  const items = await loadStaticSearchItems()
  return items
    .map(item => ({ item, score: scoreItem(item, q) }))
    .filter(({ item, score }) => score > 0 && (type === 'all' || item.type === type))
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'zh'))
    .slice(0, limit)
    .map(({ item }) => item)
}

export async function suggestStaticContent(query: string, limit = 8): Promise<StaticSearchItem[]> {
  return searchStaticContent(query, 'all', limit)
}
