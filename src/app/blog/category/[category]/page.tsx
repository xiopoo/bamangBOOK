import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import BlogPostCard from '@/components/BlogPostCard'
import { getBlogPostsByCategory, getBlogCategories } from '@/lib/blog'

export function generateStaticParams() {
  return getBlogCategories().map((cat) => ({ category: cat.label }))
}

export const dynamicParams = false

interface PageProps {
  params: { category: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const category = decodeURIComponent(params.category)
  return {
    title: `${category} · 博客分类`,
    description: `复利书房博客中「${category}」类别的文章列表。`,
    alternates: { canonical: `/blog/category/${encodeURIComponent(category)}` },
  }
}

export default function BlogCategoryPage({ params }: PageProps) {
  const category = decodeURIComponent(params.category)
  const posts = getBlogPostsByCategory(category)

  if (posts.length === 0) {
    notFound()
  }

  const categories = getBlogCategories()

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title={category}
        subtitle={`该内容类型的博客文章（${posts.length} 篇）`}
        backHref="/blog"
        backLabel="返回博客"
        sticky
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`/blog/category/${encodeURIComponent(cat.label)}`}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              cat.label === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label} <span className="opacity-60">({cat.count})</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {posts.map((post) => <BlogPostCard key={post.slug} post={post} />)}
      </div>
    </PageContainer>
  )
}
