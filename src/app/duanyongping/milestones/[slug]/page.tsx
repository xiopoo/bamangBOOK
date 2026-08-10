import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DuanReadingArticle from '@/components/DuanReadingArticle'
import { getDYDoc, getDYSlugs } from '@/lib/duanyongping'

export function generateStaticParams() { return getDYSlugs('milestones').map(slug => ({ slug: encodeURIComponent(slug) })) }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getDYDoc('milestones', params.slug)
  if (!doc) return { title: '未找到' }
  return { title: `${doc.title} · 段永平公司与里程碑`, description: `${doc.title}，段永平相关公司与里程碑资料。`, alternates: { canonical: `/duanyongping/milestones/${params.slug}` } }
}
export default function Page({ params }: { params: { slug: string } }) {
  const doc = getDYDoc('milestones', params.slug)
  if (!doc) notFound()
  return <DuanReadingArticle doc={doc} section="milestones" backLabel="返回公司与里程碑" contentType="商业史" />
}
