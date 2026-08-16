import type { Metadata } from 'next'
import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import BlogPostCard from '@/components/BlogPostCard'
import { getAllBlogPosts, getBlogCategories, getBlogTags, getBlogSeries, getBlogStats } from '@/lib/blog'

export const metadata: Metadata = {
  title: '博客',
  description: '复利书房主理人的阅读札记、公司研究与投资思考——持续写作，每一篇都回到原典。',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const categories = getBlogCategories()
  const tags = getBlogTags(15)
  const series = getBlogSeries()
  const stats = getBlogStats()

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title="博客"
        subtitle="主理人的阅读札记、公司研究与投资思考，每一篇都能回到原典继续读"
        backHref="/"
        backLabel="返回首页"
      />

      {/* 统计 + 分类：紧凑单行，避免顶部大块空白 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-text-muted dark:text-dark-muted">
        <span>共 <strong className="text-text dark:text-dark-text font-semibold">{stats.total}</strong> 篇文章</span>
        <span aria-hidden="true">·</span>
        <span>{stats.categories} 类</span>
        <span aria-hidden="true">·</span>
        <span>{stats.series} 个系列</span>
        <span aria-hidden="true">·</span>
        <span>{stats.tags} 个标签</span>
        {categories.length > 0 && (
          <span className="flex flex-wrap gap-x-4 gap-y-1 ml-2">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={`/blog/category/${encodeURIComponent(cat.label)}`}
                className="text-primary dark:text-primary-light underline underline-offset-2 hover:text-primary-light"
              >
                {cat.label}（{cat.count}）
              </Link>
            ))}
          </span>
        )}
      </div>

      {/* 文章列表：连续列表（目录模板），无卡片网格 */}
      <div className="archive-list mb-12">
        {posts.length === 0 ? (
          <p className="text-center text-text-muted dark:text-dark-muted py-16">暂无博客文章。主理人正在整理第一批阅读札记。</p>
        ) : (
          posts.map((post) => <BlogPostCard key={post.slug} post={post} />)
        )}
      </div>

      {/* 底部：系列 / 热门标签（纯文字列表，无 pill） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-gray-200 dark:border-dark-border pt-8">
        {series.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text dark:text-dark-text mb-3">系列</h2>
            <ul className="space-y-2">
              {series.map(({ series: s, count }) => (
                <li key={s} className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-text dark:text-dark-text">{s}</span>
                  <span className="text-xs text-text-muted dark:text-dark-muted">{count} 篇</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {tags.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text dark:text-dark-text mb-3">热门标签</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {tags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="text-primary dark:text-primary-light underline underline-offset-2 hover:text-primary-light"
                >
                  #{tag}（{count}）
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  )
}
