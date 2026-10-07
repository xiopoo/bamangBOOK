import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getAdjacentLiDocuments,
  getLiDocumentBySlug,
  getLiCategoryBySlug,
  getLiDocuments,
} from '@/lib/li-ka-shing'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import MarkdownContent from '@/components/MarkdownContent'

interface PageProps {
  params: { category: string; slug: string }
}

export function generateStaticParams() {
  return getLiDocuments().map(doc => ({
    category: doc.categorySlug,
    slug: doc.slug,
  }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const doc = getLiDocumentBySlug(params.category, params.slug)
  if (!doc) return { title: '原典未找到' }
  return {
    title: `${doc.title}｜李嘉诚专题`,
    description: `${doc.title}${doc.year ? `，${doc.year} 年` : ''}，李嘉诚原典全文。`,
    alternates: { canonical: doc.href },
  }
}

export default function LiDocumentPage({ params }: PageProps) {
  const doc = getLiDocumentBySlug(params.category, params.slug)
  if (!doc) notFound()
  const cat = getLiCategoryBySlug(params.category)
  const { prev, next } = getAdjacentLiDocuments(params.category, doc.fileName)

  return (
    <ReadingArticleShell
      title={doc.title}
      backHref={`/li-ka-shing/${params.category}`}
      backLabel={`返回${cat?.title ?? '栏目'}`}
      metadata={{
        person: '李嘉诚',
        year: doc.year || undefined,
        contentType: cat?.title ?? '原典',
        readMinutes: doc.readMinutes,
      }}
      previous={prev ? {
        href: prev.href,
        title: prev.title,
        meta: prev.year ? `${prev.year} 年` : undefined,
      } : null}
      next={next ? {
        href: next.href,
        title: next.title,
        meta: next.year ? `${next.year} 年` : undefined,
      } : null}
      navigationLabel={`上一篇 / 下一篇（${cat?.title ?? ''}）`}
    >
      <MarkdownContent content={doc.content} />
    </ReadingArticleShell>
  )
}
