import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DuanReadingArticle from '@/components/DuanReadingArticle'
import { getDYDoc, getDYSlugs } from '@/lib/duanyongping'

export function generateStaticParams() { return getDYSlugs('blog').map(slug => ({ slug: encodeURIComponent(slug) })) }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getDYDoc('blog', params.slug)
  if (!doc) return { title: '未找到' }
  return { title: `${doc.title} · 段永平网易博客`, description: `${doc.title}，段永平公开博客资料归档。`, alternates: { canonical: `/duanyongping/blog/${params.slug}` } }
}
export default function Page({ params }: { params: { slug: string } }) {
  const doc = getDYDoc('blog', params.slug)
  if (!doc) notFound()
  return <DuanReadingArticle doc={doc} section="blog" backLabel="返回网易博客" contentType="文章" />
}
