import type { ReactNode } from 'react'
import Link from 'next/link'
import ReadingProgress from './ReadingProgress'
import ArticleTableOfContents from './ArticleTableOfContents'
import FontSizeControlFixed from './FontSizeControlFixed'
import ReadingMetadata, { type ReadingMetadataProps } from './ReadingMetadata'
import ReadingNavigation, { type ReadingNavigationItem } from './ReadingNavigation'
import ReadingFloatingNav from './ReadingFloatingNav'
import styles from './ReadingArticleShell.module.css'

interface ReadingArticleShellComments {
  count?: string
  duanCount?: string
  sourceUrl?: string
}

interface ReadingArticleShellProps {
  title: string
  subtitle?: string
  backHref: string
  backLabel: string
  metadata: ReadingMetadataProps
  previous?: ReadingNavigationItem | null
  next?: ReadingNavigationItem | null
  navigationLabel?: string
  related?: ReactNode
  comments?: ReadingArticleShellComments | null
  children: ReactNode
}

export default function ReadingArticleShell({
  title,
  subtitle,
  backHref,
  backLabel,
  metadata,
  previous,
  next,
  navigationLabel,
  related,
  comments,
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
        {/* 这里原为 <main>，但 RootLayout 已提供唯一的 <main id="main-content">，
            嵌套第二个 main 会产生重复地标（WCAG 1.3.1），读屏地标导航会错乱。
            改为 div：样式类不变，仅去掉重复的语义角色。 */}
        <div className={styles.main}>
          <article className={styles.article} data-toc-content>{children}</article>
          <ReadingNavigation previous={previous} next={next} ariaLabel={navigationLabel} />
          {related}
          {comments && (
            <section id="comments" className={styles.comments} aria-label="评论区">
              <h2 className={styles.commentsTitle}>评论区</h2>
              <p className={styles.commentsMeta}>
                共 {comments.count ?? '若干'} 条评论
                {comments.duanCount ? `，其中段永平本人回复 ${comments.duanCount} 条` : ''}。
              </p>
              {comments.sourceUrl && (
                <a
                  className={styles.commentsLink}
                  href={comments.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  查看原始评论楼 →
                </a>
              )}
            </section>
          )}
        </div>
        <ArticleTableOfContents />
      </div>
      <ReadingFloatingNav previous={previous} next={next} />
    </div>
  )
}
