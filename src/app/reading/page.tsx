import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import { getReadingStats, type ReadingAuthor } from '@/lib/reading-library'
import styles from './reading.module.css'

const CATEGORY_HREF: Record<string, string> = {
  '合伙人信': '/partnership',
  '股东信': '/letters',
  '演讲': '/talks',
  '访谈': '/interviews',
  '股东大会': '/qa',
  '公司分析': '/companies',
}

export default function ReadingPage() {
  const stats = getReadingStats()

  return (
    <>
      <PageContainer maxWidth="7xl" className={styles.page}>
        <header className={styles.hero}>
          <p>全部内容</p>
          <h1>全部内容</h1>
          <span>
            按人物和内容类型浏览信件、演讲、访谈、股东大会记录与研究文章。
          </span>
        </header>

        <dl className={styles.stats}>
          <div><dt>{stats.totalItems}</dt><dd>篇资料</dd></div>
          <div><dt>{stats.authorCount}</dt><dd>位人物</dd></div>
          <div><dt>{stats.authorCounts['巴菲特'] || 0}</dt><dd>篇巴菲特相关</dd></div>
          <div><dt>{stats.authorCounts['芒格'] || 0}</dt><dd>篇芒格相关</dd></div>
        </dl>

        <div className={styles.authors}>
          {stats.library.map((author, index) => (
            <AuthorSection key={author.name} author={author} index={index + 1} />
          ))}
        </div>
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
