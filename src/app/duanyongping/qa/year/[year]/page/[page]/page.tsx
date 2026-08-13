import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DYList from '@/components/DYList'
import { getDYDocs, getDYQAYearPage, getDYYearKey, DY_QA_PAGE_SIZE } from '@/lib/duanyongping'
import Link from 'next/link'

interface PageProps {
  params: { year: string; page: string }
}

function decodeYearParam(value: string): string {
  const year = decodeURIComponent(value)
  return year === 'unknown' ? '未知' : year
}

function getPageNumber(value: string): number {
  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 1 ? page : 1
}

export function generateStaticParams() {
  const years = new Set(getDYDocs('qa', false).map(getDYYearKey))
  return [...years].flatMap((year) => {
    const total = getDYDocs('qa', false).filter((doc) => getDYYearKey(doc) === year).length
    const totalPages = Math.ceil(total / DY_QA_PAGE_SIZE)
    const yearParam = year === '未知' ? 'unknown' : year
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
      year: yearParam,
      page: String(index + 2),
    }))
  })
}

export function generateMetadata({ params }: PageProps): Metadata {
  const year = decodeYearParam(params.year)
  const page = getPageNumber(params.page)
  return {
    title: `${year === '未知' ? '未标注年份' : `${year} 年`}雪球问答 · 第 ${page} 页`,
    description: `段永平${year === '未知' ? '未标注年份' : `${year} 年`}雪球问答第 ${page} 页。`,
    alternates: { canonical: `/duanyongping/qa/year/${params.year}/page/${params.page}` },
  }
}

export default function Page({ params }: PageProps) {
  const year = decodeYearParam(params.year)
  const result = getDYQAYearPage(year, getPageNumber(params.page))
  if (result.total === 0 || result.page !== getPageNumber(params.page)) notFound()
  const yearParam = year === '未知' ? 'unknown' : year

  return (
    <DYList
      docs={result.docs}
      basePath="/duanyongping/qa"
      title={`${year === '未知' ? '未标注年份' : `${year} 年`} · 段永平雪球问答`}
      subtitle={`共 ${result.total} 条问答，每页 ${DY_QA_PAGE_SIZE} 条`}
      metaField="year"
      groupByYearEnabled={false}
      inlineContent
      footer={<nav className="mt-8 flex flex-wrap items-center justify-center gap-3" aria-label="问答分页"><Link href={result.page === 2 ? `/duanyongping/qa/year/${encodeURIComponent(yearParam)}` : `/duanyongping/qa/year/${encodeURIComponent(yearParam)}/page/${result.page - 1}`} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-primary dark:border-dark-border dark:bg-dark-card dark:text-dark-muted">← 上一页</Link><span className="text-sm text-text-muted dark:text-dark-muted">第 {result.page} / {result.totalPages} 页</span>{result.page < result.totalPages && <Link href={`/duanyongping/qa/year/${encodeURIComponent(yearParam)}/page/${result.page + 1}`} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-primary dark:border-dark-border dark:bg-dark-card dark:text-dark-muted">下一页 →</Link>}</nav>}
    />
  )
}
