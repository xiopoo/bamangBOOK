import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DuanReadingArticle from '@/components/DuanReadingArticle'
import { getDYDoc, getDYSlugs } from '@/lib/duanyongping'

export function generateStaticParams() { return getDYSlugs('qa').map(slug => ({ slug: encodeURIComponent(slug) })) }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getDYDoc('qa', params.slug)
  if (!doc) return { title: '未找到' }
  return { title: `${doc.title} · 段永平雪球问答`, description: `${doc.title}，段永平雪球公开问答资料。`, alternates: { canonical: `/duanyongping/qa/${params.slug}` } }
}
export default function Page({ params }: { params: { slug: string } }) {
  const doc = getDYDoc('qa', params.slug)
  if (!doc) notFound()
  const isPdf = Boolean(doc.source && /\.pdf(\?|$)/i.test(doc.source))
  const preview = isPdf ? <section className="mb-8 overflow-hidden border border-[var(--archive-rule)] bg-[var(--archive-paper-tint)]"><header className="flex min-h-11 items-center justify-between border-b border-[var(--archive-rule)] px-4 py-3"><span className="text-sm font-medium">PDF 原始资料</span><a href={doc.source} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">全屏查看 ↗</a></header><iframe src={doc.source} className="h-[70vh] min-h-[32rem] w-full border-0" title={`${doc.title} PDF 原始资料`} loading="lazy" /></section> : undefined
  return <DuanReadingArticle doc={doc} section="qa" backLabel="返回雪球问答录" contentType="雪球问答" isQA beforeBody={preview} />
}
