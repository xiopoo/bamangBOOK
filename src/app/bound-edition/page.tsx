import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'

const products = [
  {
    number: '01',
    eyebrow: 'BUFFETT COLLECTION',
    title: '《巴菲特文集合订本》',
    description: '沿着信件与公开文字，连续理解巴菲特的投资方法、企业判断与资本配置思想如何形成和变化。',
    button: '购买巴菲特文集合订本 · 99元',
    cover: '/buffett-collection-cover.png',
    alt: '《巴菲特文集》1956—2025 PDF 合订本封面',
    pages: 'A4 · 4585 页 · PDF',
  },
  {
    number: '02',
    eyebrow: 'MUNGER COLLECTION',
    title: '《芒格文集合订本》',
    description: '通过演讲、问答与重要文章，系统理解芒格如何连接商业、心理学和多元思维模型。',
    button: '购买芒格文集合订本 · 99元',
    cover: '/munger-collection-cover.png',
    alt: '《芒格文集》1924—2023 PDF 合订本封面',
    pages: 'A4 · 1905 页 · PDF',
  },
]

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
          {products.map(product => (
            <article key={product.number}>
              <div>
                <span>{product.number}</span>
                <small>{product.eyebrow}</small>
              </div>
              <Image src={product.cover} alt={product.alt} width={238} height={337} />
              <h2>{product.title}</h2>
              <strong>99<small>元</small></strong>
              <small className="edition-product-spec">{product.pages}</small>
              <p>{product.description}</p>
              <Link href="#purchase-contact" className="archive-button archive-button--solid">
                {product.button}
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
          <div>
            <Image src="/qrcode.jpeg" alt="微信公众号“金家岭小胖”购买联系二维码" width={132} height={132} />
            <div className="edition-final__actions">
              {products.map(product => <a key={product.number} href="#purchase-contact" className="archive-button archive-button--solid">{product.button}</a>)}
            </div>
          </div>
          <small>扫码联系“金家岭小胖”购买，交付对应的完整 PDF 文件。每本99元，分别出售；不提供荐股或收益承诺，请按自己的阅读需要选择。</small>
        </section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
