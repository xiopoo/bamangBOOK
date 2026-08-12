import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getRebuildCollection, getRebuildCollectionParams } from '@/lib/rebuild-manifest'

export function generateStaticParams() { return getRebuildCollectionParams() }

export default function RebuildCollectionPage({ params }: { params: { person: string; collection: string } }) {
  const items = getRebuildCollection(params.person, params.collection)
  if (!items.length) notFound()
  return <main className="rebuild-shell rebuild-catalog"><header className="rebuild-header"><Link href="/rebuild" className="rebuild-brand"><span>↗</span><strong>复利书房</strong></Link><Link href="/rebuild">返回新站首页</Link></header><section><Link href="/rebuild" className="rebuild-back"><ArrowLeft size={15} /> 原典档案</Link><p>资料目录 · {items.length.toLocaleString()} 条</p><h1>{items[0].collection.replaceAll('-', ' ')}</h1><div className="rebuild-catalog-list">{items.map((item) => <Link key={item.id} href={`/rebuild/archive/${item.person}/${item.collection}/${item.targetPath.split('/').pop()}`}><small>{item.year || '待考'} · {item.kind}</small><strong>{item.title}</strong><span>{item.wordCount ? `${Math.max(1, Math.round(item.wordCount / 400))} 分钟` : '阅读资料'} <ArrowRight size={14} /></span></Link>)}</div></section></main>
}
