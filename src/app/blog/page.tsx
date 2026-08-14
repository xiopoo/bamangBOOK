import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import BlogPostCard from '@/components/BlogPostCard'
import { getAllBlogPosts, getBlogCategories, getBlogTags, getBlogSeries, getBlogStats } from '@/lib/blog'

export const metadata: Metadata = {
  title: '博客',
  description: '复利书房主理人的阅读札记、公司研究与投资思考——持续写作，每一篇都回到原典与档案。',
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
        title="✍️ 博客"
        subtitle="主理人的阅读札记、公司研究与投资思考，每一篇都能回到原典继续读"
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      {/* 统计 + 分类：合并为紧凑单行，避免顶部大块空白 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-text-muted dark:text-dark-muted">
        <span>共 <strong className="text-text dark:text-dark-text font-semibold">{stats.total}</strong> 篇文章</span>
        <span aria-hidden="true">·</span>
        <span>{stats.categories} 类</span>
        <span aria-hidden="true">·</span>
        <span>{stats.series} 个系列</span>
        <span aria-hidden="true">·</span>
        <span>{stats.tags} 个标签</span>
        {categories.length > 0 && (
          <span className="flex flex-wrap gap-1.5 ml-2">
            {categories.map((cat) => (
              <span
                key={cat.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                {cat.label}
                <span className="text-gray-400">({cat.count})</span>
              </span>
            ))}
          </span>
        )}
      </div>

      {/* 文章列表：双列网格，提升信息密度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
        {posts.length === 0 ? (
          <div className="text-center text-text-muted dark:text-dark-muted py-16 col-span-full">
            暂无博客文章。主理人正在整理第一批阅读札记。
          </div>
        ) : (
          posts.map((post) => <BlogPostCard key={post.slug} post={post} />)
        )}
      </div>

      {/* 侧栏式底部专题：热门标签 / 系列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200 dark:border-gray-700 pt-8">
        {tags.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-3">🏷️ 热门标签</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary"
                >
                  #{tag} <span className="text-primary/60">({count})</span>
                </span>
              ))}
            </div>
          </section>
        )}
        {series.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-3">📚 系列</h2>
            <ul className="space-y-2">
              {series.map(({ series: s, count }) => (
                <li key={s} className="flex items-center justify-between text-sm">
                  <span className="text-text dark:text-dark-text">{s}</span>
                  <span className="text-xs text-text-muted dark:text-dark-muted">{count}篇</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageContainer>
  )
}
