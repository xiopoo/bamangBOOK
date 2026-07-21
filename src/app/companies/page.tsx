import Link from 'next/link'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'

interface Company {
  id: string
  filename: string
  count?: number
}

export default function CompaniesPage() {
  const companiesDir = path.join(process.cwd(), 'content/companies')
  const files = readdirSync(companiesDir).filter(f => f.endsWith('.md'))

  const companies: Company[] = files.map(file => {
    const id = file.replace('.md', '')

    try {
      const indexPath = path.join(process.cwd(), 'content/index.json')
      const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'))
      const companyData = indexData.companies?.find((c: { id: string }) => c.id === id)
      return {
        id,
        filename: file,
        count: companyData?.count || 0
      }
    } catch {
      return { id, filename: file, count: 0 }
    }
  }).sort((a, b) => b.count - a.count)

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="投资公司"
        subtitle="巴菲特投资案例公司档案"
        sticky
      />

      <div className="mb-8">
        <StatBadge icon="🏢" count={companies.length} label="投资案例公司" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${encodeURIComponent(company.id)}`}
            className="bg-white dark:bg-dark-card p-4 rounded-card border border-gray-100 dark:border-dark-border hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all"
          >
            <div className="font-medium text-text dark:text-dark-text mb-1">{company.id}</div>
            {company.count != null && company.count > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                提及 {company.count} 次
              </div>
            )}
          </Link>
        ))}
      </div>

      <PageFooter />
    </PageContainer>
  )
}
