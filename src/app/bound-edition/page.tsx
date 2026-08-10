import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import ProductCover from '@/components/ProductCover'
import EditionTocTabs, { type EditionTocBook } from '@/components/EditionTocTabs'
import JsonLd from '@/components/JsonLd'
import { products } from '@/lib/commerce'

/* 巴菲特文集：五篇 · 十五章 */
const buffettOutline: [string, string[]][] = [
  ['第一篇　所有者的起点', ['第一章　股票背后是一家企业', '第二章　价值不在报价屏上', '第三章　穿过会计看所有者收益', '第四章　安全边际与能力圈']],
  ['第二篇　好企业如何创造价值', ['第五章　伯克希尔纺织：便宜为何仍会昂贵', '第六章　喜诗糖果：企业质量改变资本配置', '第七章　护城河必须经得住时间']],
  ['第三篇　人与制度', ['第八章　选择经理人：能力、精力与正直', '第九章　信任、声誉与去中心化']],
  ['第四篇　资本配置', ['第十章　经理人的第二项工作', '第十一章　回购、收购与价格纪律', '第十二章　浮存金：资本优势不是免费午餐']],
  ['第五篇　风险、时间与复利', ['第十三章　风险不是一条波动曲线', '第十四章　现金与恐慌中的选择权', '第十五章　把个人判断变成可传承的复利制度']],
]

/* 芒格文集：五篇 · 十六章 */
const mungerOutline: [string, string[]][] = [
  ['第一篇　从一元思维到多元格栅', ['第一章　一把锤子为什么不够', '第二章　多元思维模型怎样连成知识格栅', '第三章　终身学习：让模型保持活性']],
  ['第二篇　概率、逆向与反证', ['第四章　概率：把故事变成可以检验的判断', '第五章　逆向：先问怎样会失败', '第六章　反证、检查清单与第二次思考']],
  ['第三篇　误判心理学', ['第七章　误判不是偶然：心理倾向的系统', '第八章　激励：制度比劝诫更诚实', '第九章　群体、权威与被剥夺感', '第十章　当偏误彼此增强']],
  ['第四篇　商业判断与资本配置', ['第十一章　穿过会计看商业现实', '第十二章　好企业让少行动成为优势', '第十三章　少数机会、集中下注与资本配置']],
  ['第五篇　合作、品格与人生', ['第十四章　应得信任：合作如何降低摩擦', '第十五章　避免惯常的失败方式', '第十六章　理性近乎一种道德义务']],
]

/* 两卷目录：标签页切换展示 */
const tocBooks: EditionTocBook[] = [
  {
    id: 'buffett',
    index: '01',
    title: '《巴菲特文集》',
    sub: '五篇 · 十五章：所有者起点 → 好企业 → 人与制度 → 资本配置 → 风险与复利',
    parts: buffettOutline,
    appendix: '附录A　斯科特费泽O/N会计桥完整档案 · 附录B　读者与复核检查清单 · 典藏层　年表／人物索引／企业索引／概念·问题·案例总索引',
  },
  {
    id: 'munger',
    index: '02',
    title: '《芒格文集》',
    sub: '五篇 · 十六章：知识格栅 → 概率与逆向 → 误判心理 → 商业资本 → 品格人生',
    parts: mungerOutline,
    appendix: '附录一　232个思维模型身份溯源总表 · 附录二　双轨判断检查清单 · 附录三　25种心理倾向速查表 · 典藏层　芒格年表／人物企业索引／概念·问题·案例索引',
  },
]

const heroStats = [
  ['10', '篇'],
  ['31', '章'],
  ['约 110', '万字'],
  ['1580', '页'],
  ['232', '个模型溯源'],
  ['2', '部电子书'],
]

const buffettPoints = [
  '五篇十五章：从所有者起点到制度复利，按认知逻辑而非素材类型组织',
  '逐篇标注来源与年份：每篇文章标明原作者、出处与时间，可交叉检索',
  '附读者检查清单与典藏层索引：年表、人物索引、企业索引、概念与案例索引',
  '精读编排：去除重复与冗余，保留原文语境，适合从头读到尾',
]

