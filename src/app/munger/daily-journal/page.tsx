import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import { getDailyJournalMeetings } from '@/lib/daily-journal'

export const metadata: Metadata = {
  title: '每日期刊股东会 · 中文问答',
  description: '查理·芒格在每日期刊（Daily Journal）股东会上的中文问答，2014—2023 共 11 场。',
  alternates: { canonical: '/munger/daily-journal' },
  openGraph: {
    title: '每日期刊股东会',
    description: '查理·芒格在每日期刊股东会上的中文问答，2014—2023。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '每日期刊股东会',
    description: '查理·芒格在每日期刊股东会上的中文问答，2014—2023。',
  },
}

export default function DailyJournalMeetingsPage() {
  const meetings = getDailyJournalMeetings()
  const shareholderCount = meetings.filter(item => item.kind === '股东会').length
  const firesideCount = meetings.filter(item => item.kind === '炉边谈话').length
  const firstYear = meetings[meetings.length - 1]?.year
  const lastYear = meetings[0]?.year

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="每日期刊股东会"
        subtitle="只收录 Daily Journal（每日期刊）公司股东大会资料，2014—2023 共 11 场。与西科（Wesco）分别归档，不与伯克希尔股东大会混放。"
        backHref="/munger"
        backLabel="返回芒格"
        sticky
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatBadge icon="问" count={`${meetings.length}场`} label="中文可读" sub={`${firstYear}-${lastYear}`} />
        <StatBadge icon="视" count={`${shareholderCount}场`} label="股东大会" sub="含视频记录" />
        <StatBadge icon="谈" count={`${firesideCount}场`} label="炉边谈话" sub="2017 非正式问答" />
        <StatBadge icon="年" count={`${firstYear}-${lastYear}`} label="时间范围" sub="按年份归档" />
      </div>

      <div className="mb-8 text-sm">
        <span className="text-text-muted dark:text-dark-muted">西科股东大会另见 </span>
        <Link href="/munger/wesco" className="text-primary dark:text-primary-light font-medium hover:underline">Wesco 股东大会 →</Link>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-text dark:text-dark-text font-serif">按年份阅读</h2>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {meetings.map((item) => (
            <Link
              key={item.slug}
              href={`/munger/daily-journal/${item.slug}`}
              className="group grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-5 border-b border-gray-200 dark:border-gray-700"
            >
              <strong className="font-mono text-sm text-primary dark:text-primary-light">{item.year}</strong>
              <div>
                <h3 className="font-serif font-semibold text-text dark:text-text group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted dark:text-dark-muted">
                  {item.kind} · {(item.wordCount / 1000).toFixed(1)} 千字
                </p>
              </div>
              <span className="text-text-muted group-hover:text-primary" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

    </PageContainer>
  )
}
