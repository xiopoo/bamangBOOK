import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import MarkdownContent from '@/components/MarkdownContent'
import { getMungerOriginalById, getMungerOriginals } from '@/lib/munger-originals'
import { getWescoMeetings } from '@/lib/wesco-meetings'

interface PageProps {
  params: { id: string }
}

export function generateStaticParams() {
  return getMungerOriginals().map(item => ({ id: item.id }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = getMungerOriginalById(params.id)
  if (!item) return {}
  return {
    title: `${item.title} · Wesco 股东信`,
    description: `${item.year} 年 Wesco 股东信英文原文，来源为 Berkshire Hathaway official Wesco archive。`,
  }
}

export default function MungerOriginalPage({ params }: PageProps) {
  const item = getMungerOriginalById(params.id)
  if (!item) notFound()
  const relatedMeeting = getWescoMeetings().some((meeting) => meeting.year === item.year)

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title={item.title}
        subtitle={`${item.author} · ${item.year} · ${item.originalLanguage.toUpperCase()} original`}
        backHref="/munger/originals"
        backLabel="返回 Wesco 股东信"
        sticky
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-light">
          {item.category}
        </span>
        <span className="text-text-muted dark:text-dark-muted">
          {(item.wordCount / 1000).toFixed(1)}k words
        </span>
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-primary-light hover:underline">
          官方 PDF ↗
        </a>
        {relatedMeeting && (
          <Link href={`/munger/wesco/${item.year}`} className="text-primary dark:text-primary-light hover:underline">
            同年中文股东大会问答
          </Link>
        )}
        <Link href="/munger/archive" className="text-text-muted dark:text-dark-muted hover:text-primary">
          查看补全清单
        </Link>
      </div>

      <article className="bg-white dark:bg-dark-card rounded-card border border-gray-100 dark:border-dark-border p-5 sm:p-8">
        <MarkdownContent content={item.content} />
      </article>

      <PageFooter />
    </PageContainer>
  )
}
