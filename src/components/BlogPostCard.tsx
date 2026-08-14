import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'
import { BLOG_TYPE_LABELS } from '@/lib/blog'

const typeIcon: Record<string, string> = {
  note: '📝',
  essay: '✍️',
  'reading-note': '📖',
  'company-study': '🏢',
  'concept-note': '💡',
  'book-note': '📚',
  'archive-guide': '🗂️',
}

/**
 * 博客文章卡片（B-04）：列表页与首页「最新文章」共用。
 * 卡片直接链接 canonicalPath（旧内容 = 旧 URL，不改变 canonical）。
 * 布局紧凑：单行元信息 + 标题 + 摘要，避免大卡片内只有零散文字造成页面空旷。
 */
export default function BlogPostCard({ post, showSeries = true }: { post: BlogPost; showSeries?: boolean }) {
  const icon = typeIcon[post.type] || '📄'
  return (
    <Link
      href={post.canonicalPath}
      className="group block bg-white dark:bg-dark-card rounded-card border border-gray-100 dark:border-dark-border p-3.5 sm:p-4 hover:shadow-card-hover hover:border-primary/30 transition-all"
    >
      {/* 元信息行：类型 / 精选 / 日期 */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
          {icon} {BLOG_TYPE_LABELS[post.type]}
        </span>
        {post.featured && (
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
            ★ 精选
          </span>
        )}
        <span className="text-xs text-text-muted dark:text-dark-muted ml-auto">{post.date}</span>
      </div>

      {/* 标题 */}
      <h3 className="text-[15px] font-bold text-text dark:text-dark-text leading-snug group-hover:text-primary transition-colors">
        {post.title}
      </h3>
      {post.subtitle && (
        <p className="text-[13px] text-text-muted dark:text-dark-muted mt-0.5">{post.subtitle}</p>
      )}

      {/* 摘要 */}
      {post.summary && (
        <p className="text-[13px] text-text-muted dark:text-dark-muted mt-1 leading-relaxed line-clamp-2">
          {post.summary}
        </p>
      )}

      {/* 底部：作者 / 阅读时间 / 系列 / 实体 */}
      <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-2 text-[11px] text-text-muted dark:text-dark-muted">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden="true">✍️</span>{post.author}
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden="true">⏱</span>{post.readingMinutes} 分钟
        </span>
        {showSeries && post.series && (
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">📚</span>{post.series}
          </span>
        )}
        {post.entities.slice(0, 3).map((entity) => (
          <span key={entity} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            {entity}
          </span>
        ))}
      </div>
    </Link>
  )
}
