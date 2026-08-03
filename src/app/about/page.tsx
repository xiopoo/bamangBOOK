import Link from 'next/link'
import PageContainer from '@/components/PageContainer'

const stats = [
  ['10', '年资产管理从业'],
  ['360', '篇公众号原创'],
  ['2016', '年开始写作'],
  ['2', '卷巴芒精编书'],
]

const principles = [
  ['原文', '保留作者、年份、原始来源与上下文；不以二次概括替代原始表达。'],
  ['翻译', '与原文状态分开标注，尽可能保留原意；存在歧义时保留核验线索。'],
  ['编辑整理', '用于补充结构、背景和相互关联，不包装成作者原话或唯一解释。'],
]

const ideals = [
  ['本分', '只做自己该做、做得来的事，不越界，不侥幸。'],
  ['第一性', '回到事物最基本的原理去想，不被二手说法带着走。'],
  ['守拙', '承认自己笨，用笨办法，不抄近路。'],
  ['复利', '让时间站在自己这边，慢就是快。'],
  ['长寿', '活得久，才有资格谈长期。'],
]

const wechatHome = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5NTk0MDU2NQ==&scene=124#wechat_redirect'

const platforms = [
  { name: '微信公众号', account: '金家岭小胖', note: '十年主阵地。生活记录、职业见闻、带娃心得与专业知识，都在这里。', href: wechatHome },
  { name: '小红书', account: '金融街小胖', note: '保存长期阅读里遇到的优质长文，不把第三方内容包装成原创。', href: 'https://xhslink.com/m/6OPiGk9H7w7' },
]

export const metadata = {
  title: '关于',
  description: '了解复利书房：金融街小胖整理的巴菲特、芒格第一手资料库，及其背后的编辑方法与投资理念。',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <PageContainer maxWidth="5xl" className="about-study author-profile">
        <header className="about-study__hero">
          <p className="study-label">关于</p>
          <h1>关于复利书房</h1>
          <p>复利书房由我一个人维护，整理巴菲特、芒格的第一手资料，也放我自己的研究与思考。它和我是一体的：我读什么、怎么读，这里就怎么长。</p>
        </header>

        <section>
          <p className="study-label">01 · 我是谁</p>
          <h2>一个在真实资产里工作过十年的人</h2>
          <p>我是金融街小胖，十年资产管理行业从业者，985 硕士。公众号「金家岭小胖」从 2016 年写到现在，三百六十篇原创。离开公司后，我现居青岛，全职带娃，也重新学习如何生活。长期关注投资、商业、消费与时代变化，践行巴菲特与芒格的长期主义。</p>
          <p>这些年主要做不良资产和实体运营，看惯了账面利润漂亮、现金流却持续恶化的项目，也见过名义估值很高、根本卖不掉的资产。这段经历给了我一个习惯：不轻易相信二手转述，尽量回到原始材料。巴菲特的股东信、芒格的演讲和问答，最好的读法就是直接读原文。</p>
          <p>但这些材料散落在不同的年份、网页、录音和版本里。把它们按人物、年份和主题收拢到一起，方便长期阅读、相互核对，就是复利书房这个网站的起因。</p>
          <div className="author-profile__stats">
            {stats.map(([number, label]) => (
              <div key={label}>
                <strong>{number}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="study-label">02 · 我的整理方法</p>
          <h2>原文、翻译与编辑整理，分开标注</h2>
          <p>整理资料时，我给自己立了三道规矩，每种内容的状态都标清楚，不混着来：</p>
          <div className="about-study__principles">
            {principles.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="about-study__rules">
          <div>
            <p className="study-label">03 · 核验与修订</p>
            <h2>不隐藏不确定性</h2>
          </div>
          <div>
            <p>做债务重组那几年，我见过一份文件里事实、观点和情绪混在一起的样子。所以在这，出处、年份、上下文尽量标全，没核实的明确标记，不包装成结论；发现错了就改，翻译错、标题错、关联错，都在持续修订。</p>
            <blockquote>你不需要先相信我的观点。这里提供出处、上下文和核验线索，让你自己作出判断。</blockquote>
            <ul>
              <li>尽可能标注年份、出处与完整上下文</li>
              <li>未核验内容明确标记状态，不包装成确定结论</li>
              <li>发现翻译、标题、段落或实体关系错误后持续修订</li>
              <li>第三方内容尽可能保留作者、原始标题、平台与授权状态</li>
            </ul>
          </div>
        </section>

        <section>
          <p className="study-label">04 · 投资理念与信条</p>
          <h2>本分｜第一性｜守拙｜复利｜长寿</h2>
          <div className="author-profile__principle-grid">
            {ideals.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p>落到投资上，我信这几条：股票不是一串代码，是一家企业的所有权，买入一家企业，买入的是它持续创造现金流的能力；市场短期定价情绪，长期定价自由现金流，利润可以修饰，现金流很难伪装；真正的财富增长来自少数真正理解并长期持有的资产，而不是频繁交易；时间是最重要的变量，也是最大的护城河。</p>
          <blockquote>好投资 = 好公司 × 好价格 × 长时间，缺一不可。</blockquote>
        </section>

        <section>
          <p className="study-label">05 · 在别处</p>
          <h2>名字换了几个，写的还是那些事</h2>
          <p>公众号最早叫「脑残笔记」，后来在金融街上班，一直想长胖的我，把名字改成了「金融街小胖」；再后来定居青岛，落在金家岭，就定了「金家岭小胖」。名字换了几次，写东西这件事没有停过。</p>
          <div className="author-profile__platform-grid">
            {platforms.map(({ name, account, note, href }) => (
              <article key={name}>
                <span>{name}</span>
                <h3><a href={href} target="_blank" rel="noopener noreferrer">{account} ↗</a></h3>
                <p>{note}</p>
              </article>
            ))}
          </div>
          <p className="author-profile__end">—— 小胖，于青岛金家岭</p>
        </section>

        <section className="about-study__boundary">
          <p className="study-label">06 · 内容使用边界</p>
          <h2>学习、研究与资料检索</h2>
          <p>本站不提供个股推荐、收益承诺、实时估值或个性化投资建议。公开资料不会被描述为独家拥有；合订本购买的是整理、校订与连续阅读所节省的时间，而不是秘密信息。两本书的目录与试读，见<Link href="/bound-edition">电子合订本</Link>。</p>
        </section>
      </PageContainer>
    </>
  )
}
