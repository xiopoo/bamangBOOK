import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import ReadingProgress from '@/components/ReadingProgress'
import MarkdownContent from '@/components/MarkdownContent'
import { getDYDoc, getDYSlugs } from '@/lib/duanyongping'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return getDYSlugs('blog').map((slug) => ({ slug: encodeURIComponent(slug) }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getDYDoc('blog', params.slug)
  if (!doc) return { title: '未找到' }
  return {
    title: `${doc.title} · 段永平网易博客`,
    description: doc.title,
    alternates: { canonical: `/duanyongping/blog/${params.slug}` },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const doc = getDYDoc('blog', params.slug)
  if (!doc) notFound()

  return (
    <PageContainer maxWidth="7xl">
      <ReadingProgress />
      <article>
        <Link
          href="/duanyongping/blog"
          className="inline-flex items-center gap-1 text-sm text-text-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary-light transition-colors mb-4"
        >
          ← 返回网易博客
        </Link>

        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm text-primary dark:text-primary-light mb-2">
            {doc.date && <span>{doc.date.slice(0, 10)}</span>}
            <span>· 网易博客</span>
            {doc.articleId && <span>· #{doc.articleId}</span>}
          </div>
          <h1 className="text-3xl font-bold text-text dark:text-dark-text font-serif mb-3">{doc.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted dark:text-dark-muted">
            {doc.commentCount && <span>评论 {doc.commentCount} 条</span>}
            {doc.duanCommentCount && <span>段永平本人回复 {doc.duanCommentCount} 条</span>}
            {doc.source && (
              <a href={doc.source} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                网易原文 ↗
              </a>
            )}
            {doc.mirror && (
              <a href={doc.mirror} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                镜像备份 ↗
              </a>
            )}
          </div>
        </header>

        <MarkdownContent content={doc.content} />
      </article>
    </PageContainer>
  )
}
