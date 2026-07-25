import { NextRequest, NextResponse } from 'next/server'
import { SearchItem, SearchItemType, searchContent } from '@/lib/content-search'

function sortResults(results: Array<{ item: SearchItem; score?: number }>): SearchItem[] {
  const maxCount = Math.max(...results.map(result => result.item.count), 1)
  return results
    .map(result => ({
      item: result.item,
      score: (1 - (result.score ?? 0.5)) * 0.75 + (result.item.count / maxCount) * 0.25,
    }))
    .sort((a, b) => b.score - a.score)
    .map(result => result.item)
}

// 限制查询长度：全文模糊搜索成本较高，超长输入会放大 CPU/内存开销，构成 DoS 隐患。
const MAX_QUERY_LENGTH = 100

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q')?.trim() || '').slice(0, MAX_QUERY_LENGTH)
  const type = searchParams.get('type') as SearchItemType | null
  const mode = searchParams.get('mode')

  if (!query) {
    return NextResponse.json({ results: [], suggestions: [], total: 0, time: 0 })
  }

  try {
    const found = searchContent(query)
    const filtered = type ? found.filter(result => result.item.type === type) : found
    const sortedItems = sortResults(filtered)

    if (mode === 'suggest') {
      return NextResponse.json({
        suggestions: sortedItems.slice(0, 10).map(item => ({
          name: item.name,
          type: item.type,
          count: item.count,
          url: item.url,
        })),
        time: Date.now() - startTime,
      })
    }

    const typeStats = Object.fromEntries(
      (['concept', 'company', 'person', 'letter', 'partnership', 'article', 'qa', 'talk', 'interview', 'blogger', 'book', 'column'] as SearchItemType[])
        .map(itemType => [itemType, sortedItems.filter(item => item.type === itemType).length])
    )

    return NextResponse.json({
      query,
      results: sortedItems.slice(0, 50).map(item => ({
        name: item.name,
        type: item.type,
        description: item.description,
        count: item.count,
        years: item.years.slice(0, 10),
        url: item.url,
      })),
      total: sortedItems.length,
      typeStats,
      time: Date.now() - startTime,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: '搜索过程中发生错误，请稍后重试' }, { status: 500 })
  }
}
