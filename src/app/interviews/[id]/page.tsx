import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAdjacentDocuments, getDocumentByFileName } from '@/lib/documents'
import { interviewParams } from '@/lib/staticParams'
import { documentHref } from '@/lib/content-routes'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import MarkdownContent from '@/components/MarkdownContent'
import RelatedArticles from '@/components/RelatedArticles'

export function generateStaticParams() { return interviewParams() }
export const dynamicParams = false
interface PageProps { params: { id: string } }

export function generateMetadata({ params }: PageProps): Metadata {
  const fileName = decodeURIComponent(params.id)
  const doc = getDocumentByFileName('interviews', fileName)
  if (!doc) return { title: '访谈资料未找到' }
  return {
    title: `${doc.year ? `${doc.year}年 · ` : ''}访谈 · ${doc.title}`,
    description: `${doc.title}，${doc.year ? `${doc.year}年` : ''}访谈资料中文整理。`,
    alternates: { canonical: documentHref('interviews', { fileName }) },
  }
}

export default function InterviewDetailPage({ params }: PageProps) {
  const fileName = decodeURIComponent(params.id)
  const doc = getDocumentByFileName('interviews', fileName)
  if (!doc) notFound()
  const { prev, next } = getAdjacentDocuments('interviews', fileName)
  return <ReadingArticleShell
    title={doc.title}
    subtitle="访谈原典中文阅读整理"
    backHref="/interviews"
    backLabel="返回访谈目录"
    metadata={{ year: doc.year || undefined, contentType: '访谈', sourceLabel: doc.sourceLabel, status: doc.status, completeness: doc.completeness, readMinutes: doc.readMinutes }}
    trust={{ source: doc.sourceLabel, method: '依据公开访谈资料进行中文阅读整理；重要表述以原始采访为准。' }}
    sourceNote={{ source: doc.sourceLabel, method: '中文阅读整理，保留访谈年份与上下文。', completeness: doc.completeness }}
    previous={prev ? { href: prev.href, title: prev.title, meta: prev.year ? `${prev.year}年` : undefined } : null}
    next={next ? { href: next.href, title: next.title, meta: next.year ? `${next.year}年` : undefined } : null}
    navigationLabel="按时间从早到晚的相邻访谈"
    related={<RelatedArticles source="interviews" fileName={fileName} />}
  ><MarkdownContent content={doc.content} /></ReadingArticleShell>
}
