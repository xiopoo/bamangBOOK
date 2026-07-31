import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '演讲档案',
  description: '巴菲特、芒格与价值投资相关公开演讲资料。',
  alternates: { canonical: '/talks' },
}
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import { getDocuments, getCategoryTitle } from '@/lib/documents'
import { people } from '@/lib/people'

const DECADES: { label: string; range: [number, number] }[] = [
  { label: '80年代', range: [1980, 1989] },
  { label: '90年代', range: [1990, 1999] },
  { label: '00年代', range: [2000, 2009] },
  { label: '10年代', range: [2010, 2019] },
  { label: '20年代', range: [2020, 2029] },
]

export default function TalksPage() {
  const personId: string | undefined = undefined
  const documents = getDocuments('talks', personId)
  const totalCount = documents.length
  const years = documents.map((d) => d.year).filter(y => y) as number[]
  const firstYear = years.length > 0 ? Math.min(...years) : null
  const lastYear = years.length > 0 ? Math.max(...years) : null
  const totalWords = documents.reduce(
    (sum, document) => sum + (Number.isFinite(document.wordCount) ? document.wordCount : 0),
    0
  )
  
  const currentPerson = personId ? people[personId] : null

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title={`${getCategoryTitle('talks')}${currentPerson ? ` · ${currentPerson.name}` : ''}`}
        subtitle={currentPerson ? `${currentPerson.name}公开演讲与文字记录` : '巴菲特与芒格历年公开演讲及文字记录'}
        backHref="/"
        backLabel="返回首页"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/talks"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !personId
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          全部演讲
        </Link>
        {Object.entries(people).map(([id, person]) => (
          <Link
            key={id}
            href={`/talks?person=${id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              personId === id
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {person.name}
          </Link>
        ))}
      </div>

      <div className="talks-ledger">
        <div><strong>{totalCount}</strong><span>篇演讲</span></div>
        {firstYear && lastYear && (
          <div><strong>{lastYear - firstYear + 1}</strong><span>年时间跨度 · {firstYear}—{lastYear}</span></div>
        )}
        {totalWords > 0 && (
          <div><strong>{(totalWords / 10000).toFixed(1)}万</strong><span>正文总字数</span></div>
        )}
      </div>

      <div className="space-y-8">
        {DECADES.map((decade) => {
          const decadeDocs = documents.filter(
            (d) => d.year && d.year >= decade.range[0] && d.year <= decade.range[1]
          )
          if (decadeDocs.length === 0) return null

          return (
            <section key={decade.label}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif">
                  {decade.label}
                </h2>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {decadeDocs.length}篇
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="space-y-3">
                {decadeDocs.map((doc) => (
                  <Link
                    key={doc.fileName}
                    href={`/talks/${encodeURIComponent(doc.fileName)}`}
                    className="block bg-white dark:bg-dark-card p-4 rounded-card border border-gray-100 dark:border-dark-border hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {doc.year && (
                            <span className="text-sm font-medium text-primary dark:text-primary-light">{doc.year}</span>
                          )}
                          <h3 className="text-base font-medium text-text dark:text-dark-text">{doc.title}</h3>
                        </div>
                      </div>
                      <span className="text-xs text-text-muted dark:text-dark-muted whitespace-nowrap">
                        {(doc.wordCount / 1000).toFixed(1)}千字
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <PageFooter />
    </PageContainer>
  )
}
