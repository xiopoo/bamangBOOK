import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBusinessHistories, getBusinessHistoryBySlug } from '@/lib/business-history'
import { businessHistoryParams } from '@/lib/staticParams'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import ContentTrustPanel from '@/components/ContentTrustPanel'

export function generateStaticParams() {
  return businessHistoryParams()
}

export const dynamicParams = false

interface PageProps {
  params: { slug: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = getBusinessHistoryBySlug(decodeURIComponent(params.slug))
  if (!item) return { title: '公司深度研究未找到' }
  return {
    title: `${item.title} · 公司深度研究`,
    description: item.summary
      || item.content.replace(/[#>*_`\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 150),
    alternates: { canonical: `/business-history/${encodeURIComponent(item.slug)}` },
    openGraph: { title: item.title, type: 'article' },
  }
}

export default function BusinessHistoryDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const item = getBusinessHistoryBySlug(slug)

  if (!item) {
    notFound()
  }

  const related = getBusinessHistories()
    .filter(candidate => candidate.slug !== slug)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress />
      <header className="border-b border-primary/10 bg-bg-card dark:bg-dark-card">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link href="/business-history" className="mb-1 inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary-light">
                ← 返回公司深度研究
              </Link>
              <h1 className="font-serif text-xl font-bold text-primary dark:text-primary-light sm:text-2xl md:text-3xl">{item.title}</h1>
              <p className="flex flex-wrap items-center gap-2 text-sm text-text-muted dark:text-dark-muted">
                <span>{item.company}</span>
                <span>· 约 {item.readMinutes} 分钟</span>
                {item.sourcePdf && <span>· 来源：{item.sourcePdf}</span>}
              </p>
            </div>
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-10 lg:px-10">
        <ContentTrustPanel
          source={item.sourcePdf ? `本地 PDF：content/companies-studies/${item.sourcePdf}` : 'Worldly Partners 公司研究 PDF'}
          method="本文为中文研究整理稿，侧重事实脉络、商业模式、护城河、风险与价值判断；具体数据与原始披露请以原 PDF 和公司公告为准，不构成投资建议。"
        />

        <div className="flex gap-8">
          <main className="min-w-0 flex-1">
            <article className="rounded-card bg-bg-card p-4 shadow-card dark:bg-dark-card sm:p-6 md:p-10">
              <MarkdownContent content={item.content} />
            </article>

            {related.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-700">
                <h3 className="mb-4 font-serif text-lg font-bold text-gray-800 dark:text-gray-200">
                  继续阅读
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {related.map(candidate => (
                    <Link
                      key={candidate.slug}
                      href={`/business-history/${encodeURIComponent(candidate.slug)}`}
                      className="rounded-lg border border-gray-100 p-3 transition-all hover:border-primary/30 hover:bg-primary/[0.02] dark:border-gray-700"
                    >
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{candidate.title}</div>
                      {candidate.summary && (
                        <div className="mt-1 truncate text-xs text-text-muted dark:text-dark-muted">{candidate.summary}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>
          <ArticleTableOfContents />
        </div>
      </div>

      <footer className="mt-12 border-t border-primary/10 bg-bg-card py-6 dark:bg-dark-card">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-text-muted dark:text-dark-muted sm:px-6">
          小胖书房
        </div>
      </footer>
    </div>
  )
}
