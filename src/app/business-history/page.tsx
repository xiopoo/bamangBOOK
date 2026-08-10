import Link from 'next/link'
import type { Metadata } from 'next'
import { Building2, Clock, FileText, Tags } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import CatalogStats from '@/components/CatalogStats'
import { getBusinessHistories, getBusinessHistoryStats } from '@/lib/business-history'

export const metadata: Metadata = {
  title: '公司深度研究',
  description: '16 家代表性公司的中文深度研究：商业模式、护城河、资本配置、风险与长期价值。',
}

export default function BusinessHistoryPage() {
  const histories = getBusinessHistories()
  const stats = getBusinessHistoryStats()

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title="公司深度研究"
        subtitle="16 家公司，16 份完整研究。回到历史、商业模式、护城河、资本配置与风险，而不是只看一张估值表。"
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      <CatalogStats items={[
        { value: `${stats.companies} 家`, label: '研究对象', detail: '公司与资产', icon: '🏢' },
        { value: `${stats.total} 篇`, label: '深度研究', detail: '完整长稿', icon: '📄' },
        { value: `${stats.tags} 个`, label: '主题标签', detail: '多维检索', icon: '🏷️' },
      ]} />

      {histories.length === 0 ? (
        <div className="py-16 text-center text-text-muted dark:text-dark-muted">
          暂无公司深度研究。
        </div>
      ) : (
        <div className="archive-list">
          {histories.map((item) => (
            <Link
              key={item.slug}
              href={`/business-history/${encodeURIComponent(item.slug)}`}
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
                <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {item.company}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 约 {item.readMinutes} 分钟</span>
                {item.sourcePdf && <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> 来源 PDF</span>}
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="archive-tag">
                    <Tags className="h-3 w-3" />
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
