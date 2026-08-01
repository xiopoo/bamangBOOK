import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import MarkdownContent from '@/components/MarkdownContent'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import { getWescoMeetingByYear, getWescoMeetings } from '@/lib/wesco-meetings'

interface PageProps {
  params: { year: string }
}

export function generateStaticParams() {
  return getWescoMeetings().map((item) => ({ year: String(item.year) }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps): Metadata {
  const meeting = getWescoMeetingByYear(Number(params.year))
  if (!meeting) return {}
  return {
    title: `${meeting.title} · Wesco 股东大会`,
    description: `${meeting.year} 年 Wesco 股东大会${meeting.edition}，查理·芒格中文问答与会议笔记。`,
  }
}

export default function WescoMeetingDetailPage({ params }: PageProps) {
  const meeting = getWescoMeetingByYear(Number(params.year))
  if (!meeting) notFound()

  // 计算相邻上下篇（按年份升序）
  const meetingsAsc = [...getWescoMeetings()].sort((a, b) => a.year - b.year)
  const idx = meetingsAsc.findIndex((m) => m.year === meeting.year)
  const prevMeeting = idx > 0 ? meetingsAsc[idx - 1] : null
  const nextMeeting = idx >= 0 && idx < meetingsAsc.length - 1 ? meetingsAsc[idx + 1] : null

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress />
      <PageContainer maxWidth="7xl">
        <PageHeader
          title={meeting.title}
          subtitle={`查理·芒格 · ${meeting.year} · ${meeting.edition}`}
          backHref="/munger/wesco"
          backLabel="返回 Wesco 股东大会"
          sticky
        />

        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary dark:text-primary-light">
            {meeting.edition}
          </span>
          {meeting.meetingSourceUrl && (
            <a href={meeting.meetingSourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              英文会议笔记 PDF ↗
            </a>
          )}
          {meeting.officialLetterUrl && (
            <a href={meeting.officialLetterUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              伯克希尔官网同期股东信 ↗
            </a>
          )}

          <div className="ml-auto"><FontSizeControlFixed /></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="min-w-0 flex-1">
            <article className="rounded-card border border-gray-100 bg-white p-6 shadow-card dark:border-dark-border dark:bg-dark-card md:p-10">
              <MarkdownContent content={meeting.content} isQA className="max-w-none" />
            </article>

            {/* —— Wesco 问答相邻导航：统一 CN Reading 阅读规范样式 —— */}
            <nav className="reading-nav-pair reading-adjacent" aria-label="相邻 Wesco 股东大会导航">
              {prevMeeting ? (
                <Link href={`/munger/wesco/${prevMeeting.year}`} className="nav-prev" rel="prev">
                  <span className="reading-adjacent__label">‹ 上一场 · 更早</span>
                  <span className="reading-adjacent__title">
                    {prevMeeting.year} 年 Wesco 股东大会{prevMeeting.edition ? ` · ${prevMeeting.edition}` : ''}
                  </span>
                </Link>
              ) : (
                <span className="nav-pair-btn nav-prev" aria-disabled>
                  <span className="reading-adjacent__label">已是最早一场</span>
                  <span className="reading-adjacent__title">Wesco 股东大会归档起点</span>
                </span>
              )}
              {nextMeeting ? (
                <Link href={`/munger/wesco/${nextMeeting.year}`} className="nav-next" rel="next">
                  <span className="reading-adjacent__label">下一场 · 更近 ›</span>
                  <span className="reading-adjacent__title">
                    {nextMeeting.year} 年 Wesco 股东大会{nextMeeting.edition ? ` · ${nextMeeting.edition}` : ''}
                  </span>
                </Link>
              ) : (
                <span className="nav-pair-btn nav-next" aria-disabled>
                  <span className="reading-adjacent__label">已是最后一场</span>
                  <span className="reading-adjacent__title">后续内容会持续更新</span>
                </span>
              )}
            </nav>
          </main>
          <ArticleTableOfContents />
        </div>
      </PageContainer>
      <PageFooter />
    </div>
  )
}
