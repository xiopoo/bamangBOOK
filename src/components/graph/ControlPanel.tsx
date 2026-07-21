'use client'

import { ZoomIn, ZoomOut, Maximize2, RefreshCw, X } from 'lucide-react'
import { GraphNode, NodeType, GraphMode, colorMap, typeLabels, typeList } from './types'
import GraphSearchBar from './GraphSearchBar'
import FilterPanel from './FilterPanel'
import ModeSwitcher from './ModeSwitcher'

interface ControlPanelProps {
  nodes: GraphNode[]
  linksCount: number
  activeFilters: NodeType[]
  onToggleFilter: (type: NodeType) => void
  weightThreshold: number
  onWeightThresholdChange: (value: number) => void
  yearRange: [number, number]
  onYearRangeChange: (range: [number, number]) => void
  onReset: () => void
  currentMode: GraphMode
  onModeChange: (mode: GraphMode) => void
  onSearchSelect: (node: GraphNode) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitScreen: () => void
  onResetView: () => void
  zoomLevel: number
  stats: { totalNodes: number; totalLinks: number } | null
  counts?: Record<NodeType, number>
  showMobile: boolean
  onCloseMobile: () => void
}

export default function ControlPanel({
  nodes,
  linksCount,
  activeFilters,
  onToggleFilter,
  weightThreshold,
  onWeightThresholdChange,
  yearRange,
  onYearRangeChange,
  onReset,
  currentMode,
  onModeChange,
  onSearchSelect,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onResetView,
  zoomLevel,
  stats,
  counts,
  showMobile,
  onCloseMobile,
}: ControlPanelProps) {
  return (
    <>
      {/* 平板端(768-1023px)半透明遮罩层，点击关闭面板 */}
      {showMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-30 hidden md:block lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          /* 移动端 (<768px): 底部弹出面板 (Bottom Sheet) */
          fixed bottom-0 left-0 right-0 z-50
          bg-white flex flex-col overflow-y-auto
          transition-transform duration-300 ease-in-out
          rounded-t-2xl shadow-xl
          max-h-[70vh]
          ${showMobile ? 'translate-y-0' : 'translate-y-full'}

          /* 平板端 (768-1023px): 左侧滑出抽屉 */
          md:rounded-none md:max-h-none md:shadow-lg
          md:fixed md:inset-y-0 md:left-0 md:w-72 md:z-40
          md:translate-y-0
          ${showMobile ? 'md:translate-x-0' : 'md:-translate-x-full'}

          /* 桌面端 (>=1024px): 静态侧边栏 */
          lg:static lg:z-auto lg:translate-x-0 lg:shadow-none
          lg:w-64 lg:border-r lg:border-gray-200
          lg:flex lg:flex-col lg:overflow-y-auto
        `}
      >
        {/* 面板头部（移动端和平板端显示关闭按钮） */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
          <span className="text-sm font-medium text-gray-700">控制面板</span>
          <button
            onClick={onCloseMobile}
            className="p-3 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="关闭面板"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 搜索 */}
        <div className="p-4 border-b border-gray-100">
          <GraphSearchBar nodes={nodes} onSelect={onSearchSelect} />
        </div>

        {/* 模式切换 */}
        <ModeSwitcher currentMode={currentMode} onModeChange={onModeChange} />

        {/* 类型筛选 */}
        <FilterPanel
          activeFilters={activeFilters}
          onToggleFilter={onToggleFilter}
          weightThreshold={weightThreshold}
          onWeightThresholdChange={onWeightThresholdChange}
          yearRange={yearRange}
          onYearRangeChange={onYearRangeChange}
          onReset={onReset}
          counts={counts}
        />

        {/* 图例 - 移动端折叠 */}
        <div className="hidden md:block p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">图例</h3>
          <div className="space-y-2 text-sm">
            {typeList.map(type => (
              <div key={type} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colorMap[type] }} />
                <span className="text-gray-600">{typeLabels[type]}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
              <div className="flex items-center gap-3 text-gray-400 text-xs">
                <span className="w-6 h-0 border-t border-gray-300"></span>
                <span>共现关联 (概念-概念)</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-xs">
                <span className="w-6 h-0 border-t-2 border-dashed border-gray-300"></span>
                <span>提及关联 (跨类型)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 节点尺寸图例 - 移动端折叠 */}
        <div className="hidden md:block p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">节点尺寸</h3>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-orange-600 shrink-0 border-2 border-white ring-1 ring-orange-300" />
              <span>高频节点 (提及 &gt;50 次)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
              <span>中频节点 (提及 10–50 次)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-300 shrink-0" />
              <span>低频节点 (提及 &lt;10 次)</span>
            </div>
          </div>
        </div>

        {/* 缩放控制 */}
        <div className="p-4 border-b border-gray-100 md:border-b-0">
          <h3 className="text-sm font-medium text-gray-700 mb-3">图谱控制</h3>
          <div className="flex gap-2">
            <button onClick={onZoomIn} className="p-3 min-w-[44px] min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center" title="放大">
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={onZoomOut} className="p-3 min-w-[44px] min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center" title="缩小">
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={onFitScreen} className="p-3 min-w-[44px] min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center" title="适应屏幕">
              <Maximize2 className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={onResetView} className="p-3 min-w-[44px] min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center" title="重置">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            缩放: {zoomLevel.toFixed(1)}x
          </div>
        </div>

        {/* 底部统计信息 - 移动端折叠 */}
        <div className="hidden md:block p-4 mt-auto border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">统计信息</h3>
          <div className="text-xs text-gray-500 space-y-1">
            <p>节点总数：<span className="font-medium text-gray-700">{stats?.totalNodes || 0}</span></p>
            <p>关系总数：<span className="font-medium text-gray-700">{stats?.totalLinks || 0}</span></p>
            <p>当前显示：<span className="font-medium text-gray-700">{nodes.length} 节点 / {linksCount} 关系</span></p>
          </div>
        </div>

        {/* 使用说明 - 仅桌面端显示 */}
        <div className="hidden lg:block p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            拖拽节点调整布局 · 滚轮缩放 · 悬停高亮关联 · 点击查看详情
          </p>
        </div>
      </aside>
    </>
  )
}
