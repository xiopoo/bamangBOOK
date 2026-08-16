import Link from 'next/link'
import { getBlogPostsByArchiveHref } from '@/lib/blog'
import { BLOG_TYPE_LABELS } from '@/lib/blog'

/**
 * 原典页底部「读这份原典的导读文章」（B-05/8.4）：
 * 通过博客文章 frontmatter 的 related_archive.href 反向匹配。
 */
export default function BlogArchiveLinks({ archiveHref, limit = 5 }: { archiveHref: string; limit?: number }) {
  const posts = getBlogPostsByArchiveHref(archiveHref).slice(0, limit)
  if (posts.length === 0) return null

  return (
    <section className="mt-10 border-t border-primary/10 pt-6">
      <h2 className="mb-4 text-lg font-semibold text-primary dark:text-primary-light">读这份原典的导读文章</h2>
      <ul className="space-y-2.5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={post.canonicalPath}
              className="group flex items-center gap-2 rounded-card border border-primary/15 bg-bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-card-hover dark:bg-dark-card dark:border-primary/20"
            >
              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                {BLOG_TYPE_LABELS[post.type]}
              </span>
              <span className="min-w-0 truncate text-sm font-medium text-text-base group-hover:text-primary dark:text-dark-base">
                {post.title}
              </span>
              <span className="ml-auto shrink-0 text-xs text-text-muted dark:text-dark-muted">{post.date}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
