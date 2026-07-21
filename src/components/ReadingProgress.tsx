'use client'

import { useEffect, useState } from 'react'

interface ReadingProgressProps {
  progress?: number
  hasSavedProgress?: boolean
  onContinueReading?: () => void
  title?: string
}

export default function ReadingProgress({ progress: externalProgress, hasSavedProgress, onContinueReading, title }: ReadingProgressProps) {
  const [internalProgress, setInternalProgress] = useState(0)
  
  const progress = externalProgress ?? internalProgress

  useEffect(() => {
    if (externalProgress !== undefined) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setInternalProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [externalProgress])

  if (externalProgress !== undefined) {
    // LetterReader内部使用模式
    return (
      <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 py-3 sticky top-1 z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted dark:text-dark-muted">{title}</span>
            <div className="flex items-center gap-3">
              {hasSavedProgress && onContinueReading && (
                <button
                  onClick={onContinueReading}
                  className="text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary transition-colors"
                >
                  继续阅读
                </button>
              )}
              <span className="text-text-muted dark:text-dark-muted">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary dark:bg-primary-light transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  // 全局进度条模式
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
      <div
        className="h-full bg-primary dark:bg-primary-light transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}