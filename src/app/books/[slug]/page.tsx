import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBookBySlug, getBooks } from '@/lib/books'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import ContentTrustPanel from '@/components/ContentTrustPanel'
import { bookParams } from '@/lib/staticParams'
import { resolveMarkdownEntityLinks } from '@/lib/entity-resolver'

export function generateStaticParams() {
  return bookParams()
}

export const dynamicParams = false

interface PageProps {
  params: { slug: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const book = getBookBySlug(decodeURIComponent(params.slug))
  if (!book) return { title: '书籍未找到' }
  return {
    title: `${book.title} · 深度拆书`,
    description: book.oneLiner
      || book.content.replace(/[#>*_`\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 150),
    alternates: { canonical: `/books/${encodeURIComponent(book.slug)}` },
    openGraph: { title: book.title, type: 'article' },
  }
}

export default function BookDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const book = getBookBySlug(slug)

  if (!book) {
    notFound()
  }

  // 同分类的其他书籍推荐
  const related = getBooks()
    .filter(b => b.slug !== slug && b.category === book.category)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress />
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link href="/books" className="text-sm text-primary hover:text-primary-light transition-colors mb-1 inline-flex items-center gap-1">
                ← 返回拆书列表
              </Link>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary dark:text-primary-light">{book.title}</h1>
              <p className="text-sm text-text-muted dark:text-dark-muted flex items-center gap-2 flex-wrap">
                <span>📚 {book.category}</span>
                {book.originalAuthor && <span>· 原著：{book.originalAuthor}</span>}
                {book.author && <span>· 拆解：{book.author}</span>}
              </p>
            </div>
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <ContentTrustPanel
          source="第三方出版书籍的读书笔记与要点整理"
          method="本文为个人拆解与提炼，观点仅供学习参考，具体内容请以原著为准，不构成投资建议。"
        />

        {/* 书籍信息卡 */}
        <div className="bg-white dark:bg-dark-card rounded-card shadow-card p-4 sm:p-6 mb-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">★ {book.rating}</span>
            <span className="text-xs text-text-muted dark:text-dark-muted">评分</span>
          </div>
          {book.chapters > 0 && (
            <div className="text-sm text-text dark:text-dark-text">共 {book.chapters} 章</div>
          )}
          {book.readTime && (
            <div className="text-sm text-text dark:text-dark-text">阅读约 {book.readTime}</div>
          )}
          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.tags.map(tag => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-8">
          <main className="flex-1 min-w-0">
            <article className="bg-bg-card dark:bg-dark-card p-4 sm:p-6 md:p-10 shadow-card rounded-card">
              <MarkdownContent content={resolveMarkdownEntityLinks(book.content)} />
            </article>

            {related.length > 0 && (
              <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif mb-4">
                  同类推荐 · {book.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {related.map(item => (
                    <Link
                      key={item.slug}
                      href={`/books/${encodeURIComponent(item.slug)}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {item.title}
                        </div>
                        {item.oneLiner && (
                          <div className="text-xs text-text-muted dark:text-dark-muted truncate">{item.oneLiner}</div>
                        )}
                      </div>
                      <span className="text-xs text-primary flex-shrink-0">★ {item.rating}</span>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Link href="/books" className="text-sm text-primary hover:text-primary-light">
                    查看全部拆书 →
                  </Link>
                </div>
              </div>
            )}
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
