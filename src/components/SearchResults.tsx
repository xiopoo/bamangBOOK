'use client'

import Link from 'next/link'

interface SearchResult {
  name: string
  type: 'concept' | 'company' | 'person' | 'letter' | 'article' | 'qa' | 'talk' | 'interview'
  description: string
  count: number
  years: number[]
  url: string
}

interface SearchResultsProps {
  query: string
  results: SearchResult[]
  total: number
  isLoading: boolean
}

const typeLabels: Record<string, string> = {
  concept: '概念',
  company: '公司',
  person: '人物',
  letter: '信件',
  article: '文章',
  qa: '问答',
  talk: '演讲',
  interview: '访谈',
}

const typeIcons: Record<string, string> = {
  concept: '💡',
  company: '🏢',
  person: '👤',
  letter: '📄',
  article: '📝',
  qa: '❓',
  talk: '🎤',
  interview: '🎙️',
}

const typeColors: Record<string, string> = {
  concept: 'border-orange-200 dark:border-orange-900/50 hover:border-orange-300 dark:hover:border-orange-600',
  company: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-600',
  person: 'border-purple-200 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-600',
  letter: 'border-green-200 dark:border-green-900/50 hover:border-green-300 dark:hover:border-green-600',
  article: 'border-amber-200 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-600',
  qa: 'border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-600',
  talk: 'border-cyan-200 dark:border-cyan-900/50 hover:border-cyan-300 dark:hover:border-cyan-600',
  interview: 'border-pink-200 dark:border-pink-900/50 hover:border-pink-300 dark:hover:border-pink-600',
}

const sectionColors: Record<string, string> = {
  concept: 'text-primary dark:text-primary-light',
  company: 'text-blue-600 dark:text-blue-400',
  person: 'text-purple-600 dark:text-purple-400',
  letter: 'text-green-600 dark:text-green-400',
  article: 'text-amber-600 dark:text-amber-400',
  qa: 'text-red-600 dark:text-red-400',
  talk: 'text-cyan-600 dark:text-cyan-400',
  interview: 'text-pink-600 dark:text-pink-400',
}

const sectionBg: Record<string, string> = {
  concept: 'bg-primary/5 dark:bg-primary/20',
  company: 'bg-blue-50 dark:bg-blue-900/30',
  person: 'bg-purple-50 dark:bg-purple-900/30',
  letter: 'bg-green-50 dark:bg-green-900/30',
  article: 'bg-amber-50 dark:bg-amber-900/30',
  qa: 'bg-red-50 dark:bg-red-900/30',
  talk: 'bg-cyan-50 dark:bg-cyan-900/30',
  interview: 'bg-pink-50 dark:bg-pink-900/30',
}

// 高亮匹配关键词
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export default function SearchResults({ query, results, total, isLoading }: SearchResultsProps) {
  // 按类型分组
  const grouped = {
    concept: results.filter(r => r.type === 'concept'),
    company: results.filter(r => r.type === 'company'),
    person: results.filter(r => r.type === 'person'),
    letter: results.filter(r => r.type === 'letter'),
    article: results.filter(r => r.type === 'article'),
    qa: results.filter(r => r.type === 'qa'),
    talk: results.filter(r => r.type === 'talk'),
    interview: results.filter(r => r.type === 'interview'),
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="animate-spin h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">搜索中...</p>
      </div>
    )
  }

  // 空结果
  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
          未找到相关结果
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          抱歉，没有找到与「{query}」相关的内容。请尝试其他关键词，如{'\u201C'}复利{'\u201D'}、{'\u201C'}可口可乐{'\u201D'}、{'\u201C'}巴菲特{'\u201D'}等。
        </p>
      </div>
    )
  }

  // 无搜索词
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-5xl mb-4">📖</div>
        <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
          搜索「巴芒书房」全部内容
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          输入关键词搜索概念、公司、人物或信件，探索巴菲特与芒格的价值投资知识体系
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* 搜索结果统计 */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          搜索「<span className="font-medium text-text dark:text-dark-text">{query}</span>」共找到
          <span className="font-semibold text-primary"> {total} </span>条结果
        </p>
      </div>

      {/* 按分类展示结果 */}
      <div className="space-y-8">
        {(['concept', 'company', 'person', 'letter', 'article', 'qa', 'talk', 'interview'] as const).map(type => {
          const items = grouped[type]
          if (items.length === 0) return null

          return (
            <section key={type}>
              <h2 className={`text-lg font-semibold ${sectionColors[type]} mb-3 flex items-center gap-2`}>
                <span>{typeIcons[type]}</span>
                <span>{typeLabels[type]}</span>
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({items.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={`block bg-white dark:bg-dark-card border ${typeColors[type]} rounded-lg p-4 hover:shadow-sm dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-text dark:text-dark-text">
                            {highlightMatch(item.name, query)}
                          </h3>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${sectionBg[type]} ${sectionColors[type]} flex-shrink-0`}>
                            {typeLabels[type]}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {highlightMatch(item.description, query)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {item.type === 'letter' ? (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {item.years[0]}年
                          </span>
                        ) : (
                          <>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              提及 {item.count} 次
                            </span>
                            {item.years.length > 0 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                跨 {item.years[0]}-{item.years[item.years.length - 1]}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
