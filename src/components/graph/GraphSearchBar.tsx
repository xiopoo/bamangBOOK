'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { GraphNode, colorMap, typeLabels } from './types'

interface SearchBarProps {
  nodes: GraphNode[]
  onSelect: (node: GraphNode) => void
  placeholder?: string
}

export default function GraphSearchBar({ nodes, onSelect, placeholder = '搜索节点...' }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return []
    const term = searchTerm.toLowerCase()
    return nodes.filter(n => n.name.toLowerCase().includes(term)).slice(0, 15)
  }, [searchTerm, nodes])

  // 点击外部关闭结果列表
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (node: GraphNode) => {
    onSelect(node)
    setSearchTerm('')
    setShowResults(false)
  }

  const handleClear = () => {
    setSearchTerm('')
    setShowResults(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            if (e.target.value.trim()) setShowResults(true)
          }}
          onFocus={() => { if (searchResults.length > 0) setShowResults(true) }}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {searchResults.map(node => (
            <button
              key={node.id}
              onClick={() => handleSelect(node)}
              className="w-full px-3 py-2 text-left hover:bg-primary/10 flex items-center gap-2 text-sm transition-colors"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorMap[node.type] }} />
              <span className="font-medium truncate">{node.name}</span>
              <span className="text-gray-400 text-xs shrink-0">({typeLabels[node.type]})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
