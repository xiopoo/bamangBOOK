import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import ArticleContent from '@/components/ArticleContent'
import JsonLd, { breadcrumbJsonLd } from '@/components/JsonLd'
import { getAllMeetingYears, getMeeting, getMeetingContent, stripMeetingMetadata } from '@/lib/meetings'

interface PageProps { params: { year: string; session: string } }

export function generateStaticParams() {
  return getAllMeetingYears().flatMap(({ year, sessions, clips }) =>
    [...sessions, ...clips].map(item => ({ year: String(year), session: item.session }))
  )
}

export function generateMetadata({ params }: PageProps): Metadata {
  const meeting = getMeeting(Number(params.year), decodeURIComponent(params.session))
  if (!meeting) return { title: '股东大会实录' }
  return {
    title: `${meeting.title}（${meeting.year}） · 股东大会实录`,
    description: meeting.summary || `${meeting.year} 年伯克希尔股东大会问答实录（英文原档）。`,
    alternates: { canonical: `/meetings/${meeting.year}/${encodeURIComponent(meeting.session)}` },
    openGraph: { title: meeting.title, type: 'article' },
  }
}

export default function MeetingDetailPage({ params }: PageProps) {
  const year = Number(params.year)
  const meeting = getMeeting(year, decodeURIComponent(params.session))
  if (!meeting) notFound()
  const content = stripMeetingMetadata(getMeetingContent(meeting))

  const sameYear = getAllMeetingYears().find(y => y.year === year)
  const siblings = sameYear
    ? [...sameYear.sessions, ...sameYear.clips].filter(e => e.session !== meeting.session)
    : []

  const related = siblings.length > 0 ? (
    <section className="mt-10 border-t border-primary/10 pt-6">
      <h2 className="mb-4 text-lg font-semibold text-primary dark:text-primary-light">
        {year} 年其他实录
      </h2>
      <ul className="space-y-2">
        {siblings.slice(0, 8).map(item => (
          <li key={item.session}>
            <Link
              href={`/meetings/${year}/${encodeURIComponent(item.session)}`}
              className="group flex items-center justify-between gap-3 rounded-card border border-primary/15 bg-bg-card px-4 py-2.5 text-sm transition-all hover:border-primary hover:shadow-card-hover dark:border-primary/20 dark:bg-dark-card"
            >
              <span className="min-w-0 truncate text-text-base group-hover:text-primary dark:text-dark-base">{item.title}</span>
              <span className="shrink-0 text-xs text-text-muted dark:text-dark-muted">{item.kind === 'clip' ? '片段' : item.itemCount ? `${item.itemCount} 条` : ''}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  ) : null

  return <>
    <JsonLd data={breadcrumbJsonLd([
      { name: '首页', href: '/' },
      { name: '股东大会问答', href: '/qa' },
      { name: '英文原档实录', href: '/meetings' },
      { name: meeting.title },
    ])} />
    <ReadingArticleShell
      title={meeting.title}
      subtitle={`${meeting.year} 年伯克希尔股东大会 · 英文原档`}
      backHref="/meetings"
      backLabel="返回英文原档实录"
      metadata={{
        person: '巴菲特 / 芒格',
        year: meeting.year,
        contentType: '股东大会',
        readMinutes: Math.max(5, Math.round((meeting.itemCount || 200) / 45)),
      }}
      related={related}
    >
      {meeting.summary && (
        <blockquote className="mb-6 border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-text-muted dark:text-dark-muted">
          {meeting.summary}
        </blockquote>
      )}
      <ArticleContent content={content} />
    </ReadingArticleShell>
  </>
}
