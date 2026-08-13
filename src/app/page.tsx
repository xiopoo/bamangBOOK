import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Search } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getShareholderLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import { getDocuments } from '@/lib/documents'
import { documentHref } from '@/lib/content-routes'
import { getReadingStats } from '@/lib/reading-library'
import './home.css'

export const metadata: Metadata = { title: { absolute: '复利书房｜巴菲特、芒格与段永平阅读档案' }, description: '以巴菲特、芒格与段永平原典为核心的阅读档案：股东信、问答、演讲、访谈与公司研究，保留来源与完整上下文。', alternates: { canonical: '/' } }

export default function HomePage() {
  const letters = getShareholderLetters()
  const studies = getBusinessHistories()
  const talks = getDocuments('talks')
  const selectedTalks = talks.slice(0, 3)
  const readingStats = getReadingStats()
  const duanCount = readingStats.authorCounts['段永平'] || 0
  const buffettCount = readingStats.authorCounts['巴菲特'] || 0
  const mungerCount = readingStats.authorCounts['芒格'] || 0
  return <>
    <SubdomainRootRouter />
    <PageContainer maxWidth="7xl" className="archive-home">
      <section className="archive-home__hero">
        <p className="archive-kicker">复利书房 · 阅读档案</p>
        <h1>巴菲特、芒格与段永平的公开资料</h1>
        <p className="archive-home__lede">以原典为核心：股东信、问答、演讲、访谈与公司研究。资料保留来源与完整上下文，未收录或不完整的部分会明确标注。</p>
      </section>

      <section className="archive-home__section" aria-labelledby="archive-drawers-title">
        <div className="archive-section-heading"><div><p className="archive-kicker">档案</p><h2 id="archive-drawers-title">按人物与资料类型进入</h2></div></div>
        <div className="archive-drawer-grid">
          <ArchiveDrawer href="/buffett" title="巴菲特" count={buffettCount} description="合伙人信、股东信与股东大会问答。" />
          <ArchiveDrawer href="/munger" title="芒格" count={mungerCount} description="演讲、Wesco 问答与思维模型。" />
          <ArchiveDrawer href="/duanyongping" title="段永平" count={duanCount} description="博客、问答、演讲与公司实践。" />
          <ArchiveDrawer href="/letters" title="信件" count={letters.length} description="按时间从早到晚连续阅读。" />
          <ArchiveDrawer href="/talks" title="演讲与访谈" count={talks.length} description="在真实对话与公开表达中理解判断。" />
          <ArchiveDrawer href="/business-history" title="公司研究" count={studies.length} description="从历史、护城河与资本配置理解企业。" />
        </div>
      </section>

      <section className="archive-home__section">
        <div className="archive-section-heading"><div><p className="archive-kicker">最近收录</p><h2>新整理的原典</h2></div><Link href="/talks">全部演讲与访谈 <ArrowRight size={15} /></Link></div>
        <div className="archive-list archive-list--home">{selectedTalks.map(item => <Link key={item.fileName} href={documentHref('talks', item)} className="archive-list__row"><span className="archive-list__year">{item.year || '待考'}</span><span className="archive-list__main"><strong>{item.title}</strong><small>{item.readMinutes} 分钟</small></span><ArrowRight size={16} /></Link>)}</div>
      </section>

      <div className="archive-home__search"><Search size={18} /><span>想找某个人、某一年或某家公司？</span><Link href="/search">搜索全站</Link><span className="archive-home__study-count">{studies.length} 份公司研究 · {letters.length} 封股东信</span></div>
    </PageContainer>
  </>
}

function ArchiveDrawer({ href, title, count, description }: { href: string; title: string; count: number; description: string }) {
  return <Link href={href}><span>{count}</span><h3>{title}</h3><p>{description}</p><small>打开档案 →</small></Link>
}
