import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getAllMeetingYears } from '@/lib/meetings'

export const metadata: Metadata = {
  title: '股东大会实录 · 英文原档',
  description: '1994–2026 年伯克希尔股东大会现场问答英文原档：巴菲特与芒格在年会上的完整发言与问答实录。',
  alternates: { canonical: '/meetings' },
}

export default function MeetingsArchivePage() {
  const years = getAllMeetingYears()

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="股东大会实录 · 英文原档"
        subtitle="1994–2026 伯克希尔年会问答的现场英文原档，含上午场、下午场与主题片段。"
        backHref="/qa"
        backLabel="返回股东大会问答"
      />

      <div className="space-y-8">
        {years.map(({ year, sessions, clips }) => (
          <section key={year} className="bg-white dark:bg-dark-card rounded-card border border-gray-100 dark:border-dark-border p-6 shadow-card">
            <h2 className="mb-4 flex items-baseline gap-3">
              <span className="text-xl font-bold text-primary dark:text-primary-light">{year}</span>
              <span className="text-sm text-text-muted dark:text-dark-muted">
                {sessions.length + clips.length} 段 · {clips.length} 个主题片段
              </span>
            </h2>
            <ul className="space-y-2">
              {sessions.map((item) => (
                <li key={item.session}>
                  <Link
                    href={`/meetings/${year}/${encodeURIComponent(item.session)}`}
                    className="group flex items-center justify-between gap-3 rounded-card border border-primary/15 bg-bg-card px-4 py-2.5 transition-all hover:border-primary hover:shadow-card-hover dark:border-primary/20 dark:bg-dark-card"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-text-base group-hover:text-primary dark:text-dark-base">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs text-text-muted dark:text-dark-muted">
                      {item.sectionCount ? `${item.sectionCount} 节 · ` : ''}{item.itemCount ? `${item.itemCount} 条` : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {clips.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-text-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary-light">
                  主题片段（{clips.length} 个）…
                </summary>
                <ul className="mt-3 space-y-1.5">
                  {clips.map((item) => (
                    <li key={item.session}>
                      <Link
                        href={`/meetings/${year}/${encodeURIComponent(item.session)}`}
                        className="group flex items-center gap-3 rounded px-3 py-1.5 text-sm text-text-muted hover:bg-primary/5 hover:text-primary dark:text-dark-muted dark:hover:text-primary-light"
                      >
                        <span className="min-w-0 truncate">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        ))}
      </div>
    </PageContainer>
  )
}
