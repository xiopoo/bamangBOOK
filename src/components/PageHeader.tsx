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
  showFontSize?: boolean
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = '返回',
  rightSlot,
  showFontSize = false,
}: PageHeaderProps) {
  return (
    <header className="archive-page-header">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="archive-page-header__back"
          >
            ← {backLabel}
          </Link>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1>
              {title}
            </h1>
            {subtitle && (
              <p>
                {subtitle}
              </p>
            )}
          </div>
          <div className="archive-page-header__tools">
            {showFontSize && <FontSizeControlFixed />}
            {rightSlot && rightSlot}
          </div>
        </div>
      </div>
    </header>
  )
}
