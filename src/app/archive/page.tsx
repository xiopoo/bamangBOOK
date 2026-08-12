import Link from 'next/link'
import { collectionCount } from '@/lib/rebuild-manifest'

const archives = [
  ['buffett', '巴菲特', 'partnership-letters'],
  ['munger', '芒格', 'wesco-daily-journal'],
  ['duan-yongping', '段永平', 'qa'],
] as const

export default function ArchivePage() {
  return <main className="rebuild-shell rebuild-catalog"><header className="rebuild-header"><Link href="/" className="rebuild-brand"><span>↗</span><strong>复利书房</strong></Link><Link href="/">返回首页</Link></header><section><p>原典档案</p><h1>三位投资者的完整资料</h1><div className="rebuild-catalog-list">{archives.map(([person, name, collection]) => <Link key={person} href={`/archive/${person}/${collection}`}><small>原典资料</small><strong>{name}</strong><span>{collectionCount(person, collection).toLocaleString()} 条起读</span></Link>)}</div></section></main>
}
