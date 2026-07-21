'use client'

import { useState, useCallback } from 'react'
import { BookOpen, CheckCircle, BarChart3 } from 'lucide-react'
import ReadingHistory from '@/components/ReadingHistory'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'
import { ReadingProgress, getAllProgress, clearAllProgress } from '@/lib/reading-progress'

const TYPE_FILTERS = [
  { value: '', label: '全部' },
  { value: 'letter', label: '股东信' },
  { value: 'partnership', label: '合伙人信' },
  { value: 'concept', label: '概念' },
  { value: 'company', label: '公司' },
  { value: 'people', label: '人物' },
]

export default function HistoryPage() {
  const [filterType, setFilterType] = useState('')
  const [historyData, setHistoryData] = useState<ReadingProgress[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDataChange = useCallback((items: ReadingProgress[]) => {
    setHistoryData(items)
  }, [])

  const totalDocs = getAllProgress().length
  const completedDocs = getAllProgress().filter((p) => p.progress >= 100).length
  const avgProgress = totalDocs > 0
    ? Math.round(getAllProgress().reduce((sum, p) => sum + p.progress, 0) / totalDocs)
    : 0

  const handleClearAll = () => {
    clearAllProgress()
    setHistoryData([])
    setShowConfirm(false)
  }

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="阅读历史"
        subtitle="记录你的阅读进度，随时继续阅读"
        sticky
        rightSlot={totalDocs > 0 ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            清除记录
          </button>
        ) : undefined}
      />

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-text mb-2">确认清除</h3>
            <p className="text-gray-500 text-sm mb-6">
              将清除所有阅读进度记录，此操作不可恢复。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {totalDocs > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <StatBadge
            icon={<BookOpen className="w-5 h-5" />}
            count={totalDocs}
            label="累计阅读"
          />
          <StatBadge
            icon={<CheckCircle className="w-5 h-5" />}
            count={completedDocs}
            label="已读完"
          />
          <StatBadge
            icon={<BarChart3 className="w-5 h-5" />}
            count={avgProgress}
            label="平均进度"
            sub="%"
          />
        </div>
      )}

      {/* Type Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterType === f.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ReadingHistory filterType={filterType || undefined} onDataChange={handleDataChange} />

      <PageFooter />
    </PageContainer>
  )
}
