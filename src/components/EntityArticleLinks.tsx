import Link from 'next/link'
import { getEntityArticles } from '@/lib/articles'

interface EntityArticleLinksProps {
  entityName: string
  limit?: number
}

/**
 * 概念/公司/人物详情页的「延伸阅读」区块：
 * 列出 entities 元数据中标注了该实体的文章。
 */
export default function EntityArticleLinks({ entityName, limit = 5 }: EntityArticleLinksProps) {
  const articles = getEntityArticles(entityName, limit)
  if (!articles.length) return null

  return (
    <section className="mt-8 bg-white dark:bg-dark-card rounded-card border border-gray-100 dark:border-dark-border p-6 shadow-card">
      <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
        延伸阅读 · 相关文章
      </h2>
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${encodeURIComponent(article.slug)}`}
              className="group flex flex-col gap-1 rounded-card border border-primary/15 bg-bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-card-hover dark:bg-dark-card dark:border-primary/20"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium text-text-base group-hover:text-primary dark:text-dark-base">
                  {article.title}
                </span>
                <span className="shrink-0 text-xs text-text-muted dark:text-dark-muted">
                  {[article.person, article.year].filter(Boolean).join(' · ')}
                </span>
              </div>
              {article.summary && (
                <p className="text-xs text-text-muted dark:text-dark-muted line-clamp-1">
                  {article.summary}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
