import Link from 'next/link'
import { getBlogPostsByEntity } from '@/lib/blog'
import { BLOG_TYPE_LABELS } from '@/lib/blog'

/**
 * 档案页 ↔ 博客打通（B-05）：人物/公司/概念/原典页底部展示相关博客文章。
 * 通过 entities 匹配（博客文章 frontmatter 的 entities 字段）。
 */
export default function BlogEntityLinks({ entityName, limit = 5, title = '相关博客文章' }: { entityName: string; limit?: number; title?: string }) {
  const posts = getBlogPostsByEntity(entityName).slice(0, limit)
  if (posts.length === 0) return null

  return (
    <section className="mt-10 border-t border-primary/10 pt-6">
      <h2 className="mb-4 text-lg font-semibold text-primary dark:text-primary-light">{title}</h2>
      <ul className="space-y-2.5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={post.canonicalPath}
              className="group flex flex-col gap-0.5 rounded-card border border-primary/15 bg-bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-card-hover dark:bg-dark-card dark:border-primary/20"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                  {BLOG_TYPE_LABELS[post.type]}
                </span>
                <span className="min-w-0 truncate text-sm font-medium text-text-base group-hover:text-primary dark:text-dark-base">
                  {post.title}
                </span>
                <span className="ml-auto shrink-0 text-xs text-text-muted dark:text-dark-muted">{post.date}</span>
              </span>
              {post.summary && (
                <span className="text-xs text-text-muted dark:text-dark-muted mt-1 line-clamp-1">{post.summary}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
