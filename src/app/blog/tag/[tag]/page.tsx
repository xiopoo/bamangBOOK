import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import BlogPostCard from '@/components/BlogPostCard'
import { getBlogPostsByTag, getBlogTags } from '@/lib/blog'

export function generateStaticParams() {
  return getBlogTags(100).map(({ tag }) => ({ tag }))
}

export const dynamicParams = true

interface PageProps {
  params: { tag: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const tag = decodeURIComponent(params.tag)
  return {
    title: `#${tag} · 博客标签`,
    description: `复利书房博客中标记为「${tag}」的文章列表。`,
    alternates: { canonical: `/blog/tag/${encodeURIComponent(tag)}` },
  }
}

export default function BlogTagPage({ params }: PageProps) {
  const tag = decodeURIComponent(params.tag)
  const posts = getBlogPostsByTag(tag)

  if (posts.length === 0) {
    notFound()
  }

  const allTags = getBlogTags(30)

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title={`# ${tag}`}
        subtitle={`标记为该主题的博客文章（${posts.length} 篇）`}
        backHref="/blog"
        backLabel="返回博客"
        sticky
      />

      <div className="archive-list mb-10">
        {posts.map((post) => <BlogPostCard key={post.slug} post={post} />)}
      </div>

      {allTags.length > 0 && (
        <section className="border-t border-gray-200 dark:border-dark-border pt-6">
          <h2 className="text-sm font-semibold text-text-muted dark:text-dark-muted mb-3">其他标签</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {allTags.map(({ tag: t, count }) => (
              <Link
                key={t}
                href={`/blog/tag/${encodeURIComponent(t)}`}
                className={`underline underline-offset-2 ${t === tag ? 'text-text dark:text-dark-text no-underline' : 'text-primary dark:text-primary-light hover:text-primary-light'}`}
              >
                #{t}（{count}）
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
