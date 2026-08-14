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
import BlogArchiveLinks from '@/components/BlogArchiveLinks'

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

  // 阅读优先重构：移除页面顶部的知识图谱面板，正文中的概念/人物/公司交叉链接
  // 仍由 LetterReader 依据 graphData 渲染，阅读与查找互不干扰。

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
              <h1 className="text-3xl md:text-4xl font-bold text-text dark:text-dark-text tracking-tight">{year}年</h1>
              <p className="text-sm text-text-muted dark:text-dark-muted">
                巴菲特致伯克希尔股东的信
                {isMultiLetter && `（共${letterData.letters?.length}封）`}
              </p>
            </div>
            <FontSizeControlFixed />
          </div>
          <ReadingMetadata person="巴菲特" year={yearNum} contentType="信件" readMinutes={Math.max(8, Math.round((letterData.content?.length || letterData.letters?.reduce((sum, item) => sum + item.content.length, 0) || 0) / 900))} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-5 md:py-8">
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

        {/* 读这份原典的导读文章（B-05：博客与档案双向打通） */}
        <BlogArchiveLinks archiveHref={`/letters/${yearNum}`} />
      </div>

    </div>
  )
}
