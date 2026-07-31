import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import ProductCover from '@/components/ProductCover'
import { productList } from '@/lib/commerce'

const faqs = [
  ['网站已经可以免费阅读，为什么还要买合订本？', '网站适合搜索和随时查阅，合订本适合按完整脉络连续阅读。如果你只想偶尔查一两篇，免费使用网站就够了。'],
  ['这些文章在网上不是也能找到吗？', '不少原始材料确实公开存在，但往往分散在不同年份、网页和版本中。合订本的价值是把相关文献整理成一套可以从头读到尾的文本，而不是把公开资料包装成独家内容。'],
  ['99元买一本，值不值？', '如果你准备系统阅读巴菲特或芒格，99元购买的是资料整理、文本校订和连续阅读所节省的时间。如果你对他们只有一般兴趣，建议先阅读网站上的免费内容再决定。'],
  ['翻译和整理可靠吗？', '合订本会区分原文、翻译与编辑整理，并尽可能保留年份、来源和上下文。不能保证永远没有错误，但发现问题后会持续修订并提供更正。'],
  ['读完能帮助我获得更高的投资收益吗？', '不能保证。合订本帮助你理解巴菲特和芒格如何思考企业、价格与判断，但不会提供荐股、收益承诺或替你作出投资决定。'],
]

export const metadata = {
  title: '合订本',
  description: '《巴菲特文集合订本》与《芒格文集合订本》，分别售价99元。',
  alternates: { canonical: '/bound-edition' },
}

export default function BoundEditionPage() {
  return (
    <>
      <PageContainer maxWidth="6xl" className="edition-page">
        <section className="edition-hero">
          <p className="study-label">装订版阅读 · 两本分别出售</p>
          <h1>把分散多年的文字，<br />放进一条完整脉络</h1>
          <p>网站适合搜索和查阅，合订本适合从头到尾连续阅读。两本分别出售，可以只选择现在真正想系统阅读的一位。</p>
          <Link href="#editions" className="archive-button archive-button--solid">查看两本合订本 <ArrowRight size={17} /></Link>
        </section>

        <section id="editions" className="edition-products" aria-label="两本合订本">
          {productList.map((product, index) => (
            <article key={product.slug}>
              <div>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <small>{product.coverVariant === 'buffett' ? 'BUFFETT EDITION' : 'MUNGER EDITION'}</small>
              </div>
              <ProductCover variant={product.coverVariant} title={product.title} yearRange={product.yearRange} />
              <h2>{product.title}</h2>
              <strong>{product.price}<small>元</small></strong>
              <small className="edition-product-spec">A4 · {product.pages} 页 · {product.deliveryType}</small>
              <p>{product.description}</p>
              <Link href={`/checkout/${product.slug}`} className="archive-button archive-button--solid">
                购买{product.shortTitle}合订本 · {product.price}元
              </Link>
            </article>
          ))}
          <p id="purchase-status" className="edition-purchase-status">
            交付内容为对应的完整 PDF 文集。两本分别出售，可按自己的阅读需要选择。
          </p>
        </section>

        <section className="edition-section">
          <div className="edition-section__heading">
            <p className="study-label">两种阅读方式</p>
            <h2>查阅与连续阅读，各有位置</h2>
          </div>
          <div className="edition-compare">
            <article>
              <span>免费网站</span>
              <ul>
                <li><Check size={16} />适合搜索</li>
                <li><Check size={16} />适合查阅单篇资料</li>
                <li><Check size={16} />适合按人物、年份和概念跳转</li>
              </ul>
            </article>
            <article>
              <span>合订本</span>
              <ul>
                <li><Check size={16} />适合连续阅读</li>
                <li><Check size={16} />适合建立完整脉络</li>
                <li><Check size={16} />减少零散搜索和整理成本</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="edition-section edition-standards">
          <div className="edition-section__heading">
            <p className="study-label">编辑整理标准</p>
            <h2>不是秘密信息，是一套读得下去的文本</h2>
          </div>
          <div>
            <p><span>01</span>区分原文、翻译与编辑整理，不把归纳表述当作原话。</p>
            <p><span>02</span>尽可能保留年份、原始来源与完整上下文。</p>
            <p><span>03</span>校订标题、段落与版本差异，减少连续阅读中的干扰。</p>
            <p><span>04</span>发现错误持续修订，不隐藏尚未核验的不确定性。</p>
          </div>
        </section>

        <section className="edition-section edition-samples">
          <div className="edition-section__heading">
            <p className="study-label">SAMPLE · 免费试读</p>
            <h2>先读原文，再决定是否购买</h2>
          </div>
          <div>
            <Link href="/partnership/1"><span>01</span><div><strong>巴菲特合伙人信</strong><small>从第一封原始记录开始</small></div><ArrowRight size={16} /></Link>
            <Link href="/letters/1965"><span>02</span><div><strong>伯克希尔股东信</strong><small>阅读1965年股东信</small></div><ArrowRight size={16} /></Link>
            <Link href="/poor-charlies-almanack"><span>03</span><div><strong>《穷查理宝典》</strong><small>进入完整免费目录</small></div><ArrowRight size={16} /></Link>
            <Link href="/munger/wesco"><span>04</span><div><strong>Wesco 股东大会问答</strong><small>查看芒格现场记录</small></div><ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="edition-section edition-faq">
          <div className="edition-section__heading">
            <p className="study-label">购买疑虑</p>
            <h2>决定之前，可以先把问题问清楚</h2>
          </div>
          <div>
            {faqs.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary><span>{String(index + 1).padStart(2, '0')}</span>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="purchase-contact" className="edition-final">
          <p className="study-label">从第一篇开始</p>
          <h2>长期判断，始于今天读下第一篇原文</h2>
          <p>不必继续收藏零散文章。选择巴菲特或芒格，从第一篇开始系统阅读。</p>
          <div className="edition-final__actions">
            <Link href="/checkout/buffett-collection" className="archive-button archive-button--solid">购买巴菲特文集合订本 · 99元</Link>
            <Link href="/checkout/munger-collection" className="archive-button archive-button--solid">购买芒格文集合订本 · 99元</Link>
          </div>
          <small>每本99元，分别出售，分别发放产品权益；不提供荐股或收益承诺，请按自己的阅读需要选择。</small>
        </section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
