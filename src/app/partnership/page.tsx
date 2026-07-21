import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import PageFooter from '@/components/PageFooter'
import {
  getPartnershipYearGroups,
  getPartnershipCount,
  formatPartnershipSubtitle,
  type PartnershipLetter,
} from '@/lib/partnership'

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

      {/* 年份时间轴 */}
      <div className="relative pl-6 border-l-2 border-primary/15 space-y-4">
        {yearGroups.map((group) => (
          <div key={group.year} className="relative">
            {/* 时间轴节点 */}
            <span className="absolute -left-[1.95rem] top-3 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-bg-card dark:ring-dark-bg" />

            <div className="bg-bg-card dark:bg-dark-card rounded-card border border-primary/10 p-4 sm:p-5 hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary dark:text-primary-light font-serif">
                    {group.year}
                  </span>
                  <span className="text-sm text-text-muted dark:text-dark-muted">年</span>
                </div>
                <span className="text-xs px-2.5 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full font-medium">
                  {group.letters.length}封
                </span>
              </div>

              {group.letters.length === 1 ? (
                <LetterChip letter={group.letters[0]} year={group.year} single />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {group.letters.map((letter) => (
                    <LetterChip key={letter.filename} letter={letter} year={group.year} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <PageFooter />
    </PageContainer>
  )
}

/** 单封信件的可点击标签 */
function LetterChip({
  letter,
  year,
  single = false,
}: {
  letter: PartnershipLetter
  year: number
  single?: boolean
}) {
  const label = single ? '致合伙人信' : `${formatPartnershipSubtitle(letter.subtitle)}信`
  const href = `/partnership/${letter.id}`
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-3.5 py-1.5 rounded-card border border-primary/10 text-sm font-medium text-text dark:text-dark-text hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary-light transition-all ${
        single ? 'text-base py-2' : ''
      }`}
    >
      {label}
    </Link>
  )
}
