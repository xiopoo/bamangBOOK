import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBloggerArticle, getBloggerArticles } from '@/lib/bloggers'
import ReadingProgress from '@/components/ReadingProgress'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'

interface PageProps {
  params: { blogger: string; id: string }
}

export default function BloggerArticleDetailPage({ params }: PageProps) {
  const bloggerName = decodeURIComponent(params.blogger)
  const fileName = decodeURIComponent(params.id)
  const doc = getBloggerArticle(bloggerName, fileName)

  if (!doc) {
    notFound()
  }

  // 同博主的推荐文章（按日期临近的5篇）
  const allArticles = getBloggerArticles(bloggerName)
  const relatedDocs = allArticles
    .filter(a => a.fileName !== fileName)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress />
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10 sticky top-1 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-text-muted dark:text-dark-muted mb-1">
                <Link href="/bloggers" className="text-primary hover:text-primary-light transition-colors">
                  博主文章
                </Link>
                <span>/</span>
                <Link href={`/bloggers/${encodeURIComponent(bloggerName)}`} className="text-primary hover:text-primary-light transition-colors">
                  {bloggerName}
                </Link>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary dark:text-primary-light">{doc.title}</h1>
              <p className="text-sm text-text-muted dark:text-dark-muted flex items-center gap-2 flex-wrap">
                {doc.date && <span>{doc.date.slice(0, 10)}</span>}
                {doc.author && doc.author !== bloggerName && <span>· {doc.author}</span>}
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    · 原文链接
                  </a>
                )}
              </p>
              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {doc.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <div className="flex gap-8">
          <main className="flex-1 min-w-0">
            <article className="bg-bg-card dark:bg-dark-card p-4 sm:p-6 md:p-10 shadow-card rounded-card">
              <MarkdownContent content={doc.content} />
            </article>

            {/* Related articles */}
            {relatedDocs.length > 0 && (
              <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif mb-4">
                  更多来自 {bloggerName} 的文章
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedDocs.map(related => (
                    <Link
                      key={related.fileName}
                      href={`/bloggers/${encodeURIComponent(bloggerName)}/${encodeURIComponent(related.fileName)}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                          {related.title}
                        </div>
                        {related.date && (
                          <div className="text-xs text-text-muted dark:text-dark-muted mt-0.5">{related.date.slice(0, 10)}</div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {(related.wordCount / 1000).toFixed(1)}千字
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Link href={`/bloggers/${encodeURIComponent(bloggerName)}`} className="text-sm text-primary hover:text-primary-light">
                    查看全部文章 →
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <footer className="bg-bg-card dark:bg-dark-card border-t border-primary/10 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-text-muted dark:text-dark-muted">
          价值投资知识宝库 · 博主文章
        </div>
      </footer>
    </div>
  )
}
