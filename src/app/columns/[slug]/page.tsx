import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getColumnBySlug, getSeriesNeighbors } from '@/lib/columns'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import { columnParams } from '@/lib/staticParams'

export function generateStaticParams() {
  return columnParams()
}

export const dynamicParams = false

interface PageProps {
  params: { slug: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const column = getColumnBySlug(decodeURIComponent(params.slug))
  if (!column) return { title: '专栏文章未找到' }
  return {
    title: `${column.title} · 投资策略与思考`,
    description: column.summary
      || column.content.replace(/[#>*_`\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 150),
    alternates: { canonical: `/columns/${encodeURIComponent(column.slug)}` },
    openGraph: { title: column.title, type: 'article' },
  }
}

export default function ColumnDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const column = getColumnBySlug(slug)

  if (!column) {
    notFound()
  }

  const { prev, next } = getSeriesNeighbors(slug)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress historyTitle={column.title} />
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link href="/columns" className="text-sm text-primary hover:text-primary-light transition-colors mb-1 inline-flex items-center gap-1">
                ← 返回专栏列表
              </Link>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text dark:text-dark-text tracking-tight">{column.title}</h1>
              <p className="text-sm text-text-muted dark:text-dark-muted flex items-center gap-2 flex-wrap">
                <span>✍️ {column.series}</span>
                {column.date && <span>· {column.date}</span>}
                <span>· 约 {column.readMinutes} 分钟</span>
              </p>
            </div>
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <div className="reading-content-layout">
          <main className="reading-content-layout__main min-w-0">
            <article data-toc-content className="bg-bg-card dark:bg-dark-card p-4 sm:p-6 md:p-8 shadow-card rounded-card">
              <MarkdownContent content={column.content} />

              {column.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {column.tags.map(tag => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      # {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* 同系列上一篇 / 下一篇 */}
            {(prev || next) && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prev ? (
                  <Link
                    href={`/columns/${encodeURIComponent(prev.slug)}`}
                    className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                  >
                    <div className="text-xs text-text-muted dark:text-dark-muted mb-1">← 上一篇</div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{prev.title}</div>
                  </Link>
                ) : <div className="hidden sm:block" />}
                {next && (
                  <Link
                    href={`/columns/${encodeURIComponent(next.slug)}`}
                    className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/[0.02] transition-all sm:text-right"
                  >
                    <div className="text-xs text-text-muted dark:text-dark-muted mb-1">下一篇 →</div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{next.title}</div>
                  </Link>
                )}
              </div>
            )}
          </main>
          <ArticleTableOfContents />
        </div>
      </div>

    </div>
  )
}
