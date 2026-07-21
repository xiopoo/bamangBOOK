'use client'

import { GraphMode } from './types'

const modes: { value: GraphMode; label: string; icon: string }[] = [
  { value: 'force', label: '力导向图', icon: '◉' },
  { value: 'tree', label: '层级树状图', icon: '⊢' },
  { value: 'mindmap', label: '思维导图', icon: '◎' },
  { value: 'cards', label: '知识卡片集群', icon: '▦' },
]

interface ModeSwitcherProps {
  currentMode: GraphMode
  onModeChange: (mode: GraphMode) => void
}

export default function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="p-4 border-b border-gray-100">
      <h3 className="text-sm font-medium text-gray-700 mb-3">可视化模式</h3>
      <div className="grid grid-cols-2 gap-2">
        {modes.map(mode => (
          <button
            key={mode.value}
            onClick={() => onModeChange(mode.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
              currentMode === mode.value
                ? 'bg-primary/10 text-primary border border-primary/20 font-medium'
                : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm">{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
