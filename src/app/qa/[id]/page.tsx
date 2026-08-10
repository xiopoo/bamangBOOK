import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAdjacentDocuments, getDocumentByFileName } from '@/lib/documents'
import { qaParams } from '@/lib/staticParams'
import { documentHref } from '@/lib/content-routes'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import MarkdownContent from '@/components/MarkdownContent'
import RelatedArticles from '@/components/RelatedArticles'
import JsonLd, { breadcrumbJsonLd } from '@/components/JsonLd'

export function generateStaticParams() { return qaParams() }
export const dynamicParams = false
interface PageProps { params: { id: string } }

function normalizedFileName(value: string) {
  return decodeURIComponent(value).replace(/\.md$/, '')
}

export function generateMetadata({ params }: PageProps): Metadata {
  const fileName = normalizedFileName(params.id)
  const wescoMatch = fileName.match(/^Wesco_股东大会_(\d{4})$/)
  if (wescoMatch) return {
    title: `${wescoMatch[1]}年 Wesco 股东大会问答`,
    description: `${wescoMatch[1]}年 Wesco 股东大会问答记录，查理·芒格现场回答股东提问。`,
    alternates: { canonical: `/munger/wesco/${wescoMatch[1]}` },
  }
  const doc = getDocumentByFileName('qa', fileName)
  if (!doc) return { title: '股东大会问答' }
  return {
    title: `${doc.year ? `${doc.year}年 · ` : ''}股东大会问答 · ${doc.title}`,
    description: `${doc.title}，股东大会现场问答中文整理。`,
    alternates: { canonical: documentHref('qa', { fileName }) },
  }
}

export default function QADetailPage({ params }: PageProps) {
  const fileName = normalizedFileName(params.id)
  const wescoMatch = fileName.match(/^Wesco_股东大会_(\d{4})$/)
  if (wescoMatch) redirect(`/munger/wesco/${wescoMatch[1]}`)
  const doc = getDocumentByFileName('qa', fileName)
  if (!doc) notFound()
  const { prev, next } = getAdjacentDocuments('qa', fileName)

  return <>
    <JsonLd data={breadcrumbJsonLd([{ name: '首页', href: '/' }, { name: '股东大会问答', href: '/qa' }, { name: doc.title }])} />
    <ReadingArticleShell
      title={doc.title}
      subtitle="股东大会现场问答中文整理"
      backHref="/qa"
      backLabel="返回股东大会问答目录"
      metadata={{ person: '沃伦·巴菲特', year: doc.year || undefined, contentType: '股东大会', sourceLabel: doc.sourceLabel, status: doc.status, completeness: doc.completeness, readMinutes: doc.readMinutes }}
      trust={{ source: doc.sourceLabel, method: '依据股东大会公开文字记录整理；问答分段与措辞可能因记录版本不同而有差异。' }}
      sourceNote={{ source: doc.sourceLabel, method: '中文问答整理，保留会议年份与问答上下文。', completeness: doc.completeness }}
      previous={prev ? { href: prev.href, title: prev.title, meta: prev.year ? `${prev.year}年` : undefined } : null}
      next={next ? { href: next.href, title: next.title, meta: next.year ? `${next.year}年` : undefined } : null}
      navigationLabel="按时间从早到晚的相邻股东大会问答"
      related={<RelatedArticles source="qa" fileName={fileName} />}
    ><MarkdownContent content={doc.content} isQA /></ReadingArticleShell>
  </>
}
