import { ReactNode } from 'react'
import FontSizeControlFixed from './FontSizeControlFixed'
import Breadcrumbs from './Breadcrumbs'

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
    <>
      <Breadcrumbs fallbackParent={backHref ? { href: backHref, label: backLabel } : undefined} />
      <header className="archive-page-header">
      <div>
        <div className="archive-page-header__row">
          <div className="archive-page-header__heading">
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
    </>
  )
}
