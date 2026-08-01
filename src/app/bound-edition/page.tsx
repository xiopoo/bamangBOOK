import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import ProductCover from '@/components/ProductCover'
import { products } from '@/lib/commerce'

/* 巴菲特卷：五篇十五章 */
const buffettOutline: [string, string[]][] = [
  ['第一篇　所有者的起点', ['第一章 股票背后是一家企业', '第二章 价值不在报价屏上', '第三章 穿过会计看所有者收益']],
  ['第二篇　好企业如何创造价值', ['第四章 安全边际与能力圈', '第五章 伯克希尔纺织：便宜为何仍会昂贵', '第六章 喜诗糖果：企业质量改变资本配置', '第七章 护城河必须经得住时间']],
  ['第三篇　人与制度', ['第八章 选择经理人：能力、精力与正直', '第九章 信任、声誉与去中心化']],
  ['第四篇　资本配置', ['第十章 经理人的第二项工作', '第十一章 回购、收购与价格纪律', '第十二章 浮存金：资本优势不是免费午餐']],
  ['第五篇　风险、时间与复利', ['第十三章 风险不是一条波动曲线', '第十四章 现金与恐慌中的选择权', '第十五章 把个人判断变成可传承的复利制度']],
]

/* 芒格卷：十六章 */
const mungerOutline = [
  '第一章 一把锤子为什么不够',
  '第二章 多元思维模型怎样连成知识格栅',
  '第三章 终身学习：让模型保持活性',
  '第四章 概率：把故事变成可以检验的判断',
  '第五章 逆向：先问怎样会失败',
  '第六章 反证、检查清单与第二次思考',
  '第七章 误判不是偶然：心理倾向的系统',
  '第八章 激励：制度比劝诫更诚实',
  '第九章 群体、权威与被剥夺感',
  '第十章 当偏误彼此增强',
  '第十一章 穿过会计看商业现实',
  '第十二章 好企业让少行动成为优势',
  '第十三章 少数机会、集中下注与资本配置',
  '第十四章 应得信任：合作如何降低摩擦',
  '第十五章 避免惯常的失败方式',
  '第十六章 理性近乎一种道德义务',
]

const heroStats = [
  ['31', '章'],
  ['约 60', '万字'],
  ['38', '张原创插图'],
  ['6', '份附录'],
  ['7', '份典藏索引'],
]

const buffettPoints = [
  '所有者视角：买入的是企业的一部分，不是报价符号',
  '企业质量：护城河、经济商誉与资本需要如何经得住时间',
  '资本配置：经理人的第二项工作——回购、收购与浮存金',
  '风险与复利：把个人判断变成可以传承的制度',
]

const mungerPoints = [
  '多元思维模型：不同学科怎样连成一张可以用的知识格栅',
  '误判心理学：25 种心理倾向如何系统性地扭曲判断',
  '逆向与检查清单：先问怎样会失败，再用程序对抗犯错',
  '理性与避错：为什么理性近乎一种道德义务',
]

/* 实际页面预览：从终稿 PDF 抽取的代表页 */
const buffettPreviews = [
  { img: '/ebook-previews/buffett-p01.png', title: '封面', desc: '品牌红与深棕双色装帧，系列开卷之作，书名与副题同页呈现。' },
  { img: '/ebook-previews/buffett-p03.png', title: '目录', desc: '五篇 15 章两级目录，点线引导页码，附录与典藏索引并列入口。' },
  { img: '/ebook-previews/buffett-p13.png', title: '第一章开头', desc: '篇目信息、核心问题与原创插图同页呈现，引文来源逐条标注。' },
]
const mungerPreviews = [
  { img: '/ebook-previews/munger-p01.png', title: '封面', desc: '与巴菲特卷同系列同版式，两卷并排观感统一，适合成套收藏。' },
  { img: '/ebook-previews/munger-p03.png', title: '目录', desc: '16 章加附录与典藏索引，232 个模型对照、25 种心理倾向速查在内。' },
  { img: '/ebook-previews/munger-p04.png', title: '第一章开头', desc: '开卷即 1994 年南加大演讲，配图解《单一锤子与多模型视野》。' },
]

