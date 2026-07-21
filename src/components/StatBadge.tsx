import Link from 'next/link'
import { ReactNode } from 'react'

interface StatBadgeProps {
  icon: ReactNode
  count: number | string
  label: string
  sub?: string
  href?: string
  variant?: 'default' | 'highlight'
}

export default function StatBadge({
  icon,
  count,
  label,
  sub,
  href,
  variant = 'default',
}: StatBadgeProps) {
  const baseClass =
    variant === 'highlight'
      ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 dark:border-primary/40'
      : 'bg-bg-card dark:bg-dark-card border-primary/20 dark:border-primary/30'

  const content = (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-card-hover ${baseClass}`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-primary dark:text-primary-light">
            {count}
          </div>
          <div className="text-sm text-text-muted dark:text-dark-muted truncate">
            {label}
          </div>
          {sub && (
            <div className="text-xs text-text-light dark:text-dark-muted mt-0.5 truncate">
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}
