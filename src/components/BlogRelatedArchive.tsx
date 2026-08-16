import Link from 'next/link'
import type { BlogArchiveLink } from '@/lib/blog'

/**
 * 关联档案区块（B-05）：博客文章底部「回到原典继续读」。
 * 渲染 frontmatter 中的 related_archive 链接（股东信/问答/演讲/公司页/概念页）。
 */
export default function BlogRelatedArchive({ links, title = '回到原典继续读' }: { links: BlogArchiveLink[]; title?: string }) {
  if (!links || links.length === 0) return null
  return (
    <section className="mt-10 border-t border-primary/10 pt-6">
      <h2 className="mb-4 text-lg font-semibold text-primary dark:text-primary-light">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link, index) => (
          <li key={`${link.href}-${index}`}>
            <Link
              href={link.href}
              className="group flex items-start gap-3 rounded-card border border-primary/15 bg-bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-card-hover dark:bg-dark-card dark:border-primary/20"
            >
              <span className="mt-0.5 text-primary">↳</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text-base group-hover:text-primary dark:text-dark-base">
                  {link.label}
                </span>
                {link.reason && (
                  <span className="block text-xs text-text-muted dark:text-dark-muted mt-0.5">
                    {link.reason}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
