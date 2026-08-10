import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import { getReadingStats, type ReadingAuthor } from '@/lib/reading-library'
import { getBloggers } from '@/lib/bloggers'
import { getBusinessHistoryStats } from '@/lib/business-history'
import { getBookStats } from '@/lib/books'
import { getColumnStats } from '@/lib/columns'
import { getModelStats } from '@/lib/models'
import type { Metadata } from 'next'
import styles from './reading.module.css'

export const metadata: Metadata = {
  title: '阅读总库',
  description: '从人物、资料类型和研究主题进入复利书房，浏览巴菲特、芒格、段永平及公司研究内容。',
  alternates: { canonical: '/reading' },
}

const CATEGORY_HREF: Record<string, string> = {
  '合伙人信': '/partnership',
  '股东信': '/letters',
  '演讲': '/talks',
  '访谈': '/interviews',
  '股东大会': '/qa',
  '问答': '/duanyongping/qa',
  '文章': '/duanyongping/blog',
  '公司里程碑': '/duanyongping/milestones',
  '公司分析': '/companies',
}

const READING_HUBS = [
  { href: '/business-history', label: '公司研究', description: '从商业模式、护城河到资本配置', key: 'business' },
  { href: '/model', label: '思维模型', description: '跨学科工具与长期决策框架', key: 'models' },
  { href: '/bloggers', label: '博主文章', description: '按作者和时间继续阅读长期文章', key: 'bloggers' },
  { href: '/columns', label: '专栏', description: '按系列和篇章建立连续阅读', key: 'columns' },
  { href: '/books', label: '经典书籍', description: '书籍拆解、要点和延伸阅读', key: 'books' },
] as const

export default function ReadingPage() {
  const stats = getReadingStats()
  const hubCounts: Record<string, number> = {
    business: getBusinessHistoryStats().total,
    models: getModelStats().total,
    bloggers: getBloggers().reduce((sum, blogger) => sum + blogger.count, 0),
    columns: getColumnStats().total,
    books: getBookStats().total,
  }

  return (
    <>
      <PageContainer maxWidth="7xl" className={styles.page}>
        <header className={styles.hero}>
          <p>THE READING ROOM</p>
          <h1>阅读总库</h1>
          <span>
            从人物、资料类型和研究主题进入书房。这里是全站阅读入口；核心原典与其他专题内容分区统计，方便你理解内容范围。
          </span>
        </header>

        <dl className={styles.stats}>
          <div><dt>{stats.totalItems}</dt><dd>核心资料</dd></div>
          <div><dt>{stats.authorCount}</dt><dd>位核心人物</dd></div>
          <div><dt>{stats.authorCounts['巴菲特'] || 0}</dt><dd>篇巴菲特相关</dd></div>
          <div><dt>{stats.authorCounts['芒格'] || 0}</dt><dd>篇芒格相关</dd></div>
          <div><dt>{stats.authorCounts['段永平'] || 0}</dt><dd>篇段永平相关</dd></div>
        </dl>

        <div className={styles.authors}>
          {stats.library.map((author, index) => (
            <AuthorSection key={author.name} author={author} index={index + 1} />
          ))}
        </div>

        <section className={styles.hubs} aria-labelledby="reading-hubs-title">
          <header className={styles.hubsHeader}>
            <div>
              <p>EXPLORE THE LIBRARY</p>
              <h2 id="reading-hubs-title">继续探索</h2>
            </div>
            <span>以下是独立专题内容，数量不与上方核心原典重复相加。</span>
          </header>
          <div className={styles.hubGrid}>
            {READING_HUBS.map((hub, index) => (
              <Link key={hub.href} href={hub.href} className={styles.hubCard}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{hub.label}</h3>
                  <p>{hub.description}</p>
                </div>
                <small>{hubCounts[hub.key]} 篇</small>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  )
}

function AuthorSection({ author, index }: { author: ReadingAuthor; index: number }) {
  return (
    <section className={styles.author}>
      <header>
        <span>{String(index).padStart(2, '0')}</span>
        <div>
          <h2>{author.name}</h2>
          <p>{author.totalCount} 篇资料</p>
        </div>
      </header>
      <div>
        {author.categories.map((category) => (
          <Link key={category.name} href={CATEGORY_HREF[category.name] || '/search'}>
            <div>
              <h3>{category.name}</h3>
              <p>
                {category.items.slice(0, 2).map((item) => item.title).join(' · ')}
              </p>
            </div>
            <small>{category.totalCount} 篇</small>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  )
}
