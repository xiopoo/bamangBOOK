import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import {
  getPartnershipYearGroups,
  formatPartnershipSubtitle,
  formatPartnershipLabel,
  type PartnershipLetter,
} from '@/lib/partnership'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '巴菲特致合伙人信',
  description: '1956–1970 年巴菲特致合伙人信全集：从第一封记录开始，看巴菲特怎样向合伙人解释业绩、风险与评价投资结果。',
  alternates: { canonical: '/partnership' },
  openGraph: {
    title: '巴菲特致合伙人信｜复利书房',
    description: '1956–1970 年致合伙人信全集，按年份连续阅读。',
  },
}

export default function PartnershipPage() {
  const yearGroups = getPartnershipYearGroups()

  // 跨度年份（首末）
  const firstYear = yearGroups[0]?.year
  const lastYear = yearGroups[yearGroups.length - 1]?.year

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="巴菲特致合伙人信"
        subtitle={`${firstYear}-${lastYear}年 · 巴菲特合伙基金时期`}
        backHref="/buffett"
        backLabel="返回巴菲特主页"
        sticky
      />

      {/* 按年份分组的时间轴列表：仅列出有信件的月份，完全响应式 */}
      <div className="space-y-8">
        {yearGroups.map((group) => (
          <section key={group.year} className="archive-card archive-card--plain overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 dark:bg-primary/10 border-b border-primary/10">
              <span className="text-xl font-bold text-primary dark:text-primary-light font-serif">
                {group.year}年
              </span>
              <span className="archive-chip archive-chip--oxblood">
                {group.letters.length}封
              </span>
              <div className="flex-1 h-px bg-primary/10" />
            </div>

            <ul className="divide-y divide-primary/5">
              {group.letters.map((letter) => (
                <LetterRow key={letter.filename} letter={letter} />
              ))}
            </ul>
          </section>
        ))}
      </div>

    </PageContainer>
  )
}

/** 单封信件的可点击行：年份 + 日期标签 + 类型 */
function LetterRow({
  letter,
}: {
  letter: PartnershipLetter
}) {
  const label = formatPartnershipLabel(letter)
  const date = formatPartnershipSubtitle(letter.subtitle)
  const href = `/partnership/${letter.id}`
  const isAgreement = letter.filename.includes('有限合伙协议')

  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-primary/[0.03] dark:hover:bg-primary/5"
      >
        <span
          className={`shrink-0 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium border rounded-none ${
            isAgreement
              ? 'archive-chip archive-chip--gold'
              : 'archive-chip group-hover:border-primary group-hover:text-primary dark:group-hover:border-primary-light dark:group-hover:text-primary-light'
          }`}
        >
          {date}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-text dark:text-dark-text">
          {label}
        </span>
        <span className="shrink-0 text-primary/50 dark:text-primary-light/50 text-lg leading-none transition-transform group-hover:translate-x-0.5">
          ›
        </span>
      </Link>
    </li>
  )
}
