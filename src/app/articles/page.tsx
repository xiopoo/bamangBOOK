import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getAllArticles } from '@/lib/articles'

export const metadata: Metadata = {
  title: '中文文章',
  description: '本站整理的中文投资文章，按时间顺序阅读。',
  alternates: { canonical: '/articles' },
}

export default function ArticlesPage() {
  const articles = getAllArticles().slice().sort((a, b) => (b.year || '').localeCompare(a.year || '') || a.title.localeCompare(b.title, 'zh'))

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader title="中文文章" backHref="/reading" backLabel="返回阅读总库" />
      <ol className="archive-list">
        {articles.map(article => (
          <li key={article.slug}>
            <Link href={`/articles/${article.slug}`} className="archive-list__row">
              <span className="archive-list__year">{article.year || '待考'}</span>
              <span className="archive-list__main">
                <strong>{article.title}</strong>
                {article.summary && <small>{article.summary}</small>}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </PageContainer>
  )
}
