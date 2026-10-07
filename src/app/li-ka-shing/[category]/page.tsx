import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import {
  getLiCategoryBySlug,
  getLiDocumentsByCategory,
  LI_CATEGORIES,
} from '@/lib/li-ka-shing'

interface PageProps {
  params: { category: string }
}

export function generateStaticParams() {
  return LI_CATEGORIES.map(c => ({ category: c.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const cat = getLiCategoryBySlug(params.category)
  if (!cat) return { title: '栏目未找到' }
  return {
    title: `${cat.title}｜李嘉诚专题`,
    description: cat.description,
    alternates: { canonical: `/li-ka-shing/${cat.slug}` },
  }
}

export default function LiCategoryPage({ params }: PageProps) {
  const cat = getLiCategoryBySlug(params.category)
  if (!cat) notFound()
  const docs = getLiDocumentsByCategory(cat.slug)

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title={cat.title}
        subtitle={`${cat.description} 共 ${docs.length} 篇`}
        backHref="/li-ka-shing"
        backLabel="返回李嘉诚专题"
      />
      <ul className="flex flex-col gap-3 mt-8">
        {docs.map(doc => (
          <li key={doc.fileName}>
            <Link
              href={doc.href}
              className="block rounded-lg border border-neutral-200 dark:border-neutral-800 px-5 py-4 hover:border-[#AB1942] transition-colors"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-base sm:text-lg font-medium leading-snug">
                  {doc.title}
                </h2>
                <span className="shrink-0 text-sm text-neutral-500 tabular-nums">
                  {doc.year ? `${doc.year} 年` : '年份待考'}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                约 {doc.readMinutes} 分钟阅读 · {doc.wordCount?.toLocaleString() ?? 0} 字
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  )
}
