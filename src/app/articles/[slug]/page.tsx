import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import ArticleContent from '@/components/ArticleContent'
import JsonLd, { breadcrumbJsonLd } from '@/components/JsonLd'
import EntityChips from '@/components/EntityChips'
import { getAllArticles, getArticleBySlug } from '@/lib/articles'

interface PageProps { params: { slug: string } }

function personHref(person?: string): string | null {
  if (!person) return null
  if (person === '巴菲特') return '/buffett'
  if (person === '芒格') return '/munger'
  if (person === '段永平') return '/duanyongping'
  return null
}

export function generateStaticParams() {
  return getAllArticles().map(article => ({ slug: article.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = getArticleBySlug(decodeURIComponent(params.slug))
  if (!article) return { title: '文章' }
  const { meta } = article
  return {
    title: `${meta.title} · 文章`,
    description: meta.summary || `${meta.title}：延伸阅读文章。`,
    alternates: { canonical: `/articles/${encodeURIComponent(meta.slug)}` },
    openGraph: { title: meta.title, type: 'article' },
  }
}

export default function ArticleDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const article = getArticleBySlug(slug)
  if (!article) notFound()
  const { meta, content } = article

  const breadcrumb = [{ name: '首页', href: '/' }, { name: meta.title }]
  if (meta.person) {
    const href = personHref(meta.person)
    if (href) breadcrumb.splice(1, 0, { name: meta.person, href })
  }

  return <>
    <JsonLd data={breadcrumbJsonLd(breadcrumb)} />
    <ReadingArticleShell
      title={meta.title}
      backHref="/"
      backLabel="返回复利书房"
      metadata={{
        person: meta.person,
        year: meta.year,
        contentType: '文章',
        readMinutes: Math.max(3, Math.round(meta.wordCount / 700)),
      }}
      related={<EntityChips entities={meta.entities} />}
    >
      <ArticleContent content={content} />
    </ReadingArticleShell>
  </>
}
