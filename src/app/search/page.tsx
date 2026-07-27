'use client'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import SearchResults from '@/components/SearchResults'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import { searchStaticContent, type StaticSearchItemType } from '@/lib/static-search-client'

interface SearchResult {
  name: string
  type: StaticSearchItemType
  description: string
  count: number
  years: number[]
  url: string
}

interface TypeStats {
  [key: string]: number
}

const emptyTypeStats: TypeStats = {
  concept: 0,
  company: 0,
  person: 0,
  letter: 0,
  partnership: 0,
  article: 0,
  qa: 0,
  talk: 0,
  interview: 0,
  blogger: 0,
  book: 0,
  column: 0,
  model: 0,
}

const typeLabels: Record<string, string> = {
  all: '全部',
  concept: '概念',
  company: '公司',
  person: '人物',
  letter: '信件',
  partnership: '合伙人信',
  article: '文章',
  qa: '问答',
  talk: '演讲',
  interview: '访谈',
  blogger: '博主文章',
  book: '拆书',
  column: '专栏',
  model: '思维模型',
}

const typeIcons: Record<string, string> = {
  all: '🔍',
  concept: '💡',
  company: '🏢',
  person: '👤',
  letter: '📄',
  partnership: '🤝',
  article: '📝',
  qa: '❓',
  talk: '🎤',
  interview: '🎙️',
  blogger: '📚',
  book: '📖',
  column: '✍️',
  model: '🧠',
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialType = searchParams.get('type') as StaticSearchItemType | 'all' || 'all'

  const [query, setQuery] = useState(initialQuery)
  const [selectedType, setSelectedType] = useState(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [typeStats, setTypeStats] = useState<TypeStats>(emptyTypeStats)
  const [isLoading, setIsLoading] = useState(false)

  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string, filterType: StaticSearchItemType | 'all' = 'all') => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotal(0)
      setTypeStats(emptyTypeStats)
      return
    }

    setIsLoading(true)
    try {
      const allResults = await searchStaticContent(searchQuery)
      const filteredResults = filterType === 'all'
        ? allResults
        : allResults.filter((item) => item.type === filterType)
      const stats = allResults.reduce<TypeStats>((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, { ...emptyTypeStats })
      setResults(filteredResults)
      setTotal(filteredResults.length)
      setTypeStats(stats)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
      setTotal(0)
      setTypeStats(emptyTypeStats)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 从URL参数加载搜索结果
  useEffect(() => {
    setQuery(initialQuery)
    setSelectedType(initialType)
    if (initialQuery) {
      performSearch(initialQuery, initialType)
    }
  }, [initialQuery, initialType, performSearch])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setSelectedType('all')
    performSearch(searchQuery, 'all')
    // 更新URL参数
    const url = new URL(window.location.href)
    url.searchParams.set('q', searchQuery)
    url.searchParams.delete('type')
    window.history.replaceState({}, '', url.toString())
  }

  const handleTypeFilter = (type: StaticSearchItemType | 'all') => {
    setSelectedType(type)
    performSearch(query, type)
    // 更新URL参数
    const url = new URL(window.location.href)
    url.searchParams.set('q', query)
    if (type !== 'all') {
      url.searchParams.set('type', type)
    } else {
      url.searchParams.delete('type')
    }
    window.history.replaceState({}, '', url.toString())
  }

  const allTypes = ['all', 'concept', 'company', 'person', 'letter', 'partnership', 'article', 'qa', 'talk', 'interview', 'blogger', 'book', 'column', 'model'] as const

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="全站搜索"
        subtitle="搜索概念、公司、人物、信件，探索价值投资知识体系"
        sticky
      />

      {/* 搜索框 */}
      <div className="mb-6">
        <SearchBar
          initialQuery={initialQuery}
          autoFocus={!initialQuery}
          onSearch={handleSearch}
        />
      </div>

      {/* 分类筛选器 */}
      {query && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">筛选：</span>
            {allTypes.map((type) => {
              const count = type === 'all' ? total : typeStats[type]
              const isActive = selectedType === type
              
              return (
                <button
                  key={type}
                  onClick={() => handleTypeFilter(type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white dark:text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{typeIcons[type]}</span>
                  <span>{typeLabels[type]}</span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      <SearchResults
        query={query}
        results={results}
        total={total}
        isLoading={isLoading}
      />

      <PageFooter />
    </PageContainer>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <PageContainer maxWidth="4xl">
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500">加载中...</p>
        </div>
      </PageContainer>
    }>
      <SearchContent />
    </Suspense>
  )
}
