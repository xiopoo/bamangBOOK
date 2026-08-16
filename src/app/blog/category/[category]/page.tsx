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

export const dynamicParams = true

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

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-8 text-sm">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`/blog/category/${encodeURIComponent(cat.label)}`}
            className={`underline underline-offset-2 ${cat.label === category ? 'text-text dark:text-dark-text no-underline' : 'text-primary dark:text-primary-light hover:text-primary-light'}`}
          >
            {cat.label}（{cat.count}）
          </Link>
        ))}
      </div>

      <div className="archive-list">
        {posts.map((post) => <BlogPostCard key={post.slug} post={post} />)}
      </div>
    </PageContainer>
  )
}
