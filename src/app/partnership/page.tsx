import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '巴菲特合伙人信',
  description: '1956—1970年巴菲特合伙企业时期的信件、协议与投资方法演变。',
  alternates: { canonical: '/partnership' },
}
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import PageFooter from '@/components/PageFooter'
import {
  getPartnershipYearGroups,
  getPartnershipCount,
  getPartnershipTimelineSlot,
  formatPartnershipLabel,
  type PartnershipLetter,
} from '@/lib/partnership'

const monthLabels = Array.from({ length: 12 }, (_, index) => `${index + 1}月`)

export default function PartnershipPage() {
  const yearGroups = getPartnershipYearGroups()
  const totalCount = getPartnershipCount()
  const yearSpan = yearGroups.length

  // 跨度年份（首末）
  const firstYear = yearGroups[0]?.year
  const lastYear = yearGroups[yearGroups.length - 1]?.year

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="巴菲特致合伙人信"
        subtitle={`${firstYear}-${lastYear}年 · 巴菲特合伙基金时期完整收录`}
        backHref="/buffett"
        backLabel="返回巴菲特主页"
        sticky
      />

      {/* 概览：三张统计卡 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
        <StatBadge
          icon="📝"
          count={`${totalCount}封`}
          label="合伙人信"
          sub="完整收录"
        />
        <StatBadge
          icon="📅"
          count={`${yearSpan}年`}
          label="时间跨度"
          sub={`${firstYear}-${lastYear}`}
        />
        <StatBadge
          icon="🤝"
          count="合伙基金"
          label="时期"
          sub="巴菲特投资起点"
          variant="highlight"
        />
      </div>

      {/* 时期说明 */}
      <div className="mb-8 p-5 rounded-card bg-bg-card dark:bg-dark-card border border-primary/10">
        <p className="text-sm text-text-muted dark:text-dark-muted leading-relaxed">
          <span className="font-medium text-primary dark:text-primary-light">合伙基金时期</span>
          （1956-1970）是巴菲特投资生涯的起点。26岁的巴菲特带着家人和朋友的支持回到奥马哈创立合伙基金，
          这14年间的致合伙人信奠定了他日后全部投资哲学的基础——
          <span className="text-text dark:text-dark-text">「市场先生」「能力圈」「安全边际」</span>
          等核心思想，都最早在这里成形。
        </p>
      </div>

      {/* 年份月份表 */}
      <div className="overflow-x-auto rounded-card border border-primary/10 bg-bg-card dark:bg-dark-card shadow-card">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[88px_repeat(12,minmax(68px,1fr))] border-b border-primary/10 bg-primary/5 dark:bg-primary/10">
            <div className="px-4 py-3 text-sm font-semibold text-primary dark:text-primary-light">
              年份
            </div>
            {monthLabels.map((month) => (
              <div
                key={month}
                className="px-2 py-3 text-center text-xs font-medium text-text-muted dark:text-dark-muted"
              >
                {month}
              </div>
            ))}
          </div>

          <div className="divide-y divide-primary/10">
            {yearGroups.map((group) => {
              const lettersByMonth = group.letters.reduce<Record<number, PartnershipLetter[]>>(
                (slots, letter) => {
                  const month = getPartnershipTimelineSlot(letter.subtitle)
                  if (!slots[month]) slots[month] = []
                  slots[month].push(letter)
                  return slots
                },
                {}
              )

              return (
                <div
                  key={group.year}
                  className="grid grid-cols-[88px_repeat(12,minmax(68px,1fr))] min-h-[72px] hover:bg-primary/[0.03] dark:hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center px-4 py-3 border-r border-primary/10">
                    <span className="text-xl font-bold text-primary dark:text-primary-light font-serif">
                      {group.year}
                    </span>
                  </div>

                  {monthLabels.map((_, index) => {
                    const month = index + 1
                    const letters = lettersByMonth[month] || []

                    return (
                      <div
                        key={month}
                        className="flex min-h-[72px] flex-col items-center justify-center gap-1 border-r border-primary/5 px-1.5 py-2 last:border-r-0"
                      >
                        {letters.map((letter) => (
                          <LetterChip key={letter.filename} letter={letter} />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <PageFooter />
    </PageContainer>
  )
}

/** 单封信件的可点击标签 */
function LetterChip({
  letter,
}: {
  letter: PartnershipLetter
}) {
  const label = formatPartnershipLabel(letter)
  const href = `/partnership/${letter.id}`
  return (
    <Link
      href={href}
      className="inline-flex min-h-8 w-full items-center justify-center rounded-card border border-primary/15 bg-bg dark:bg-dark-bg px-2 py-1 text-center text-xs font-medium leading-snug text-text dark:text-dark-text hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary-light transition-all"
    >
      {label}
    </Link>
  )
}
