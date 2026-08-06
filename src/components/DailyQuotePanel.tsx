'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DailyQuote, DailyQuoteSpeaker } from '@/lib/daily-quote'

const SPEAKER_NAME: Record<DailyQuoteSpeaker, string> = {
  buffett: '沃伦·巴菲特',
  munger: '查理·芒格',
}

interface DailyQuotePanelProps {
  quotes: DailyQuote[]
}

export default function DailyQuotePanel({ quotes }: DailyQuotePanelProps) {
  const [index, setIndex] = useState(0)

  if (quotes.length === 0) return null

  const quote = quotes[index]

  return (
    <div className="daily-quote">
      <div className="daily-quote__card">
        <blockquote className="daily-quote__quote">“{quote.quote}”</blockquote>
        <div className="daily-quote__meta">
          <span className="daily-quote__speaker">{SPEAKER_NAME[quote.speaker]}</span>
          <span className="daily-quote__source">{quote.source}</span>
        </div>
        <div className="daily-quote__nav">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            aria-label="上一条"
          >
            <ChevronLeft size={15} aria-hidden="true" /> 上一条
          </button>
          <button
            type="button"
            disabled={index === quotes.length - 1}
            onClick={() => setIndex(i => Math.min(quotes.length - 1, i + 1))}
            aria-label="下一条"
          >
            下一条 <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
