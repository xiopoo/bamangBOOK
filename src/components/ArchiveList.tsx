import Link from 'next/link'
import styles from './ArchiveList.module.css'

export interface ArchiveListItem {
  id: string
  href: string
  title: string
  year?: number | null
  person?: string
  personIds?: string[]
  contentType: string
  readMinutes: number
  status: string
  description?: string
}

interface ArchiveListProps {
  items: ArchiveListItem[]
  emptyMessage?: string
}

export default function ArchiveList({ items, emptyMessage = '没有符合当前条件的资料。' }: ArchiveListProps) {
  if (items.length === 0) return <div className={styles.empty}>{emptyMessage}</div>
  const groups = new Map<string, ArchiveListItem[]>()
  for (const item of items) {
    const label = item.year ? `${Math.floor(item.year / 10) * 10}年代` : '年份待考'
    groups.set(label, [...(groups.get(label) || []), item])
  }

  return <div className={styles.groups}>
    {[...groups.entries()].map(([label, group]) => <section key={label} className={styles.group}>
      <header><h2>{label}</h2><span>{group.length} 篇</span></header>
      <ol>{group.map(item => <li key={item.id}>
        <Link href={item.href} className={styles.row}>
          <span className={styles.year}>{item.year || '待考'}</span>
          <span className={styles.main}><strong>{item.title}</strong>{item.description && <small>{item.description}</small>}<small>{[item.person, item.contentType, `${item.readMinutes} 分钟`].filter(Boolean).join(' · ')}</small></span>
          <span className={styles.status}>{item.status}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </li>)}</ol>
    </section>)}
  </div>
}
