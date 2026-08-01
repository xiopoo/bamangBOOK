import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import { getBooksByCategory, getBookStats } from '@/lib/books'

export const metadata: Metadata = {
  title: '深度拆书',
  description: '价值投资经典书籍的结构化拆解：核心观点、金句摘录与知识关联。',
}

export default function BooksPage() {
  const groups = getBooksByCategory()
  const stats = getBookStats()

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="📚 深度拆书"
        subtitle="价值投资经典的结构化拆解：核心观点、金句摘录与知识关联"
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatBadge icon="📚" count={`${stats.total}本`} label="已拆解书籍" sub="持续更新" />
        <StatBadge icon="📂" count={`${stats.categories}类`} label="主题分类" sub="按主题浏览" />
        <StatBadge icon="📖" count={`${stats.totalChapters}章`} label="拆解章节" sub="结构化内容" />
        <StatBadge icon="⭐" count={stats.avgRating.toFixed(1)} label="平均评分" sub="精选好书" />
      </div>

      {groups.length === 0 ? (
        <div className="text-center text-text-muted dark:text-dark-muted py-16">
          暂无拆书内容，敬请期待。
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(group => (
            <section key={group.category}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif">{group.category}</h2>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                  {group.books.length}本
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.books.map(book => (
                  <Link
                    key={book.slug}
                    href={`/books/${encodeURIComponent(book.slug)}`}
                    className="group flex flex-col bg-white dark:bg-dark-card p-5 rounded-card border border-gray-100 dark:border-dark-border hover:shadow-card-hover hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-text dark:text-dark-text group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <span className="flex-shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg whitespace-nowrap">
                        ★ {book.rating}
                      </span>
                    </div>
                    {(book.author || book.originalAuthor) && (
                      <p className="text-sm text-text-muted dark:text-dark-muted mt-1">
                        {book.originalAuthor ? `${book.originalAuthor}` : book.author}
                      </p>
                    )}
                    {book.oneLiner && (
                      <p className="text-sm text-text-muted dark:text-dark-muted mt-3 flex-1">{book.oneLiner}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted dark:text-dark-muted">
                      {book.readTime && <span>⏱ {book.readTime}</span>}
                      {book.chapters > 0 && <span>📖 {book.chapters} 章</span>}
                    </div>
                    {book.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {book.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

    </PageContainer>
  )
}
