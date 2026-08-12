import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import MarkdownContent from '@/components/MarkdownContent'
import { getRebuildItem, getRebuildRouteParams } from '@/lib/rebuild-manifest'

export function generateStaticParams() { return getRebuildRouteParams() }

export default function RebuildReaderPage({ params }: { params: { person: string; collection: string; slug: string } }) {
  const item = getRebuildItem(params.person, params.collection, params.slug)
  if (!item) notFound()
  const sourcePath = path.resolve(process.cwd(), item.sourcePath)
  if (!sourcePath.startsWith(path.resolve(process.cwd(), 'content') + path.sep) || !fs.existsSync(sourcePath)) notFound()
  const content = fs.readFileSync(sourcePath, 'utf8')
  return <main className="rebuild-shell rebuild-reader"><header className="rebuild-header"><Link href="/rebuild" className="rebuild-brand"><span>↗</span><strong>复利书房</strong></Link><Link href={`/rebuild/archive/${item.person}/${item.collection}`}>返回目录</Link></header><article><Link className="rebuild-back" href={`/rebuild/archive/${item.person}/${item.collection}`}><ArrowLeft size={15} /> 返回资料目录</Link><p className="rebuild-reader__meta">{[item.year, item.kind, item.wordCount ? `${Math.max(1, Math.round(item.wordCount / 400))} 分钟` : null].filter(Boolean).join(' · ')}</p><h1>{item.title}</h1><p className="rebuild-reader__source">内容状态 · 待核对　完整度 · 未知{item.sourceUrl ? `　来源 · ${item.sourceUrl}` : ''}</p><MarkdownContent content={content} isQA={item.kind.includes('问答') || item.kind.includes('股东大会')} className="prose" /></article></main>
}