const mungerPoints = [
  '五篇十六章：从知识格栅到品格人生，按认知推进而非素材类型组织',
  '多元思维模型全收录：232个模型逐一身份溯源与来源标注',
  '附双轨检查清单、25种心理倾向速查表与典藏层索引',
  '附录实用：三种检查工具（模型溯源表、双轨清单、心理倾向速查）可直接用于判断',
]

/* 实际页面预览：从电子书抽取的代表页 */
const buffettPreviews = [
  { img: '/ebook-previews/buffett-p01.png', title: '封面', desc: '米白纸底配品牌玫红，五篇结构一目了然，书名列于封面正下方。' },
  { img: '/ebook-previews/buffett-p03.png', title: '目录', desc: '五篇两级目录，标注各章所含文章篇目与来源年份。' },
  { img: '/ebook-previews/buffett-p13.png', title: '股东信正文', desc: '全文收录伯克希尔股东信，原文语境保留，来源逐条标注。' },
]
const mungerPreviews = [
  { img: '/ebook-previews/munger-p01.png', title: '封面', desc: '与巴菲特文集同系列版式，五篇结构列于封面下方。' },
  { img: '/ebook-previews/munger-p03.png', title: '目录', desc: '五篇目录，含232个模型身份溯源表与主题索引入口。' },
  { img: '/ebook-previews/munger-p04.png', title: '穷查理宝典', desc: '直接收录《穷查理宝典》核心章节，保留原始版本语境。' },
]

const craftItems = [
  ['01', '全文收录原始记录', '合伙人信、股东信、股东大会问答、演讲、访谈等全文收录，不删减原文内容。'],
  ['02', '逐篇标注来源与年份', '每篇文章标注原作者、出处、年份与背景，区分原文与编者注释。'],
  ['03', '按主题而非时间线编排', '巴菲特五篇十五章、芒格五篇十六章，均按认知逻辑推进，适合系统阅读而非零散检索。'],
  ['04', '附交叉索引与检索入口', '人物索引、企业索引、编年大事记、模型身份溯源表，可按多个维度定位内容。'],
  ['05', '持续更新', '新发现的公开资料持续收录，已购读者可免费获取更新版本。'],
]

