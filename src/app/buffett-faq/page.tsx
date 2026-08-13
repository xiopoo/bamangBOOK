import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getAllBuffettFaqTopics } from '@/lib/buffett-faq'

export const metadata: Metadata = {
  title: '巴菲特主题问答 · 英文原档',
  description: 'Buffett FAQ 主题汇编：巴菲特在年会与访谈中对投资、估值、会计、管理、市场等主题的问答英文原档，按主题分页整理。',
  alternates: { canonical: '/buffett-faq' },
}

export default function BuffettFaqArchivePage() {
  const topics = getAllBuffettFaqTopics().filter(t => t.slug !== 'buffettfaq')

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="巴菲特主题问答 · 英文原档"
        subtitle="按主题整理的巴菲特问答汇编（1977–2015 年会实录摘录），英文原档。"
        backHref="/qa"
        backLabel="返回问答栏目"
      />
      <p className="mb-6 text-sm text-text-muted dark:text-dark-muted">
        原始来源：Buffett FAQ（buffettfaq.com，编译者 Nick Webb），引文出处逐条注于各问答之后。
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
