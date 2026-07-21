import type { Recommendation } from '@/lib/recommendations'

interface RecommendationCardProps {
  item: Recommendation
}

export function RecommendationCard({ item }: RecommendationCardProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'concept':
        return '📚'
      case 'company':
        return '🏢'
      case 'person':
        return '👤'
      case 'letter':
        return '📄'
      default:
        return '📌'
    }
  }

  const getTypeLabel = () => {
    switch (item.type) {
      case 'concept':
        return '概念'
      case 'company':
        return '公司'
      case 'person':
        return '人物'
      case 'letter':
        return '信件'
      default:
        return ''
    }
  }

  const getTypeColor = () => {
    switch (item.type) {
      case 'concept':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'company':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'person':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'letter':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getLink = () => {
    switch (item.type) {
      case 'concept':
        return `/concepts/${encodeURIComponent(item.name)}`
      case 'company':
        return `/companies/${encodeURIComponent(item.name)}`
      case 'person':
        return `/people/${encodeURIComponent(item.name)}`
      case 'letter':
        return `/letters/${item.id}`
      default:
        return '#'
    }
  }

  return (
    <a
      href={getLink()}
      className="flex items-center gap-3 p-3 bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border hover:border-primary/30 hover:shadow-md transition-all group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary/20 transition-colors">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {item.name}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor()}`}>
            {getTypeLabel()}
          </span>
        </div>
        {item.count !== undefined && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            提及 {item.count} 次
          </p>
        )}
      </div>
      <svg
        className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </a>
  )
}
