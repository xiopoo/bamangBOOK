'use client'

import { useEffect, useState } from 'react'

interface FontSizeControlFixedProps {
  defaultSize?: number
}

const STORAGE_KEY = 'reader-font-size'
// 与 reading.css:root 中 --reading-base-min / --reading-base-default / --reading-base-max 对齐
const MIN_SIZE = 17
const DEFAULT_SIZE = 19
const MAX_SIZE = 26
const STEP = 2

function clampSize(value: number) {
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, value))
}

function applySize(value: number) {
  const root = document.documentElement
  root.style.setProperty('--text-size-base', `${value}px`)
  root.dataset.readerFontSize = String(value)
  // FOUC 配套：保证 html.reading-no-fouc class 在应用尺寸时依然生效
  root.classList.add('reading-no-fouc')
}

export default function FontSizeControlFixed({
  defaultSize = DEFAULT_SIZE,
}: FontSizeControlFixedProps) {
  const [fontSize, setFontSize] = useState(defaultSize)

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY))
    const initial = clampSize(
      Number.isFinite(stored) && stored > 0 ? stored : defaultSize
    )
    setFontSize(initial)
    applySize(initial)
  }, [defaultSize])

  const changeSize = (delta: number) => {
    setFontSize((current) => {
      const next = clampSize(current + delta)
      applySize(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // 字号仍会在当前页面生效；仅忽略浏览器存储不可用的情况。
      }
      return next
    })
  }

  return (
    <div className="reader-font-control" role="group" aria-label="正文文字大小">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          changeSize(-STEP)
        }}
        disabled={fontSize <= MIN_SIZE}
        aria-label="缩小正文文字"
        title="缩小字体"
      >
        A−
      </button>
      <output aria-live="polite" aria-label="当前正文字号">
        {fontSize}px
      </output>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          changeSize(STEP)
        }}
        disabled={fontSize >= MAX_SIZE}
        aria-label="放大正文文字"
        title="放大字体"
      >
        A+
      </button>
    </div>
  )
}
