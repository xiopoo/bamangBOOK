import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { DYDoc, groupByYear } from '@/lib/duanyongping'

interface DYListProps {
  docs: DYDoc[]
  basePath: string
  title: string
  subtitle: string
  /** 列表项副标题字段 */
  metaField?: 'platform' | 'source' | 'year'
  /** 是否按年份分组（blog/qa 适用） */
  groupByYearEnabled?: boolean
}

export default function DYList({
  docs,
  basePath,
  title,
  subtitle,
  metaField = 'platform',
  groupByYearEnabled = true,
}: DYListProps) {
  const groups = groupByYearEnabled ? groupByYear(docs) : [{ year: '', docs }]
  const totalWords = docs.reduce((s, d) => s + Math.round((d.content.length || 0) / 2), 0)

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader title={title} subtitle={subtitle} backHref="/duanyongping" backLabel="返回段永平专题" />

      <div className="talks-ledger">
        <div><strong>{docs.length}</strong><span>篇</span></div>
        <div><strong>{totalWords / 10000 > 1 ? (totalWords / 10000).toFixed(1) + '万' : totalWords}</strong><span>正文字数（估）</span></div>
        {groupByYearEnabled && docs.length > 0 && (
          <div><strong>{groups.length}</strong><span>个年份</span></div>
        )}
      </div>

      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.year || 'all'}>
            {g.year && (
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif">{g.year}</h2>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {g.docs.length}篇
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            )}
            <div className="space-y-3">
              {g.docs.map((doc) => {
                const meta = doc[metaField] || doc.date || ''
                return (
                  <Link
                    key={doc.slug}
                    href={`${basePath}/${encodeURIComponent(doc.slug)}`}
                    className="block bg-white dark:bg-dark-card p-4 rounded-card border border-gray-100 dark:border-dark-border hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {doc.date && (
                            <span className="text-sm font-medium text-primary dark:text-primary-light">
                              {doc.date.slice(0, 10)}
                            </span>
                          )}
                          <h3 className="text-base font-medium text-text dark:text-dark-text">{doc.title}</h3>
                        </div>
                        {meta && (
                          <p className="text-xs text-text-muted dark:text-dark-muted mt-1">{meta}</p>
                        )}
                        {doc.duanCommentCount && (
                          <p className="text-xs text-text-muted dark:text-dark-muted mt-0.5">
                            段永平本人回复 {doc.duanCommentCount} 条
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  )
}
