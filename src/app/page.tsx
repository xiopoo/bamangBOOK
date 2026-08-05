import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Check, Search } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import DailyQuotePanel from '@/components/DailyQuotePanel'
import { getDocuments } from '@/lib/documents'
import { getPartnershipCount, getShareholderLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import { getModels } from '@/lib/models'
import { getSpaceHref } from '@/lib/site-spaces'
import { getAllDailyQuotes } from '@/lib/daily-quote'

export const metadata: Metadata = { alternates: { canonical: '/' } }

const trustSignals = [
  '原文、翻译与编辑整理分别标注',
  '尽量保留年份、出处与完整上下文',
  '发现错误后持续修订',
]

export default function HomePage() {
  const partnershipCount = getPartnershipCount()
  const shareholderLetters = getShareholderLetters()
  const qaCount = getDocuments('qa').length
  const talkCount = getDocuments('talks').length + getDocuments('interviews').length
  const companyStudies = getBusinessHistories()
  const modelCount = getModels().length
  const letterCount = partnershipCount + shareholderLetters.length
  const featuredCompany = companyStudies[0]

  const dailyQuotes = getAllDailyQuotes()
  const dailyDateISO = new Date().toISOString().slice(0, 10)

  const drawers = [
    { href: '/letters', number: letterCount, label: '巴菲特信件', meta: '合伙人信与伯克希尔股东信', description: '按年份连续阅读，观察一种投资方法怎样在真实决策中形成。' },
    { href: '/qa', number: qaCount, label: '股东大会问答', meta: '现场提问与完整回答', description: '把观点放回问题、追问和当时的商业环境中理解。' },
    { href: '/munger/archive', number: talkCount, label: '演讲与访谈', meta: '巴菲特与芒格公开表达', description: '按人物和时间查找演讲、访谈、播客与会议记录。' },
    { href: '/business-history', number: companyStudies.length, label: '公司研究', meta: '经营史与资本配置', description: '研究企业如何赚钱、扩张、犯错，以及资本最终流向哪里。' },
    { href: '/model', number: modelCount, label: '思维模型', meta: '多学科判断工具', description: '从概率、激励、心理学和逆向思考建立一张可用的格栅。' },
    { href: '/bloggers', number: '长期', label: '博主文章', meta: '四位中文写作者', description: '把原典、企业案例和中国投资者的长期实践放在一起阅读。' },
  ]

  return (
    <>
      <SubdomainRootRouter />
      <PageContainer maxWidth="7xl" className="study-home study-home--refined">
        <section className="study-hero study-hero--refined study-hero--daily">
          <p className="study-label study-label--daily">每日一句 · 来自原文</p>
          <DailyQuotePanel quotes={dailyQuotes} initialDateISO={dailyDateISO} />
          <div className="study-hero__copy">
            <h1>读巴菲特和芒格，<br />先回到原文。</h1>
            <p className="study-hero__lede">
              复利书房整理巴菲特、芒格散落多年的信件、演讲与问答，也持续收录公司研究和投资方法文章。这里的目标不是替你下结论，而是把可以核验的材料放到一起。
            </p>
            <div className="study-actions">
              <Link href="/partnership/1" className="archive-button archive-button--solid">
                从第一封合伙人信开始 <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/search" className="archive-button"><Search size={16} />搜索整个书房</Link>
            </div>
            <nav className="study-hero__quicklinks" aria-label="推荐起点">
              <Link href="/letters">巴菲特股东信</Link>
              <Link href="/munger/archive">芒格演讲与问答</Link>
              <Link href="/business-history">公司研究</Link>
              <Link href="/bound-edition">两卷电子书</Link>
            </nav>
          </div>
        </section>

        <section className="study-proof study-proof--refined" aria-label="内容规模与编辑标准">
          <dl className="study-proof__metrics">
            <div><dt>{letterCount}</dt><dd>封巴菲特信件</dd></div>
            <div><dt>{qaCount}</dt><dd>篇股东大会问答</dd></div>
            <div><dt>{modelCount}</dt><dd>个思维模型</dd></div>
            <div><dt>{companyStudies.length}</dt><dd>份公司研究</dd></div>
          </dl>
          <div className="study-proof__trust">
            {trustSignals.map(signal => <span key={signal}><Check size={14} />{signal}</span>)}
          </div>
        </section>

        <section className="study-section study-feature">
          <header className="study-section__header study-section__header--compact">
            <div><p className="study-label">从这里开始</p><h2>一封信，是最好的入口</h2></div>
            <Link href="/reading">浏览全部内容 →</Link>
          </header>
          <div className="study-feature__grid">
            <article className="study-feature__primary">
              <span>1956 · PARTNERSHIP LETTER</span>
              <h3>1956年巴菲特致合伙人信</h3>
              <p>从第一封记录开始，看巴菲特怎样向合伙人解释业绩、风险与评价投资结果的方法。许多后来写进伯克希尔股东信的原则，在这里已经出现。</p>
              <blockquote>判断一年做得好不好，不能只看赚了多少钱，还要看当时承担了什么风险、市场整体处在什么位置。</blockquote>
              <Link href="/partnership/1" className="archive-button archive-button--solid">打开原文 <ArrowRight size={16} /></Link>
            </article>
            <aside className="study-feature__more" aria-label="继续阅读">
              <p>接着读</p>
              <Link href={featuredCompany ? `/business-history/${featuredCompany.slug}` : '/business-history'}>
                <small>公司研究 · {featuredCompany?.readMinutes || 18} 分钟</small>
                <strong>{featuredCompany?.title || '企业如何把优势变成长期结构'}</strong>
                <span>{featuredCompany?.summary || '把公司放回经营历史里，观察优势、约束和资本流向。'}</span>
              </Link>
              <Link href="/concepts/资本配置">
                <small>投资方法 · 沿问题阅读</small>
                <strong>管理层怎样分配资本？</strong>
                <span>利润留下来以后怎样使用，往往比某一年的利润本身更重要。</span>
              </Link>
            </aside>
          </div>
        </section>

        <section className="study-section study-drawers">
          <header className="study-section__header study-section__header--compact">
            <div><p className="study-label">按资料类型浏览</p><h2>六个类别，任选入口</h2></div>
            <p>不必从首页顺序读完。选一个问题、一位人物或一种资料，直接进去。</p>
          </header>
          <div className="study-drawers__grid">
            {drawers.map(drawer => (
              <Link key={drawer.href} href={drawer.href}>
                <div><h3>{drawer.label}</h3><strong>{drawer.number}</strong></div>
                <small>{drawer.meta}</small>
                <p>{drawer.description}</p>
                <span>打开抽屉 <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="study-section study-thinkers">
          <header className="study-section__header study-section__header--compact">
            <div><p className="study-label">人物专题</p><h2>两条彼此交叉的学习路径</h2></div>
          </header>
          <div className="study-thinkers__grid">
            <article>
              <p>WARREN BUFFETT</p>
              <h3>从价格出发，<br />最后走向企业。</h3>
              <span>合伙人信、伯克希尔股东信、股东大会问答与六十余年的资本配置记录。</span>
              <Link href={getSpaceHref('buffett')}>进入巴菲特专题 <ArrowRight size={16} /></Link>
            </article>
            <article>
              <p>CHARLIE MUNGER</p>
              <h3>从投资出发，<br />最后走向判断。</h3>
              <span>Wesco 问答、Daily Journal、公开演讲、多元思维模型与误判心理学。</span>
              <Link href={getSpaceHref('munger')}>进入芒格专题 <ArrowRight size={16} /></Link>
            </article>
          </div>
        </section>

        <section className="study-section study-editions study-editions--refined">
          <div className="study-editions__intro">
            <p className="study-label">BOUND EDITION · 电子合订本</p>
            <h2>网站适合查，<br />电子书适合从头读。</h2>
            <p>《所有者的眼光》与《理性的格栅》分别整理巴菲特和芒格的完整思想脉络。每卷 99 元，添加微信后人工发送 PDF。</p>
            <Link href="/bound-edition" className="archive-button archive-button--solid">查看目录与实际页面 <ArrowRight size={17} /></Link>
          </div>
          <div className="study-editions__summary">
            <article><span>01 · BUFFETT</span><h3>《所有者的眼光》</h3><p>企业、资本与长期复利</p></article>
            <article><span>02 · MUNGER</span><h3>《理性的格栅》</h3><p>思维模型、商业判断与人生智慧</p></article>
            <strong>99<small>元 / 卷</small></strong>
          </div>
        </section>
      </PageContainer>
    </>
  )
}
