'use client'

import { Filter } from 'lucide-react'
import { NodeType, colorMap, typeLabels, typeList } from './types'

interface FilterPanelProps {
  activeFilters: NodeType[]
  onToggleFilter: (type: NodeType) => void
  weightThreshold: number
  onWeightThresholdChange: (value: number) => void
  yearRange: [number, number]
  onYearRangeChange: (range: [number, number]) => void
  onReset: () => void
  counts?: Record<NodeType, number>
}

export default function FilterPanel({
  activeFilters,
  onToggleFilter,
  weightThreshold,
  onWeightThresholdChange,
  yearRange,
  onYearRangeChange,
  onReset,
  counts,
}: FilterPanelProps) {
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
        <Filter className="w-4 h-4" />
        <span>节点筛选</span>
      </div>
      <div className="space-y-2">
        {typeList.map(type => (
          <button
            key={type}
            onClick={() => onToggleFilter(type)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              activeFilters.includes(type)
                ? 'bg-gray-100 font-medium'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${activeFilters.includes(type) ? '' : 'opacity-30'}`}
              style={{ backgroundColor: colorMap[type] }}
            />
            <span className={activeFilters.includes(type) ? '' : 'line-through'}>
              {typeLabels[type]}
            </span>
            {counts && (
              <span className="ml-auto text-xs text-gray-400">{counts[type]}</span>
            )}
          </button>
        ))}
      </div>

      {/* 权重阈值滑块 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">最小关联权重</span>
          <span className="text-xs font-medium text-gray-700">{weightThreshold}</span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={weightThreshold}
          onChange={(e) => onWeightThresholdChange(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>弱</span>
          <span>强</span>
        </div>
      </div>

      {/* 年份范围 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">年份范围</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1900}
            max={2025}
            value={yearRange[0]}
            onChange={(e) => {
              const val = Math.max(1900, Math.min(2025, Number(e.target.value)))
              onYearRangeChange([val, Math.max(val, yearRange[1])])
            }}
            className="w-24 px-2 py-1 text-xs border border-gray-200 rounded"
          />
          <span className="text-xs text-gray-400">至</span>
          <input
            type="number"
            min={1900}
            max={2025}
            value={yearRange[1]}
            onChange={(e) => {
              const val = Math.max(1900, Math.min(2025, Number(e.target.value)))
              onYearRangeChange([Math.min(yearRange[0], val), val])
            }}
            className="w-24 px-2 py-1 text-xs border border-gray-200 rounded"
          />
        </div>
      </div>

      {/* 重置按钮 */}
      <button
        onClick={onReset}
        className="mt-4 w-full px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        重置筛选
      </button>
    </div>
  )
}
