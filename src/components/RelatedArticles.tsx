import Link from 'next/link'
import { getRelatedLinks, articleKey } from '@/lib/related'

interface RelatedArticlesProps {
  source: string
  fileName: string
  limit?: number
}

/**
 * 延伸阅读：基于共同关键词的交叉内链区块。
 * 自动从 reports/site-classification.json 读取相关文章并解析各栏目详情页 URL。
 */
export default function RelatedArticles({ source, fileName, limit = 6 }: RelatedArticlesProps) {
  const links = getRelatedLinks(articleKey(source, fileName), limit)
  if (!links.length) return null

  return (
    <section className="mt-10 border-t border-primary/10 pt-6">
      <h2 className="mb-4 text-lg font-semibold text-primary dark:text-primary-light">
        延伸阅读 · 相关文章
      </h2>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex flex-col gap-1 rounded-card border border-primary/15 bg-bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-card-hover dark:bg-dark-card dark:border-primary/20"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium text-text-base group-hover:text-primary dark:text-dark-base">
                  {l.title}
                </span>
                <span className="shrink-0 text-xs text-text-muted dark:text-dark-muted">
                  {l.column} / {l.sub}
                </span>
              </div>
              {l.sharedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {l.sharedKeywords.slice(0, 4).map((k) => (
                    <span
                      key={k}
                      className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary/80"
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
