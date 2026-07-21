import Link from 'next/link'
import { ReactNode } from 'react'
import FontSizeControlFixed from './FontSizeControlFixed'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  rightSlot?: ReactNode
  sticky?: boolean
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = '返回',
  rightSlot,
  sticky = false,
}: PageHeaderProps) {
  return (
    <header
      className={`${sticky ? 'sticky top-0 z-20 bg-bg-card/95 dark:bg-dark-bg/95 backdrop-blur' : ''} border-b border-primary/10`}
    >
      <div className="px-4 py-4">
        {backHref && (
          <Link
            href={backHref}
            className="text-sm text-primary hover:text-primary-dark transition-colors mb-2 inline-flex items-center gap-1"
          >
            ← {backLabel}
          </Link>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary dark:text-primary-light">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-text-muted dark:text-dark-muted mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <FontSizeControlFixed />
            {rightSlot && rightSlot}
          </div>
        </div>
      </div>
    </header>
  )
}
