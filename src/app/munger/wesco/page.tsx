import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import { getWescoMeetings } from '@/lib/wesco-meetings'

export const metadata: Metadata = {
  title: 'Wesco 股东大会 · 中文问答',
  description: '查理·芒格在 Wesco 股东大会上的中文问答与会议笔记，按年份连续阅读。',
  alternates: { canonical: '/munger/wesco' },
  openGraph: {
    title: 'Wesco 股东大会',
    description: '查理·芒格在 Wesco 股东大会上的中文问答与会议笔记，1987—2011。',
    images: [{ url: '/og-wesco.jpg', width: 1200, height: 630, alt: 'Wesco 股东大会：查理·芒格中文问答' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wesco 股东大会',
    description: '查理·芒格在 Wesco 股东大会上的中文问答与会议笔记，1987—2011。',
    images: ['/og-wesco.jpg'],
  },
}

export default function WescoMeetingsPage() {
  const meetings = getWescoMeetings()
  const transcriptCount = meetings.filter((item) => item.edition === '中文实录').length
  const editorialCount = meetings.filter((item) => item.edition === '中文整理').length
  const firstYear = meetings[0]?.year
  const lastYear = meetings[meetings.length - 1]?.year

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="Wesco 股东大会"
        subtitle="只收录 Wesco 公司股东大会资料。中文实录与英文会议笔记整理版分别标注，不与伯克希尔股东大会混放。"
        backHref="/munger"
        backLabel="返回芒格"
        sticky
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatBadge icon="问" count={`${meetings.length}场`} label="中文可读" sub={`${firstYear}-${lastYear}`} />
        <StatBadge icon="中" count={`${transcriptCount}篇`} label="中文实录" sub="完整逐字稿" />
        <StatBadge icon="编" count={`${editorialCount}篇`} label="中文整理" sub="会议笔记整理" />
        <StatBadge icon="年" count={`${firstYear}-${lastYear}`} label="时间范围" sub="按年份归档" />
      </div>

      <div className="mb-8 text-sm">
        <span className="text-text-muted dark:text-dark-muted">每日期刊股东会另见 </span>
        <Link href="/munger/daily-journal" className="text-primary dark:text-primary-light font-medium hover:underline">每日期刊股东会 →</Link>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-text dark:text-dark-text font-serif">按年份阅读</h2>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {meetings.map((item) => (
            <Link
              key={item.year}
              href={`/munger/wesco/${item.year}`}
              className="group grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-5 border-b border-gray-200 dark:border-gray-700"
            >
              <strong className="font-mono text-sm text-primary dark:text-primary-light">{item.year}</strong>
              <div>
                <h3 className="font-serif font-semibold text-text dark:text-dark-text group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted dark:text-dark-muted">
                  {item.edition} · {(item.wordCount / 1000).toFixed(1)} 千字
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
