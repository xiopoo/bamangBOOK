import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import { getRecentUpdates } from '@/lib/recent-updates'
import { buffettArchive, mungerArchive, duanYongpingArchive, type ThinkerArchive } from '@/lib/thinker-archives'
import './home.css'

export const metadata: Metadata = { title: { absolute: '复利书房｜巴菲特、芒格与段永平阅读档案' }, description: '巴菲特、芒格与段永平的第一手资料：股东信、合伙人信、股东大会问答、演讲与访谈，按人物与主题阅读。', alternates: { canonical: '/' } }

const FIGURES: { name: string; href: string; years: string; archive: ThinkerArchive }[] = [
  { name: '沃伦·巴菲特', href: '/buffett', years: '1930—', archive: buffettArchive },
  { name: '查理·芒格', href: '/munger', years: '1924—2023', archive: mungerArchive },
  { name: '段永平', href: '/duanyongping', years: '1961—', archive: duanYongpingArchive },
]

// 次要入口：研究（本站解读）与延伸阅读（外部内容/衍生），在首页底部以小字呈现
const STUDY_LINKS = [
  { href: '/business-history', label: '公司研究' },
  { href: '/companies', label: '公司索引' },
  { href: '/concepts', label: '投资概念' },
  { href: '/model', label: '思维模型' },
] as const

const READING_LINKS = [
  { href: '/books', label: '拆书' },
  { href: '/columns', label: '专栏' },
  { href: '/bloggers', label: '博主文章' },
  { href: '/articles', label: '中文文章' },
] as const

export default function HomePage() {
  const recent = getRecentUpdates(10)

  return <>
    <SubdomainRootRouter />
    <PageContainer maxWidth="6xl" className="archive-home">
      <header className="archive-home__header">
        <h1>复利书房</h1>
        <p>巴菲特、芒格与段永平的第一手资料</p>
      </header>

      <section className="archive-home__figures" aria-label="按人物阅读">
        {FIGURES.map(figure => (
          <div key={figure.name} className="archive-home__figure">
            <div className="archive-home__figure-head">
              <Link href={figure.href}><h2>{figure.name}</h2></Link>
              <span>{figure.years}</span>
            </div>
            <ul className="archive-home__figure-links">
              {figure.archive.sources.slice(0, 5).map(source => (
                <li key={source.href}>
                  <Link href={source.href}>
                    <span>{source.label}</span>
                    <small>{source.meta}</small>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={figure.href} className="archive-home__figure-more">进入专题 →</Link>
          </div>
        ))}
      </section>

      <section className="archive-home__feed" aria-labelledby="recent-title">
        <h2 id="recent-title" className="archive-home__feed-title-label">原典最近更新</h2>
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

      <nav className="archive-home__secondary" aria-label="次要内容入口">
        <div>
          <p>研究</p>
          {STUDY_LINKS.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </div>
        <div>
          <p>延伸阅读</p>
          {READING_LINKS.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </div>
      </nav>
    </PageContainer>
  </>
}
