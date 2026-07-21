import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import { getBloggers, getBloggerArticles, getBloggerStats } from '@/lib/bloggers'

interface PageProps {
  params: { blogger: string }
}

export default function BloggerArticlesPage({ params }: PageProps) {
  const bloggerName = decodeURIComponent(params.blogger)
  const articles = getBloggerArticles(bloggerName)
  const stats = getBloggerStats(bloggerName)
  
  if (!stats || articles.length === 0) {
    notFound()
  }

  const bloggers = getBloggers()
  const totalBloggers = bloggers.length
  
  // 按年份分组
  const articlesByYear: Record<string, typeof articles> = {}
  articles.forEach(a => {
    const year = a.year?.toString() || '未知'
    if (!articlesByYear[year]) articlesByYear[year] = []
    articlesByYear[year].push(a)
  })
  
  // 按年份倒序排列
  const sortedYears = Object.keys(articlesByYear).sort((a, b) => {
    if (a === '未知') return 1
    if (b === '未知') return -1
    return parseInt(b) - parseInt(a)
  })

  const tagList = stats.tags.slice(0, 8)

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title={`📡 ${bloggerName}`}
        subtitle={`共 ${stats.total} 篇文章 · ${stats.dateRange}`}
        backHref="/bloggers"
        backLabel="返回博主列表"
        sticky
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-text-muted dark:text-dark-muted mt-0.5">文章总数</div>
        </div>
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{sortedYears.length}</div>
          <div className="text-xs text-text-muted dark:text-dark-muted mt-0.5">年份跨度</div>
        </div>
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{stats.tags.length}</div>
          <div className="text-xs text-text-muted dark:text-dark-muted mt-0.5">主题标签</div>
        </div>
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{totalBloggers}</div>
          <div className="text-xs text-text-muted dark:text-dark-muted mt-0.5">博主总数</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tagList.map(({ tag, count }) => (
          <span
            key={tag}
            className="text-xs px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700"
          >
            {tag} <span className="text-gray-400 ml-0.5">{count}</span>
          </span>
        ))}
      </div>

      {/* Articles by year */}
      <div className="space-y-10">
        {sortedYears.map(year => (
          <section key={year}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 font-serif">{year}</h2>
              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                {articlesByYear[year].length}篇
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="space-y-2">
              {articlesByYear[year].map(article => (
                <Link
                  key={article.fileName}
                  href={`/bloggers/${encodeURIComponent(bloggerName)}/${encodeURIComponent(article.fileName)}`}
                  className="block bg-white dark:bg-dark-card p-3.5 rounded-lg border border-gray-100 dark:border-dark-border hover:shadow-card-hover hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {article.date && (
                          <span className="text-xs text-text-muted dark:text-dark-muted whitespace-nowrap">
                            {article.date.slice(0, 10)}
                          </span>
                        )}
                        <h3 className="text-base font-medium text-text dark:text-dark-text leading-snug">
                          {article.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-text-muted dark:text-dark-muted whitespace-nowrap flex-shrink-0">
                      {(article.wordCount / 1000).toFixed(1)}千字
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <PageFooter />
    </PageContainer>
  )
}
