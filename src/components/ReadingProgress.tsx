'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  saveProgress,
  type ReadingProgressType,
} from '@/lib/reading-progress'

interface ReadingProgressProps {
  progress?: number
  hasSavedProgress?: boolean
  onContinueReading?: () => void
  title?: string
  /** 全局模式下的阅读历史记录信息（P1-03 统一双存储：滚动保存 reader-position 的同时写入 reading_progress）。 */
  historyTitle?: string
  historyYear?: string
}

/**
 * P1-03 修复：将 pathname 映射为阅读历史条目类型。
 * letters 路由刻意不在映射内——该页由 LetterReader / useReadingProgress 负责写入历史，
 * 避免同一页面重复产生两条记录。
 */
const HISTORY_ROUTE_MAP: ReadonlyArray<readonly [string, ReadingProgressType]> = [
  ['/munger/wesco', 'wesco'],
  ['/munger/archive', 'archive'],
  ['/poor-charlies-almanack', 'almanack'],
  ['/business-history', 'business-history'],
  ['/duanyongping', 'duanyongping'],
  ['/partnership', 'partnership'],
  ['/concepts', 'concept'],
  ['/companies', 'company'],
  ['/people', 'people'],
  ['/interviews', 'interviews'],
  ['/talks', 'talks'],
  ['/qa', 'qa'],
  ['/model', 'model'],
  ['/books', 'book'],
  ['/columns', 'column'],
  ['/bloggers', 'blogger'],
]

function inferHistoryType(pathname: string): ReadingProgressType | null {
  for (const [prefix, type] of HISTORY_ROUTE_MAP) {
    if (pathname.startsWith(prefix)) return type
  }
  return null
}

function resolveHistoryTitle(propTitle?: string): string {
  if (propTitle && propTitle.trim()) return propTitle.trim()
  // 兜底：从页面 h1 或 document.title 提取（title 模板为 "标题 · 分类 | 站点名"）
  const h1 = document.querySelector('h1')?.textContent?.trim()
  if (h1) return h1
  const title = document.title
  const idx = title.indexOf(' | ')
  return idx > 0 ? title.slice(0, idx).replace(/ · .*$/, '') : title
}

export default function ReadingProgress({ progress: externalProgress, hasSavedProgress, onContinueReading, title, historyTitle, historyYear }: ReadingProgressProps) {
  const [internalProgress, setInternalProgress] = useState(0)
  const [savedPosition, setSavedPosition] = useState<number | null>(null)
  const [showResume, setShowResume] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()
  
  const progress = externalProgress ?? internalProgress

  useEffect(() => {
    if (externalProgress !== undefined) return

    const storageKey = `reader-position:${pathname}`
    const historyType = inferHistoryType(pathname)
    try {
      const saved = Number(localStorage.getItem(storageKey))
      if (Number.isFinite(saved) && saved > 200) {
        setSavedPosition(saved)
        setShowResume(true)
      }
    } catch {
      // Reading remains available when storage is disabled.
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setInternalProgress(Math.min(100, Math.max(0, scrollPercent)))
      if (window.scrollY > 100) setShowResume(false)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, String(Math.round(window.scrollY)))
          // P1-03：与 reader-position 同步写入统一阅读历史（reading_progress），
          // letterId 取完整路径，确保 /history 可跳转回原文。
          if (historyType) {
            const docHeightTotal = document.documentElement.scrollHeight
            saveProgress({
              letterId: pathname.slice(1),
              letterType: historyType,
              scrollPosition: scrollTop,
              totalHeight: docHeightTotal,
              paragraphIndex: 0,
              totalParagraphs: 0,
              progress: Math.min(100, Math.max(0, Math.round(scrollPercent))),
              lastReadAt: new Date().toISOString(),
              title: resolveHistoryTitle(historyTitle),
              year: historyYear || pathname.match(/(\d{4})/)?.[1],
            })
          }
        } catch { /* ignore */ }
      }, 350)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [externalProgress, pathname, historyTitle, historyYear])

  if (externalProgress !== undefined) {
    // LetterReader内部使用模式
    return (
      <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 py-3">
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
  return <>
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50" aria-hidden="true">
      <div className="h-full bg-primary dark:bg-primary-light transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />
    </div>
    {showResume && savedPosition && <aside className="fixed bottom-5 left-1/2 z-40 flex min-h-11 -translate-x-1/2 items-center gap-3 border border-[var(--archive-rule)] bg-[var(--archive-paper)] px-4 py-2 text-xs shadow-lg" aria-label="恢复阅读位置">
      <button type="button" className="font-semibold text-primary" onClick={() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: savedPosition, behavior: reduced ? 'auto' : 'smooth' })
        setShowResume(false)
      }}>回到上次位置</button>
      <button type="button" className="text-[var(--archive-ink-faint)]" onClick={() => {
        try { localStorage.removeItem(`reader-position:${pathname}`) } catch { /* ignore */ }
        setSavedPosition(null)
        setShowResume(false)
        window.scrollTo({ top: 0, behavior: 'auto' })
      }}>从头开始</button>
    </aside>}
  </>
}
