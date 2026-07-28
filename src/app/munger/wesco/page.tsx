import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'
import { getWescoMeetings } from '@/lib/wesco-meetings'

export const metadata: Metadata = {
  title: 'Wesco 股东大会 · 中文问答',
  description: '查理·芒格在 Wesco 股东大会上的中文问答与会议笔记，按年份连续阅读。',
  openGraph: {
    title: 'Wesco 股东大会',
    description: '查理·芒格中文问答档案，1996-2011。',
    images: [{ url: '/og-wesco.png', width: 1728, height: 910, alt: 'Wesco 股东大会：查理·芒格中文问答档案' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wesco 股东大会',
    description: '查理·芒格中文问答档案，1996-2011。',
    images: ['/og-wesco.png'],
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
        backLabel="返回芒格档案"
        sticky
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatBadge icon="问" count={`${meetings.length}场`} label="中文可读" sub="Wesco 股东大会" />
        <StatBadge icon="中" count={`${transcriptCount}篇`} label="中文实录" sub="现有完整资料" />
        <StatBadge icon="编" count={`${editorialCount}篇`} label="中文整理" sub="英文会议笔记" />
        <StatBadge icon="年" count={`${firstYear}-${lastYear}`} label="时间范围" sub="按年份归档" />
      </div>

      <div className="mb-8 border-y border-gray-200 dark:border-gray-700 py-4 text-sm text-text-muted dark:text-dark-muted leading-7">
        <p>
          伯克希尔官网的 Wesco 档案提供 1997-2009 年年度股东信，但不提供股东大会问答逐字稿。
          本栏目因此将官方股东信作为同期公司材料，将公开会议笔记标为“中文整理”，避免混淆两种文献。
        </p>
        <Link href="/munger/originals" className="mt-2 inline-block text-primary dark:text-primary-light hover:underline">
          查看 Wesco 官方股东信 →
        </Link>
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

      <PageFooter />
    </PageContainer>
  )
}
