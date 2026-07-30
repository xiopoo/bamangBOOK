import Link from 'next/link'
import type { Metadata } from 'next'
import { Building2, Clock, FileText, Tags } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'
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

      <div className="mb-10 grid grid-cols-3 gap-3">
        <StatBadge icon="🏢" count={`${stats.companies}家`} label="研究对象" sub="公司与资产" />
        <StatBadge icon="📄" count={`${stats.total}篇`} label="深度研究" sub="完整长稿" />
        <StatBadge icon="🏷️" count={`${stats.tags}个`} label="主题标签" sub="多维检索" />
      </div>

      {histories.length === 0 ? (
        <div className="py-16 text-center text-text-muted dark:text-dark-muted">
          暂无公司深度研究。
        </div>
      ) : (
        <div className="space-y-3">
          {histories.map((item) => (
            <Link
              key={item.slug}
              href={`/business-history/${encodeURIComponent(item.slug)}`}
              className="group block border border-gray-100 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-card-hover dark:border-dark-border dark:bg-dark-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-text transition-colors group-hover:text-primary dark:text-dark-text">
                    {item.title}
                  </h2>
                  {item.summary && (
                    <p className="mt-2 text-sm leading-6 text-text-muted dark:text-dark-muted">{item.summary}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {item.company}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted dark:text-dark-muted">
                <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {item.company}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 约 {item.readMinutes} 分钟</span>
                {item.sourcePdf && <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> 来源 PDF</span>}
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    <Tags className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      <PageFooter />
    </PageContainer>
  )
}
