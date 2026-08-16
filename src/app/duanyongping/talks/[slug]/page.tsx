import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DuanReadingArticle from '@/components/DuanReadingArticle'
import { getDYDoc, getDYSlugs } from '@/lib/duanyongping'

export function generateStaticParams() { return getDYSlugs('talks').map(slug => ({ slug: encodeURIComponent(slug) })) }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getDYDoc('talks', params.slug)
  if (!doc) return { title: '未找到' }
  return { title: `${doc.title} · 段永平演讲与访谈`, description: `${doc.title}，段永平公开演讲与访谈资料。`, alternates: { canonical: `/duanyongping/talks/${params.slug}` } }
}
export default function Page({ params }: { params: { slug: string } }) {
  const doc = getDYDoc('talks', params.slug)
  if (!doc) notFound()
  return <DuanReadingArticle doc={doc} section="talks" backLabel="返回演讲与访谈" contentType="演讲访谈" />
}
