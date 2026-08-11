import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { getLetterByYear } from '@/lib/letters'
import LetterReader from '@/components/LetterReader'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import BerkshireSourceLink from '@/components/BerkshireSourceLink'
import JsonLd, { breadcrumbJsonLd } from '@/components/JsonLd'
import type { Metadata } from 'next'
import { letterYearParams } from '@/lib/staticParams'
import { getLetterArchiveHref } from '@/lib/letter-links'
import { companyIds, conceptIds, resolvePersonRouteId } from '@/lib/entity-resolver'
import ReadingMetadata from '@/components/ReadingMetadata'

export function generateStaticParams() {
  return letterYearParams()
}

interface LetterGraphData {
  year: string
  concepts: Array<{
    id: string
    name: string
    description: string
    count: number
    totalCount: number
    years: string[]
    relatedConcepts: Array<{ id: string; name: string; count: number }>
    relatedPeople: Array<{ id: string; name: string; count: number }>
  }>
  people: Array<{ id: string; name: string; count: number }>
  companies: Array<{ id: string; name: string; count: number }>
  summary: {
    conceptCount: number
    peopleCount: number
    companyCount: number
  }
}

interface PageProps {
  params: { year: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `${params.year}年巴菲特致股东信`,
    description: `阅读${params.year}年巴菲特致伯克希尔股东的信，并浏览相关概念、人物与公司索引。`,
    alternates: { canonical: `/letters/${params.year}` },
    openGraph: { title: `${params.year}年巴菲特致股东信`, type: 'article' },
  }
}

function loadLetterGraphData(year: string): LetterGraphData | null {
  try {
    const graphPath = path.join(process.cwd(), 'content/graph', `${year}.json`)
    if (!existsSync(graphPath)) return null
    return JSON.parse(readFileSync(graphPath, 'utf-8'))
  } catch {
    return null
  }
}

export default async function LetterDetailPage({ params }: PageProps) {
  const year = params.year
  const yearNum = parseInt(year)
  const letterData = getLetterByYear(year)

  if (!letterData) {
    notFound()
  }

  const isMultiLetter = letterData.letters && letterData.letters.length > 1
  const letterTitle = `${year}年巴菲特致股东信`

  const rawGraphData = loadLetterGraphData(year)
  const graphData = rawGraphData ? {
    ...rawGraphData,
    concepts: rawGraphData.concepts.filter(item => conceptIds.has(item.name)),
    people: rawGraphData.people
      .map(item => ({ ...item, name: resolvePersonRouteId(item.name) }))
      .filter((item): item is { id: string; name: string; count: number } => Boolean(item.name)),
    companies: rawGraphData.companies.filter(item => companyIds.has(item.name)),
  } : null
  const topConcepts = graphData?.concepts?.slice(0, 5) || []
  const relatedPeople = graphData?.people || []
  const relatedCompanies = graphData?.companies || []

  const showKnowledgePanel = topConcepts.length > 0 || relatedPeople.length > 0 || relatedCompanies.length > 0

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <JsonLd data={breadcrumbJsonLd([
        { name: '首页', href: '/' },
        { name: '巴菲特股东信全集', href: '/letters' },
        { name: letterTitle },
      ])} />
      <ReadingProgress />
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/letters" className="text-sm text-primary hover:text-primary-light transition-colors mb-2 inline-flex items-center gap-1">
                ← 返回信全集
              </Link>
              <h1 className="text-4xl font-serif font-bold text-primary dark:text-primary-light">{year}年</h1>
              <p className="text-sm text-text-muted dark:text-dark-muted">
                巴菲特致伯克希尔股东的信
                {isMultiLetter && `（共${letterData.letters?.length}封）`}
              </p>
            </div>
            <FontSizeControlFixed />
          </div>
          <ReadingMetadata person="巴菲特" year={yearNum} contentType="信件" sourceLabel="伯克希尔·哈撒韦年度股东信" status="译文" readMinutes={Math.max(8, Math.round((letterData.content?.length || letterData.letters?.reduce((sum, item) => sum + item.content.length, 0) || 0) / 900))} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-5 md:py-8">
        {showKnowledgePanel && (
          <div className="knowledge-panel">
            <h2 className="knowledge-panel__title">知识图谱</h2>
            {topConcepts.length > 0 && (
              <div className="mb-5">
                <h3 className="knowledge-panel__label">核心概念</h3>
                <div className="flex flex-wrap gap-2">
                  {topConcepts.map((concept) => (
                    <Link
                      key={concept.id}
                      href={`/concepts/${encodeURIComponent(concept.name)}`}
                      className="knowledge-panel__tag"
                    >
                      {concept.name}
                      <span className="opacity-70 ml-1">({concept.count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-5">
              {relatedPeople.length > 0 && (
                <div>
                  <h3 className="knowledge-panel__label">人物</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedPeople.slice(0, 5).map((person: any) => (
                      <Link key={person.id} href={`/people/${encodeURIComponent(person.name)}`} className="knowledge-panel__tag">
                        {person.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {relatedCompanies.length > 0 && (
                <div>
                  <h3 className="knowledge-panel__label">公司</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedCompanies.slice(0, 5).map((company: any) => (
                      <Link key={company.id} href={`/companies/${encodeURIComponent(company.name)}`} className="knowledge-panel__tag">
                        {company.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="reading-content-layout">
          <main className="reading-content-layout__main min-w-0">
            <LetterReader
              letterData={letterData}
              graphData={graphData}
              year={yearNum}
              letterTitle={letterTitle}
              isPartnerLetter={false}
              isMultiLetter={!!isMultiLetter}
            />
            <BerkshireSourceLink year={yearNum} />
          </main>
          <ArticleTableOfContents />
        </div>

        {/* —— 上下篇（年份）导航：统一使用 CN Reading 阅读规范样式 —— */}
        <p className="archive-sort-note">按时间从早到晚 · 上一封为前一年，下一封为后一年</p>
        <nav className="reading-nav-pair reading-adjacent" aria-label="相邻股东信导航">
          {yearNum > 1956 ? (
            <Link
              href={getLetterArchiveHref(yearNum - 1)}
              className="nav-prev"
              rel="prev"
            >
              <span className="reading-adjacent__label">
                ‹ 上一封信 · 前一年
              </span>
              <span className="reading-adjacent__title">
                {yearNum - 1} 年巴菲特致股东信
              </span>
            </Link>
          ) : (
            <span className="nav-pair-btn nav-prev" aria-disabled>
              <span className="reading-adjacent__label">已是最早一封</span>
              <span className="reading-adjacent__title">1956 年起的股东信</span>
            </span>
          )}
          {yearNum < 2025 ? (
            <Link
              href={`/letters/${yearNum + 1}`}
              className="nav-next"
              rel="next"
            >
              <span className="reading-adjacent__label">
                下一封信 · 后一年 ›
              </span>
              <span className="reading-adjacent__title">
                {yearNum + 1} 年巴菲特致股东信
              </span>
            </Link>
          ) : (
            <span className="nav-pair-btn nav-next" aria-disabled>
              <span className="reading-adjacent__label">已是最新一封</span>
              <span className="reading-adjacent__title">后续年度会持续整理</span>
            </span>
          )}
        </nav>
      </div>

    </div>
  )
}
