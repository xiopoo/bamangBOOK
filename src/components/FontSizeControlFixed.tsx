'use client'

import { useState, useEffect } from 'react'

interface FontSizeControlFixedProps {
  defaultSize?: number
}

export default function FontSizeControlFixed({ defaultSize = 16 }: FontSizeControlFixedProps) {
  const [fontSize, setFontSize] = useState(defaultSize)

  const minSize = 12
  const maxSize = 20
  const step = 2

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + step, maxSize))
  }

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - step, minSize))
  }

  useEffect(() => {
    // 使用CSS变量控制字体大小，确保只影响文本内容
    document.documentElement.style.setProperty('--text-size-base', `${fontSize}px`)
  }, [fontSize])

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={decreaseFontSize}
        disabled={fontSize <= minSize}
        className="text-lg font-bold text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="缩小字体"
      >
        A-
      </button>
      <span className="text-sm text-text-muted dark:text-dark-muted w-12 text-center">
        {fontSize}px
      </span>
      <button
        onClick={increaseFontSize}
        disabled={fontSize >= maxSize}
        className="text-lg font-bold text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="放大字体"
      >
        A+
      </button>
    </div>
  )
}