import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, BookOpen, CalendarDays, Search, Tags } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getShareholderLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import { getDocuments } from '@/lib/documents'
import { documentHref } from '@/lib/content-routes'
import { getReadingStats } from '@/lib/reading-library'
import { getDYDocs, type DYDoc, type DYSection } from '@/lib/duanyongping'
import '@/styles/templates/home.css'

export const metadata: Metadata = { title: { absolute: '复利书房｜巴菲特、芒格与公司研究' }, description: '巴菲特、芒格与段永平的第一手资料：股东信、合伙人信、股东大会问答、演讲与访谈，按人物与主题阅读。', alternates: { canonical: '/' } }

// 今日推荐：编辑精选，显式配置（前端重构 Spec §5.1）
const TODAY_RECOMMENDATION = {
  title: '巴菲特致伯克希尔股东的信（1965）',
  href: '/letters/1965',
  meta: '股东信 · 1965 · 首封伯克希尔股东信',
  reason: '这是巴菲特经营伯克希尔的第一封信：把股东当成合伙人，明确“账面价值不等于内在价值”，并立下衡量业绩的标准。此后六十年的股东信，都从这里开始。',
}

// 精选阅读路径（对齐 mungerarchive.com 的 crown jewels）
const CROWN_PATHS = [
  { href: '/partnership/1', title: '从第一封合伙人信开始', why: '方法形成期的起点：套利、控制型投资与业绩衡量，第一次被说清楚。' },
  { href: '/buffett', title: '巴菲特的企业阅读', why: '从价格出发，最后回到企业和所有者收益。' },
  { href: '/munger', title: '芒格的判断系统', why: '从投资出发，最后走向多元思维模型。' },
]

