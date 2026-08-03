import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'

const stats = [
  ['10', '年资产管理从业'],
  ['360', '篇公众号原创'],
  ['2016', '年开始写作'],
  ['2', '卷巴芒精编书'],
]

const wechatHome = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5NTk0MDU2NQ==&scene=124#wechat_redirect'

const principles = [
  ['本分', '只做自己该做、做得来的事，不越界，不侥幸。'],
  ['第一性', '回到事物最基本的原理去想，不被二手说法带着走。'],
  ['守拙', '承认自己笨，用笨办法，不抄近路。'],
  ['复利', '让时间站在自己这边，慢就是快。'],
  ['长寿', '活得久，才有资格谈长期。'],
]

const platforms = [
  { name: '微信公众号', account: '金家岭小胖', note: '十年主阵地。生活记录、职业见闻、带娃心得与专业知识，都在这里。', href: wechatHome },
  { name: '小红书', account: '金融街小胖', note: '保存长期阅读里遇到的优质长文，不把第三方内容包装成原创。', href: null },
  { name: '抖音 / 视频号', account: '金家岭小胖', note: '分享不良资产、企业纾困与并购重组的实战干货。', href: null },
]

export const metadata: Metadata = {
  title: '作者',
  description: '关于金融街小胖：十年资产管理从业者，公众号「金家岭小胖」作者，复利书房维护人。',
  alternates: { canonical: '/author' },
}

export default function AuthorPage() {
  return (
    <>
      <PageContainer maxWidth="5xl" className="about-study author-profile">
        <header className="about-study__hero author-profile__hero">
          <p className="study-label">ABOUT THE AUTHOR · 作者</p>
          <h1>金融街小胖</h1>
          <p>
            十年资产管理行业从业者，985 硕士。离开公司后，现居青岛，全职带娃，也重新学习如何生活。
            长期关注投资、商业、消费与时代变化，践行巴菲特与芒格的长期主义。这里记录一个普通家庭，在不确定时代里的生活、思考与资产积累。
          </p>
        </header>

        <section className="author-profile__stats" aria-label="简要数字">
          {stats.map(([number, label]) => (
            <div key={label}>
              <strong>{number}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section>
          <p className="study-label">01 · 职业背景与专业</p>
          <h2>在真实资产的世界里做了十年</h2>
          <p>
            我长期从事不良资产及实体运营相关工作，工作内容涉及资产管理、租户运营、现金流与回款管理、商业运营等多个环节。
            这些经历让我对「真实价值」的理解，和很多纯市场视角的投资者不一样：在真实资产世界里，利润可能是阶段性的，估值可能是情绪化的，但现金流永远是真实的。
          </p>
          <p>
            我见过账面利润漂亮、现金流却持续恶化的项目；见过名义估值很高、却根本无法变现的资产；也见过许多企业最终死于杠杆，而非亏损。
            所以我越来越相信：投资最核心的问题，从来不是股价，而是资产质量。
          </p>
          <p>
            这些年的专业文章都写在公众号「金家岭小胖」里。想看专栏全部内容，直接进
            <a href={wechatHome} target="_blank" rel="noopener noreferrer">公众号文章列表</a>。
          </p>
        </section>

        <section>
          <p className="study-label">02 · 写作十年</p>
          <h2>从金融街写到金家岭</h2>
          <p>
            2016 年 7 月，公众号发出第一篇文章，到今年正好十年，三百六十篇原创。写的东西很杂：生活记录、职业见闻、带娃心得、专业知识，也有电影、书和一场又一场债务危机。
          </p>
          <p>
            公众号最早叫「脑残笔记」——分享的过程是知识面筛选的过程，总有一些观点让人贻笑大方。后来在金融街上班，一直想长胖的我，就把名字改成了「金融街小胖」。
            再后来定居青岛，落在金家岭，公众号沿用了这个地名。名字换了几次，写东西这件事没有停过。
          </p>
          <blockquote>我的文章非常朴素、平常，没有什么花里胡哨的东西。我的目标是写下去，把日常感念的所思所想记录下来。</blockquote>
          <p>
            十年三百六十篇都收在公众号里，进
            <a href={wechatHome} target="_blank" rel="noopener noreferrer">公众号文章列表</a>
            就能从 2016 年一路翻到现在。
          </p>
        </section>

        <section>
          <p className="study-label">03 · 现在在做的事</p>
          <h2>把几百万字蒸馏成两本书</h2>
          <p>
            2026 年，我离开公司回到青岛，开始全职带娃，也第一次认真琢磨自己这条路该怎么走。之后做了一件以前不敢想的事：
            把巴菲特和芒格几十年散落的股东信、演讲、访谈和问答收进一个文件库，用 AI 做粗加工，再一篇一篇人工精校，最后整理成两本书——《所有者的眼光》和《理性的格栅》。
          </p>
          <p>
            几百篇原始档案，七百万字符，最后压到三十多万字。AI 在里面干的是读得动、会甄别、能对齐、会审计这些粗活；删什么、留什么、怎么排、下什么结论，从头到尾是我自己定的。
            所有引文都能回到原始档案，你可以核对，可以不同意。
          </p>
          <p>
            两本书之外，就是这个复利书房网站。做网站的起因也简单：这些整理过的资料不该躺在硬盘里，应该放在能一直查、一直改的地方。想了解网站本身的定位与编辑方式，可以看
            <Link href="/about">关于复利书房</Link>；两本书的目录与试读，在
            <Link href="/bound-edition">电子合订本</Link>一页。
          </p>
        </section>

        <section className="author-profile__principles">
          <p className="study-label">04 · 投资理念与信条</p>
          <h2>本分｜第一性｜守拙｜复利｜长寿</h2>
          <div className="author-profile__principle-grid">
            {principles.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p>
            落到投资上，我信这几条：股票不是一串代码，是一家企业的所有权，买入一家企业，买入的是它持续创造现金流的能力；市场短期定价情绪，长期定价自由现金流，
            利润可以修饰，现金流很难伪装；真正的财富增长来自少数真正理解并长期持有的资产，而不是频繁交易；时间是最重要的变量，也是最大的护城河。
          </p>
          <blockquote>好投资 = 好公司 × 好价格 × 长时间，缺一不可。</blockquote>
        </section>

        <section className="author-profile__platforms">
          <p className="study-label">WHERE TO FIND ME · 在别处</p>
          <h2>名字换了几个，写的还是那些事</h2>
          <div className="author-profile__platform-grid">
            {platforms.map(({ name, account, note, href }) => (
              <article key={name}>
                <span>{name}</span>
                {href ? (
                  <h3><a href={href} target="_blank" rel="noopener noreferrer">{account} ↗</a></h3>
                ) : (
                  <h3>{account}</h3>
                )}
                <p>{note}</p>
              </article>
            ))}
          </div>
          <p className="author-profile__end">—— 小胖，于青岛金家岭</p>
        </section>
      </PageContainer>
    </>
  )
}
