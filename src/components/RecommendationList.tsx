import type { Recommendation } from '@/lib/recommendations'
import { RecommendationCard } from './RecommendationCard'

interface RecommendationListProps {
  title: string
  items: Recommendation[]
  viewAllUrl?: string
}

export function RecommendationList({ title, items, viewAllUrl }: RecommendationListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {viewAllUrl && (
          <a
            href={viewAllUrl}
            className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
          >
            查看全部 →
          </a>
        )}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <RecommendationCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
