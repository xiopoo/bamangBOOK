import Link from 'next/link'
import { collectionCount } from '@/lib/rebuild-manifest'

export default function ResearchPage() {
  const sections = [['company-research', '公司研究', '从企业经营、护城河和资本配置理解长期价值。'], ['business-history', '商业史', '把商业模式放回它形成、演变与竞争的历史中阅读。']] as const
  return <main className="rebuild-shell rebuild-catalog"><header className="rebuild-header"><Link href="/rebuild" className="rebuild-brand"><span>↗</span><strong>复利书房</strong></Link><Link href="/rebuild">返回新站首页</Link></header><section><p>研究资料</p><h1>公司研究与商业史</h1><div className="rebuild-catalog-list">{sections.map(([id, name, description]) => <Link key={id} href={`/rebuild/archive/research/${id}`}><small>{collectionCount('research', id)} 篇</small><strong>{name}</strong><span>{description}</span></Link>)}</div></section></main>
}
