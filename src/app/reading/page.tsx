import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getReadingStats, type ReadingAuthor } from '@/lib/reading-library'
import { getBloggers } from '@/lib/bloggers'
import { getBusinessHistoryStats } from '@/lib/business-history'
import { getBookStats } from '@/lib/books'
import { getColumnStats } from '@/lib/columns'
import { getModelStats } from '@/lib/models'
import type { Metadata } from 'next'

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
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="阅读总库"
        subtitle="从人物、资料类型和研究主题进入书房，这里是全站阅读入口；核心原典与其他专题内容分区统计。"
        sticky
      />

      <div className="archive-stats-line" aria-label="档案统计">
        <span>{stats.totalItems} 篇核心资料</span>
        <span>{stats.authorCount} 位核心人物</span>
        <span>{stats.authorCounts['巴菲特'] || 0} 篇巴菲特相关</span>
        <span>{stats.authorCounts['芒格'] || 0} 篇芒格相关</span>
        <span>{stats.authorCounts['段永平'] || 0} 篇段永平相关</span>
      </div>

      {stats.library.map((author, index) => (
        <AuthorSection key={author.name} author={author} index={index + 1} />
      ))}

      <section className="mb-12" aria-labelledby="reading-hubs-title">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="archive-kicker">专题内容</p>
            <h2 id="reading-hubs-title" className="mt-1 text-xl md:text-2xl font-bold text-text dark:text-dark-text">
              继续探索
            </h2>
          </div>
          <span className="text-sm text-text-muted dark:text-dark-muted">专题内容与上方核心原典分区统计。</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {READING_HUBS.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="bg-white dark:bg-dark-card p-4 rounded-card border border-gray-100 dark:border-dark-border hover:border-primary/30 dark:hover:border-primary/40 hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all shadow-card"
            >
              <div className="font-medium text-text dark:text-dark-text mb-1">{hub.label}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{hub.description}</p>
              <span className="text-xs text-primary dark:text-primary-light">{hubCounts[hub.key]} 篇</span>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  )
}

function AuthorSection({ author, index }: { author: ReadingAuthor; index: number }) {
  return (
    <section className="mb-12">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="archive-kicker">{String(index).padStart(2, '0')} · 核心人物</p>
          <h2 className="mt-1 text-xl md:text-2xl font-bold text-text dark:text-dark-text">{author.name}</h2>
        </div>
        <span className="text-sm text-text-muted dark:text-dark-muted">{author.totalCount} 篇资料</span>
      </div>
      <div className="archive-list">
        {author.categories.map((category) => (
          <Link
            key={category.name}
            href={CATEGORY_HREF[category.name] || '/search'}
            className="archive-list__row"
          >
            <span className="archive-list__year">{category.totalCount}</span>
            <span className="archive-list__main">
              <strong>{category.name}</strong>
              <small>{category.items.slice(0, 2).map((item) => item.title).join(' · ')}</small>
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  )
}
