'use client'

import { X } from 'lucide-react'
import { GraphNode, colorMap, bgColorMap, typeLabels } from './types'

interface RelatedNode extends GraphNode {
  relationWeight: number
}

interface NodeDetailPanelProps {
  node: GraphNode
  relatedNodes: RelatedNode[]
  onClose: () => void
  onNodeClick: (node: GraphNode) => void
}

export default function NodeDetailPanel({ node, relatedNodes, onClose, onNodeClick }: NodeDetailPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: colorMap[node.type] }}
            />
            <h3 className="text-lg font-bold">{node.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* 类型标签和提及次数 */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColorMap[node.type]}`}>
              {typeLabels[node.type]}
            </span>
            <span className="text-sm text-gray-500">
              提及 <strong className="text-gray-700">{node.count}</strong> 次
            </span>
          </div>

          {/* 相关年份 */}
          {node.years && node.years.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">相关年份</h4>
              <div className="flex flex-wrap gap-1">
                {node.years.slice(0, 10).map(year => (
                  <span key={year} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {year}
                  </span>
                ))}
                {node.years.length > 10 && (
                  <span className="px-2 py-0.5 text-gray-400 text-xs">
                    +{node.years.length - 10} 更多
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 描述 */}
          {node.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{node.description}</p>
          )}

          {/* 关联实体 */}
          {relatedNodes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                关联实体
                <span className="text-gray-400 font-normal ml-1">({relatedNodes.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {relatedNodes.map(rn => (
                  <button
                    key={rn.id}
                    onClick={() => onNodeClick(rn)}
                    className="group relative"
                  >
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${bgColorMap[rn.type]} hover:opacity-80 transition-opacity inline-flex items-center gap-1.5`}
                    >
                      {rn.name}
                      <span className="text-[10px] opacity-60">×{rn.relationWeight}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {relatedNodes.length === 0 && (
            <p className="text-sm text-gray-400">暂无关联实体</p>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
          点击其他节点查看 · 点击空白关闭
        </div>
      </div>
    </div>
  )
}
