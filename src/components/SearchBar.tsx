'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { suggestStaticContent } from '@/lib/static-search-client'

interface Suggestion {
  name: string
  type: 'concept' | 'company' | 'person' | 'letter' | 'partnership' | 'article' | 'qa' | 'talk' | 'interview' | 'blogger' | 'book' | 'column' | 'model' | 'meeting' | 'faq'
  count: number
  url: string
}

const typeLabels: Record<string, string> = {
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
  meeting: '股东大会实录',
  faq: '主题问答',
}

// 徽章色调：与 ui.css .ui-badge[data-tone] 对应。
// 博客=金 / 原典(信件·合伙人信·问答·演讲·访谈·股东大会·主题问答)=赭红 / 实体=墨 / 外部资料=弱。
const typeTone: Record<string, 'oxblood' | 'gold' | 'ink' | 'muted'> = {
  article: 'gold',
  column: 'gold',
  book: 'gold',
  model: 'gold',
  concept: 'ink',
  company: 'ink',
  person: 'ink',
  letter: 'oxblood',
  partnership: 'oxblood',
  qa: 'oxblood',
  talk: 'oxblood',
  interview: 'oxblood',
  meeting: 'oxblood',
  faq: 'oxblood',
  blogger: 'muted',
}

export default function SearchBar({
  initialQuery = '',
  autoFocus = false,
  onSearch,
  onQueryChange,
}: {
  initialQuery?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
  onQueryChange?: (query: string) => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
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
      const data = await suggestStaticContent(value)
      setSuggestions(data.map((item) => ({
        name: item.name,
        type: item.type as Suggestion['type'],
        count: item.count,
        url: item.url,
      })))
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
      // 与建议同一防抖节奏：通知外部（搜索页）同步更新主结果区
      onQueryChange?.(value)
    }, 250)
  }

  // 键盘导航：combobox 虚拟焦点（aria-activedescendant），不移动 DOM 焦点
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
          const selected = suggestions[selectedIndex]
          router.push(selected.url)
          setIsOpen(false)
          setQuery('')
        } else if (query.trim()) {
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
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
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
      <form onSubmit={handleSubmit} role="search">
        <div className="ui-field__box">
          <Search className="h-4 w-4" aria-hidden="true" />
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
            aria-label="全站搜索"
            aria-autocomplete="list"
            aria-expanded={isOpen && suggestions.length > 0}
            aria-controls="search-suggestions"
            aria-activedescendant={selectedIndex >= 0 && isOpen ? `search-opt-${selectedIndex}` : undefined}
            className="ui-input"
          />
          {/* 加载指示器（本地索引，通常瞬时；保留以覆盖首次大索引冷加载） */}
          {isLoading && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              <span className="block h-4 w-4 animate-[ui-spin_620ms_linear_infinite] rounded-full border-2 border-[var(--archive-ink-faint)] border-r-transparent" />
            </span>
          )}
        </div>
      </form>

      {/* 建议下拉框：token 化面板 + ARIA listbox/option */}
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={dropdownRef}
          id="search-suggestions"
          role="listbox"
          aria-label="搜索建议"
          className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-72 overflow-y-auto rounded-[var(--archive-radius)] border border-[var(--archive-hairline)] bg-[var(--surface-0)] p-1 shadow-[var(--elev-2)]"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.type}-${suggestion.name}`}
              id={`search-opt-${index}`}
              role="option"
              aria-selected={selectedIndex === index}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-[var(--archive-radius)] px-3 py-2.5 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-[var(--surface-2)]'
                  : 'hover:bg-[var(--surface-1)]'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium text-[var(--archive-ink)]">{suggestion.name}</span>
                <span className="ui-badge" data-tone={typeTone[suggestion.type]}>{typeLabels[suggestion.type]}</span>
              </span>
              <span className="flex-shrink-0 text-xs text-[var(--archive-ink-faint)]">{suggestion.count}次</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
