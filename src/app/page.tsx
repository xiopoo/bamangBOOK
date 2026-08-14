import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import SubdomainRootRouter from '@/components/SubdomainRootRouter'
import BlogPostCard from '@/components/BlogPostCard'
import { getRecentBlogPosts, getFeaturedBlogPosts } from '@/lib/blog'
import { buffettArchive, mungerArchive, duanYongpingArchive, type ThinkerArchive } from '@/lib/thinker-archives'
import './home.css'

export const metadata: Metadata = { title: { absolute: '复利书房｜巴菲特、芒格与段永平阅读档案' }, description: '巴菲特、芒格与段永平的第一手资料：股东信、合伙人信、股东大会问答、演讲与访谈，按人物与主题阅读。', alternates: { canonical: '/' } }

// 三个人的档案入口（第二屏保留，档案做底盘）
const FIGURES: { name: string; href: string; years: string; blurb: string; archive: ThinkerArchive }[] = [
  { name: '沃伦·巴菲特', href: '/buffett', years: '1930—', blurb: '股东信、合伙人信、股东大会问答与演讲访谈', archive: buffettArchive },
  { name: '查理·芒格', href: '/munger', years: '1924—2023', blurb: '演讲、Wesco、穷查理宝典与思维模型', archive: mungerArchive },
  { name: '段永平', href: '/duanyongping', years: '1961—', blurb: '博客、雪球问答、演讲与访谈', archive: duanYongpingArchive },
]

// 可持续专题入口
const TOPICS = [
  { href: '/companies/可口可乐', label: '可口可乐与品牌价值', icon: '🥤' },
  { href: '/concepts/浮存金', label: '保险、浮存金与伯克希尔', icon: '🛡️' },
  { href: '/concepts/能力圈', label: '能力圈', icon: '⭕' },
  { href: '/concepts/市场先生', label: '市场先生', icon: '🎢' },
  { href: '/concepts/资本配置', label: '资本配置', icon: '⚙️' },
  { href: '/duanyongping', label: '段永平问答精选', icon: '❓' },
]

// 本周推荐阅读：人工维护，每篇说明「为什么值得读 + 连接到哪份原典 + 适合谁」
const WEEKLY_PICKS = [
  {
    title: '安全边际不是"打折买"，而是"允许自己犯错"',
    href: '/columns/安全边际不是打折',
    reason: '开篇就把安全边际从"买便宜"纠正到"为判断误差留缓冲"，是理解格雷厄姆体系的起点。',
    connects: '连接 1965 年起的股东信与「低估」「风险」概念',
    audience: '适合刚接触价值投资、容易把便宜当安全边际的读者。',
  },
  {
    title: '可口可乐：把一瓶饮料做成全球分发权',
    href: '/business-history/05-可口可乐：把一杯饮料变成全球分工系统',
    reason: '用一家公司讲清品牌、渠道与装瓶体系如何互相强化，是"品牌价值"专题的核心案例。',
    connects: '可回到 1988 年股东信与「品牌」「渠道」概念页',
    audience: '适合想通过真实案例理解护城河与复利的读者。',
  },
]

export default function HomePage() {
  const featured = getFeaturedBlogPosts(3)
  const recent = getRecentBlogPosts(8)
  return <>
    <SubdomainRootRouter />
    <PageContainer maxWidth="6xl" className="archive-home">
      {/* Hero：主理人定位 */}
      <header className="archive-home__hero">
        <h1>复利书房</h1>
        <p className="archive-home__hero-sub">我在这里整理巴菲特、芒格、段永平的原典，也写下自己的阅读札记、公司研究和投资思考。</p>
        <div className="archive-home__hero-actions">
          <Link href="/blog" className="archive-home__hero-btn archive-home__hero-btn--primary">读最新文章 →</Link>
          <Link href="/buffett" className="archive-home__hero-btn">进入原典档案</Link>
        </div>
      </header>

      {/* 最新文章 */}
      <section className="archive-home__blog" aria-labelledby="blog-title">
        <div className="archive-home__section-head">
          <h2 id="blog-title">最新文章</h2>
          <Link href="/blog" className="archive-home__section-more">全部博客 →</Link>
        </div>
        {featured.length > 0 && (
          <div className="archive-home__featured">
            {featured.map(post => <BlogPostCard key={post.slug} post={post} />)}
          </div>
        )}
        <div className="archive-home__blog-list">
          {recent.map(post => <BlogPostCard key={post.slug} post={post} />)}
        </div>
      </section>

      {/* 本周推荐阅读（人工维护） */}
      <section className="archive-home__weekly" aria-labelledby="weekly-title">
        <h2 id="weekly-title">本周推荐阅读</h2>
        <div className="archive-home__weekly-grid">
          {WEEKLY_PICKS.map(pick => (
            <article key={pick.href} className="archive-home__weekly-card">
              <Link href={pick.href}><h3>{pick.title}</h3></Link>
              <p className="archive-home__weekly-reason">{pick.reason}</p>
              <p className="archive-home__weekly-connects">{pick.connects}</p>
              <p className="archive-home__weekly-audience">{pick.audience}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 从三个人开始 */}
      <section className="archive-home__figures" aria-label="按人物阅读">
        {FIGURES.map(figure => (
          <div key={figure.name} className="archive-home__figure">
            <div className="archive-home__figure-head">
              <Link href={figure.href}><h2>{figure.name}</h2></Link>
              <span>{figure.years}</span>
            </div>
            <p className="archive-home__figure-blurb">{figure.blurb}</p>
            <ul className="archive-home__figure-links">
              {figure.archive.sources.slice(0, 4).map(source => (
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

      {/* 专题入口 */}
      <section className="archive-home__topics" aria-labelledby="topics-title">
        <h2 id="topics-title">从主题进入</h2>
        <div className="archive-home__topics-grid">
          {TOPICS.map(topic => (
            <Link key={topic.href} href={topic.href} className="archive-home__topic">
              <span className="archive-home__topic-icon">{topic.icon}</span>
              <span>{topic.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 搜索与资料库入口 */}
      <section className="archive-home__search" aria-label="搜索与资料库">
        <h2>继续查资料</h2>
        <p>档案馆仍然完整可用：全站搜索、人物索引、拆书、博主文章与中文文章。</p>
        <div className="archive-home__search-links">
          <Link href="/search" className="archive-home__hero-btn archive-home__hero-btn--primary">🔍 全站搜索</Link>
          <Link href="/people" className="archive-home__hero-btn">人物索引</Link>
          <Link href="/books" className="archive-home__hero-btn">拆书</Link>
          <Link href="/bloggers" className="archive-home__hero-btn">博主文章</Link>
          <Link href="/articles" className="archive-home__hero-btn">中文文章</Link>
        </div>
      </section>
    </PageContainer>
  </>
}
