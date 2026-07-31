import Link from 'next/link'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'

interface Concept {
  id: string
  filename: string
  count?: number
}

export default function ConceptsPage() {
  const conceptsDir = path.join(process.cwd(), 'content/concepts')
  const files = readdirSync(conceptsDir).filter(f => f.endsWith('.md'))

  const concepts: Concept[] = files.map(file => {
    const id = file.replace('.md', '')

    try {
      const indexPath = path.join(process.cwd(), 'content/index.json')
      const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'))
      const conceptData = indexData.concepts?.find((c: { id: string }) => c.id === id)
      return {
        id,
        filename: file,
        count: conceptData?.count || 0
      }
    } catch {
      return { id, filename: file, count: 0 }
    }
  }).sort((a, b) => b.count - a.count)

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="投资概念"
        subtitle="巴菲特与芒格价值投资核心概念知识卡片"
        sticky
      />

      <div className="mb-8">
        <StatBadge icon="💡" count={concepts.length} label="核心投资概念" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {concepts.map((concept) => (
          <Link
            key={concept.id}
            href={`/concepts/${encodeURIComponent(concept.id)}`}
            className="bg-white dark:bg-dark-card p-4 rounded-card border border-gray-100 dark:border-dark-border hover:border-primary/30 dark:hover:border-primary/40 hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all shadow-card"
          >
            <div className="font-medium text-text dark:text-dark-text mb-1">{concept.id}</div>
            {concept.count != null && concept.count > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                引用 {concept.count} 次
              </div>
            )}
          </Link>
        ))}
      </div>

      <PageFooter />
    </PageContainer>
  )
}