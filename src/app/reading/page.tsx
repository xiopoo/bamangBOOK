import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import { getReadingStats, type ReadingAuthor } from '@/lib/reading-library'
import styles from './reading.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '阅读索引',
  description: '按人物、材料类型与阅读路径浏览小胖书房收录的信件、演讲、访谈、问答和公司研究。',
  alternates: { canonical: '/reading' },
}

const CATEGORY_HREF: Record<string, string> = {
  '合伙人信': '/partnership',
  '股东信': '/letters',
  '演讲': '/talks',
  '访谈': '/interviews',
  '股东大会': '/qa',
  '文章': '/reading',
  '公司分析': '/companies',
}

export default function ReadingPage() {
  const stats = getReadingStats()

  return (
    <>
      <PageContainer maxWidth="7xl" className={styles.page}>
        <header className={styles.hero}>
          <p>THE INDEX</p>
          <h1>阅读索引</h1>
          <span>
            按人物进入，再沿着信件、演讲、访谈、股东大会和文章继续往下找。
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

        <nav className="mt-12 grid gap-3 border-t border-primary/15 pt-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="阅读工具">
          {[
            { href: '/learn', title: '学习室', note: '从一个问题开始' },
            { href: '/learn/path', title: '阅读地图', note: '需要起点时使用' },
            { href: '/history', title: '阅读历史', note: '回到上次读到的地方' },
            { href: '/graph', title: '知识关联', note: '沿人物、公司与概念探索' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="border border-primary/15 bg-bg-card p-4 transition-colors hover:border-primary">
              <strong className="block font-serif text-text dark:text-dark-text">{item.title}</strong>
              <span className="mt-1 block text-sm text-text-muted dark:text-dark-muted">{item.note}</span>
            </Link>
          ))}
        </nav>
      </PageContainer>
      <PageFooter />
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
