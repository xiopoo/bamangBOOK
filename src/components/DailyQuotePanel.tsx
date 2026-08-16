'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DailyQuote, DailyQuoteSpeaker } from '@/lib/daily-quote'

const SPEAKER_NAME: Record<DailyQuoteSpeaker, string> = {
  buffett: '沃伦·巴菲特',
  munger: '查理·芒格',
}

const STATUS_LABEL: Record<string, string> = {
  'as recalled': '据回忆整理',
  attributed: '归属待核实',
  verification: '待核实',
}

/** 自 1970-01-01 起的天数（UTC） */
function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
}

/** 以日期为 seed 的确定性索引：每天一条，次日顺移 */
function indexForDate(quotes: DailyQuote[], date: Date): number {
  if (quotes.length === 0) return 0
  return ((dayNumber(date) % quotes.length) + quotes.length) % quotes.length
}

function parseQueryDate(query: string): Date | null {
  const match = query.match(/[?&]date=(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
}

function formatDateCN(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function toQueryDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

interface DailyQuotePanelProps {
  quotes: DailyQuote[]
  /** 服务端预渲染使用的日期（YYYY-MM-DD），避免 hydration 闪烁 */
  initialDateISO: string
}

export default function DailyQuotePanel({ quotes, initialDateISO }: DailyQuotePanelProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const [y, m, d] = initialDateISO.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d))
  })

  useEffect(() => {
    // 挂载后：优先跟随 URL 的 ?date=，否则回到“今天”
    const applyDate = () => {
      const fromQuery = parseQueryDate(window.location.search)
      setSelectedDate(fromQuery ?? new Date())
    }
    applyDate()
    window.addEventListener('popstate', applyDate)
    return () => window.removeEventListener('popstate', applyDate)
  }, [])

  if (quotes.length === 0) return null

  const index = indexForDate(quotes, selectedDate)
  const quote = quotes[index]

  const shiftDay = (delta: number) => {
    setSelectedDate(prev => {
      const next = new Date(prev)
      next.setDate(next.getDate() + delta)
      const url = new URL(window.location.href)
      url.searchParams.set('date', toQueryDate(next))
      window.history.replaceState(null, '', url)
      return next
    })
  }

  const statusLabel = quote.status ? STATUS_LABEL[quote.status] : null
  // 出处本身已含年份时（如“1996 annual letter”），不再重复显示独立年份
  const sourceHasYear = /(?:19|20)\d{2}/.test(quote.source)

  return (
    <div className="daily-quote">
      <div className="daily-quote__card">
        <p className="daily-quote__date">{formatDateCN(selectedDate)}</p>
        <blockquote className="daily-quote__quote">“{quote.quote}”</blockquote>
        <div className="daily-quote__meta">
          <span className="daily-quote__speaker">{SPEAKER_NAME[quote.speaker]}</span>
          <span className="daily-quote__source">
            {!sourceHasYear && quote.year ? `${quote.year} · ` : ''}{quote.source}
          </span>
        </div>
        <div className="daily-quote__footer">
          <Link className="daily-quote__topic" href={quote.href}>
            {quote.topic} <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          {statusLabel && <span className="daily-quote__status">{statusLabel}</span>}
        </div>
        <div className="daily-quote__nav">
          <button type="button" onClick={() => shiftDay(-1)} aria-label="前一天">
            <ChevronLeft size={15} aria-hidden="true" /> 前一天
          </button>
          <span className="daily-quote__nav-hint">每天一句，选自可核验的原文</span>
          <button type="button" onClick={() => shiftDay(1)} aria-label="后一天">
            后一天 <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
