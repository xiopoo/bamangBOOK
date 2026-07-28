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
    title: `${meeting.title} · 芒格档案`,
    description: `${meeting.year} 年 Wesco 股东大会${meeting.edition}，归入查理·芒格档案。`,
  }
}

export default function WescoMeetingDetailPage({ params }: PageProps) {
  const meeting = getWescoMeetingByYear(Number(params.year))
  if (!meeting) notFound()

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
          {meeting.officialLetterUrl && (
            <Link href={`/munger/originals/wesco-letter-${meeting.year}`} className="text-text-muted hover:text-primary">
              站内英文股东信
            </Link>
          )}
          <div className="ml-auto"><FontSizeControlFixed /></div>
        </div>

        <div className="flex gap-8">
          <main className="min-w-0 flex-1">
            <article className="rounded-card border border-gray-100 bg-white p-6 shadow-card dark:border-dark-border dark:bg-dark-card md:p-10">
              <MarkdownContent content={meeting.content} isQA className="max-w-none" />
            </article>
          </main>
          <ArticleTableOfContents />
        </div>
      </PageContainer>
      <PageFooter />
    </div>
  )
}
