import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { getLetterByYear } from '@/lib/letters'
import LetterReader from '@/components/LetterReader'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'

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

  const graphData = loadLetterGraphData(year)
  const topConcepts = graphData?.concepts?.slice(0, 5) || []
  const relatedPeople = graphData?.people || []
  const relatedCompanies = graphData?.companies || []

  const showKnowledgePanel = topConcepts.length > 0 || relatedPeople.length > 0 || relatedCompanies.length > 0

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress />
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10 sticky top-1 z-30">
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        {showKnowledgePanel && (
          <div className="furnish-border bg-bg-card dark:bg-dark-card p-6 mb-8 shadow-card hover:shadow-card-hover transition-shadow">
            <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              知识图谱
            </h2>
            {topConcepts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">核心概念</h3>
                <div className="flex flex-wrap gap-2">
                  {topConcepts.map((concept) => (
                    <Link
                      key={concept.id}
                      href={`/concepts/${encodeURIComponent(concept.name)}`}
                      className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-sm hover:bg-primary/20 dark:hover:bg-primary/30 transition-all hover:shadow-sm"
                    >
                      {concept.name}
                      <span className="text-xs opacity-70 ml-1">({concept.count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPeople.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-1"><span>👤</span> 人物</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedPeople.slice(0, 5).map((person: any) => (
                      <Link key={person.id} href={`/people/${encodeURIComponent(person.name)}`} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
                        {person.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {relatedCompanies.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-1"><span>🏢</span> 公司</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedCompanies.slice(0, 5).map((company: any) => (
                      <Link key={company.id} href={`/companies/${encodeURIComponent(company.name)}`} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm hover:bg-green-100 dark:hover:bg-green-900/50 transition-all">
                        {company.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-8">
          <main className="flex-1">
            <LetterReader
              letterData={letterData}
              graphData={graphData}
              year={yearNum}
              letterTitle={letterTitle}
              isPartnerLetter={false}
              isMultiLetter={!!isMultiLetter}
            />
          </main>
          <ArticleTableOfContents />
        </div>

        <div className="flex justify-between mt-8 gap-4">
          {yearNum > 1956 && (
            <Link href={`/letters/${yearNum - 1}`} className="inline-flex items-center gap-2 px-4 py-2 bg-bg-card dark:bg-dark-card border border-primary/20 rounded-card hover:border-primary hover:text-primary dark:hover:text-primary-light text-text-muted dark:text-dark-muted transition-all hover:shadow-card-hover shadow-card">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{yearNum - 1}年</span>
            </Link>
          )}
          {yearNum < 2025 && (
            <Link href={`/letters/${yearNum + 1}`} className="inline-flex items-center gap-2 px-4 py-2 bg-bg-card dark:bg-dark-card border border-primary/20 rounded-card hover:border-primary hover:text-primary dark:hover:text-primary-light text-text-muted dark:text-dark-muted transition-all hover:shadow-card-hover shadow-card ml-auto">
              <span>{yearNum + 1}年</span>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      <footer className="bg-bg-card dark:bg-dark-card border-t border-primary/10 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-text-muted dark:text-dark-muted">
          巴芒书房
        </div>
      </footer>
    </div>
  )
}
