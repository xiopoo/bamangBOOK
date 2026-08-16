import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAdjacentDocuments, getDocumentByFileName } from '@/lib/documents'
import { personDisplayName } from '@/lib/people'
import { talkParams } from '@/lib/staticParams'
import { documentHref } from '@/lib/content-routes'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import MarkdownContent from '@/components/MarkdownContent'
import RelatedArticles from '@/components/RelatedArticles'

export function generateStaticParams() { return talkParams() }
export const dynamicParams = true

interface PageProps { params: { id: string } }

export function generateMetadata({ params }: PageProps): Metadata {
  const fileName = decodeURIComponent(params.id)
  const doc = getDocumentByFileName('talks', fileName)
  if (!doc) return { title: '演讲资料未找到' }
  const personName = (Array.isArray(doc.person) ? doc.person : [doc.person]).filter((id): id is string => Boolean(id)).map(personDisplayName).join('、')
  return {
    title: `${personName ? `${personName} · ` : ''}${doc.year ? `${doc.year}年 · ` : ''}演讲 · ${doc.title}`,
    description: `${doc.title}，${doc.year ? `${doc.year}年` : ''}演讲资料中文整理。`,
    alternates: { canonical: documentHref('talks', { fileName }) },
  }
}

export default function TalkDetailPage({ params }: PageProps) {
  const fileName = decodeURIComponent(params.id)
  const doc = getDocumentByFileName('talks', fileName)
  if (!doc) notFound()
  const { prev, next } = getAdjacentDocuments('talks', fileName)
  const personName = (Array.isArray(doc.person) ? doc.person : [doc.person]).filter((id): id is string => Boolean(id)).map(personDisplayName).join('、') || '相关人物待核对'

  return <ReadingArticleShell
    title={doc.title}
    backHref="/talks"
    backLabel="返回演讲目录"
    metadata={{ person: personName, year: doc.year || undefined, contentType: '演讲',
 readMinutes: doc.readMinutes }}
    previous={prev ? { href: prev.href, title: prev.title, meta: prev.year ? `${prev.year}年` : undefined } : null}
    next={next ? { href: next.href, title: next.title, meta: next.year ? `${next.year}年` : undefined } : null}
    navigationLabel="相邻演讲"
    related={<RelatedArticles source="talks" fileName={fileName} />}
  ><MarkdownContent content={doc.content} /></ReadingArticleShell>
}
