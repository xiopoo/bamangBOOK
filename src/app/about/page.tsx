import PageContainer from '@/components/PageContainer'

const principles = [
  ['原文', '保留作者、年份、原始来源与上下文；不以二次概括替代原始表达。'],
  ['翻译', '与原文状态分开标注，尽可能保留原意；存在歧义时保留核验线索。'],
  ['编辑整理', '用于补充结构、背景和相互关联，不包装成作者原话或唯一解释。'],
]

export const metadata = {
  title: '关于复利书房',
  description: '了解复利书房的定位、编辑方法、修订机制与平台关系。',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <PageContainer maxWidth="5xl" className="about-study">
        <header className="about-study__hero">
          <p className="study-label">关于</p>
          <h1>关于复利书房</h1>
          <p>复利书房是一个由个人长期维护的投资研究网站，重点整理巴菲特、芒格的第一手资料，并持续发布公司研究、投资方法与商业史文章。</p>
        </header>

        <section>
          <p className="study-label">01 · 为什么建立</p>
          <h2>把重要资料整理清楚</h2>
          <p>巴菲特与芒格的重要材料散落在不同年份、网页、录音和版本里。这个网站把它们按人物、年份和主题重新整理，方便长期阅读、查询和相互核对。</p>
          <blockquote>你不需要先相信我的观点。这里提供出处、上下文和核验线索，让你自己作出判断。</blockquote>
        </section>

        <section>
          <p className="study-label">02 · 编辑边界</p>
          <h2>原文、翻译与编辑整理，分别标注</h2>
          <div className="about-study__principles">
            {principles.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="about-study__rules">
          <div>
            <p className="study-label">03 · 核验与修订</p>
            <h2>不隐藏不确定性</h2>
          </div>
          <ul>
            <li>尽可能标注年份、出处与完整上下文</li>
            <li>未核验内容明确标记状态，不包装成确定结论</li>
            <li>发现翻译、标题、段落或实体关系错误后持续修订</li>
            <li>第三方内容尽可能保留作者、原始标题、平台与授权状态</li>
          </ul>
        </section>

        <section>
          <p className="study-label">04 · 关于作者</p>
          <h2>长期阅读，也长期整理</h2>
          <p>我长期阅读巴菲特、芒格、企业史与资本配置案例。这个网站用于系统整理第一手资料和研究文章；其他平台主要记录个人思考与阶段性判断。</p>
          <div className="about-study__platforms">
            <article><span>微信公众号</span><h3>金家岭小胖</h3><p>记录个人思考、长期文章与阶段性判断。网站与公众号各有侧重，内容不会完全同步。</p></article>
            <article><span>小红书</span><h3>金融街小胖</h3><p>转发和保存长期阅读中遇到的优质长文，不把第三方内容包装为原创。</p></article>
          </div>
          <p>名称不同，但都由我维护。复利书房集中呈现经过整理的资料、研究文章和长期专题。</p>
        </section>

        <section className="about-study__boundary">
          <p className="study-label">05 · 内容使用边界</p>
          <h2>学习、研究与资料检索</h2>
          <p>本站不提供个股推荐、收益承诺、实时估值或个性化投资建议。公开资料不会被描述为独家拥有；合订本购买的是整理、校订与连续阅读所节省的时间，而不是秘密信息。</p>
        </section>
      </PageContainer>
    </>
  )
}
