import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBusinessHistories, getBusinessHistoryBySlug } from '@/lib/business-history'
import { businessHistoryParams } from '@/lib/staticParams'
import MarkdownContent from '@/components/MarkdownContent'
import { businessHistoryHref } from '@/lib/content-routes'
import ReadingArticleShell from '@/components/ReadingArticleShell'

export function generateStaticParams() {
  return businessHistoryParams()
}

interface PageProps {
  params: { slug: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = getBusinessHistoryBySlug(decodeURIComponent(params.slug))
  if (!item) return { title: '公司深度研究未找到' }
  return {
    title: `${item.title} · 公司深度研究`,
    description: item.summary
      || item.content.replace(/[#>*_`\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 150),
    alternates: { canonical: businessHistoryHref(item.slug) },
    openGraph: { title: item.title, type: 'article' },
  }
}

export default function BusinessHistoryDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const item = getBusinessHistoryBySlug(slug)

  if (!item) {
    notFound()
  }

  const histories = getBusinessHistories()
  const related = histories
    .filter(candidate => candidate.slug !== slug)
    .slice(0, 6)
  const index = histories.findIndex(candidate => candidate.slug === slug)
  const previous = index > 0 ? histories[index - 1] : null
  const next = index >= 0 && index < histories.length - 1 ? histories[index + 1] : null
  const sourceLabel = item.sourcePdf ? `${item.company} 公司研究资料（${item.sourcePdf}）` : '公司公开资料与研究档案'

  return (
    <ReadingArticleShell
      title={item.title}
      subtitle={item.summary}
      backHref="/business-history"
      backLabel="返回公司深度研究"
      metadata={{ person: item.company, contentType: '公司研究', sourceLabel, status: '编辑整理', completeness: '完整', readMinutes: item.readMinutes }}
      previous={previous ? { href: businessHistoryHref(previous.slug), title: previous.title, meta: previous.company } : null}
      next={next ? { href: businessHistoryHref(next.slug), title: next.title, meta: next.company } : null}
      navigationLabel="按公司研究目录顺序的相邻内容"
      related={related.length > 0 ? <section className="mt-10 border-t border-[var(--archive-rule)] pt-6"><h2 className="mb-4 font-serif text-lg font-bold">延伸研究</h2><ul className="grid gap-3 sm:grid-cols-2">{related.map(candidate => <li key={candidate.slug}><Link href={businessHistoryHref(candidate.slug)} className="block border border-[var(--archive-rule)] p-3 text-sm hover:text-primary">{candidate.title}</Link></li>)}</ul></section> : null}
    ><MarkdownContent content={item.content} /></ReadingArticleShell>
  )
}
