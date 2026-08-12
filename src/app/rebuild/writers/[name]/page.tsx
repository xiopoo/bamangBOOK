import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRebuildWriter } from '@/lib/rebuild-manifest'

export function generateStaticParams() {
  return ['唐僧的碎碎念', '在苍茫中传灯', '方伟看十年', '梁孝永康'].map((name) => ({ name }))
}

export default function WriterArchivePage({ params }: { params: { name: string } }) {
  const writer = getRebuildWriter(decodeURIComponent(params.name))
  if (!writer) notFound()
  return <main className="rebuild-shell rebuild-catalog"><header className="rebuild-header"><Link href="/rebuild" className="rebuild-brand"><span>↗</span><strong>复利书房</strong></Link><Link href="/rebuild/writers">返回四位博主</Link></header><section><p>投资写作 · {writer.items.length.toLocaleString()} 篇</p><h1>{writer.name}</h1><div className="rebuild-catalog-list">{writer.items.map((item) => <Link key={item.id} href={`/rebuild/archive/writer/writers/${item.targetPath.split('/').pop()}`}><small>{item.year || '待考'} · 微信公众号文章</small><strong>{item.title}</strong><span>{item.wordCount ? `${Math.max(1, Math.round(item.wordCount / 400))} 分钟` : '阅读'}</span></Link>)}</div></section></main>
}
