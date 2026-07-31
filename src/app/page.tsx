import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Search } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getDocuments } from '@/lib/documents'
import { getPartnershipCount, getShareholderLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import { getModels } from '@/lib/models'
import { getSpaceHref } from '@/lib/site-spaces'

const trustSignals = [
  '原文、翻译、编辑整理分别标注',
  '保留年份、出处与上下文',
  '发现错误，持续修订',
]

const archiveEntrances = [
  {
    number: '01',
    href: '/reading',
    title: '原典档案',
    description: '在完整上下文中，理解巴菲特和芒格真正表达了什么。',
  },
  {
    number: '02',
    href: '/business-history',
    title: '企业研究',
    description: '看清一家公司如何赚钱、扩张、犯错，以及资本最终流向哪里。',
  },
  {
    number: '03',
    href: '/concepts',
    title: '主题索引',
    description: '围绕安全边际、企业质量和资本配置，把分散材料连接起来。',
  },
  {
    number: '04',
    href: '/search',
    title: '档案检索',
    description: '通过人物、公司、年份和概念，找到可以核验和继续阅读的资料。',
  },
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
            <p className="study-label">一个长期主义投资档案馆</p>
            <h1>阅读原典，<br />形成自己的判断</h1>
            <p className="study-hero__lede">
              小胖书房系统整理巴菲特、芒格的信件、谈话与企业研究，尽可能保留年份、出处与上下文。这里不提供荐股，只帮助你更接近事实。
            </p>
            <div className="study-actions">
              <Link href="/partnership/1" className="archive-button archive-button--solid">
                从一封信开始 <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/reading" className="archive-button">
                浏览全部馆藏
              </Link>
            </div>
          </div>
          <figure className="study-hero__visual">
            <Image
              src="/buffett-collection-cover.png"
              alt="《巴菲特文集》1956—2025 合订本封面"
              width={595}
              height={842}
              priority
              sizes="(max-width: 760px) 58vw, 24vw"
              className="study-hero__book study-hero__book--front"
            />
            <Image
              src="/munger-collection-cover.png"
              alt="《芒格文集》1924—2023 合订本封面"
              width={595}
              height={842}
              sizes="(max-width: 760px) 52vw, 21vw"
              className="study-hero__book study-hero__book--back"
            />
            <figcaption>
              <span>XP · ARCHIVE 001</span>
              <span>两份真实合订本</span>
            </figcaption>
          </figure>
        </section>

        <section className="study-proof" aria-labelledby="collection-proof-title">
          <div className="study-proof__numbers">
            <p id="collection-proof-title" className="study-label">馆藏与编辑标准</p>
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
              <p className="study-label">CURATED THIS WEEK</p>
              <h2>本周案头</h2>
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
              <span>企业研究 · {featuredCompany?.readMinutes || 18} 分钟</span>
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
              <span>继续思考 · 主题索引</span>
              <h3><Link href="/concepts/资本配置">管理层怎样分配资本？</Link></h3>
              <p>利润留下来以后怎样使用，往往比某一年的利润本身更重要。</p>
              <Link href="/concepts/资本配置">沿问题阅读 <ArrowRight size={15} /></Link>
            </article>
          </div>
        </section>

        <section className="study-section study-thinkers">
          <header className="study-section__header">
            <div>
              <p className="study-label">TWO ARCHIVES</p>
              <h2>两个人，一套不断校正的方法</h2>
            </div>
          </header>
          <div className="study-thinkers__grid">
            <article>
              <p>沃伦·巴菲特档案</p>
              <h3>从价格出发，<br />最后走向企业。</h3>
              <span>阅读合伙人信、伯克希尔股东信与六十余年的资本配置记录。</span>
              <Link href={getSpaceHref('buffett')}>进入巴菲特档案 <ArrowRight size={16} /></Link>
            </article>
            <article>
              <p>查理·芒格档案</p>
              <h3>从投资出发，<br />最后走向判断。</h3>
              <span>阅读 Wesco 问答、公开演讲与多元思维模型。</span>
              <Link href={getSpaceHref('munger')}>进入芒格档案 <ArrowRight size={16} /></Link>
            </article>
          </div>
        </section>

        <section className="study-section study-entrances">
          <header className="study-section__header">
            <div>
              <p className="study-label">COLLECTIONS</p>
              <h2>四个核心馆藏入口</h2>
            </div>
            <Link href="/search" className="study-search-link"><Search size={17} /> 搜索人物、公司、年份或概念</Link>
          </header>
          <div className="study-entrances__grid">
            {archiveEntrances.map(item => (
              <Link key={item.number} href={item.href}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="study-section study-editions">
          <div className="study-editions__intro">
            <p className="study-label">装订版阅读</p>
            <h2>把分散多年的文字，<br />放进一条完整脉络</h2>
            <p>网站适合搜索和查阅，合订本适合从头到尾连续阅读。两本分别出售，可以只选择现在真正想系统阅读的一位。</p>
            <Link href="/bound-edition" className="archive-button archive-button--solid">
              查看两本合订本 <ArrowRight size={17} />
            </Link>
          </div>
          <div className="study-editions__books">
            <article>
              <span>01 · BUFFETT</span>
              <h3>《巴菲特文集合订本》</h3>
              <strong>99<small>元</small></strong>
              <p>沿着信件与公开文字，系统理解巴菲特的投资方法、企业判断与资本配置思想。</p>
            </article>
            <article>
              <span>02 · MUNGER</span>
              <h3>《芒格文集合订本》</h3>
              <strong>99<small>元</small></strong>
              <p>通过演讲、问答与重要文章，系统理解芒格的商业判断与多元思维方法。</p>
            </article>
          </div>
        </section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
