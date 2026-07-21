import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'
import MarkdownContent from '@/components/MarkdownContent'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

interface PageProps {
  params: { name: string }
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const companyName = decodeURIComponent(params.name)
  
  const companiesDir = path.join(process.cwd(), 'content/companies')
  const filePath = path.join(companiesDir, `${companyName}.md`)
  
  if (!existsSync(filePath)) {
    notFound()
  }
  
  const content = readFileSync(filePath, 'utf-8')
  
  // 从内容中提取标题
  const titleMatch = content.match(/^#\s*(.+)/)
  const title = titleMatch ? titleMatch[1] : companyName
  
  // 获取提及次数和年份
  let mentionCount = 0
  let years: number[] = []
  try {
    const indexPath = path.join(process.cwd(), 'content/index.json')
    const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'))
    const companyData = indexData.companies?.find((c: { id: string }) => c.id === companyName)
    mentionCount = companyData?.count || 0
    years = companyData?.years || []
  } catch {
    mentionCount = 0
    years = []
  }

  // 按年份排序
  years.sort((a, b) => a - b)

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title={title}
        subtitle="巴菲特投资案例公司档案"
        backHref="/companies"
        backLabel="返回公司列表"
        sticky
      />

      <div className="mb-6">
        <StatBadge icon="📊" count={`${mentionCount}次`} label="股东信提及" />
      </div>

      <article className="prose prose-lg max-w-none dark:prose-invert bg-bg-card dark:bg-dark-card rounded-card border border-primary/10 p-6 sm:p-8">
        <MarkdownContent content={content} />
      </article>

      {/* 相关股东信年份链接 */}
      {years.length > 0 && (
        <div className="mt-8 p-5 rounded-card bg-primary/5 dark:bg-primary/10 border border-primary/10">
          <h3 className="font-medium text-primary dark:text-primary-light mb-3">相关股东信</h3>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <Link
                key={year}
                href={`/letters/${year}`}
                className="inline-flex items-center px-3 py-1.5 rounded-card border border-primary/20 text-sm text-text-muted dark:text-dark-muted hover:border-primary hover:text-primary dark:hover:text-primary-light transition-all"
              >
                {year}年
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-5 rounded-card bg-primary/5 dark:bg-primary/10 border border-primary/10">
        <h3 className="font-medium text-primary dark:text-primary-light mb-2">相关链接</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/letters"
            className="inline-flex items-center px-3 py-1.5 rounded-card border border-primary/20 text-sm text-text-muted dark:text-dark-muted hover:border-primary hover:text-primary dark:hover:text-primary-light transition-all"
          >
            查看股东信
          </Link>
          <Link
            href="/concepts"
            className="inline-flex items-center px-3 py-1.5 rounded-card border border-primary/20 text-sm text-text-muted dark:text-dark-muted hover:border-primary hover:text-primary dark:hover:text-primary-light transition-all"
          >
            投资概念
          </Link>
          <Link
            href="/people"
            className="inline-flex items-center px-3 py-1.5 rounded-card border border-primary/20 text-sm text-text-muted dark:text-dark-muted hover:border-primary hover:text-primary dark:hover:text-primary-light transition-all"
          >
            人物传记
          </Link>
        </div>
      </div>

      <PageFooter />
    </PageContainer>
  )
}