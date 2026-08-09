import Link from 'next/link'
import type { ReactNode } from 'react'
import MarkdownContent from '@/components/MarkdownContent'
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
  /** 只显示年份目录，不把全部条目输出到同一页。 */
  indexOnly?: boolean
  /** indexOnly 模式下的年份页路径。 */
  yearPath?: string
  footer?: ReactNode
  inlineContent?: boolean
}

export default function DYList({
  docs,
  basePath,
  title,
  subtitle,
  metaField = 'platform',
  groupByYearEnabled = true,
  indexOnly = false,
  yearPath,
  footer,
  inlineContent = false,
}: DYListProps) {
  const groups = groupByYearEnabled ? groupByYear(docs) : [{ year: '', docs }]
  const totalWords = docs.reduce((s, d) => s + Math.round((d.content.length || 0) / 2), 0)

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader title={title} subtitle={subtitle} backHref="/duanyongping" backLabel="返回段永平专题" />

      <div className="talks-ledger">
        <div><strong>{docs.length}</strong><span>篇</span></div>
        {!indexOnly && (
          <div><strong>{totalWords / 10000 > 1 ? (totalWords / 10000).toFixed(1) + '万' : totalWords}</strong><span>正文字数（估）</span></div>
        )}
        {groupByYearEnabled && docs.length > 0 && (
          <div><strong>{groups.length}</strong><span>个年份</span></div>
        )}
      </div>

      <div className="space-y-8">
        {groups.map((g) => (
            <details key={g.year || 'all'} open={!g.year || g.year === groups.at(-1)?.year}>
            {g.year && (
              <summary className="flex cursor-pointer list-none items-center gap-3 mb-4 [&::-webkit-details-marker]:hidden">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif">{g.year}</h2>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {g.docs.length}篇
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-text-muted dark:text-dark-muted">展开 / 收起</span>
              </summary>
            )}
            {indexOnly && g.year && yearPath ? (
              <Link
                href={`${yearPath}/${encodeURIComponent(g.year === '未知' ? 'unknown' : g.year)}`}
                className="block rounded-card border border-gray-100 bg-white p-5 transition-all hover:border-primary/40 hover:shadow-card-hover dark:border-dark-border dark:bg-dark-card dark:hover:shadow-lg dark:hover:shadow-black/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text">进入 {g.year} 年问答</h3>
                    <p className="mt-1 text-sm text-text-muted dark:text-dark-muted">按时间顺序阅读本年份的 {g.docs.length} 条问答</p>
                  </div>
                  <span className="text-xl text-primary" aria-hidden="true">→</span>
                </div>
              </Link>
            ) : <div className="space-y-3">
              {g.docs.map((doc) => {
                const candidateMeta = doc[metaField] || (metaField === 'year' ? '' : doc.date || '')
                const meta = candidateMeta === doc.date || candidateMeta === doc.date?.slice(0, 4)
                  ? ''
                  : candidateMeta
                if (inlineContent) {
                  return (
                    <details key={doc.slug} className="group rounded-card border border-gray-100 bg-white dark:border-dark-border dark:bg-dark-card">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {doc.date && <span className="text-sm font-medium text-primary dark:text-primary-light">{doc.date.slice(0, 10)}</span>}
                            <h3 className="text-base font-medium text-text dark:text-dark-text">{doc.title}</h3>
                          </div>
                          {meta && <p className="mt-1 text-xs text-text-muted dark:text-dark-muted">{meta}</p>}
                        </div>
                        <span className="shrink-0 text-xs text-text-muted transition-transform group-open:rotate-180 dark:text-dark-muted" aria-hidden="true">⌄</span>
                      </summary>
                      <div className="border-t border-gray-100 px-4 pb-5 pt-4 dark:border-dark-border">
                        <MarkdownContent content={doc.content} isQA />
                        <Link href={`${basePath}/${encodeURIComponent(doc.slug)}`} className="mt-4 inline-flex text-xs text-primary hover:underline dark:text-primary-light">
                          打开独立阅读页 ↗
                        </Link>
                      </div>
                    </details>
                  )
                }

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
                        {doc.author !== '段永平' && (
                          <p className="text-xs text-text-muted dark:text-dark-muted mt-1">作者：{doc.author}</p>
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
            </div>}
          </details>
        ))}
      </div>
      {footer}
    </PageContainer>
  )
}
