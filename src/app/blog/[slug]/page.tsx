import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import MarkdownContent from '@/components/MarkdownContent'
import BlogRelatedArchive from '@/components/BlogRelatedArchive'
import { blogSlugParams, getBlogPostBySlug, getBlogDetail, getRecentBlogPosts, BLOG_TYPE_LABELS } from '@/lib/blog'

export function generateStaticParams() {
  return blogSlugParams().map((slug) => ({ slug }))
}

export const dynamicParams = true

interface PageProps {
  params: { slug: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getBlogPostBySlug(decodeURIComponent(params.slug))
  if (!post) return { title: '博客文章未找到' }
  const detail = getBlogDetail(post)
  return {
    title: `${post.title} · 复利书房博客`,
    description: post.summary || (detail ? detail.content.replace(/[#>*_`\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 150) : ''),
    alternates: { canonical: post.canonicalPath },
    openGraph: { title: post.title, type: 'article' },
  }
}

export default function BlogPostPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const detail = getBlogDetail(post)
  const content = detail ? detail.content : ''
  const recent = getRecentBlogPosts(5).filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* 面包屑：首页 / 博客 */}
              <nav className="flex items-center gap-1.5 text-sm text-text-muted dark:text-dark-muted mb-1.5" aria-label="面包屑">
                <Link href="/" className="hover:text-primary transition-colors">首页</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-primary transition-colors">博客</Link>
                <span>/</span>
                <span className="text-text dark:text-dark-text truncate">{post.title}</span>
              </nav>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {BLOG_TYPE_LABELS[post.type]}
                </span>
                {post.featured && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                    精选
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text dark:text-dark-text tracking-tight">
                {post.title}
              </h1>
              {post.subtitle && (
                <p className="text-sm text-text-muted dark:text-dark-muted mt-1">{post.subtitle}</p>
              )}
              <p className="text-sm text-text-muted dark:text-dark-muted flex items-center gap-2 flex-wrap mt-1.5">
                <span>{post.author}</span>
                <span>· {post.date}</span>
                {post.updatedAt && <span>· 更新于 {post.updatedAt}</span>}
                <span>· 约 {post.readingMinutes} 分钟</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <article className="bg-bg-card dark:bg-dark-card p-4 sm:p-6 md:p-8 shadow-card rounded-card">
          {/* 摘要：明确「本文观点」定位 */}
          {post.summary && (
            <blockquote className="border-l-4 border-primary/40 bg-primary/5 px-4 py-3 mb-6 text-sm text-text-muted dark:text-dark-muted rounded-r-lg">
              {post.summary}
            </blockquote>
          )}
          <MarkdownContent content={content} />

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  # {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* 关联档案：回到原典继续读 */}
        <BlogRelatedArchive links={post.relatedArchiveLinks} />

        {/* 免责声明 */}
        <div className="mt-10 rounded-card border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 px-4 py-3 text-xs text-text-muted dark:text-dark-muted">
          免责声明：本站内容仅供学习研究之用，不构成任何投资建议。文章观点为作者个人研究记录，引用材料版权归原作者所有。
        </div>

        {/* 延伸阅读：最新博客 */}
        {recent.length > 0 && (
          <section className="mt-10 border-t border-primary/10 pt-6">
            <h2 className="mb-4 text-lg font-semibold text-primary dark:text-primary-light">
              延伸阅读 · 最新博客
            </h2>
            <ul className="space-y-2.5">
              {recent.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.canonicalPath}
                    className="group flex items-center justify-between gap-3 rounded-card border border-primary/15 bg-bg-card px-4 py-3 transition-all hover:border-primary hover:shadow-card-hover dark:bg-dark-card dark:border-primary/20"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-text-base group-hover:text-primary dark:text-dark-base">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs text-text-muted dark:text-dark-muted">{item.date}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
