import type { ReactNode } from 'react'

export interface CatalogStat {
  value: string | number
  label: string
  detail?: string
  icon?: ReactNode
}

export default function CatalogStats({ items }: { items: CatalogStat[] }) {
  return (
    <dl className="archive-stats" aria-label="栏目统计">
      {items.map((item) => (
        <div className="archive-stats__item" key={`${item.label}-${item.value}`}>
          {item.icon && <span className="archive-stats__icon" aria-hidden="true">{item.icon}</span>}
          <div>
            <dt>{item.value}</dt>
            <dd>{item.label}</dd>
            {item.detail && <small>{item.detail}</small>}
          </div>
        </div>
      ))}
    </dl>
  )
}
