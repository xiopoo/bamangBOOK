import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, BookOpen, CalendarDays, Search, Tags } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getShareholderLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import { getDocuments } from '@/lib/documents'

export const metadata: Metadata = { title: '长期投资阅读档案馆', description: '复利书房以巴菲特、芒格原典为核心，延伸到公司研究的长期投资阅读档案馆。', alternates: { canonical: '/' } }

export default function HomePage() {
  const letters = getShareholderLetters()
  const studies = getBusinessHistories()
  const recent = getDocuments('talks').slice(0, 3)
  const latestYear = letters.length ? Math.max(...letters.map(item => item.year)) : 2025
  return <>
    <SubdomainRootRouter />
    <PageContainer maxWidth="7xl" className="archive-home">
      <section className="archive-home__hero">
        <p className="archive-kicker">复利书房 · 长期投资阅读档案馆</p>
        <h1>回到原典，<br />建立自己的判断。</h1>
        <p className="archive-home__lede">以巴菲特、芒格和段永平的原典资料为核心，延伸到公司研究与商业史。我们整理来源、保留上下文，也把不完整的地方明确标出来。</p>
        <Link href="/partnership/1" className="archive-button archive-button--solid">开始阅读 <ArrowRight size={17} /></Link>
      </section>

      <section className="archive-entry-grid" aria-label="阅读入口">
        <Link href="/reading"><BookOpen size={20} /><span><strong>按人物</strong><small>巴菲特 · 芒格 · 段永平</small></span><ArrowRight size={16} /></Link>
        <Link href="/letters"><CalendarDays size={20} /><span><strong>按年份</strong><small>从 1956 年的第一封信开始</small></span><ArrowRight size={16} /></Link>
        <Link href="/model"><Tags size={20} /><span><strong>按主题</strong><small>资本配置 · 护城河 · 判断</small></span><ArrowRight size={16} /></Link>
      </section>

      <section className="archive-home__section">
        <div className="archive-section-heading"><div><p className="archive-kicker">最近更新</p><h2>现在可以读什么</h2></div><Link href="/reading">浏览全部 <ArrowRight size={15} /></Link></div>
        <div className="archive-list archive-list--home">{recent.map((item: any) => <Link key={item.slug || item.id || item.title} href={item.href || `/talks/${item.slug || item.id}`} className="archive-list__row"><span className="archive-list__year">{item.year || latestYear}</span><span className="archive-list__main"><strong>{item.title}</strong><small>演讲与访谈 · 原典资料</small></span><ArrowRight size={16} /></Link>)}</div>
      </section>

      <section className="archive-home__section archive-home__paths">
        <div className="archive-section-heading"><div><p className="archive-kicker">精选阅读路径</p><h2>从一条线索开始</h2></div></div>
        <div className="archive-path-grid"><Link href="/learn/path"><span>01</span><strong>从第一封合伙人信开始</strong><small>看一个投资者如何解释风险、评价与资本。</small></Link><Link href="/buffett"><span>02</span><strong>巴菲特的企业阅读</strong><small>从价格出发，最后回到企业和所有者收益。</small></Link><Link href="/munger"><span>03</span><strong>芒格的判断系统</strong><small>从投资出发，最后走向多元思维模型。</small></Link></div>
      </section>

      <section className="archive-home__editorial"><div><p className="archive-kicker">编辑说明</p><h2>每一条资料，都说明它从哪里来。</h2></div><p>原文、译文、编辑整理和已校对内容分别标注；尽量保留原始年份、出处与完整上下文。发现错误或缺漏后，我们会持续修订。网站适合查找和交叉阅读，文集入口保留在页脚。</p><Link href="/about">了解来源与修订原则 <ArrowRight size={15} /></Link></section>
      <div className="archive-home__search"><Search size={18} /><span>想找某个人、某一年或某家公司？</span><Link href="/search">搜索全站</Link><span className="archive-home__study-count">{studies.length} 份公司研究 · {letters.length} 封股东信</span></div>
    </PageContainer>
  </>
}
