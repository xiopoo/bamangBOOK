import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import ReadingProgress from '@/components/ReadingProgress'
import MarkdownContent from '@/components/MarkdownContent'
import { getDYDoc, getDYSlugs, getDYNeighbors } from '@/lib/duanyongping'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return getDYSlugs('qa').map((slug) => ({ slug: encodeURIComponent(slug) }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getDYDoc('qa', params.slug)
  if (!doc) return { title: '未找到' }
  return {
    title: `${doc.title} · 段永平雪球问答`,
    description: doc.title,
    alternates: { canonical: `/duanyongping/qa/${params.slug}` },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const doc = getDYDoc('qa', params.slug)
  if (!doc) notFound()

  const isPdfSource = doc.source && /\.pdf(\?|$)/i.test(doc.source)
  const { previous, next } = getDYNeighbors('qa', doc.slug)

  return (
    <PageContainer maxWidth="7xl">
      <ReadingProgress />
      <article>
        <Link
          href="/duanyongping/qa"
          className="inline-flex items-center gap-1 text-sm text-text-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary-light transition-colors mb-4"
        >
          ← 返回雪球问答录
        </Link>

        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm text-primary dark:text-primary-light mb-2">
            {doc.date && <span>{doc.date}</span>}
            <span>· 雪球问答</span>
          </div>
          <h1 className="text-3xl font-bold text-text dark:text-dark-text font-serif mb-3">{doc.title}</h1>
          {doc.source && (
            <a
              href={doc.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-muted dark:text-dark-muted hover:text-primary"
            >
              {isPdfSource ? '📄 查看 PDF 原文' : '雪球原文 ↗'}
            </a>
          )}
        </header>

        {isPdfSource && (
          <div className="mb-8 rounded-lg border border-border dark:border-dark-border overflow-hidden bg-canvas-subtle dark:bg-dark-subtle">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-dark-border">
              <span className="text-sm font-medium text-text dark:text-dark-text">PDF 在线阅读</span>
              <a
                href={doc.source!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary dark:text-primary-light hover:underline"
              >
                全屏查看 ↗
              </a>
            </div>
            <iframe
              src={doc.source}
              className="w-full border-0"
              style={{ height: '80vh', minHeight: '600px' }}
              title={doc.title}
              loading="lazy"
            />
          </div>
        )}

        <MarkdownContent content={doc.content} isQA />

        <nav className="reading-nav-pair reading-adjacent" aria-label="相邻雪球问答导航">
          {previous ? (
            <Link href={`/duanyongping/qa/${previous.slug}`} className="nav-prev" rel="prev">
              <span className="reading-adjacent__label">‹ 上一条 · 更早</span>
              <span className="reading-adjacent__title">{previous.date?.slice(0, 10)} · {previous.title}</span>
            </Link>
          ) : <span className="nav-pair-btn nav-prev" aria-disabled><span className="reading-adjacent__label">已是最早一条</span></span>}
          {next ? (
            <Link href={`/duanyongping/qa/${next.slug}`} className="nav-next" rel="next">
              <span className="reading-adjacent__label">下一条 · 更晚 ›</span>
              <span className="reading-adjacent__title">{next.date?.slice(0, 10)} · {next.title}</span>
            </Link>
          ) : <span className="nav-pair-btn nav-next" aria-disabled><span className="reading-adjacent__label">已是最后一条</span></span>}
        </nav>
      </article>
    </PageContainer>
  )
}
