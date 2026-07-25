import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getModelBySlug, getModels } from '@/lib/models'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import ContentTrustPanel from '@/components/ContentTrustPanel'
import RelatedArticles from '@/components/RelatedArticles'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getModels().map(m => ({ slug: m.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const model = getModelBySlug(decodeURIComponent(params.slug))
  if (!model) return { title: '模型未找到' }
  return {
    title: `${model.title} · 思维模型`,
    description: model.description,
    alternates: { canonical: `/model/${model.slug}` },
    openGraph: { title: model.title, type: 'article' },
  }
}

export default function ModelDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const model = getModelBySlug(slug)

  if (!model) {
    notFound()
  }

  // 同学科的其他模型推荐（按重要度）
  const related = getModels()
    .filter(m => m.slug !== slug && m.discipline === model.discipline)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress />
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10 sticky top-1 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link href="/model" className="text-sm text-primary hover:text-primary-light transition-colors mb-1 inline-flex items-center gap-1">
                ← 返回思维模型
              </Link>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary dark:text-primary-light">
                {model.title}
                {model.english && (
                  <span className="ml-2 text-base font-mono font-normal text-text-muted dark:text-dark-muted">
                    {model.english}
                  </span>
                )}
              </h1>
              <p className="text-sm text-text-muted dark:text-dark-muted flex items-center gap-2 flex-wrap">
                <span>🧠 {model.disciplineName || '思维模型'}</span>
                {model.importance > 0 && <span>· 重要度 {'★'.repeat(model.importance)}</span>}
              </p>
            </div>
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <ContentTrustPanel
          source={`整理自 mungermodels.com（查理·芒格的思维模型），原文见 ${model.sourceUrl || 'mungermodels.com'}`}
          method="本文为第三方整理的学习资料，观点仅供参考，不构成投资建议。"
        />

        {/* 应用场景标签 */}
        {model.scenarios.length > 0 && (
          <div className="bg-white dark:bg-dark-card rounded-card shadow-card p-4 sm:p-6 mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted dark:text-dark-muted">适用场景：</span>
            {model.scenarios.map(s => (
              <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          <main className="flex-1 min-w-0">
            <article className="bg-bg-card dark:bg-dark-card p-4 sm:p-6 md:p-10 shadow-card rounded-card">
              <MarkdownContent content={model.content} />
            </article>

            {related.length > 0 && (
              <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif mb-4">
                  同学科模型 · {model.disciplineName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {related.map(item => (
                    <Link
                      key={item.slug}
                      href={`/model/${item.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-text-muted dark:text-dark-muted truncate">{item.description}</div>
                        )}
                      </div>
                      <span className="text-xs text-primary flex-shrink-0">{'★'.repeat(item.importance)}</span>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Link href="/model" className="text-sm text-primary hover:text-primary-light">
                    查看全部思维模型 →
                  </Link>
                </div>
              </div>
            )}

            <RelatedArticles source="models" fileName={slug} />

          </main>
          <ArticleTableOfContents />
        </div>
      </div>

      <footer className="bg-bg-card dark:bg-dark-card border-t border-primary/10 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-text-muted dark:text-dark-muted">
          小胖书房
        </div>
      </footer>
    </div>
  )
}
