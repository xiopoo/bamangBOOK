import type { ReactNode } from 'react'
import Link from 'next/link'
import ReadingProgress from './ReadingProgress'
import ArticleTableOfContents from './ArticleTableOfContents'
import FontSizeControlFixed from './FontSizeControlFixed'
import ReadingMetadata, { type ReadingMetadataProps } from './ReadingMetadata'
import ContentTrustPanel from './ContentTrustPanel'
import SourceNote from './SourceNote'
import ReadingNavigation, { type ReadingNavigationItem } from './ReadingNavigation'
import styles from './ReadingArticleShell.module.css'

interface ReadingArticleShellProps {
  title: string
  subtitle?: string
  backHref: string
  backLabel: string
  metadata: ReadingMetadataProps
  trust: { source: string; method?: string; note?: string }
  sourceNote: { source: string; sourceUrl?: string; method: string; completeness?: '完整' | '部分' | '未知'; reviewedAt?: string }
  previous?: ReadingNavigationItem | null
  next?: ReadingNavigationItem | null
  navigationLabel?: string
  related?: ReactNode
  children: ReactNode
}

export default function ReadingArticleShell({
  title,
  subtitle,
  backHref,
  backLabel,
  metadata,
  trust,
  sourceNote,
  previous,
  next,
  navigationLabel,
  related,
  children,
}: ReadingArticleShellProps) {
  return (
    <div className={styles.page}>
      <ReadingProgress />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.heading}>
            <Link href={backHref} className={styles.back}>← {backLabel}</Link>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
            <ReadingMetadata {...metadata} />
          </div>
          <FontSizeControlFixed />
        </div>
      </header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <ContentTrustPanel {...trust} />
          <article className={styles.article}>{children}</article>
          <SourceNote {...sourceNote} />
          <ReadingNavigation previous={previous} next={next} ariaLabel={navigationLabel} />
          {related}
        </main>
        <ArticleTableOfContents />
      </div>
    </div>
  )
}
