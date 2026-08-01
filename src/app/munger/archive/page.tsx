import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import MungerRecordingBrowser from '@/components/MungerRecordingBrowser'
import {
  getMungerLocalArchiveGroups,
  getMungerLocalArchiveStats,
  getMungerArchiveRecordings,
} from '@/lib/munger-archive'

export const metadata: Metadata = {
  title: '芒格资料',
  description: '查理·芒格的生平、事业、演讲访谈与主题语录。',
}

export default function MungerArchivePage() {
  const groups = getMungerLocalArchiveGroups()
  const supportingGroups = groups.filter(group => group.section !== 'recordings')
  const stats = getMungerLocalArchiveStats()
  const recordings = getMungerArchiveRecordings()
  const readableTotal = groups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <PageContainer maxWidth="6xl" className="archive-catalog">
      <PageHeader
        title="芒格资料"
        subtitle="生平、事业、演讲访谈与主题语录"
        backHref="/munger"
        backLabel="返回芒格"
      />

      <div className="archive-catalog__ledger" aria-label="内容统计">
        <div><strong>{readableTotal}</strong><span>篇可读内容</span></div>
        <div><strong>{stats.recordings}</strong><span>篇演讲与访谈</span></div>
        <div><strong>{stats.quotes}</strong><span>组主题语录</span></div>
        <div><strong>232</strong><span>个思维模型</span></div>
      </div>

      <section className="archive-catalog__intro">
        <p>WATCH · LISTEN · READ</p>
        <h2>先看见他说话的语境，<br />再进入文字。</h2>
        <span>仿照 Munger Archive 的影音档案方式：先浏览、筛选和播放，再沿着中文整理稿继续阅读。首批接入公开来源播放器，之后可直接替换为复利书房的 B 站视频。</span>
      </section>

      <MungerRecordingBrowser recordings={recordings} />

      <nav className="archive-catalog__primary" aria-label="芒格主要资料入口">
        <Link href="/munger/wesco">
          <span>01</span>
          <div>
            <h2>Wesco 股东大会</h2>
            <p>中文实录与会议笔记整理</p>
          </div>
          <b>→</b>
        </Link>
        <Link href="/model">
          <span>02</span>
          <div>
            <h2>多元思维模型</h2>
            <p>合并整理后的统一模型库</p>
          </div>
          <b>→</b>
        </Link>
      </nav>

      <div className="archive-catalog__groups archive-catalog__groups--supporting">
        {supportingGroups.map((group, groupIndex) => (
          <section key={group.section} id={group.section}>
            <header>
              <span>{String(groupIndex + 1).padStart(2, '0')}</span>
              <h2>{group.label}</h2>
              <p>{group.items.length} 篇</p>
            </header>
            <div>
              {group.items.map(item => (
                <Link key={item.slug} href={`/munger/archive/${item.slug}`}>
                  <h3>{item.title}</h3>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

    </PageContainer>
  )
}
