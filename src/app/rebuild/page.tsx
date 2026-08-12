import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Search } from 'lucide-react'
import { collectionCount, getRebuildManifest } from '@/lib/rebuild-manifest'

export const metadata: Metadata = { title: '长期价值投资阅读档案馆', description: '复利书房以巴菲特、芒格、段永平原典为核心，收录公司研究、商业史与长期价值投资写作。', alternates: { canonical: '/' } }

const people = [
  { id: 'buffett', name: '巴菲特', label: '从合伙人信到股东大会，读一个投资者如何形成判断。', collections: [['partnership-letters', '合伙人信'], ['shareholder-letters', '股东信'], ['speeches', '演讲'], ['interviews', '访谈'], ['annual-meetings', '股东大会实录']] },
  { id: 'munger', name: '芒格', label: '从西科、每日期刊到多元思维模型，理解判断的格栅。', collections: [['wesco-daily-journal', '西科与每日期刊'], ['poor-charlies-almanack', '《穷查理宝典》'], ['mental-models', '思维模型']] },
  { id: 'duan-yongping', name: '段永平', label: '在问答与博客里，看价值投资如何进入企业与日常。', collections: [['qa', '问答录'], ['netease-blog', '网易博客']] },
] as const

export default function RebuildPreviewPage() {
  const manifest = getRebuildManifest()
  const writerCount = collectionCount('writer', 'writers')
  const researchCount = collectionCount('research', 'company-research') + collectionCount('research', 'business-history')

  return <div className="rebuild-shell">
    <header className="rebuild-header"><Link href="/rebuild" className="rebuild-brand"><span>↗</span><strong>复利书房</strong></Link><nav><a href="#archive">原典档案</a><a href="#research">研究资料</a><a href="#writers">投资写作</a><a href="#books">电子书</a><Link href="/search" aria-label="全站搜索"><Search size={18} /></Link></nav></header>
    <main>
      <section className="rebuild-hero"><p>长期价值投资阅读档案馆</p><h1>回到原典，<br />建立自己的判断。</h1><div><span>巴菲特、芒格、段永平</span><span>公司研究与商业史</span><span>四位长期写作者</span></div><a href="#archive" className="rebuild-action">从原典开始 <ArrowRight size={16} /></a></section>
      <section className="rebuild-proof"><span>已整理</span><strong>{manifest.total.toLocaleString()}</strong><span>条可迁移资料</span><i /> <span>每条资料将保留来源、年份、类型与阅读上下文</span></section>
      <section id="archive" className="rebuild-section"><div className="rebuild-heading"><p>原典档案</p><h2>从一个人的完整思想脉络进入</h2></div><div className="rebuild-people">{people.map((person, index) => <article key={person.id}><span className="rebuild-index">0{index + 1}</span><h3>{person.name}</h3><p>{person.label}</p><ul>{person.collections.map(([id, label]) => <li key={id}><Link href={`/archive/${person.id}/${id}`}><span>{label}</span><b>{collectionCount(person.id, id).toLocaleString()}</b></Link></li>)}</ul><Link href={`/archive/${person.id}/${person.collections[0][0]}`}>进入{person.name}书房 <ArrowRight size={15} /></Link></article>)}</div></section>
      <section id="research" className="rebuild-section rebuild-split"><div className="rebuild-heading"><p>研究资料</p><h2>用企业与历史，校验自己的理解。</h2></div><div className="rebuild-feature"><BookOpen size={22} /><div><strong>{researchCount} 篇公司研究与商业史</strong><p>把企业、行业、商业模式与资本配置放回长期尺度中阅读。</p></div><Link href="/research">浏览研究 <ArrowRight size={16} /></Link></div></section>
      <section id="writers" className="rebuild-section rebuild-split"><div className="rebuild-heading"><p>投资写作</p><h2>四位写作者，{writerCount.toLocaleString()} 篇文章。</h2></div><Link className="rebuild-writers" href="/writers">唐僧的碎碎念　·　在苍茫中传灯　·　方伟看十年　·　梁孝永康</Link></section>
      <section id="books" className="rebuild-books"><p>主题文集</p><h2>把零散阅读，变成一条完整的线。</h2><Link href="/books"><div><article><small>电子书 · 人工购买</small><h3>《巴菲特文集》</h3><p>从所有者思维、好企业到资本配置。</p></article><article><small>电子书 · 人工购买</small><h3>《芒格文集》</h3><p>从知识格栅、误判心理到商业判断。</p></article></div></Link></section>
    </main>
    <footer>复利书房 · 原典优先，完整上下文优先，可验证来源优先。</footer>
  </div>
}
