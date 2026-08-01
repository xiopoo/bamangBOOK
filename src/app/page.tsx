import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Check, Search } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getDocuments } from '@/lib/documents'
import { getPartnershipCount, getShareholderLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import { getModels } from '@/lib/models'
import { getSpaceHref } from '@/lib/site-spaces'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const trustSignals = [
  '原文、翻译、编辑整理分别标注',
  '保留年份、出处与上下文',
  '发现错误，持续修订',
]

const contentEntrances = [
  {
    number: '01',
    href: '/reading',
    title: '信件与演讲',
    eyebrow: '原文与谈话',
    description: '在完整上下文中理解他们真正表达了什么。',
  },
  {
    number: '02',
    href: '/business-history',
    title: '公司研究',
    eyebrow: '经营与资本',
    description: '研究一家公司如何赚钱、扩张、犯错，以及资本最终流向哪里。',
  },
  {
    number: '03',
    href: '/concepts',
    title: '投资方法',
    eyebrow: '概念与模型',
    description: '围绕安全边际、企业质量和资本配置连接分散材料。',
  },
  {
    number: '04',
    href: '/search',
    title: '全站搜索',
    eyebrow: '按人物、公司、年份检索',
    description: '通过人物、公司、年份和概念找到可以核验的资料。',
  },
]

const contentMap = [
  ['01', '巴菲特合伙人信', '1956—1970'],
  ['02', '伯克希尔股东信', '1965—至今'],
  ['03', '股东大会问答', '现场记录'],
  ['04', '芒格演讲与问答', '公开表达'],
  ['05', '公司研究', '商业模式'],
  ['06', '投资方法', '概念与判断'],
  ['07', '商业史文章', '长期视角'],
]

export default function HomePage() {
  const partnershipCount = getPartnershipCount()
  const shareholderLetters = getShareholderLetters()
  const qaCount = getDocuments('qa').length
  const companyStudies = getBusinessHistories()
  const modelCount = getModels().length
  const latestYear = shareholderLetters.at(-1)?.year
  const letterCount = partnershipCount + shareholderLetters.length
  const featuredCompany = companyStudies[0]
  return (
    <>
      <SubdomainRootRouter />
      <PageContainer maxWidth="7xl" className="study-home">
        <section className="study-hero">
          <div className="study-hero__copy">
            <p className="study-label">一个长期更新的投资研究网站</p>
            <h1>巴菲特、芒格与<br />长期投资研究</h1>
            <p className="study-hero__lede">
              这里整理巴菲特、芒格的信件、演讲和股东大会记录，也持续发布公司研究与投资方法文章。重要内容尽量保留出处、年份和上下文。
            </p>
            <div className="study-actions">
              <Link href="/partnership/1" className="archive-button archive-button--solid">
                从巴菲特合伙人信开始 <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/reading" className="archive-button">
                查看全部内容
              </Link>
            </div>
          </div>
          <aside className="study-archive-map" aria-label="网站主要内容">
            <header><strong>网站内容</strong></header>
            <ol>
              {contentMap.map(([number, title, meta]) => (
                <li key={number}><span>{number}</span><strong>{title}</strong><small>{meta}</small></li>
              ))}
            </ol>
            <footer><span>复利书房</span><span>公开内容 / 付费合订本</span></footer>
          </aside>
        </section>

        <section className="study-proof" aria-labelledby="collection-proof-title">
          <div className="study-proof__numbers">
            <p id="collection-proof-title" className="study-label">内容与编辑说明</p>
            <div>
              <strong>1956—{latestYear || '至今'}</strong>
              <span>{letterCount} 封信件</span>
              <span>{qaCount} 篇问答</span>
              <span>{modelCount} 个思维模型</span>
              <span>{companyStudies.length} 份公司研究</span>
            </div>
          </div>
          <div className="study-proof__trust">
            {trustSignals.map(signal => (
              <span key={signal}><Check size={15} aria-hidden="true" />{signal}</span>
            ))}
          </div>
          <p className="study-proof__statement">
            你不需要先相信我的观点。这里提供出处和核验线索，让你自己作出判断。
          </p>
        </section>

        <section className="study-section study-desk">
          <header className="study-section__header">
            <div>
              <p className="study-label">每周推荐</p>
              <h2>本周推荐</h2>
            </div>
            <p>不是最新的三篇，而是本周值得花时间的三篇。</p>
          </header>
          <div className="study-desk__list">
            <article>
              <span>原始信件 · 约 8 分钟</span>
              <h3><Link href="/partnership/1">1956年巴菲特致合伙人信</Link></h3>
              <p>从第一封记录开始，看一种投资方法如何向合伙人解释风险与结果。</p>
              <Link href="/partnership/1">打开原文 <ArrowRight size={15} /></Link>
            </article>
            <article>
              <span>公司研究 · {featuredCompany?.readMinutes || 18} 分钟</span>
              <h3>
                <Link href={featuredCompany ? `/business-history/${featuredCompany.slug}` : '/business-history'}>
                  {featuredCompany?.title || '企业如何把优势变成长期结构'}
                </Link>
              </h3>
              <p>{featuredCompany?.summary || '把公司放回经营历史里，观察优势、约束和资本流向。'}</p>
              <Link href={featuredCompany ? `/business-history/${featuredCompany.slug}` : '/business-history'}>
                打开研究 <ArrowRight size={15} />
              </Link>
            </article>
            <article>
              <span>继续思考 · 投资方法</span>
              <h3><Link href="/concepts/资本配置">管理层怎样分配资本？</Link></h3>
              <p>利润留下来以后怎样使用，往往比某一年的利润本身更重要。</p>
              <Link href="/concepts/资本配置">沿问题阅读 <ArrowRight size={15} /></Link>
            </article>
          </div>
        </section>

        <section className="study-section study-thinkers">
          <header className="study-section__header">
            <div>
              <p className="study-label">人物专题</p>
              <h2>巴菲特与芒格</h2>
            </div>
          </header>
          <div className="study-thinkers__grid">
            <article>
              <p>沃伦·巴菲特</p>
              <h3>从价格出发，<br />最后走向企业。</h3>
              <span>阅读合伙人信、伯克希尔股东信与六十余年的资本配置记录。</span>
              <Link href={getSpaceHref('buffett')}>进入巴菲特 <ArrowRight size={16} /></Link>
            </article>
            <article>
              <p>查理·芒格</p>
              <h3>从投资出发，<br />最后走向判断。</h3>
              <span>阅读 Wesco 问答、公开演讲与多元思维模型。</span>
              <Link href={getSpaceHref('munger')}>进入芒格 <ArrowRight size={16} /></Link>
            </article>
          </div>
        </section>

        <section className="study-section study-entrances">
          <header className="study-section__header">
            <div>
              <p className="study-label">主要内容</p>
              <h2>主要内容</h2>
            </div>
            <Link href="/search" className="study-search-link"><Search size={17} /> 搜索人物、公司、年份或概念</Link>
          </header>
          <div className="study-entrances__grid">
            {contentEntrances.map(item => (
              <Link key={item.number} href={item.href}>
                <span>{item.number}</span>
                <small>{item.eyebrow}</small>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="study-section study-editions">
          <div className="study-editions__intro">
            <p className="study-label">电子合订本</p>
            <h2>把分散多年的文字，<br />放进一条完整脉络</h2>
            <p>网站适合搜索和查阅，合订本适合从头到尾连续阅读。两本分别出售，可以只选择现在真正想系统阅读的一位。</p>
            <Link href="/bound-edition" className="archive-button archive-button--solid">
              查看两本合订本 <ArrowRight size={17} />
            </Link>
          </div>
          <div className="study-editions__books">
            <article>
              <span>01 · BUFFETT</span>
              <h3>《所有者的眼光》</h3>
              <strong>99<small>元</small></strong>
              <p>巴菲特论企业、资本与长期复利。五篇 15 章，把股东信与长期实践编成一条完整脉络。</p>
            </article>
            <article>
              <span>02 · MUNGER</span>
              <h3>《理性的格栅》</h3>
              <strong>99<small>元</small></strong>
              <p>芒格论思维模型、商业判断与人生智慧。16 章正文，附 232 个思维模型对照与心理倾向速查。</p>
            </article>
          </div>
        </section>
      </PageContainer>
    </>
  )
}