const craftItems = [
  ['01', '引文逐条标注来源与年份', '区分原文、翻译与编辑整理，不把归纳表述当作原话。'],
  ['02', '全卷术语统一', '浮存金、护城河、安全边际、所有者收益等关键概念，全书口径一致，可交叉检索。'],
  ['03', '观点覆盖可核验', '巴菲特观点原子库 100% 覆盖，芒格 96.7%；概念条目 67/67，232 个思维模型逐一身份溯源。'],
  ['04', '双版本交付', '连续阅读版剔除证据展开层；证据段版保留出版可选扩展层，供有研究需要的读者使用。'],
  ['05', '持续修订', '发现错误持续更正，不隐藏尚未核验的不确定性。'],
]

const faqs = [
  ['怎么买？付款后怎么收到 PDF？', '点击页面中的“微信购买”，扫码添加微信 igrape，并发送“巴菲特卷”或“芒格卷”。确认书名和付款后，完整 PDF 会直接通过微信文件发送。'],
  ['网站已经可以免费阅读，为什么还要买合订本？', '网站适合搜索和随时查阅，合订本是把材料组织成一套可以从头读到尾的书。如果你只想偶尔查一两篇，免费使用网站就够了。'],
  ['这套书和网站上的原始材料是什么关系？', '原始材料确实公开存在，但分散在不同年份、网页和版本中。这套书的价值是把它们整理、校订、组织成连续文本，并补上目录、术语表、索引与插图——不是把公开资料包装成独家内容。'],
  ['99元买一本，值不值？', '如果你准备系统读巴菲特或芒格，99元购买的是资料整理、文本校订、章节组织与连续阅读所节省的时间。如果你只有一般兴趣，建议先读网站上的免费内容再决定。'],
  ['两卷都要买吗？', '两卷分别出售、分别交付。巴菲特卷讲企业、资本与长期复利；芒格卷讲思维模型、商业判断与人生智慧。可以先买现在真正想系统读的一卷。'],
  ['翻译和整理可靠吗？', '全部引文标注原始出处；关键术语全书统一；观点覆盖经自动化核查。不能保证永远没有错误，但发现问题后会持续修订并提供更正。'],
  ['读完能帮助我获得更高的投资收益吗？', '不能保证。这套书帮助你理解巴菲特和芒格如何思考企业、价格与判断，但不会提供荐股、收益承诺或替你作出投资决定。'],
]

export const metadata = {
  title: '合订本',
  description: '《所有者的眼光》与《理性的格栅》：两卷本系统讲述巴菲特与芒格的投资方法与判断智慧，每卷 99 元。',
  alternates: { canonical: '/bound-edition' },
}

