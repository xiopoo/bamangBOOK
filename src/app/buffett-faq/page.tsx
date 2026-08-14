import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getAllBuffettFaqTopics } from '@/lib/buffett-faq'

export const metadata: Metadata = {
  title: '巴菲特主题问答 · 英文原档',
  description: 'Buffett FAQ 主题汇编：巴菲特在访谈、商学院座谈与杂志报道中的问答英文原档，按主题分页整理（已剔除与股东大会实录重复的内容）。',
  alternates: { canonical: '/buffett-faq' },
}

export default function BuffettFaqArchivePage() {
  const topics = getAllBuffettFaqTopics().filter(t => t.slug !== 'buffettfaq')
  const total = topics.reduce((sum, t) => sum + t.questionCount, 0)

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="巴菲特主题问答 · 英文原档"
        subtitle={`按主题整理的巴菲特问答汇编（非年会来源），英文原档，共 ${total} 条。`}
        backHref="/qa"
        backLabel="返回问答栏目"
      />
      <p className="mb-6 text-sm text-text-muted dark:text-dark-muted">
        原始来源：Buffett FAQ（buffettfaq.com，编译者 Nick Webb）。已剔除与「股东大会英文原档实录」重复的年会问答，保留媒体访谈、商学院座谈等独有内容。
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map(topic => (
          <Link
            key={topic.slug}
            href={`/buffett-faq/${encodeURIComponent(topic.slug)}`}
            className="group flex flex-col justify-between gap-3 rounded-card border border-gray-100 bg-white p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover dark:border-dark-border dark:bg-dark-card"
          >
            <div>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <h2 className="text-base font-bold text-primary dark:text-primary-light">{topic.label}</h2>
                <span className="shrink-0 text-xs text-text-muted dark:text-dark-muted">{topic.questionCount} 条</span>
              </div>
              <p className="text-sm text-text-muted dark:text-dark-muted">{topic.title}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-text-muted dark:text-dark-muted">
              <span>{topic.yearRange || '—'}</span>
              <span className="text-primary transition-transform group-hover:translate-x-0.5 dark:text-primary-light">阅读 →</span>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}
