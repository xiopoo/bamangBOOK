import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getBusinessHistories } from '@/lib/business-history'
import { businessHistoryHref } from '@/lib/content-routes'

export const metadata: Metadata = {
  title: '商业主题 · 公司研究',
  description: '按品牌、资本配置、平台、供应链、技术和行业主题浏览复利书房公司研究。',
  alternates: { canonical: '/business-history/themes' },
}

export default function BusinessThemesPage() {
  const histories = getBusinessHistories()
  const themes = [...new Set(histories.flatMap(item => item.tags))].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  return <PageContainer maxWidth="5xl">
    <PageHeader title="商业主题" subtitle="从共同的商业问题进入公司研究：品牌、平台、供应链、资本配置和长期竞争优势。" backHref="/business-history" backLabel="返回公司研究" />
    <div className="archive-catalog__groups">
      {themes.map(theme => {
        const items = histories.filter(item => item.tags.includes(theme))
        return <section key={theme} className="archive-catalog-section">
          <header><h2>{theme}</h2><span>{items.length} 篇研究</span></header>
          <div>{items.map(item => <Link key={item.slug} href={businessHistoryHref(item.slug)} className="archive-catalog-row"><span className="archive-catalog-row__year">研究</span><strong className="archive-catalog-row__title">{item.title}</strong><span className="archive-catalog-row__type">{item.company}</span><span className="archive-catalog-row__read">{item.readMinutes} 分钟</span><span aria-hidden="true">→</span></Link>)}</div>
        </section>
      })}
    </div>
  </PageContainer>
}
