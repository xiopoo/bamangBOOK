import Link from 'next/link'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import MarkdownContent from '@/components/MarkdownContent'
import { RecommendationList } from '@/components/RecommendationList'
import { resolveEntityLink } from '@/lib/entity-resolver'
import { getRelatedConcepts } from '@/lib/recommendations'
import JsonLd, { breadcrumbJsonLd } from '@/components/JsonLd'
import type { Metadata } from 'next'
import { conceptParams } from '@/lib/staticParams'
import { getLetterArchiveHref } from '@/lib/letter-links'

export function generateStaticParams() {
  return conceptParams()
}

export const dynamicParams = false

function processConceptLinks(content: string): string {
  if (!content.includes('[[')) return content
  return content.replace(/\[\[([^\]]+)\]\]/g, (_match, entity: string) => {
    const href = resolveEntityLink(entity)
    // 未识别为任何实体（人物/公司/概念/信件）时降级为纯文本，避免生成空占位页链接
    return href ? `[${entity}](${href})` : entity
  })
}

interface PageProps {
  params: { name: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const name = decodeURIComponent(params.name)
  return {
    title: `${name}：概念解释与原文线索`,
    description: `了解价值投资概念“${name}”的定义、相关年份、公司案例与原文线索。`,
    alternates: { canonical: `/concepts/${encodeURIComponent(name)}` },
  }
}

export default function ConceptDetailPage({ params }: PageProps) {
  const conceptName = decodeURIComponent(params.name)
  const conceptPath = path.join(process.cwd(), 'content/concepts', `${conceptName}.md`)

  let content = ''
  let exists = false

  if (existsSync(conceptPath)) {
    content = processConceptLinks(readFileSync(conceptPath, 'utf-8'))
    exists = true
  }

  let stats = { count: 0, years: [] as number[] }
  try {
    const indexPath = path.join(process.cwd(), 'content/index.json')
    const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'))
    const conceptData = indexData.concepts?.find((c: { id: string }) => c.id === conceptName)
    if (conceptData) {
      stats = { count: conceptData.count, years: conceptData.years || [] }
    }
  } catch (e) {
    console.error('Failed to read index:', e)
  }

  return (
    <PageContainer maxWidth="4xl">
      <JsonLd data={breadcrumbJsonLd([
        { name: '首页', href: '/' },
        { name: '投资概念库', href: '/concepts' },
        { name: conceptName },
      ])} />
      <PageHeader
        title={conceptName}
        subtitle="投资核心概念知识卡片"
        backHref="/concepts"
        backLabel="返回概念列表"
        sticky
        showFontSize
      />

      <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-lg p-6 mb-8 border border-primary/20 dark:border-primary/30 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="text-3xl">💡</div>
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.count}次</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">引用次数</div>
              </div>
              {stats.years.length > 0 && (
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.years.length}年</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">跨年份提及</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {stats.years.length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-6 mb-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4">📅 相关年份</h2>
          <div className="flex flex-wrap gap-2">
            {stats.years.slice(0, 20).map((year) => (
              <Link
                key={year}
                href={getLetterArchiveHref(year)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-primary/5 dark:hover:bg-primary/15 hover:text-primary dark:hover:text-primary-light transition-all border border-transparent hover:border-primary/20"
              >
                {year}年
              </Link>
            ))}
            {stats.years.length > 20 && (
              <span className="px-3 py-1.5 text-sm text-gray-400">
                +{stats.years.length - 20}年
              </span>
            )}
          </div>
        </div>
      )}

      <article className="bg-white dark:bg-dark-card rounded-card border border-gray-100 dark:border-dark-border p-8 shadow-card hover:shadow-card-hover transition-shadow">
        {exists ? (
          <MarkdownContent content={content} />
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500 dark:text-gray-400">该概念的详细内容暂未收录</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">请查看相关年份的股东信获取更多信息</p>
          </div>
        )}
      </article>

      {/* 概念演变时间线 */}
      {stats.years.length > 0 && (
        <div className="mt-8 bg-white dark:bg-dark-card rounded-card border border-gray-100 dark:border-dark-border p-8 shadow-card">
          <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-6 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            概念演变时间线
          </h2>
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/60 to-gray-300 dark:from-primary dark:via-primary/50 dark:to-gray-600"></div>
            
            <div className="space-y-6">
              {stats.years.slice(0, 20).map((year, index) => (
                <div key={year} className="relative pl-12">
                  <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-primary/20 border-2 border-primary dark:border-primary-light flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary dark:bg-primary-light"></div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={getLetterArchiveHref(year)}
                        className="text-lg font-semibold text-primary hover:text-primary-light transition-colors"
                      >
                        {year}年
                      </Link>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {index === 0 ? '首次提及' : index === stats.years.length - 1 ? '最近提及' : `第${index + 1}次提及`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {stats.years.length > 20 && (
                <div className="pl-12 text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">
                    还有 {stats.years.length - 20} 个年份提及该概念...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 相关概念推荐 */}
      {getRelatedConcepts(conceptName, 5).length > 0 && (
        <div className="mt-8">
          <RecommendationList
            title="相关概念"
            items={getRelatedConcepts(conceptName, 5)}
          />
        </div>
      )}

    </PageContainer>
  )
}