export default function HomePage() {
  const letters = getShareholderLetters()
  const studies = getBusinessHistories()
  const talks = getDocuments('talks')
  const selectedTalks = talks.slice(0, 3)
  const readingStats = getReadingStats()
  const recentRevisions = (['blog', 'qa', 'talks', 'milestones'] as DYSection[])
    .flatMap(section => getDYDocs(section, false).map(doc => ({ doc, section })))
    .filter(item => item.doc.updatedAt)
    .sort((a, b) => String(b.doc.updatedAt).localeCompare(String(a.doc.updatedAt)))
    .slice(0, 4)
  const duanCount = readingStats.authorCounts['段永平'] || 0
  const buffettCount = readingStats.authorCounts['巴菲特'] || 0
  const mungerCount = readingStats.authorCounts['芒格'] || 0
  return <>
    <SubdomainRootRouter />
    <PageContainer maxWidth="6xl" className="archive-home">
      {/* Hero：主题宣言 */}
      <section className="archive-home__hero">
        <p className="archive-kicker">复利书房 · 巴菲特、芒格与公司研究</p>
        <h1><span>回到原典，</span><span>建立自己的判断。</span></h1>
        <p className="archive-home__lede">以巴菲特、芒格和段永平的原典资料为核心，延伸到公司研究与商业史。我们整理来源、保留上下文，也把不完整的地方明确标出来。</p>
        <Link href="/partnership/1" className="archive-button archive-button--solid">开始阅读 <ArrowRight size={17} /></Link>
      </section>

      {/* 阅读入口 */}
      <section className="archive-entry-grid" aria-label="阅读入口">
        <Link href="/people"><BookOpen size={20} /><span><strong>按人物</strong><small>巴菲特 · 芒格 · 段永平</small></span><ArrowRight size={16} /></Link>
        <Link href="/letters"><CalendarDays size={20} /><span><strong>按年份</strong><small>从 1957 年的第一封信开始</small></span><ArrowRight size={16} /></Link>
        <Link href="/model"><Tags size={20} /><span><strong>按主题</strong><small>资本配置 · 护城河 · 判断</small></span><ArrowRight size={16} /></Link>
      </section>

      {/* 今日推荐 */}
      <section className="archive-home__section archive-featured" aria-labelledby="featured-reading-title">
        <div className="archive-featured__meta"><p className="archive-kicker">今日推荐</p><span>{TODAY_RECOMMENDATION.meta}</span></div>
        <div className="archive-featured__body">
          <h2 id="featured-reading-title">{TODAY_RECOMMENDATION.title}</h2>
          <p>{TODAY_RECOMMENDATION.reason}</p>
          <Link href={TODAY_RECOMMENDATION.href}>开始阅读 <ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* 全部内容：按人物与资料类型进入 */}
      <section className="archive-home__section" aria-labelledby="archive-drawers-title">
        <div className="archive-section-heading"><div><p className="archive-kicker">全部内容</p><h2 id="archive-drawers-title">按人物与资料类型进入</h2></div></div>
        <div className="archive-drawer-grid">
          <ArchiveDrawer href="/buffett" title="巴菲特" count={buffettCount} description="合伙人信、股东信与股东大会问答。" />
          <ArchiveDrawer href="/munger" title="芒格" count={mungerCount} description="演讲、Wesco 问答与思维模型。" />
          <ArchiveDrawer href="/duanyongping" title="段永平" count={duanCount} description="博客、问答、演讲与公司实践。" />
          <ArchiveDrawer href="/letters" title="信件" count={letters.length} description="按时间从早到晚连续阅读。" />
          <ArchiveDrawer href="/talks" title="演讲与访谈" count={talks.length} description="在真实对话与公开表达中理解判断。" />
          <ArchiveDrawer href="/business-history" title="公司研究" count={studies.length} description="从历史、护城河与资本配置理解企业。" />
        </div>
      </section>

      {/* 编辑选读 */}
      <section className="archive-home__section">
        <div className="archive-section-heading"><div><p className="archive-kicker">编辑选读</p><h2>三篇值得重读的原典</h2></div><Link href="/talks">浏览演讲与访谈 <ArrowRight size={15} /></Link></div>
        <div className="archive-list archive-list--home">{selectedTalks.map(item => <Link key={item.fileName} href={documentHref('talks', item)} className="archive-list__row"><span className="archive-list__year">{item.year || '待考'}</span><span className="archive-list__main"><strong>{item.title}</strong><small>演讲与访谈 · 原典资料</small></span><ArrowRight size={16} /></Link>)}</div>
      </section>

      {/* 精选阅读路径 */}
      <section className="archive-home__section archive-home__paths">
        <div className="archive-section-heading"><div><p className="archive-kicker">精选阅读路径</p><h2>从一条线索开始</h2></div></div>
        <div className="archive-path-grid">{CROWN_PATHS.map((path, index) => <Link key={path.href} href={path.href}><span>0{index + 1}</span><strong>{path.title}</strong><small>{path.why}</small></Link>)}</div>
      </section>

      {/* 最近修订 */}
      {recentRevisions.length > 0 && <section className="archive-home__section">
        <div className="archive-section-heading"><div><p className="archive-kicker">最近修订</p><h2>刚刚整理过的资料</h2></div><Link href="/duanyongping">查看段永平档案 <ArrowRight size={15} /></Link></div>
        <div className="archive-list archive-list--home">{recentRevisions.map(({ doc, section }) => <Link key={`${section}-${doc.slug}`} href={`/duanyongping/${section}/${doc.slug}`} className="archive-list__row"><span className="archive-list__year">{formatRevisionDate(doc)}</span><span className="archive-list__main"><strong>{doc.title}</strong><small>最近修订 · {sectionLabel(section)} · 编辑整理</small></span><ArrowRight size={16} /></Link>)}</div>
      </section>}

      {/* 搜索 */}
      <div className="archive-home__search"><Search size={18} /><span>想找某个人、某一年或某家公司？</span><Link href="/search">搜索全站</Link><span className="archive-home__study-count">{studies.length} 份公司研究 · {letters.length} 封股东信</span></div>
    </PageContainer>
  </>
}

function ArchiveDrawer({ href, title, count, description }: { href: string; title: string; count: number; description: string }) {
  return <Link href={href}><span>{count}</span><h3>{title}</h3><p>{description}</p><small>打开全部 →</small></Link>
}

function formatRevisionDate(doc: DYDoc): string {
  return doc.updatedAt?.slice(0, 10) || '待考'
}

function sectionLabel(section: DYSection): string {
  return ({ blog: '博客', qa: '问答', talks: '演讲与访谈', milestones: '公司里程碑' } as const)[section]
}
