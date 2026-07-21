import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import PageFooter from '@/components/PageFooter'
import { getShareholderLetters, getShareholderCount } from '@/lib/partnership'

// 股东信按"年代"分组，便于纵览60+年脉络
const DECADES: { label: string; range: [number, number] }[] = [
  { label: '60年代', range: [1960, 1969] },
  { label: '70年代', range: [1970, 1979] },
  { label: '80年代', range: [1980, 1989] },
  { label: '90年代', range: [1990, 1999] },
  { label: '00年代', range: [2000, 2009] },
  { label: '10年代', range: [2010, 2019] },
  { label: '20年代', range: [2020, 2029] },
]

export default function LettersPage() {
  const letters = getShareholderLetters()
  const totalCount = getShareholderCount()
  const years = letters.map((l) => l.year)
  const firstYear = years[years.length - 1]
  const lastYear = years[0]

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="巴菲特致股东信"
        subtitle={`${firstYear}-${lastYear}年 · 伯克希尔哈撒韦年度致股东信完整收录`}
        backHref="/buffett"
        backLabel="返回巴菲特主页"
        sticky
      />

      {/* 概览统计 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatBadge icon="📬" count={`${totalCount}封`} label="股东信" sub="年度信件" />
        <StatBadge icon="📅" count={`${lastYear - firstYear + 1}年`} label="时间跨度" sub={`${firstYear}-${lastYear}`} />
        <StatBadge icon="🏭" count="伯克希尔" label="时期" sub="哈撒韦" />
        <StatBadge icon="🤝" count="前期" label="合伙人信" sub="1956-1970见此→" href="/partnership" />
      </div>

      {/* 时期衔接说明：合伙人信 → 股东信 */}
      <div className="mb-10 p-5 rounded-card bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 border border-primary/10">
        <p className="text-sm text-text-muted dark:text-dark-muted leading-relaxed">
          <span className="font-medium text-primary dark:text-primary-light">股东信时期</span>
          始于1965年巴菲特取得伯克希尔控制权。
          在此之前的
          <Link href="/partnership" className="text-primary dark:text-primary-light underline decoration-primary/40 hover:decoration-primary mx-1 font-medium">
            合伙基金时期（1956-1970）
          </Link>
          的信件另成一册。
          两类信件已完全分离，本页面仅展示股东信内容。
        </p>
      </div>

      {/* 按年代分组的年份网格 */}
      <div className="space-y-8">
        {DECADES.map((decade) => {
          const decadeLetters = letters.filter(
            (l) => l.year >= decade.range[0] && l.year <= decade.range[1]
          )
          if (decadeLetters.length === 0) return null

          return (
            <section key={decade.label}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif">
                  {decade.label}
                </h2>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {decadeLetters.length}封
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3">
                {decadeLetters.map((letter) => (
                  <Link
                    key={letter.year}
                    href={`/letters/${letter.year}`}
                    className="bg-white dark:bg-dark-card p-3 rounded-card border text-center hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 hover:border-primary/40 hover:-translate-y-0.5 transition-all shadow-card border-gray-100 dark:border-dark-border hover:border-primary/30"
                  >
                    <div className="text-base font-semibold text-[#2c2c2c] dark:text-[#e0e0e0]">
                      {letter.year}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <PageFooter />
    </PageContainer>
  )
}
