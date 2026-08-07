import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import ProductCover from '@/components/ProductCover'
import EditionTocTabs, { type EditionTocBook } from '@/components/EditionTocTabs'
import JsonLd from '@/components/JsonLd'
import { products } from '@/lib/commerce'

/* 巴菲特文集：七卷 */
const buffettOutline: [string, string[]][] = [
  ['第一卷　理解巴菲特：人生、选择与伯克希尔', ['沃伦·巴菲特人物生平', '本杰明·格雷厄姆与菲利普·费雪', '查理·芒格：事业合伙人', '伯克希尔·哈撒韦的演变']],
  ['第二卷　起点与方法：早期文章及合伙人信', ['早期文章与投资备忘录', '巴菲特合伙人信（1957—1970）']],
  ['第三卷　资本配置主线：伯克希尔股东信', ['股东信全文（1965—2025）', '按主题分类的股东信节选']],
  ['第四卷　原则的现场检验：伯克希尔股东大会', ['股东大会问答文字记录（1994—2025）']],
  ['第五卷　专题写作：商业、市场与管理备忘录', ['商业与管理', '市场与价格', '公司治理与信托责任']],
  ['第六卷　公开演讲：投资、职业与人生', ['大学演讲与课堂', '年会与专业论坛', '公开访谈与对话']],
  ['第七卷　访谈与课堂：在具体问题中思考', ['财经媒体深度访谈', '商学院与学生问答', '纪录片与专题采访']],
]

/* 芒格文集：十三卷 */
const mungerOutline = [
  '第一卷　理解芒格：人生、事业与精神坐标',
  '第二卷　核心经典：《穷查理宝典》',
  '第三卷　实践现场：Wesco 股东大会',
  '第四卷　晚年智慧：每日期刊年会',
  '第五卷　对话与访谈：在具体问题中思考',
  '第六卷　方法论：学习、思考与避免愚蠢',
  '第七卷　数量思维：数学、概率与不确定性',
  '第八卷　人类误判：心理倾向与叠加效应',
  '第九卷　商业世界：经济学、竞争优势与管理',
  '第十卷　投资判断：会计、金融与资本配置',
  '第十一卷　系统世界：科学、工程与复杂性',
  '第十二卷　长期品格：历史、法律、哲学与自我修炼',
  '第十三卷　主题索引：语录与复习入口',
]

/* 两卷目录：标签页切换展示 */
const tocBooks: EditionTocBook[] = [
  {
    id: 'buffett',
    index: '01',
    title: '《巴菲特文集》',
    sub: '七卷：人物 · 合伙信 · 股东信 · 年会 · 写作 · 演讲 · 访谈',
    parts: buffettOutline,
    appendix: '附录：人物索引 · 企业索引 · 编年大事记 · 主题交叉索引',
  },
  {
    id: 'munger',
    index: '02',
    title: '《芒格文集》',
    sub: '十三卷：人物 · 经典 · 实践 · 模型 · 品格 · 复习',
    chapters: mungerOutline,
    appendix: '附录：232个模型身份溯源 · 关键人物索引 · 芒格年表 · 主题交叉索引',
  },
]

const heroStats = [
  ['20', '卷'],
  ['约 110', '万字'],
  ['1580', '页'],
  ['232', '个模型溯源'],
  ['2', '部电子书'],
]

const buffettPoints = [
  '七卷系统编排：从人物生平到底层记录，按主题而非时间线组织',
  '原始资料汇编：合伙人信、股东信、股东大会、演讲、访谈全文收录',
  '标注来源与年份：每篇文章标明原作者、出处与时间，可交叉检索',
  '精读编排：去除重复与冗余，保留原文语境，适合从头读到尾',
]

const mungerPoints = [
  '十三卷完整体系：人物、经典、实践、模型、品格五大板块',
  '多元思维模型全收录：232个模型逐一身份溯源与来源标注',
  '实践现场：Wesco与每日期刊股东大会全文，补充《穷查理宝典》之后的新材料',
  '主题索引：按概念、人物、企业、模型多维度交叉检索',
]

