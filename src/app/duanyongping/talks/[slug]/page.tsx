import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import ReadingProgress from '@/components/ReadingProgress'
import MarkdownContent from '@/components/MarkdownContent'
import { getDYDoc, getDYSlugs, stripTalkSourceNote } from '@/lib/duanyongping'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return getDYSlugs('talks').map((slug) => ({ slug: encodeURIComponent(slug) }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getDYDoc('talks', params.slug)
  if (!doc) return { title: '未找到' }
  const kind = doc.contentType === 'article' ? '人物文章' : '演讲与采访'
  return {
    title: `${doc.title} · 段永平${kind}`,
    description: `${doc.author}：${doc.title}`,
    alternates: { canonical: `/duanyongping/talks/${params.slug}` },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const doc = getDYDoc('talks', params.slug)
  if (!doc) notFound()

  return (
    <PageContainer maxWidth="7xl">
      <ReadingProgress />
      <article>
        <Link
          href="/duanyongping/talks"
          className="inline-flex items-center gap-1 text-sm text-text-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary-light transition-colors mb-4"
        >
          ← 返回演讲、采访与文章
        </Link>

        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm text-primary dark:text-primary-light mb-2">
            {doc.year && <span>{doc.year}</span>}
            <span>· {doc.contentType === 'article' ? '人物文章' : '演讲 / 采访'}</span>
          </div>
          <h1 className="text-3xl font-bold text-text dark:text-dark-text font-serif mb-3">{doc.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted dark:text-dark-muted">
            <span>作者：{doc.author}</span>
            {doc.source && <span>{doc.source}</span>}
            {doc.sourceUrl && (
              <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                查看原文 ↗
              </a>
            )}
          </div>
        </header>

        <MarkdownContent content={stripTalkSourceNote(doc.content)} />
      </article>
    </PageContainer>
  )
}
