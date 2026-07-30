import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import { getDocuments } from '@/lib/documents'
import { getBloggers } from '@/lib/bloggers'
import { getPartnershipCount, getShareholderLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import { getBooks } from '@/lib/books'
import { getColumns } from '@/lib/columns'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getSpaceHref } from '@/lib/site-spaces'

type Drawer = {
  href: string
  title: string
  count: string
  description: string
}

const sharedIdeas = [
  {
    href: '/concepts/价值投资',
    number: '01',
    title: '企业',
    description: '股票不是代码，而是一门生意的一部分。先看它怎样赚钱，再看市场怎样报价。',
  },
  {
    href: '/concepts/优质企业',
    number: '02',
    title: '质量',
    description: '能提价、少追加资本、让客户反复回来——好生意通常有很朴素的特征。',
  },
  {
    href: '/concepts/安全边际',
    number: '03',
    title: '价格',
    description: '再好的企业也有价格。未知无法消除，只能在买入时给它留下余地。',
  },
  {
    href: '/concepts/股东回报',
    number: '04',
    title: '资本',
    description: '利润留下来以后怎样使用，最终决定一家公司的复利能走多远。',
  },
  {
    href: '/model/lollapalooza-tendency',
    number: '05',
    title: '判断',
    description: '数字之外还有激励、情绪与偏见。很多大错，是几个小偏差同时发生。',
  },
  {
    href: '/concepts/长期持有',
    number: '06',
    title: '时间',
    description: '耐心不是等待行情，而是让优秀的企业和正确的结构有时间兑现。',
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
  const bookCount = getBooks().length
  const columnCount = getColumns().length
  const partnershipCount = getPartnershipCount()
  const shareholderYears = getShareholderLetters().map((letter) => letter.year)
  const shareholderYearRange = shareholderYears.length > 0
    ? `${Math.min(...shareholderYears)}—${Math.max(...shareholderYears)}`
    : '1965—'

  const drawers: Drawer[] = [
    {
      href: getSpaceHref('buffett'),
      title: '巴菲特原典',
      count: `${partnershipCount + shareholderYears.length} 封`,
      description: '从合伙人时期到伯克希尔，六十余年的亲笔信与资本配置记录。',
    },
    {
      href: getSpaceHref('munger'),
      title: '查理·芒格',
      count: '原典与模型',
      description: 'Wesco 问答、公开演讲、《穷查理宝典》与多元思维模型。',
    },
    {
      href: '/qa',
      title: '股东大会',
      count: `${qaCount} 篇`,
      description: '历年现场问答。问题很具体，回答往往比问题走得更远。',
    },
    {
      href: '/books',
      title: '书籍',
      count: `${bookCount} 本`,
      description: '经典书目、核心章节，以及书与书之间相互照亮的部分。',
    },
    {
      href: '/columns',
      title: '文章',
      count: `${columnCount + articleCount} 篇`,
      description: '关于价格、价值、企业、市场，以及那些容易被忽略的细节。',
    },
    {
      href: '/business-history',
      title: '公司',
      count: `${businessHistoryCount} 篇`,
      description: '把公司放回历史里，看它如何赚钱、扩张、犯错和分配资本。',
    },
  ]

  return (
    <>
      <SubdomainRootRouter />
      <PageContainer maxWidth="7xl" className="archive-home">
        <section className="archive-hero">
          <p className="archive-eyebrow">巴菲特 · 芒格 · 企业 · 商业史</p>
          <h1>小胖书房</h1>
          <p className="archive-hero__lede">
            巴菲特和芒格留下了很多结论。更有价值的，是这些结论从哪里来，
            在什么情况下成立，又被什么事实改变。
          </p>

          <div className="archive-hero__actions">
            <Link href="/reading" className="archive-button archive-button--solid">
              看全部内容
              <ArrowRight size={17} strokeWidth={1.7} />
            </Link>
            <Link href="/partnership" className="archive-button">
              翻开一封合伙人信
            </Link>
            <Link href="/search" className="archive-button">
              <Search size={18} strokeWidth={1.7} />
              搜索
            </Link>
          </div>
        </section>

        <section className="archive-thinkers">
          <header>
            <p className="archive-kicker">两个人</p>
            <h2>一套不断校正的方法</h2>
          </header>
          <div>
            <Link href={getSpaceHref('buffett')} className="archive-thinker">
              <p>WARREN E. BUFFETT · 1930—</p>
              <h3>从价格出发，<br />最后走向企业。</h3>
              <span>
                合伙人信 · 伯克希尔股东信 · 股东大会 · 公司与资本配置
              </span>
              <strong>进入巴菲特档案 <ArrowRight size={16} /></strong>
            </Link>
            <Link href={getSpaceHref('munger')} className="archive-thinker">
              <p>CHARLES T. MUNGER · 1924—2023</p>
              <h3>从投资出发，<br />最后走向判断。</h3>
              <span>
                Wesco 问答 · 演讲与访谈 · 思维模型 · 生平与事业
              </span>
              <strong>进入芒格档案 <ArrowRight size={16} /></strong>
            </Link>
          </div>
        </section>

        <section className="archive-thought-map">
          <header>
            <p className="archive-kicker">共同的地图</p>
            <h2>六个问题，彼此相连</h2>
          </header>
          <div>
            {sharedIdeas.map((idea) => (
              <Link key={idea.number} href={idea.href}>
                <span>{idea.number}</span>
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="archive-today" aria-label="今天读这篇">
          <div className="archive-today__label">
            <p className="archive-kicker">今天读这篇</p>
            <span>约 8 分钟</span>
          </div>
          <div className="archive-today__content">
            <p className="archive-kicker">能力圈</p>
            <h2>
              <Link href="/columns/能力圈的真正边界">能力圈的真正边界</Link>
            </h2>
            <p>
              熟悉一个行业，不等于理解一门生意。真正的边界，
              往往藏在那些无法回答的问题里。
            </p>
            <Link href="/columns/能力圈的真正边界" className="archive-today__link">
              打开 <ArrowRight size={16} />
            </Link>
          </div>
          <blockquote>
            “重要的不是能力圈有多大，而是你清楚它的边界在哪里。”
            <cite>—— 沃伦·巴菲特</cite>
          </blockquote>
        </section>

        <div className="archive-flourish" aria-hidden="true">❧</div>

        <section className="archive-section archive-section--collection">
          <div className="archive-section__heading">
            <div>
              <p className="archive-kicker">全部内容</p>
              <h2>六个入口</h2>
            </div>
            <p>
              巴菲特、芒格、股东大会、书籍、文章和公司。
            </p>
          </div>
          <div className="archive-drawers">
            {drawers.map((drawer, index) => (
              <Link key={drawer.href} href={drawer.href} className="archive-drawer">
                <div>
                  <span>{drawer.title}</span>
                  <small>{drawer.count}</small>
                </div>
                <p>{drawer.description}</p>
                <strong>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <ArrowRight size={15} />
                </strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="archive-section archive-section--ruled">
          <div className="archive-section__heading">
            <div>
              <p className="archive-kicker">反复重读</p>
              <h2>三组原典</h2>
            </div>
            <Link href="/reading">完整索引 →</Link>
          </div>
          <div className="archive-reading-grid">
            <ReadingCard
              href="/partnership"
              kicker="巴菲特 · 早期原典"
              title="巴菲特合伙人信"
              description="在成为“股神”以前，他怎样向合伙人解释收益、风险和自己做过的决定。"
              meta="1956—1970"
            />
            <ReadingCard
              href="/letters"
              kicker="伯克希尔 · 年度原典"
              title="伯克希尔股东信"
              description="六十年，数十家公司，一套不断进化、又很少改变的资本配置方法。"
              meta={shareholderYearRange}
            />
            <ReadingCard
              href="/poor-charlies-almanack"
              kicker="查理·芒格 · 思想原典"
              title="《穷查理宝典》"
              description="商业、心理学、工程学和人生经验，被放进同一张思考的网。"
              meta="演讲 · 文章 · 书单"
            />
          </div>
        </section>

        <section className="archive-index">
          <div>
            <p className="archive-kicker">再往里走</p>
            <h2>演讲、访谈和长期写作</h2>
            <p className="archive-index__intro">
              有些判断只在当时的现场里才完整，有些东西经得起一再重读。
              两种都留在这里。
            </p>
          </div>
          <div className="archive-index__links">
            <Link href="/talks"><span>公开演讲</span><small>{talkCount} 篇</small></Link>
            <Link href="/interviews"><span>访谈记录</span><small>{interviewCount} 篇</small></Link>
            <Link href="/articles"><span>研究文章</span><small>{articleCount} 篇</small></Link>
            <Link href="/business-history"><span>公司深度研究</span><small>{businessHistoryCount} 篇</small></Link>
            <Link href="/bloggers"><span>长期写作者</span><small>{bloggerCount.toLocaleString()} 篇</small></Link>
            <Link href="/search"><span>全站搜索</span><small>查找全部馆藏</small></Link>
          </div>
        </section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
