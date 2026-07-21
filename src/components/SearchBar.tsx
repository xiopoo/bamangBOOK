'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Suggestion {
  name: string
  type: 'concept' | 'company' | 'person' | 'letter' | 'article' | 'qa' | 'talk' | 'interview'
  count: number
  url: string
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

const typeColors: Record<string, string> = {
  concept: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light',
  company: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  person: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  letter: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  article: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  qa: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  talk: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  interview: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

export default function SearchBar({ 
  initialQuery = '',
  autoFocus = false,
  onSearch,
}: { 
  initialQuery?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()

  // 防抖搜索建议
  const fetchSuggestions = useCallback(async (value: string) => {
    if (!value.trim()) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&mode=suggest`)
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setIsOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 输入变化处理 - 250ms防抖
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 250)
  }

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          // 选中建议项
          const selected = suggestions[selectedIndex]
          router.push(selected.url)
          setIsOpen(false)
          setQuery('')
        } else if (query.trim()) {
          // 回车直接搜索
          handleSearch(query)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // 执行搜索
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
    setIsOpen(false)
  }

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleSearch(query)
    }
  }

  // 点击建议项
  const handleSuggestionClick = (suggestion: Suggestion) => {
    router.push(suggestion.url)
    setIsOpen(false)
    setQuery('')
  }

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true)
            }}
            placeholder="搜索概念、公司、人物..."
            autoFocus={autoFocus}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-card dark:bg-dark-bg-card border border-gray-200 dark:border-dark-border rounded-lg text-sm text-text dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {/* 搜索图标 */}
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
            aria-label="搜索"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {/* 加载指示器 */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
      </form>

      {/* 建议下拉框 */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg dark:shadow-black/30 z-50 max-h-72 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.name}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-primary/5 dark:bg-primary/20 text-text dark:text-dark-text'
                  : 'text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${index !== suggestions.length - 1 ? 'border-b border-gray-50 dark:border-dark-border' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium truncate">{suggestion.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeColors[suggestion.type]}`}>
                  {typeLabels[suggestion.type]}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                {suggestion.count}次
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
