'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
// 仅类型导入：DailyReading 是纯类型，编译期会被擦除，不会把 daily-reading.ts
// 中依赖 fs 的服务端代码打进客户端包。
import type { DailyReading } from '@/lib/daily-reading'

/**
 * 与 src/lib/daily-reading.ts 的 dailyReadingForDate 同构的纯函数。
 * 此处内联而非直接 import，是为了避免把依赖 fs 的 daily-reading.ts 整模块
 * 打进客户端 bundle（会导致构建报错）。若 daily-reading.ts 拆分出纯逻辑模块，
 * 可改回共享导入。
 */
function dailyReadingForDate(readings: DailyReading[], date: Date): DailyReading | null {
  if (readings.length === 0) return null
  const days = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  return readings[((days % readings.length) + readings.length) % readings.length]
}

function formatDateCN(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function parseQueryDate(query: string): Date | null {
  const match = query.match(/[?&]date=(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
}

interface DailyReadingPanelProps {
  /** 构建期确定的精选池（daily-reading.ts 用固定 seed 洗牌，跨构建稳定） */
  readings: DailyReading[]
  /** 服务端预渲染使用的日期（YYYY-MM-DD），避免 hydration 闪烁 */
  initialDateISO: string
}

export default function DailyReadingPanel({ readings, initialDateISO }: DailyReadingPanelProps) {
  // 初始值用构建期日期，与静态导出的 HTML 保持一致，避免 hydration mismatch。
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const [y, m, d] = initialDateISO.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d))
  })

  useEffect(() => {
    // 挂载后：优先跟随 URL 的 ?date=，否则回到“今天”。
    // 关键修复：静态导出页的服务端 new Date() 冻结在构建时刻，这里在浏览器端
    // 取真实当前日期，使“今日一读”随日期滚动。
    const applyDate = () => {
      const fromQuery = parseQueryDate(window.location.search)
      setSelectedDate(fromQuery ?? new Date())
    }
    applyDate()
    window.addEventListener('popstate', applyDate)
    return () => window.removeEventListener('popstate', applyDate)
  }, [])

  const todayReading = dailyReadingForDate(readings, selectedDate)
  if (!todayReading) return null

  return (
    <section className="archive-home__section archive-featured" aria-labelledby="featured-reading-title">
      <div className="archive-featured__meta">
        <p className="archive-kicker">今日一读 · {formatDateCN(selectedDate)}</p>
        <div className="archive-featured__tags">
          <span>{todayReading.typeLabel}</span>
          <span>{todayReading.year || '年份待考'}</span>
          <span>约 {todayReading.readMinutes} 分钟</span>
        </div>
      </div>
      <div className="archive-featured__body">
        <h2 id="featured-reading-title">{todayReading.title}</h2>
        <p>{todayReading.excerpt}</p>
        <Link href={todayReading.href}>阅读原文 <ArrowRight size={16} /></Link>
      </div>
    </section>
  )
}
