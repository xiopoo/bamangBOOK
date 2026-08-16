import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'
import { BLOG_TYPE_LABELS } from '@/lib/blog'

/**
 * 博客文章行（前端重构 Spec §6.4）：目录模板的连续列表行。
 * 无 emoji、无卡片、无胶囊标签；标题 + 摘要 + 元数据，发丝线分隔。
 * 博客列表页、分类页与标签页共用。
 */
export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={post.canonicalPath} className="archive-list__row">
      <div className="archive-list__main">
        <strong>{post.title}</strong>
        {post.subtitle && <small>{post.subtitle}</small>}
        {post.summary && <small className="line-clamp-2">{post.summary}</small>}
      </div>
      <small className="ml-auto shrink-0 text-xs text-text-muted dark:text-dark-muted whitespace-nowrap">
        {BLOG_TYPE_LABELS[post.type]}
        {post.date ? ` · ${post.date}` : ''}
        {post.readingMinutes ? ` · ${post.readingMinutes} 分钟` : ''}
      </small>
    </Link>
  )
}
