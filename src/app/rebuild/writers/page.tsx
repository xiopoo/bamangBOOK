import Link from 'next/link'
import { getRebuildWriters } from '@/lib/rebuild-manifest'

export default function WritersPage() {
  const writers = getRebuildWriters()
  return <main className="rebuild-shell rebuild-catalog"><header className="rebuild-header"><Link href="/rebuild" className="rebuild-brand"><span>↗</span><strong>复利书房</strong></Link><Link href="/rebuild">返回新站首页</Link></header><section><p>投资写作</p><h1>四位长期写作者</h1><div className="rebuild-catalog-list">{writers.map((writer) => <Link key={writer.name} href={`/rebuild/writers/${encodeURIComponent(writer.name)}`}><small>微信公众号文章</small><strong>{writer.name}</strong><span>{writer.items.length.toLocaleString()} 篇</span></Link>)}</div></section></main>
}