/* 实际页面预览：从电子书抽取的代表页 */
const buffettPreviews = [
  { img: '/ebook-previews/buffett-p01.png', title: '封面', desc: '米白纸底配品牌玫红，七卷结构一目了然，书名列于封面正下方。' },
  { img: '/ebook-previews/buffett-p03.png', title: '目录', desc: '七卷两级目录，标注各卷所含文章篇目与来源年份。' },
  { img: '/ebook-previews/buffett-p13.png', title: '股东信正文', desc: '全文收录伯克希尔股东信，原文语境保留，来源逐条标注。' },
]
const mungerPreviews = [
  { img: '/ebook-previews/munger-p01.png', title: '封面', desc: '与巴菲特文集同系列版式，十三卷结构列于封面下方。' },
  { img: '/ebook-previews/munger-p03.png', title: '目录', desc: '十三卷目录，含232个模型身份溯源表与主题索引入口。' },
  { img: '/ebook-previews/munger-p04.png', title: '穷查理宝典', desc: '直接收录《穷查理宝典》核心章节，保留原始版本语境。' },
]

const craftItems = [
  ['01', '全文收录原始记录', '合伙人信、股东信、股东大会问答、演讲、访谈等全文收录，不删减原文内容。'],
  ['02', '逐篇标注来源与年份', '每篇文章标注原作者、出处、年份与背景，区分原文与编者注释。'],
  ['03', '按主题而非时间线编排', '巴菲特按七卷主题编排，芒格按十三卷体系编排，适合系统阅读而非零散检索。'],
  ['04', '附交叉索引与检索入口', '人物索引、企业索引、编年大事记、模型身份溯源表，可按多个维度定位内容。'],
  ['05', '持续更新', '新发现的公开资料持续收录，已购读者可免费获取更新版本。'],
]

const faqs = [
  ['怎么买？付款后怎么收到 EPUB？', '点击页面中的"微信购买"，扫码添加微信 igrape，并发送"巴菲特文集"或"芒格文集"。确认书名和付款后，EPUB 电子书会直接通过微信文件发送。'],
  ['网站已经可以免费阅读，为什么还要买巴芒文集？', '网站适合搜索和随时查阅，巴芒文集是把分散的原始资料按主题组织成两本可以从头读到尾的电子书。如果你只想偶尔查一两篇，免费使用网站就够了。'],
  ['这套电子书和网站上的原始材料是什么关系？', '原始材料确实公开存在，但分散在不同年份、网页和版本中。这套电子书的价值是把它们整理、校订、按主题编排成连续阅读的 EPUB 格式——不是把公开资料包装成独家内容。'],
  ['99元买一本电子书，值不值？', '如果你准备系统阅读巴菲特或芒格的原始记录，99元购买的是资料整理、主题编排与连续阅读所节省的大量时间。如果你只有一般兴趣，建议先读网站上的免费内容再决定。'],
  ['两本都要买吗？', '两本分别出售、分别交付。《巴菲特文集》七卷覆盖巴菲特六十年的全部公开记录；《芒格文集》十三卷覆盖芒格的完整思想体系。可以先买你现在真正想系统读的一本。'],
  ['翻译和整理可靠吗？', '全部文章标注原始出处与年份；关键术语统一翻译；232个芒格思维模型逐一身份溯源。不能保证永远没有错误，但发现问题后会持续修订并免费更新。'],
  ['读完能帮助我获得更高的投资收益吗？', '不能保证。这套电子书帮助你系统阅读巴菲特和芒格的原话与思考过程，但不会提供荐股、收益承诺或替你作出投资决定。'],
]

