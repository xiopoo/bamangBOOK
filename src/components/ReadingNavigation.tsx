import Link from 'next/link'
import styles from './ReadingNavigation.module.css'

export interface ReadingNavigationItem {
  href: string
  title: string
  meta?: string
}

interface ReadingNavigationProps {
  previous?: ReadingNavigationItem | null
  next?: ReadingNavigationItem | null
  previousEmptyLabel?: string
  nextEmptyLabel?: string
  ariaLabel?: string
}

export default function ReadingNavigation({
  previous,
  next,
  previousEmptyLabel = '已是最早一篇',
  nextEmptyLabel = '已是最后一篇',
  ariaLabel = '相邻内容导航',
}: ReadingNavigationProps) {
  return (
    <nav className={styles.navigation} aria-label={ariaLabel}>
      {previous ? (
        <Link href={previous.href} rel="prev" className={styles.previous}>
          <span>‹ 上一篇 · 更早</span>
          <strong>{previous.title}</strong>
          {previous.meta && <small>{previous.meta}</small>}
        </Link>
      ) : (
        <span className={`${styles.previous} ${styles.disabled}`} aria-disabled="true">
          <span>{previousEmptyLabel}</span>
        </span>
      )}
      {next ? (
        <Link href={next.href} rel="next" className={styles.next}>
          <span>下一篇 · 更晚 ›</span>
          <strong>{next.title}</strong>
          {next.meta && <small>{next.meta}</small>}
        </Link>
      ) : (
        <span className={`${styles.next} ${styles.disabled}`} aria-disabled="true">
          <span>{nextEmptyLabel}</span>
        </span>
      )}
    </nav>
  )
}
