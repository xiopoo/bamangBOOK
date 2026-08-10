import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import MarkdownContent from '@/components/MarkdownContent'
import { getWescoMeetingByYear, getWescoMeetings } from '@/lib/wesco-meetings'

interface PageProps { params: { year: string } }

export function generateStaticParams() { return getWescoMeetings().map(item => ({ year: String(item.year) })) }
export const dynamicParams = false

export function generateMetadata({ params }: PageProps): Metadata {
  const meeting = getWescoMeetingByYear(Number(params.year))
  if (!meeting) return { title: 'Wesco 股东大会未找到' }
  return {
    title: `${meeting.year}年 · 查理·芒格 · Wesco 股东大会问答`,
    description: `${meeting.year}年 Wesco 股东大会${meeting.edition}，查理·芒格中文问答与会议笔记。`,
    alternates: { canonical: `/munger/wesco/${meeting.year}` },
  }
}

export default function WescoMeetingDetailPage({ params }: PageProps) {
  const meeting = getWescoMeetingByYear(Number(params.year))
  if (!meeting) notFound()
  const meetings = [...getWescoMeetings()].sort((a, b) => a.year - b.year)
  const index = meetings.findIndex(item => item.year === meeting.year)
  const previous = index > 0 ? meetings[index - 1] : null
  const next = index >= 0 && index < meetings.length - 1 ? meetings[index + 1] : null
  const sourceLabel = meeting.meetingSourceUrl ? 'Wesco 股东大会英文会议笔记' : 'Wesco 股东大会公开记录'

  return <ReadingArticleShell
    title={meeting.title}
    subtitle={`查理·芒格 · ${meeting.edition}`}
    backHref="/munger/wesco"
    backLabel="返回 Wesco 股东大会目录"
    metadata={{ person: '查理·芒格', year: meeting.year, contentType: '股东大会', sourceLabel, status: '编辑整理', completeness: '未知', readMinutes: Math.max(5, Math.round(meeting.content.length / 900)) }}
    trust={{ source: sourceLabel, method: '依据英文会议笔记和公开资料整理；会议记录版本之间可能存在措辞和分段差异。' }}
    sourceNote={{ source: sourceLabel, sourceUrl: meeting.meetingSourceUrl, method: '中文问答与会议笔记整理，保留会议年份和上下文。', completeness: '未知' }}
    previous={previous ? { href: `/munger/wesco/${previous.year}`, title: previous.title, meta: `${previous.year}年 · ${previous.edition}` } : null}
    next={next ? { href: `/munger/wesco/${next.year}`, title: next.title, meta: `${next.year}年 · ${next.edition}` } : null}
    navigationLabel="按时间从早到晚的相邻 Wesco 股东大会"
  ><MarkdownContent content={meeting.content} isQA /></ReadingArticleShell>
}
