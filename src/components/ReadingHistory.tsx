'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ReadingProgress, getAllProgress, clearProgress } from '@/lib/reading-progress'

const TYPE_LABELS: Record<string, string> = {
  letter: '股东信',
  partnership: '合伙人信',
  concept: '概念',
  company: '公司',
  people: '人物',
}

const TYPE_COLORS: Record<string, string> = {
  letter: 'bg-primary/10 text-primary',
  partnership: 'bg-purple-50 text-purple-600',
  concept: 'bg-blue-50 text-blue-600',
  company: 'bg-green-50 text-green-600',
  people: 'bg-pink-50 text-pink-600',
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function getDocLink(item: ReadingProgress): string {
  switch (item.letterType) {
    case 'partnership':
    case 'letter':
      return `/letters/${item.letterId}`
    case 'concept':
      return `/concepts/${encodeURIComponent(item.letterId)}`
    case 'company':
      return `/companies/${encodeURIComponent(item.letterId)}`
    case 'people':
      return `/people/${encodeURIComponent(item.letterId)}`
    default:
      return `/letters/${item.letterId}`
  }
}

interface ReadingHistoryProps {
  filterType?: string
  onDataChange?: (items: ReadingProgress[]) => void
}

export default function ReadingHistory({ filterType, onDataChange }: ReadingHistoryProps) {
  const [history, setHistory] = useState<ReadingProgress[]>([])

  const loadData = useCallback(() => {
    const all = getAllProgress()
    const filtered = filterType
      ? all.filter((item) => item.letterType === filterType)
      : all
    filtered.sort(
      (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
    )
    setHistory(filtered)
    onDataChange?.(filtered)
  }, [filterType, onDataChange])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-xl font-semibold text-text mb-2">
          暂无阅读记录
        </h2>
        <p className="text-gray-500">
          开始阅读一篇股东信，进度将自动保存到这里
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item) => {
        const typeLabel = TYPE_LABELS[item.letterType] || item.letterType
        const typeColor = TYPE_COLORS[item.letterType] || 'bg-gray-50 text-gray-600'

        return (
          <Link
            key={item.letterId}
            href={getDocLink(item)}
            className="block bg-white rounded-xl border border-gray-100 p-5 hover:border-primary/20 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text truncate group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
                    {typeLabel}
                  </span>
                  <span className="text-sm text-gray-500">{formatTime(item.lastReadAt)}</span>
                  {item.sectionTitle && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500 truncate max-w-[200px]">
                        {item.sectionTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 w-16 text-right">
                <div className="text-lg font-bold text-primary">
                  {item.progress}%
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
