import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getBusinessHistories } from '@/lib/business-history'
import { businessHistoryHref } from '@/lib/content-routes'

export const metadata: Metadata = {
  title: '公司深度研究',
  description: '代表性公司的中文深度研究：商业模式、护城河、资本配置、风险与长期价值。',
  alternates: { canonical: '/business-history' },
}

export default function BusinessHistoryPage() {
  const histories = getBusinessHistories()

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title="公司深度研究"
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      {histories.length === 0 ? (
        <div className="py-16 text-center text-text-muted dark:text-dark-muted">
          暂无公司深度研究。
        </div>
      ) : (
        <div className="archive-list">
          {histories.map((item) => (
            <Link
              key={item.slug}
              href={businessHistoryHref(item.slug)}
              className="archive-list__item group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="archive-list__title group-hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  {item.summary && (
                    <p className="archive-list__summary">{item.summary}</p>
                  )}
                </div>
                <span className="archive-content-card__badge">
                  {item.company}
                </span>
              </div>

              <div className="archive-list__meta">
                <span>{item.company}</span>
                <span>约 {item.readMinutes} 分钟</span>
                {item.sourcePdf && <span>来源 PDF</span>}
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="archive-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

    </PageContainer>
  )
}
