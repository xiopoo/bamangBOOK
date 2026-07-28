import Link from 'next/link'
import { ArrowRight, BookOpen, Search } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import { getDocuments } from '@/lib/documents'
import { getBloggers } from '@/lib/bloggers'
import { getShareholderLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getSpaceHref } from '@/lib/site-spaces'

const drawers = [
  {
    href: getSpaceHref('buffett'),
    title: '巴菲特档案',
    count: '亲笔与亲述',
    description: '合伙人信、伯克希尔股东信、股东大会问答与公开演讲。',
  },
  {
    href: getSpaceHref('munger'),
    title: '芒格档案',
    count: '思想与原典',
    description: '影音记录、Wesco 原典、演讲文章与多元思维模型。',
  },
  {
    href: '/columns',
    title: '投资专栏',
    count: '长期写作',
    description: '围绕投资、企业、资本配置和商业史的专题文章。',
  },
  {
    href: '/bloggers',
    title: '作者专栏',
    count: '长期观察',
    description: '收录四位长期写作者对投资、企业与市场的持续观察。',
  },
  {
    href: '/companies',
    title: '公司档案',
    count: '企业索引',
    description: '把公司、人物、概念和历史事件放回同一张研究地图。',
  },
  {
    href: '/reading',
    title: '阅读索引',
    count: '连续阅读',
    description: '按人物、年份与主题进入馆藏，在不同资料之间相互参照。',
  },
]

function ReadingCard({
  href,
  kicker,
  title,
  description,
  meta,
}: {
  href: string
  kicker: string
  title: string
  description: string
  meta: string
}) {
  return (
    <article className="archive-reading-card">
      <p className="archive-kicker">{kicker}</p>
      <h3>
        <Link href={href}>{title}</Link>
      </h3>
      <p>{description}</p>
      <Link href={href} className="archive-reading-card__meta">
        <span>{meta}</span>
        <ArrowRight size={17} strokeWidth={1.5} />
      </Link>
    </article>
  )
}

export default function HomePage() {
  const articleCount = getDocuments('articles').length
  const qaCount = getDocuments('qa').length
  const talkCount = getDocuments('talks').length
  const interviewCount = getDocuments('interviews').length
  const bloggerCount = getBloggers().reduce((sum, blogger) => sum + blogger.count, 0)
  const businessHistoryCount = getBusinessHistories().length
  const shareholderYears = getShareholderLetters().map((letter) => letter.year)
  const shareholderYearRange = shareholderYears.length > 0
    ? `${Math.min(...shareholderYears)}—${Math.max(...shareholderYears)}`
    : '1965—'

  return (
    <>
      <SubdomainRootRouter />
      <PageContainer maxWidth="7xl" className="archive-home">
        <section className="archive-hero">
          <p className="archive-eyebrow">巴菲特 · 芒格 · 投资思想 · 商业史</p>
          <h1>小胖书房</h1>
          <p className="archive-hero__lede">
            系统整理巴菲特与芒格的原典、股东大会实录、投资专栏与商业史研究，保存重要思想的出处、语境和长期脉络。
          </p>

          <aside className="archive-aphorism" aria-label="今日书房">
            <p className="archive-kicker">今日书房</p>
            <blockquote>“每天睡觉时，都比早晨醒来时聪明一点点。”</blockquote>
            <p>——查理·芒格，《穷查理宝典》</p>
          </aside>

          <div className="archive-hero__actions">
            <Link href="/learn" className="archive-button archive-button--solid">
              <BookOpen size={18} strokeWidth={1.7} />
              进入学习室
            </Link>
            <Link href="/partnership" className="archive-button">
              从合伙人信开始
            </Link>
            <Link href="/search" className="archive-button">
              <Search size={18} strokeWidth={1.7} />
              搜索书房
            </Link>
          </div>
        </section>

        <div className="archive-flourish" aria-hidden="true">❧</div>

        <section className="archive-section">
          <div className="archive-section__heading">
            <div>
              <p className="archive-kicker">馆藏导航</p>
              <h2>分门别类的馆藏</h2>
            </div>
            <p>馆藏按人物、资料类型、作者、公司与概念组织，重要内容均可相互参照。</p>
          </div>
          <div className="archive-drawers">
            {drawers.map((drawer) => (
              <Link key={drawer.href} href={drawer.href} className="archive-drawer">
                <div>
                  <span>{drawer.title}</span>
                  <small>{drawer.count}</small>
                </div>
                <p>{drawer.description}</p>
                <strong>打开档案 <ArrowRight size={15} /></strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="archive-section archive-section--ruled">
          <div className="archive-section__heading">
            <div>
              <p className="archive-kicker">从这里开始</p>
              <h2>核心馆藏</h2>
            </div>
            <Link href="/reading">查看阅读记录 →</Link>
          </div>
          <div className="archive-reading-grid">
            <ReadingCard
              href="/partnership"
              kicker="巴菲特 · 早期原典"
              title="巴菲特合伙人信"
              description="回到他管理合伙基金的现场，观察业绩解释、投资纪律和早期方法如何形成。"
              meta="1956—1970"
            />
            <ReadingCard
              href="/letters"
              kicker="伯克希尔 · 年度原典"
              title="伯克希尔股东信"
              description="沿着六十年的亲笔信，理解企业经营、资本配置和长期复利的完整脉络。"
              meta={shareholderYearRange}
            />
            <ReadingCard
              href="/qa"
              kicker="股东大会 · 现场问答"
              title="巴菲特与芒格问答实录"
              description="从具体问题进入投资、管理、市场、错误与人生智慧，保留真实的问答语境。"
              meta={`${qaCount} 篇`}
            />
          </div>
        </section>

        <section className="archive-index">
          <div>
            <p className="archive-kicker">研究索引</p>
            <h2>演讲、访谈与专题研究</h2>
            <p className="archive-index__intro">
              收录公开演讲、访谈记录、研究文章与公司商业史，并支持按人物、公司和主题检索。
            </p>
          </div>
          <div className="archive-index__links">
            <Link href="/talks"><span>公开演讲</span><small>{talkCount} 篇</small></Link>
            <Link href="/interviews"><span>访谈记录</span><small>{interviewCount} 篇</small></Link>
            <Link href="/articles"><span>研究文章</span><small>{articleCount} 篇</small></Link>
            <Link href="/business-history"><span>商业史研究</span><small>{businessHistoryCount} 篇</small></Link>
            <Link href="/bloggers"><span>作者专栏</span><small>{bloggerCount.toLocaleString()} 篇</small></Link>
            <Link href="/search"><span>全站搜索</span><small>查找全部馆藏</small></Link>
          </div>
        </section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