const faqs = [
  ['怎么买？付款后怎么收到 EPUB？', '点击页面中的"微信购买"，扫码添加微信 igrape，并发送"巴菲特文集"或"芒格文集"。确认书名和付款后，EPUB 电子书会直接通过微信文件发送。'],
  ['网站已经可以免费阅读，为什么还要买巴芒文集？', '网站适合搜索和随时查阅，巴芒文集是把分散的原始资料按主题组织成两本可以从头读到尾的电子书。如果你只想偶尔查一两篇，免费使用网站就够了。'],
  ['这套电子书和网站上的原始材料是什么关系？', '原始材料确实公开存在，但分散在不同年份、网页和版本中。这套电子书的价值是把它们整理、校订、按主题编排成连续阅读的 EPUB 格式——不是把公开资料包装成独家内容。'],
  ['99元买一本电子书，值不值？', '如果你准备系统阅读巴菲特或芒格的原始记录，99元购买的是资料整理、主题编排与连续阅读所节省的大量时间。如果你只有一般兴趣，建议先读网站上的免费内容再决定。'],
  ['两本都要买吗？', '两本分别出售、分别交付。《巴菲特文集》五篇十五章覆盖巴菲特的全部核心思想；《芒格文集》五篇十六章覆盖芒格的完整思维体系。可以先买你现在真正想系统读的一本。'],
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
          <h1><span>巴菲特文集 · 芒格文集</span><span>两本电子书，完整收录原始记录</span></h1>
          <p>
            基于两人六十余年的公开档案精读编排：巴菲特文集五篇十五章，从所有者思维推进到制度复利；芒格文集五篇十六章，从知识格栅推进到品格人生。每篇标注来源与年份，附交叉索引，是一套可以系统通读的电子书。
          </p>
          <div className="edition-hero__stats" aria-label="巴芒文集内容规模">
            {heroStats.map(([num, label]) => (
              <span key={label}><strong>{num}</strong> {label}</span>
            ))}
          </div>
          <Link href="#books" className="archive-button archive-button--solid">查看两卷书 <ArrowRight size={17} /></Link>
          <Link href="#sample" className="archive-button">先读原文再决定</Link>
        </section>

        <section className="edition-section edition-compare" aria-labelledby="edition-audience-title">
          <div className="edition-section__heading">
            <p className="study-label">WHO IT IS FOR · 适合谁</p>
            <h2 id="edition-audience-title">适合准备系统读一遍的人，<br />不适合寻找投资捷径的人</h2>
          </div>
          <article><span>适合</span><h3>希望连续阅读原始资料</h3><p>已经不满足于金句和二手摘要，希望沿一条主线读完巴菲特或芒格的重要公开记录。</p></article>
          <article><span>适合</span><h3>重视来源、索引和修订</h3><p>愿意核对年份与出处，也需要人物、企业、概念和模型索引帮助反复查找。</p></article>
          <article><span>不适合</span><h3>期待荐股、收益承诺或秘密信息</h3><p>文集提供的是公开资料的整理、校订和连续阅读，不提供即时交易答案，也不替任何人作投资决定。</p></article>
        </section>

        {/* 两本书 */}
        <section id="books" className="edition-products" aria-label="巴芒文集">
          <article>
            <div><span>01</span><small>BUFFETT EDITION</small></div>
            <ProductCover variant={buffett.coverVariant} title={buffett.title} yearRange={buffett.yearRange} />
            <h2>{buffett.title.replace(/[《》]/g, '')}</h2>
            <p className="edition-product-sub">{buffett.subtitle}</p>
            <div className="edition-product-stats">
              <span>5 篇 · 15 章</span>
              <span>约 55 万字</span>
              <span>760 页</span>
              <span>2 份附录</span>
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
              <span>5 篇 · 16 章</span>
              <span>约 55 万字</span>
              <span>820 页</span>
              <span>3 份附录</span>
              <span>3 份索引</span>
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
        <section className="edition-section edition-preview" aria-label="EPUB 电子书实际页面预览">
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
              <Link href="/digital-product-policy"><ShieldCheck size={16} /><div><strong>交付与售后</strong><small>EPUB 交付、更新范围与退款说明</small></div><ArrowRight size={15} /></Link>
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
          <p>请发送&ldquo;巴菲特文集&rdquo;或&ldquo;芒格文集&rdquo;。确认书名、价格与付款后，完整 EPUB 将通过微信文件发送。</p>
          <div className="edition-wechat-purchase">
            <a href="/wechat-purchase-qr.jpg" target="_blank" rel="noopener noreferrer" aria-label="打开购买微信二维码原图">
              <Image src="/wechat-purchase-qr.jpg" alt="复利书房购买微信二维码" width={109} height={110} />
            </a>
            <div>
              <strong>购买微信：igrape</strong>
              <p>微信扫码或长按识别二维码添加好友</p>
              <small>添加时请备注&ldquo;复利书房&rdquo;，并发送想购买的电子书：巴菲特文集 / 芒格文集。</small>
              <a href="/wechat-purchase-qr.jpg" target="_blank" rel="noopener noreferrer">打开二维码原图</a>
            </div>
          </div>
          <div className="edition-steps">
            <div><span>01</span><strong>选择一本</strong><small>巴菲特文集或芒格文集，每本 99 元，分别交付</small></div>
            <div><span>02</span><strong>添加购买微信</strong><small>扫码添加 igrape，备注&ldquo;复利书房&rdquo;，发送想购买的书名</small></div>
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
