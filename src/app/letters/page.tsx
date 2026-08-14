import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getShareholderLetters } from '@/lib/partnership'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '巴菲特股东信全集',
  description: '伯克希尔·哈撒韦历年股东信，按年份连续阅读，观察一种投资方法怎样在真实决策中形成。',
  alternates: { canonical: '/letters' },
  openGraph: {
    title: '巴菲特股东信全集｜复利书房',
    description: '伯克希尔历年股东信，按年份连续阅读。',
  },
}

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
  const years = letters.map((l) => l.year)
  const firstYear = Math.min(...years)
  const lastYear = Math.max(...years)

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="巴菲特致股东信"
        subtitle={`${firstYear}-${lastYear}年 · 伯克希尔哈撒韦年度致股东信`}
        backHref="/buffett"
        backLabel="返回巴菲特主页"
        sticky
      />

      <p className="text-sm text-text-muted dark:text-dark-muted mb-8">
        1965 年前，巴菲特以合伙基金方式管理资金，<Link href="/partnership" className="underline decoration-primary/40 hover:decoration-primary">合伙人信（1956—1970）</Link>另成一册。
      </p>

      <div className="archive-list archive-list--catalog">
        {DECADES.map((decade) => {
          const decadeLetters = letters.filter(
            (l) => l.year >= decade.range[0] && l.year <= decade.range[1]
          )
          if (decadeLetters.length === 0) return null

          return <section key={decade.label} className="archive-catalog-section"><header><h2>{decade.label}</h2><span>{decadeLetters.length} 封</span></header>{decadeLetters.map(letter => <Link key={letter.year} href={`/letters/${letter.year}`} className="archive-catalog-row" style={{ gridTemplateColumns: '4.5rem minmax(0, 1.6fr) 1fr 1rem' }}><span className="archive-catalog-row__year">{letter.year}</span><span className="archive-catalog-row__title">巴菲特致伯克希尔股东的信</span><span className="archive-catalog-row__type">中文译文</span><span aria-hidden="true">→</span></Link>)}</section>
        })}
      </div>

    </PageContainer>
  )
}
