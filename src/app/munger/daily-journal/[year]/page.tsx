import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import MarkdownContent from '@/components/MarkdownContent'
import { getDailyJournalMeetingBySlug, getDailyJournalMeetings } from '@/lib/daily-journal'

interface PageProps { params: { year: string } }

export function generateStaticParams() { return getDailyJournalMeetings().map(item => ({ year: item.slug })) }
export const dynamicParams = true

export function generateMetadata({ params }: PageProps): Metadata {
  const meeting = getDailyJournalMeetingBySlug(params.year)
  if (!meeting) return { title: '每日期刊股东会未找到' }
  return {
    title: `${meeting.year}年 · 查理·芒格 · 每日期刊股东大会问答`,
    description: `${meeting.year}年每日期刊股东大会${meeting.kind === '炉边谈话' ? '炉边谈话' : '问答'}，查理·芒格中文整理。`,
    alternates: { canonical: `/munger/daily-journal/${meeting.slug}` },
  }
}

export default function DailyJournalMeetingDetailPage({ params }: PageProps) {
  const meeting = getDailyJournalMeetingBySlug(params.year)
  if (!meeting) notFound()
  const ordered = [...getDailyJournalMeetings()].sort((a, b) => a.year - b.year || a.slug.localeCompare(b.slug))
  const index = ordered.findIndex(item => item.slug === meeting.slug)
  const previous = index > 0 ? ordered[index - 1] : null
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null

  return <ReadingArticleShell
    title={meeting.title}
    subtitle={`查理·芒格 · 每日期刊${meeting.kind === '炉边谈话' ? '炉边谈话' : '股东大会'}`}
    backHref="/munger/daily-journal"
    backLabel="返回每日期刊股东会目录"
    metadata={{ person: '查理·芒格', year: meeting.year, contentType: '股东大会问答', readMinutes: Math.max(3, Math.round(meeting.content.length / 900)) }}
    previous={previous ? { href: `/munger/daily-journal/${previous.slug}`, title: previous.title, meta: `${previous.year}年 · ${previous.kind}` } : null}
    next={next ? { href: `/munger/daily-journal/${next.slug}`, title: next.title, meta: `${next.year}年 · ${next.kind}` } : null}
    navigationLabel="按时间从早到晚的相邻每日期刊股东会"
  ><MarkdownContent content={meeting.content} /></ReadingArticleShell>
}
