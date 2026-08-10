import type { Metadata } from 'next'
import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getDYDocs, type DYSection } from '@/lib/duanyongping'

export const metadata: Metadata = {
  title: '修订记录',
  description: '复利书房近期完成的内容修订、来源补充和资料整理记录。',
  alternates: { canonical: '/about/revisions' },
}

const labels: Record<DYSection, string> = { blog: '博客', qa: '问答', talks: '演讲与访谈', milestones: '公司里程碑' }

export default function RevisionsPage() {
  const revisions = (Object.keys(labels) as DYSection[])
    .flatMap(section => getDYDocs(section, false).map(doc => ({ section, doc })))
    .filter(item => item.doc.updatedAt)
    .sort((a, b) => String(b.doc.updatedAt).localeCompare(String(a.doc.updatedAt)))
    .slice(0, 50)
  return <PageContainer maxWidth="5xl">
    <PageHeader title="修订记录" subtitle="这里只显示具有明确修订日期的内容，不以原始内容年份冒充网站更新时间。" backHref="/about" backLabel="返回关于" />
    <div className="archive-list">{revisions.map(({ section, doc }) => <Link key={`${section}-${doc.slug}`} href={`/duanyongping/${section}/${doc.slug}`} className="archive-list__row"><span className="archive-list__year">{doc.updatedAt?.slice(0, 10)}</span><span className="archive-list__main"><strong>{doc.title}</strong><small>{labels[section]} · 编辑整理 · 最近修订</small></span><span aria-hidden="true">→</span></Link>)}</div>
  </PageContainer>
}
