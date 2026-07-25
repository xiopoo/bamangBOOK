import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import { getModelsByDiscipline, getModelStats } from '@/lib/models'

export const metadata: Metadata = {
  title: '思维模型 · 芒格多元思维格栅',
  description: '查理·芒格的多元思维模型全集：14 个学科、200+ 模型，一张格栅。',
}

function ImportanceDots({ value }: { value: number }) {
  return (
    <span className="text-xs text-primary tracking-tighter" title={`重要度 ${value}/5`}>
      {'●'.repeat(value)}
      <span className="opacity-25">{'●'.repeat(Math.max(0, 5 - value))}</span>
    </span>
  )
}

export default function ModelPage() {
  const groups = getModelsByDiscipline()
  const stats = getModelStats()

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title="🧠 思维模型"
        subtitle={`芒格多元思维格栅 · ${stats.total} 个模型 · ${stats.disciplines} 个学科`}
      />

      {/* 统计条 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: '思维模型', value: stats.total },
          { label: '学科', value: stats.disciplines },
          { label: '应用场景', value: stats.scenarios },
          { label: '五星核心模型', value: stats.core },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-dark-card rounded-card shadow-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{item.value}</div>
            <div className="text-xs text-text-muted dark:text-dark-muted mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 学科分组 */}
      <div className="space-y-8">
        {groups.map((group, gi) => (
          <section key={group.id}>
            <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-primary dark:text-primary-light mb-3">
              <span>{group.icon}</span>
              <span>{String(gi + 1).padStart(2, '0')} · {group.name}</span>
              <span className="text-xs font-normal text-text-muted dark:text-dark-muted">
                {group.models.length} 个模型
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.models.map(model => (
                <Link
                  key={model.slug}
                  href={`/model/${model.slug}`}
                  className="group bg-white dark:bg-dark-card rounded-card shadow-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-text dark:text-dark-text group-hover:text-primary transition-colors">
                      {model.title}
                    </div>
                    <ImportanceDots value={model.importance} />
                  </div>
                  {model.english && (
                    <div className="text-xs text-text-muted dark:text-dark-muted font-mono mt-0.5">
                      {model.english}
                    </div>
                  )}
                  {model.description && (
                    <p className="text-xs text-text-muted dark:text-dark-muted mt-2 line-clamp-2">
                      {model.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs text-text-muted dark:text-dark-muted text-center mt-10">
        内容整理自 <a href="https://mungermodels.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light">mungermodels.com</a>，仅供学习参考。
      </p>

      <PageFooter />
    </PageContainer>
  )
}
