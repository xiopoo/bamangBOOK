import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import ReadingProgress from '@/components/ReadingProgress'
import MarkdownContent from '@/components/MarkdownContent'
import { getDYDoc, getDYSlugs } from '@/lib/duanyongping'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return getDYSlugs('milestones').map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getDYDoc('milestones', params.slug)
  if (!doc) return { title: '未找到' }
  return {
    title: `${doc.title} · 段永平公司与里程碑`,
    description: doc.title,
    alternates: { canonical: `/duanyongping/milestones/${params.slug}` },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const doc = getDYDoc('milestones', params.slug)
  if (!doc) notFound()

  return (
    <PageContainer maxWidth="7xl">
      <ReadingProgress />
      <article>
        <Link
          href="/duanyongping/milestones"
          className="inline-flex items-center gap-1 text-sm text-text-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary-light transition-colors mb-4"
        >
          ← 返回公司与里程碑
        </Link>

        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm text-primary dark:text-primary-light mb-2">
            {doc.year && <span>{doc.year}</span>}
            <span>· 公司与里程碑</span>
          </div>
          <h1 className="text-3xl font-bold text-text dark:text-dark-text font-serif mb-3">{doc.title}</h1>
          {doc.source && (
            <span className="text-xs text-text-muted dark:text-dark-muted">{doc.source}</span>
          )}
        </header>

        <MarkdownContent content={doc.content} />
      </article>
    </PageContainer>
  )
}
