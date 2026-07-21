import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import PageFooter from '@/components/PageFooter'
import { getDocuments, getCategoryTitle, getCategoryIcon } from '@/lib/documents'
import { people } from '@/lib/people'

const DECADES: { label: string; range: [number, number] }[] = [
  { label: '80年代', range: [1980, 1989] },
  { label: '90年代', range: [1990, 1999] },
  { label: '00年代', range: [2000, 2009] },
  { label: '10年代', range: [2010, 2019] },
  { label: '20年代', range: [2020, 2029] },
]

interface PageProps {
  searchParams: { person?: string }
}

export default function QAPage({ searchParams }: PageProps) {
  const personId = searchParams.person
  const documents = getDocuments('qa', personId)
  const totalCount = documents.length
  const years = documents.map((d) => d.year).filter(y => y) as number[]
  const firstYear = years.length > 0 ? Math.min(...years) : null
  const lastYear = years.length > 0 ? Math.max(...years) : null
  const totalWords = documents.reduce((sum, d) => sum + d.wordCount, 0)

  const currentPerson = personId ? people[personId] : null
  const subtitle = currentPerson
    ? `${currentPerson.name}在伯克希尔和Wesco股东大会上的问答实录`
    : '伯克希尔股东大会问答实录，近距离聆听投资大师的智慧'

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title={`${getCategoryIcon('qa')} ${getCategoryTitle('qa')}${currentPerson ? ` - ${currentPerson.name}` : ''}`}
        subtitle={subtitle}
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/qa"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !personId
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          全部问答
        </Link>
        {Object.entries(people).map(([id, person]) => (
          <Link
            key={id}
            href={`/qa?person=${id}`}
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatBadge icon="❓" count={`${totalCount}篇`} label="问答" sub="股东大会" />
        {firstYear && lastYear && (
          <StatBadge icon="📅" count={`${lastYear - firstYear + 1}年`} label="时间跨度" sub={`${firstYear}-${lastYear}`} />
        )}
        <StatBadge icon="📝" count={`${(totalWords / 10000).toFixed(1)}万`} label="总字数" sub="问答内容" />
        <StatBadge icon="👥" count="股东互动" label="形式" sub="现场问答" />
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
                    href={`/qa/${encodeURIComponent(doc.fileName)}`}
                    className="block bg-white dark:bg-dark-card p-4 rounded-card border border-gray-100 dark:border-dark-border hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {doc.year && (
                            <span className="text-sm font-medium text-primary dark:text-primary-light">{doc.year}</span>
                          )}
                          <h3 className="text-base font-medium text-text dark:text-dark-text">{doc.title}</h3>
                          {doc.person && (
                            <span className="text-xs bg-primary/10 text-primary dark:text-primary-light px-2 py-0.5 rounded-full">
                              {Array.isArray(doc.person) ? doc.person.map(p => people[p]?.name).join('、') : people[doc.person as string]?.name}
                            </span>
                          )}
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