export default function BoundEditionPage() {
  const buffett = products['buffett-collection']
  const munger = products['munger-collection']

  return (
    <>
      <PageContainer maxWidth="6xl" className="edition-page">
        <section className="edition-hero">
          <p className="study-label">电子合订本 · 复利书房「巴芒经典」系列</p>
          <h1>两卷本，把巴菲特与芒格<br />从头讲清楚</h1>
          <p>
            基于两人六十余年的公开档案与记录整理成书：巴菲特一卷讲企业、资本与长期复利；芒格一卷讲思维模型、商业判断与人生智慧。
            每卷约三十万字，附原创插图、附录与典藏索引，是一套从头到尾读得下去的书。
          </p>
          <div className="edition-hero__stats" aria-label="两卷合订本内容规模">
            {heroStats.map(([num, label]) => (
              <span key={label}><strong>{num}</strong> {label}</span>
            ))}
          </div>
          <Link href="#books" className="archive-button archive-button--solid">查看两卷书 <ArrowRight size={17} /></Link>
          <Link href="#sample" className="archive-button">先读原文再决定</Link>
        </section>

        {/* 两本书 */}
        <section id="books" className="edition-products" aria-label="两卷合订本">
          <article>
            <div><span>01</span><small>BUFFETT EDITION</small></div>
            <ProductCover variant={buffett.coverVariant} title={buffett.title} yearRange={buffett.yearRange} />
            <h2>{buffett.title.replace(/[《》]/g, '')}</h2>
            <p className="edition-product-sub">{buffett.subtitle}</p>
            <div className="edition-product-stats">
              <span>15 章 · 5 篇</span>
              <span>约 32 万字</span>
              <span>20 张插图</span>
              <span>3 份附录</span>
              <span>4 份典藏索引</span>
            </div>
            <ul className="edition-product-points">
              {buffettPoints.map(point => <li key={point}>{point}</li>)}
            </ul>
            <p className="edition-product-desc">{buffett.description}</p>
            <strong>{buffett.price}<small>元</small></strong>
            <Link href="#purchase-contact" className="archive-button archive-button--solid">
              微信购买巴菲特卷 · {buffett.price}元
            </Link>
          </article>

          <article>
            <div><span>02</span><small>MUNGER EDITION</small></div>
            <ProductCover variant={munger.coverVariant} title={munger.title} yearRange={munger.yearRange} />
            <h2>{munger.title.replace(/[《》]/g, '')}</h2>
            <p className="edition-product-sub">{munger.subtitle}</p>
            <div className="edition-product-stats">
              <span>16 章</span>
              <span>约 28 万字</span>
              <span>18 张插图</span>
              <span>3 份附录</span>
              <span>3 份典藏索引</span>
            </div>
            <ul className="edition-product-points">
              {mungerPoints.map(point => <li key={point}>{point}</li>)}
            </ul>
            <p className="edition-product-desc">{munger.description}</p>
            <strong>{munger.price}<small>元</small></strong>
            <Link href="#purchase-contact" className="archive-button archive-button--solid">
              微信购买芒格卷 · {munger.price}元
            </Link>
          </article>

          <p id="purchase-status" className="edition-purchase-status">
            当前采用微信人工交付：添加微信、确认付款后，通过微信直接发送对应卷目的完整 PDF。两卷分别出售，可按自己的阅读需要选择。
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
            <details className="edition-toc__book" open>
              <summary>
                <span>01</span>
                <div>
                  <h3>《所有者的眼光》</h3>
                  <small>五篇十五章：从买什么，到如何长期持有</small>
                </div>
                <ArrowRight size={16} aria-hidden="true" />
              </summary>
              <div className="edition-toc__chapters">
                {buffettOutline.map(([part, chapters]) => (
                  <div key={part} className="edition-toc__part">
                    <h4>{part}</h4>
                    <ol>
                      {chapters.map(title => <li key={title}>{title}</li>)}
                    </ol>
                  </div>
                ))}
                <p className="edition-toc__appendix">
                  附录：术语表与案例索引 · 读者与复核检查清单 · 模型身份对照　｜　典藏：人物索引 · 企业索引 · 思想与制度年表 · 概念·问题·案例总索引
                </p>
              </div>
            </details>

            <details className="edition-toc__book">
              <summary>
                <span>02</span>
                <div>
                  <h3>《理性的格栅》</h3>
                  <small>十六章：从一把锤子，到理性与避错</small>
                </div>
                <ArrowRight size={16} aria-hidden="true" />
              </summary>
              <div className="edition-toc__chapters">
                <ol className="edition-toc__flat">
                  {mungerOutline.map(title => <li key={title}>{title}</li>)}
                </ol>
                <p className="edition-toc__appendix">
                  附录：模型身份与思想源流对照表（232 个模型）· 双轨判断检查清单 5 组 · 25 种心理倾向速查表　｜　典藏：芒格年表 1924—2023 · 关键人物与关键企业索引 · 概念·问题·案例索引
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* 实际页面预览 */}
        <section className="edition-section edition-preview" aria-label="终稿 PDF 实际页面预览">
          <div className="edition-section__heading">
            <p className="study-label">PREVIEW · 实际页面预览</p>
            <h2>终稿 PDF 里，<br />实际长什么样</h2>
            <p>下面是从两卷终稿 PDF 中抽取的代表页面。先看实际排版与阅读效果，再决定要不要买。</p>
          </div>
          <div className="edition-preview__books">
            <div className="edition-preview__book">
              <h3>《所有者的眼光》<span>巴菲特卷 · 终稿 PDF</span></h3>
              <div className="edition-preview__grid">
                {buffettPreviews.map(item => (
                  <figure key={item.img} className="edition-preview__item">
                    <Image src={item.img} alt={`《所有者的眼光》${item.title}页`} width={1100} height={1556} priority={item.title === '封面'} />
                    <figcaption><strong>{item.title}</strong><small>{item.desc}</small></figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className="edition-preview__book">
              <h3>《理性的格栅》<span>芒格卷 · 终稿 PDF</span></h3>
              <div className="edition-preview__grid">
                {mungerPreviews.map(item => (
                  <figure key={item.img} className="edition-preview__item">
                    <Image src={item.img} alt={`《理性的格栅》${item.title}页`} width={1100} height={1556} priority={item.title === '封面'} />
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
            <p className="study-label">HOW IT&apos;S MADE · 编辑标准</p>
            <h2>不是把公开资料打包，<br />是整理成一套能核验的文本</h2>
            <p>五轮内容完善、终稿自动化核查、全卷去 AI 味——每一项都写进这本书的制作记录。</p>
          </div>
          <div className="edition-craft__list">
            {craftItems.map(([num, title, desc]) => (
              <p key={num}><span>{num}</span><div><strong>{title}</strong><small>{desc}</small></div></p>
            ))}
          </div>
        </section>

        {/* 免费试读 */}
        <section id="sample" className="edition-section edition-samples">
          <div className="edition-section__heading">
            <p className="study-label">SAMPLE · 免费试读</p>
            <h2>先读原文，再决定是否购买</h2>
            <p>两卷书基于网站公开材料整理。先读几篇原始记录，感受整理前后的差别。</p>
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
            <p>这套书 2026 年 8 月完成终稿，正在交付首批购买者。评价只放真实的，不筛选、不代写。</p>
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
          <h2>扫码添加微信，<br />确认付款后直接发送 PDF</h2>
          <p>请发送“巴菲特卷”或“芒格卷”。确认书名、价格与付款后，完整 PDF 将通过微信文件发送。</p>
          <div className="edition-wechat-purchase">
            <a href="/wechat-purchase-qr.jpg" target="_blank" rel="noopener noreferrer" aria-label="打开购买微信二维码原图">
              <Image src="/wechat-purchase-qr.jpg" alt="复利书房购买微信二维码" width={109} height={110} />
            </a>
            <div>
              <strong>购买微信：igrape</strong>
              <p>微信扫码或长按识别二维码添加好友</p>
              <small>添加时请备注“复利书房”，并发送想购买的书名：巴菲特卷 / 芒格卷。</small>
              <a href="/wechat-purchase-qr.jpg" target="_blank" rel="noopener noreferrer">打开二维码原图</a>
            </div>
          </div>
          <div className="edition-steps">
            <div><span>01</span><strong>选择一卷</strong><small>巴菲特卷或芒格卷，每卷 99 元，分别交付</small></div>
            <div><span>02</span><strong>添加购买微信</strong><small>扫码添加 igrape，备注“复利书房”，发送想购买的书名</small></div>
            <div><span>03</span><strong>付款并接收 PDF</strong><small>确认付款后，通过微信文件直接发送完整 PDF</small></div>
          </div>
          <small>
            每卷 99 元，分别出售；交付内容为对应卷目的完整 PDF。通常在确认付款后 24 小时内通过微信完成交付。本书为档案材料的整理与再编辑，非商业出版物，亦非官方授权的巴菲特/芒格著作；不提供荐股或收益承诺，请按自己的阅读需要选择。
          </small>
        </section>
      </PageContainer>
    </>
  )
}
