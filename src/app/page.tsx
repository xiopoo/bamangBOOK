import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getRecentUpdates } from '@/lib/recent-updates'
import './home.css'

export const metadata: Metadata = { title: { absolute: '复利书房｜巴菲特、芒格与段永平阅读档案' }, description: '以巴菲特、芒格与段永平原典为核心的阅读档案：股东信、问答、演讲、访谈与公司研究，保留来源与完整上下文。', alternates: { canonical: '/' } }

const NAV = [
  ['巴菲特', '/buffett'],
  ['芒格', '/munger'],
  ['段永平', '/duanyongping'],
  ['股东信', '/letters'],
  ['股东大会问答', '/qa'],
  ['演讲与访谈', '/talks'],
  ['公司研究', '/business-history'],
  ['搜索', '/search'],
] as const

export default function HomePage() {
  const recent = getRecentUpdates(14)

  return <>
    <SubdomainRootRouter />
    <PageContainer maxWidth="5xl" className="archive-home">
      <header className="archive-home__header">
        <h1>复利书房</h1>
        <p>巴菲特、芒格与段永平的公开资料阅读档案</p>
      </header>

      <section className="archive-home__feed" aria-labelledby="recent-title">
        <h2 id="recent-title" className="archive-home__feed-title-label">最近更新</h2>
        <ol>
          {recent.map(item => (
            <li key={item.href}>
              <Link href={item.href}>
                <span className="archive-home__feed-meta">{item.meta}</span>
                <span className="archive-home__feed-title">{item.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <nav className="archive-home__nav" aria-label="主要栏目">
        {NAV.map(([label, href]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
      </nav>
    </PageContainer>
  </>
}
