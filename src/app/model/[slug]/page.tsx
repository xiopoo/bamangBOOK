import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getModelBySlug, getModels } from '@/lib/models'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import RelatedArticles from '@/components/RelatedArticles'
import PageFooter from '@/components/PageFooter'

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
    <div className="archive-page model-detail-page min-h-screen">
      <ReadingProgress />
      <header className="model-detail__hero">
        <div className="model-detail__hero-inner">
          <div className="model-detail__breadcrumb">
            <Link href="/model">多元思维模型库</Link>
            <span>/</span>
            <span>{model.disciplineName || '思维模型'}</span>
          </div>
          <div className="model-detail__heading">
            <div>
              <h1>{model.title}</h1>
              {model.english && <p className="model-detail__english">{model.english}</p>}
            </div>
            <div className="model-detail__font-control">
              <span>正文字号</span>
              <FontSizeControlFixed />
            </div>
          </div>
          {model.description && <p className="model-detail__dek">{model.description}</p>}
          <div className="model-detail__meta">
            <span>{model.disciplineName || '思维模型'}</span>
            {model.importance >= 5 && <span>核心模型</span>}
            <span>综合资料条目</span>
          </div>
        </div>
      </header>

      <div className="model-detail__shell">
        <div className="model-detail__grid">
          <main className="flex-1 min-w-0">
            {model.scenarios.length > 0 && (
              <div className="model-detail__scenarios">
                <span>适用场景</span>
                <p>{model.scenarios.join(' · ')}</p>
              </div>
            )}

            <details className="model-detail__source">
              <summary>来源与编辑说明</summary>
              <div>
                <p>
                  {model.content.includes('<!-- munger-archive-merged -->')
                    ? '本条目由原有模型资料与 Munger Archive 同名内容归并整理，重复内容已合并。'
                    : `本条目整理自 ${model.source || '原有模型库'}。`}
                  内容仅供研究参考，不构成投资建议。
                </p>
                {model.sourceUrl && (
                  <a href={model.sourceUrl} target="_blank" rel="noopener noreferrer">查看原始资料 ↗</a>
                )}
              </div>
            </details>

            <article className="model-detail__article">
              <MarkdownContent content={model.content} />
            </article>

            {related.length > 0 && (
              <section className="model-detail__related">
                <header>
                  <p>继续阅读</p>
                  <h2>同学科模型 · {model.disciplineName}</h2>
                </header>
                <div>
                  {related.map(item => (
                    <Link
                      key={item.slug}
                      href={`/model/${item.slug}`}
                      className="model-detail__related-item"
                    >
                      <div>
                        <h3>{item.title}</h3>
                        {item.description && <p>{item.description}</p>}
                      </div>
                      <span aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
                <Link href="/model" className="model-detail__all-link">查看全部思维模型 →</Link>
              </section>
            )}

            <RelatedArticles source="models" fileName={slug} />
          </main>
          <ArticleTableOfContents />
        </div>
      </div>

      <PageFooter />
    </div>
  )
}
