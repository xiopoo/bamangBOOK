import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import { getModels } from '@/lib/models'
import { getMungerLocalArchiveGroups, getMungerLocalArchiveStats } from '@/lib/munger-archive'
import { getMungerOriginals } from '@/lib/munger-originals'
import { getWescoMeetings } from '@/lib/wesco-meetings'
import styles from './munger.module.css'

export default function MungerPage() {
  const groups = getMungerLocalArchiveGroups()
  const stats = getMungerLocalArchiveStats()
  const models = getModels()
  const originals = getMungerOriginals()
  const meetings = getWescoMeetings()

  const drawers = [
    { number: '01', href: '/munger/archive#recordings', title: '影音记录', note: '演讲、年会与访谈', count: `${stats.recordings} 篇` },
    { number: '02', href: '/munger/wesco', title: 'Wesco 股东大会', note: '中文问答与会议笔记', count: `${meetings.length} 场` },
    { number: '03', href: '/munger/archive/daily-journal', title: '每日期刊', note: 'Daily Journal 年会与公司档案', count: '长期问答' },
    { number: '04', href: '/model', title: '思维模型', note: '多学科格栅与人类误判心理学', count: `${models.length} 个` },
    { number: '05', href: '/poor-charlies-almanack', title: '穷查理宝典', note: '按原书顺序统一阅读', count: '完整目录' },
    { number: '06', href: '/munger/archive#quotes', title: '主题语录', note: '按主题查找并回到出处', count: `${stats.quotes} 组` },
    { number: '07', href: '/munger/archive', title: '生平与事业', note: '家庭、公司、慈善与建筑', count: `${stats.total} 篇档案` },
  ]

  return (
    <>
      <PageContainer maxWidth="6xl" className={styles.page}>
        <header className={styles.hero}>
          <p>THE CHARLIE MUNGER ARCHIVE</p>
          <h1>查理·芒格档案</h1>
          <span>一个关于芒格演讲、思想、书籍与人生的长期档案。</span>
        </header>

        <div className={styles.ledger}>
          <div><strong>{stats.total}</strong><span>篇可读档案</span></div>
          <div><strong>{meetings.length}</strong><span>场 Wesco 问答</span></div>
          <div><strong>{models.length}</strong><span>个思维模型</span></div>
          <div><strong>{groups.length}</strong><span>组档案主题</span></div>
        </div>

        <nav className={styles.drawers} aria-label="芒格档案分类">
          {drawers.map((drawer) => (
            <Link key={drawer.number} href={drawer.href}>
              <span>{drawer.number}</span>
              <div><h2>{drawer.title}</h2><p>{drawer.note}</p></div>
              <small>{drawer.count}</small>
            </Link>
          ))}
        </nav>

        <section className={styles.meetings}>
          <header><span>问答</span><h2>Wesco 股东大会 · 中文</h2><Link href="/munger/wesco">查看全部 →</Link></header>
          <div>
            {meetings.map((item) => (
              <Link key={item.year} href={`/munger/wesco/${item.year}`}>
                <strong>{item.year}</strong>
                <span>{item.title}</span>
                <b>{item.edition}</b>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.originals}>
          <header><span>原文</span><h2>Wesco 股东信 · 英文</h2><Link href="/munger/originals">查看全部 →</Link></header>
          <div>
            {originals.map((item) => (
              <Link key={item.id} href={`/munger/originals/${item.id}`}>
                <strong>{item.year}</strong>
                <span>{item.title}</span>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.groups}>
          {groups.map((group, index) => (
            <div key={group.section}>
              <header><span>{String(index + 1).padStart(2, '0')}</span><h2>{group.label}</h2><small>{group.items.length} 篇</small></header>
              <div>
                {group.items.slice(0, 8).map((item) => (
                  <Link key={item.slug} href={`/munger/archive/${item.slug}`}>{item.title}<span aria-hidden="true">→</span></Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
