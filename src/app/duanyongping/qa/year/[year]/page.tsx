import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import DYList from '@/components/DYList'
import { getDYDocs, getDYQAYearPage, getDYYearKey } from '@/lib/duanyongping'

interface PageProps {
  params: { year: string }
}

function decodeYearParam(value: string): string {
  const year = decodeURIComponent(value)
  return year === 'unknown' ? '未知' : year
}

export function generateStaticParams() {
  const years = new Set(getDYDocs('qa', false).map(getDYYearKey))
  return [...years].map((year) => ({ year: year === '未知' ? 'unknown' : year }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const year = decodeYearParam(params.year)
  return {
    title: `${year === '未知' ? '未标注年份' : `${year} 年`} · 段永平雪球问答`,
    description: `段永平${year === '未知' ? '未标注年份' : `${year} 年`}雪球问答，按时间顺序阅读。`,
    alternates: { canonical: `/duanyongping/qa/year/${params.year}` },
  }
}

export default function Page({ params }: PageProps) {
  const year = decodeYearParam(params.year)
  const result = getDYQAYearPage(year, 1)
  if (result.total === 0) notFound()

  return (
    <DYList
      docs={result.docs}
      basePath="/duanyongping/qa"
      title={`${year === '未知' ? '未标注年份' : `${year} 年`} · 段永平雪球问答`}
      subtitle={`共 ${result.total} 条问答，每页 50 条，按时间顺序阅读。`}
      metaField="year"
      groupByYearEnabled={false}
      inlineContent
      footer={<QAPagination year={year} page={result.page} totalPages={result.totalPages} />}
    />
  )
}

function QAPagination({ year, page, totalPages }: { year: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null
  const yearParam = year === '未知' ? 'unknown' : year
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="问答分页">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
        <Link
          key={item}
          href={item === 1 ? `/duanyongping/qa/year/${encodeURIComponent(yearParam)}` : `/duanyongping/qa/year/${encodeURIComponent(yearParam)}/page/${item}`}
          aria-current={item === page ? 'page' : undefined}
          className={`inline-flex min-w-9 items-center justify-center rounded-full border px-3 py-1.5 text-sm transition-colors ${item === page ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-text-muted hover:border-primary/40 hover:text-primary dark:border-dark-border dark:bg-dark-card dark:text-dark-muted'}`}
        >
          {item}
        </Link>
      ))}
    </nav>
  )
}