export const metadata = {
  title: '巴芒文集',
  description: '《巴菲特文集》与《芒格文集》：两本EPUB电子书，系统收录巴菲特与芒格六十余年的公开原始记录，按主题编排，每本 99 元。',
  alternates: { canonical: '/bound-edition' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function BoundEditionPage() {
  const buffett = products['buffett-collection']
  const munger = products['munger-collection']

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageContainer maxWidth="6xl" className="edition-page">
        <section className="edition-hero">
          <p className="study-label">巴芒文集</p>
          <h1>巴菲特文集 · 芒格文集<br />两本电子书，完整收录原始记录</h1>
          <p>
            基于两人六十余年的公开档案精读编排：巴菲特文集七卷，完整收录合伙人信、股东信、股东大会、演讲与访谈；芒格文集十三卷，覆盖《穷查理宝典》、Wesco与每日期刊实践、思维模型全体系。
            每篇标注来源与年份，附交叉索引，是一套可以系统通读的电子书。
          </p>
          <div className="edition-hero__stats" aria-label="巴芒文集内容规模">
            {heroStats.map(([num, label]) => (
              <span key={label}><strong>{num}</strong> {label}</span>
            ))}
          </div>
          <Link href="#books" className="archive-button archive-button--solid">查看两卷书 <ArrowRight size={17} /></Link>
          <Link href="#sample" className="archive-button">先读原文再决定</Link>
        </section>

        {/* 两本书 */}
        <section id="books" className="edition-products" aria-label="巴芒文集">
          <article>
            <div><span>01</span><small>BUFFETT EDITION</small></div>
            <ProductCover variant={buffett.coverVariant} title={buffett.title} yearRange={buffett.yearRange} />
            <h2>{buffett.title.replace(/[《》]/g, '')}</h2>
            <p className="edition-product-sub">{buffett.subtitle}</p>
            <div className="edition-product-stats">
              <span>7 卷</span>
              <span>约 55 万字</span>
              <span>760 页</span>
              <span>4 份附录</span>
              <span>4 份索引</span>
            </div>
            <ul className="edition-product-points">
              {buffettPoints.map(point => <li key={point}>{point}</li>)}
            </ul>
            <p className="edition-product-desc">{buffett.description}</p>
            <strong>{buffett.price}<small>元</small></strong>
            <Link href="#purchase-contact" className="archive-button archive-button--solid">
              微信购买巴菲特文集 · {buffett.price}元
            </Link>
          </article>

          <article>
            <div><span>02</span><small>MUNGER EDITION</small></div>
            <ProductCover variant={munger.coverVariant} title={munger.title} yearRange={munger.yearRange} />
            <h2>{munger.title.replace(/[《》]/g, '')}</h2>
            <p className="edition-product-sub">{munger.subtitle}</p>
            <div className="edition-product-stats">
              <span>13 卷</span>
              <span>约 55 万字</span>
              <span>820 页</span>
              <span>4 份附录</span>
              <span>4 份索引</span>
            </div>
            <ul className="edition-product-points">
              {mungerPoints.map(point => <li key={point}>{point}</li>)}
            </ul>
            <p className="edition-product-desc">{munger.description}</p>
            <strong>{munger.price}<small>元</small></strong>
            <Link href="#purchase-contact" className="archive-button archive-button--solid">
              微信购买芒格文集 · {munger.price}元
            </Link>
          </article>

          <p id="purchase-status" className="edition-purchase-status">
            当前采用微信人工交付：添加微信、确认付款后，通过微信直接发送对应文集的完整 EPUB 电子书。两本分别出售，可按自己的阅读需要选择。
          </p>
        </section>

        {/* 内容结构：目录 */}
        <section className="edition-section edition-toc" aria-label="两卷书目录">
          <div className="edition-section__heading">
            <p className="study-label">CONTENTS · 目录预览</p>
            <h2>翻开之前，先看清每一章讲什么</h2>
            <p>两卷的章节都按「一条主线」推进，而不是零散文章的堆叠。</p>
          </div>

          <div className="edition-toc__books">
            <EditionTocTabs books={tocBooks} />
          </div>
        </section>

        {/* 实际页面预览 */}
        <section className="edition-section edition-preview" aria-label="终稿 PDF 实际页面预览">
          <div className="edition-section__heading">
            <p className="study-label">PREVIEW · 实际页面预览</p>
            <h2>电子书里，<br />实际长什么样</h2>
            <p>下面是从两本 EPUB 电子书中抽取的代表页面。先看实际排版与阅读效果，再决定要不要买。</p>
          </div>
          <div className="edition-preview__books">
            <div className="edition-preview__book">
              <h3>《巴菲特文集》<span>巴菲特文集 · EPUB 电子书</span></h3>
              <div className="edition-preview__grid">
                {buffettPreviews.map(item => (
                  <figure key={item.img} className="edition-preview__item">
                    <Image src={item.img} alt={`《巴菲特文集》${item.title}页`} width={1100} height={1556} priority={item.title === '封面'} />
                    <figcaption><strong>{item.title}</strong><small>{item.desc}</small></figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className="edition-preview__book">
              <h3>《芒格文集》<span>芒格文集 · EPUB 电子书</span></h3>
              <div className="edition-preview__grid">
                {mungerPreviews.map(item => (
                  <figure key={item.img} className="edition-preview__item">
                    <Image src={item.img} alt={`《芒格文集》${item.title}页`} width={1100} height={1556} priority={item.title === '封面'} />
                    <figcaption><strong>{item.title}</strong><small>{item.desc}</small></figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 这一版是怎么做的 */}
        <section id="craft" className="edition-section edition-craft">
          <div className="edition-section__heading">
            <p className="study-label">HOW IT&apos;S MADE · 编排标准</p>
            <h2>不是把公开资料打包，<br />是编排成一套可以通读的文本</h2>
            <p>全文收录原始记录、逐篇标注来源、按主题编排而非时间线堆叠——每一项都写进这两本电子书的制作记录。</p>
          </div>
          <div className="edition-craft__list">
            {craftItems.map(([num, title, desc]) => (
              <div key={num}><span>{num}</span><div><strong>{title}</strong><small>{desc}</small></div></div>
            ))}
          </div>
        </section>

        {/* 免费试读 */}
        <section id="sample" className="edition-section edition-samples">
          <div className="edition-section__heading">
            <p className="study-label">SAMPLE · 免费试读</p>
            <h2>先读原文，再决定是否购买</h2>
            <p>两本电子书基于网站公开材料编排。先读几篇原始记录，感受系统阅读与零散查询的差别。</p>
          </div>
          <div>
            <Link href="/partnership/1"><span>01</span><div><strong>巴菲特合伙人信</strong><small>从第一封原始记录开始</small></div><ArrowRight size={16} /></Link>
            <Link href="/letters/1965"><span>02</span><div><strong>伯克希尔股东信</strong><small>阅读1965年股东信</small></div><ArrowRight size={16} /></Link>
            <Link href="/poor-charlies-almanack"><span>03</span><div><strong>《穷查理宝典》</strong><small>进入完整免费目录</small></div><ArrowRight size={16} /></Link>
            <Link href="/munger/wesco"><span>04</span><div><strong>Wesco 股东大会问答</strong><small>查看芒格现场记录</small></div><ArrowRight size={16} /></Link>
          </div>
        </section>

        {/* 读者反馈 */}
        <section className="edition-section edition-feedback">
          <div className="edition-section__heading">
            <p className="study-label">READER FEEDBACK · 读者反馈</p>
            <h2>第一批读者读完，<br />这里会出现真实反馈</h2>
            <p>这两本电子书正在持续更新。评价只放真实的，不筛选、不代写。</p>
          </div>
          <div className="edition-feedback__body">
            <div className="edition-feedback__empty" role="note">
              <p>还没有读者评价。</p>
              <small>你读完这卷书之后，可以回到这里留下你的真实感受——无论满意还是失望，都会原样展示。</small>
            </div>
            <div className="edition-feedback__alternatives">
              <Link href="#sample"><ShieldCheck size={16} /><div><strong>先读原文</strong><small>用免费材料检验这套书的来源</small></div><ArrowRight size={15} /></Link>
              <Link href="#craft"><ShieldCheck size={16} /><div><strong>看编辑记录</strong><small>字数、核查、修订，全部可查</small></div><ArrowRight size={15} /></Link>
              <Link href="/digital-product-policy"><ShieldCheck size={16} /><div><strong>交付与售后</strong><small>PDF 交付、更新范围与退款说明</small></div><ArrowRight size={15} /></Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
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

        {/* 购买流程 + 收束 */}
        <section id="purchase-contact" className="edition-final">
          <p className="study-label">微信购买 · 人工交付</p>
          <h2>扫码添加微信，<br />确认付款后直接发送 EPUB 电子书</h2>
          <p>请发送"巴菲特文集"或"芒格文集"。确认书名、价格与付款后，完整 EPUB 将通过微信文件发送。</p>
          <div className="edition-wechat-purchase">
            <a href="/wechat-purchase-qr.jpg" target="_blank" rel="noopener noreferrer" aria-label="打开购买微信二维码原图">
              <Image src="/wechat-purchase-qr.jpg" alt="复利书房购买微信二维码" width={109} height={110} />
            </a>
            <div>
              <strong>购买微信：igrape</strong>
              <p>微信扫码或长按识别二维码添加好友</p>
              <small>添加时请备注"复利书房"，并发送想购买的电子书：巴菲特文集 / 芒格文集。</small>
              <a href="/wechat-purchase-qr.jpg" target="_blank" rel="noopener noreferrer">打开二维码原图</a>
            </div>
          </div>
          <div className="edition-steps">
            <div><span>01</span><strong>选择一本</strong><small>巴菲特文集或芒格文集，每本 99 元，分别交付</small></div>
            <div><span>02</span><strong>添加购买微信</strong><small>扫码添加 igrape，备注"复利书房"，发送想购买的书名</small></div>
            <div><span>03</span><strong>付款并接收 EPUB</strong><small>确认付款后，通过微信文件直接发送完整 EPUB 电子书</small></div>
          </div>
          <small>
            每本 99 元，分别出售；交付内容为对应文集的完整 EPUB 电子书。通常在确认付款后 24 小时内通过微信完成交付。本书为公开资料的搜集、整理与编排，非商业出版物，亦非官方授权的巴菲特/芒格著作；不提供荐股或收益承诺，请按自己的阅读需要选择。
          </small>
        </section>
      </PageContainer>
    </>
  )
}
