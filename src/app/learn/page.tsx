import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import { getBusinessHistories } from '@/lib/business-history'
import { getDocuments } from '@/lib/documents'
import { getModels } from '@/lib/models'
import { getMungerLocalArchiveItems, getMungerLocalArchiveStats } from '@/lib/munger-archive'
import { getAllPartnershipLetters, getShareholderLetters } from '@/lib/partnership'
import styles from './learn.module.css'

const questions = [
  { query: '护城河', title: '什么样的生意值得长期拥有？', note: '从护城河、定价权与资本回报开始' },
  { query: '资本配置', title: '怎样判断一位管理者？', note: '看他如何使用利润、债务与股票' },
  { query: '市场先生', title: '市场下跌时，真正需要害怕什么？', note: '区分价格波动与永久性损失' },
  { query: '机会成本', title: '什么时候应该什么也不做？', note: '沿着机会成本、耐心与能力圈思考' },
  { query: '心理误判', title: '一个看似聪明的决定错在哪里？', note: '进入芒格的人类误判心理学' },
  { query: '复利', title: '长期主义到底在积累什么？', note: '把时间、资本、信誉与知识放在一起看' },
]

export default function LearnPage() {
  const archiveStats = getMungerLocalArchiveStats()
  const models = getModels()
  const letters = getShareholderLetters()
  const partnerships = getAllPartnershipLetters()
  const histories = getBusinessHistories()
  const qaCount = getDocuments('qa').length

  const inversion = models.find((item) => item.slug === 'inversion')
  const circle = models.find((item) => item.slug === 'circle-of-competence')
  const disney = histories.find((item) => item.company.includes('迪士尼')) || histories[0]
  const archivePage = getMungerLocalArchiveItems().find((item) => item.section === 'recordings')

  const loosePages = [
    {
      href: '/letters/1986',
      meta: '巴菲特股东信 · 1986',
      title: '所有者收益：会计数字之外',
      note: '回到"所有者收益"概念出现的原始语境。',
    },
    inversion && {
      href: `/model/${inversion.slug}`,
      meta: '思维模型 · 元认知',
      title: inversion.title,
      note: inversion.description || '先问怎样会失败，再寻找避免失败的方法。',
    },
    circle && {
      href: `/model/${circle.slug}`,
      meta: '思维模型 · 投资原则',
      title: circle.title,
      note: circle.description || '能力圈的价值不在大小，而在边界是否清楚。',
    },
    disney && {
      href: `/business-history/${encodeURIComponent(disney.slug)}`,
      meta: `公司研究 · ${disney.readMinutes} 分钟`,
      title: disney.title,
      note: disney.summary || '把一个长期复利故事还原为真实的经营系统。',
    },
    archivePage && {
      href: `/munger/archive/${archivePage.slug}`,
      meta: '芒格 · 演讲与访谈',
      title: archivePage.title,
      note: '从一次公开表达继续了解相关人物、概念与第一手资料。',
    },
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  const wescoCount = 14

  const shelves = [
    { number: '01', href: '/munger/wesco', title: '读 Wesco 问答', note: '芒格独自回答投资与人的判断', count: `${wescoCount} 场` },
    { number: '02', href: '/model', title: '找一个模型', note: '跨学科工具与心理误判', count: `${models.length} 个` },
    { number: '03', href: '/business-history', title: '研究一家公司', note: '经营系统、护城河与资本配置', count: `${histories.length} 篇` },
    { number: '04', href: '/letters', title: '沿年份阅读', note: '在六十年股东信中观察变化', count: `${letters.length} 封` },
    { number: '05', href: '/qa', title: '听现场问答', note: '从具体问题进入真实判断', count: `${qaCount} 篇` },
    { number: '06', href: '/partnership', title: '回到早期巴菲特', note: '看方法如何在实践中形成', count: `${partnerships.length} 封` },
  ]

  return (
    <>
      <PageContainer maxWidth="6xl" className={`${styles.page} archive-catalog`}>
        <header className={styles.hero}>
          <p className={styles.kicker}>投资学习</p>
          <h1>从一个问题开始</h1>
          <p>
            没有课表，也不要求完成。选一个此刻真正困扰你的问题，打开一篇原文，
            再顺着其中的人物、公司和概念继续走。
          </p>
          <Link href="/search">搜索此刻想弄明白的事 <span aria-hidden="true">→</span></Link>
        </header>

        <div className="archive-catalog__ledger" aria-label="可浏览内容">
          <div><strong>{archiveStats.total}</strong><span>篇芒格资料</span></div>
          <div><strong>{models.length}</strong><span>个思维模型</span></div>
          <div><strong>{letters.length + partnerships.length}</strong><span>封长期信件</span></div>
          <div><strong>{histories.length}</strong><span>篇公司深度研究</span></div>
        </div>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span>01</span>
            <div>
              <h2>从一个问题开始</h2>
              <p>问题比进度更重要。点击任何一个，也可以换成你自己的关键词。</p>
            </div>
          </header>
          <div className={styles.questionGrid}>
            {questions.map((question) => (
              <Link key={question.query} href={`/search?q=${encodeURIComponent(question.query)}`}>
                <h3>{question.title}</h3>
                <p>{question.note}</p>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span>02</span>
            <div>
              <h2>从一种材料开始</h2>
              <p>可以按资料类型进入，也可以直接从感兴趣的内容开始。</p>
            </div>
          </header>
          <nav className={styles.shelves} aria-label="内容入口">
            {shelves.map((shelf) => (
              <Link key={shelf.href} href={shelf.href}>
                <span>{shelf.number}</span>
                <div>
                  <h3>{shelf.title}</h3>
                  <p>{shelf.note}</p>
                </div>
                <small>{shelf.count}</small>
              </Link>
            ))}
          </nav>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span>03</span>
            <div>
              <h2>推荐阅读</h2>
              <p>几篇适合用来开始或继续阅读的内容。</p>
            </div>
          </header>
          <div className={styles.loosePages}>
            {loosePages.map((item) => (
              <Link key={item.href} href={item.href}>
                <p>{item.meta}</p>
                <h3>{item.title}</h3>
                <span>{item.note}</span>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
        </section>

        <aside className={styles.optionalMap}>
          <div>
            <p>当你暂时不知道读什么</p>
            <h2>阅读地图仍然在，但它只是一张地图。</h2>
          </div>
          <Link href="/learn/path">查看可选阅读地图 <span aria-hidden="true">→</span></Link>
        </aside>
      </PageContainer>
    </>
  )
}
