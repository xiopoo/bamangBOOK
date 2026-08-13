import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import ArticleContent from '@/components/ArticleContent'
import JsonLd, { breadcrumbJsonLd } from '@/components/JsonLd'
import { getAllBuffettFaqTopics, getBuffettFaqTopic } from '@/lib/buffett-faq'

interface PageProps { params: { slug: string } }

export function generateStaticParams() {
  // 总目录页 buffettfaq.md 内嵌全部主题问答，不单独生成详情页
  return getAllBuffettFaqTopics()
    .filter(t => t.slug !== 'buffettfaq')
    .map(t => ({ slug: t.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const data = getBuffettFaqTopic(decodeURIComponent(params.slug))
  if (!data) return { title: '主题问答' }
  const { topic } = data
  return {
    title: `${topic.label} · 巴菲特主题问答`,
    description: `${topic.label}（${topic.title}）：巴菲特相关问答英文原档 ${topic.questionCount} 条，${topic.yearRange || ''}。`,
    alternates: { canonical: `/buffett-faq/${encodeURIComponent(topic.slug)}` },
  }
}

export default function BuffettFaqDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const data = getBuffettFaqTopic(slug)
  if (!data) notFound()
  const { topic, content } = data
  const others = getAllBuffettFaqTopics().filter(t => t.slug !== 'buffettfaq' && t.slug !== slug).slice(0, 6)

  return <>
    <JsonLd data={breadcrumbJsonLd([
      { name: '首页', href: '/' },
      { name: '巴菲特主题问答', href: '/buffett-faq' },
      { name: topic.label },
    ])} />
    <ReadingArticleShell
      title={topic.title}
      subtitle={`${topic.label} · 共 ${topic.questionCount} 条问答`}
      backHref="/buffett-faq"
      backLabel="返回主题问答"
      metadata={{
        year: topic.yearRange || undefined,
        contentType: '问答',
        sourceLabel: 'Buffett FAQ',
        sourceUrl: 'https://buffettfaq.com/',
        status: '编辑整理',
        readMinutes: Math.max(3, Math.round(topic.wordCount / 220)),
      }}
      related={
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted dark:text-dark-muted">其他主题</h2>
          <ul className="space-y-1.5">
            {others.map(other => (
              <li key={other.slug}>
                <Link
                  href={`/buffett-faq/${encodeURIComponent(other.slug)}`}
                  className="group flex items-center justify-between gap-3 rounded px-3 py-2 text-sm text-text-muted transition-colors hover:bg-primary/5 hover:text-primary dark:text-dark-muted dark:hover:text-primary-light"
                >
                  <span className="min-w-0 truncate">{other.label}<span className="ml-2 text-xs opacity-60">{other.title}</span></span>
                  <span className="shrink-0 text-xs opacity-60">{other.questionCount} 条</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      }
    >
      <ArticleContent content={content} />
    </ReadingArticleShell>
  </>
}
