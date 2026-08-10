import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import { getColumnsBySeries, getColumnStats } from '@/lib/columns'

export const metadata: Metadata = {
  title: '投资策略与思考',
  description: '价值投资的原则、策略与独立思考——按系列组织的长期专栏。',
  alternates: { canonical: '/columns' },
}

export default function ColumnsPage() {
  const series = getColumnsBySeries()
  const stats = getColumnStats()

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title="✍️ 投资策略与思考"
        subtitle="价值投资的原则、策略与独立思考，按系列持续更新"
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <StatBadge icon="✍️" count={`${stats.total}篇`} label="专栏文章" sub="持续更新" />
        <StatBadge icon="📚" count={`${stats.series}个`} label="系列专题" sub="成体系" />
        <StatBadge icon="🏷️" count={`${stats.tags}个`} label="主题标签" sub="多维检索" />
      </div>

      {series.length === 0 ? (
        <div className="text-center text-text-muted dark:text-dark-muted py-16">
          暂无专栏内容，敬请期待。
        </div>
      ) : (
        <div className="space-y-10">
          {series.map(group => (
            <section key={group.series}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif">{group.series}</h2>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                  {group.columns.length}篇
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="space-y-3">
                {group.columns.map((column, index) => (
                  <Link
                    key={column.slug}
                    href={`/columns/${encodeURIComponent(column.slug)}`}
                    className="group block bg-white dark:bg-dark-card p-4 sm:p-5 rounded-card border border-gray-100 dark:border-dark-border hover:shadow-card-hover hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center mt-0.5">
                        {column.order || index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-text dark:text-dark-text group-hover:text-primary transition-colors">
                          {column.title}
                        </h3>
                        {column.summary && (
                          <p className="text-sm text-text-muted dark:text-dark-muted mt-1">{column.summary}</p>
                        )}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-text-muted dark:text-dark-muted">
                          {column.date && <span>{column.date}</span>}
                          <span>约 {column.readMinutes} 分钟</span>
                          {column.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
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
