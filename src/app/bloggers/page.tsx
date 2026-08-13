import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import CatalogStats from '@/components/CatalogStats'
import { getBloggers, getAllBloggerTags } from '@/lib/bloggers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博主文章',
  description: '四位中文写作者的长期投资文章：把原典、企业案例和中国投资者的长期实践放在一起阅读。',
  alternates: { canonical: '/bloggers' },
  openGraph: {
    title: '博主文章｜复利书房',
    description: '四位中文写作者的长期投资文章索引。',
  },
}

const BLOGGER_DESCRIPTIONS: Record<string, string> = {
  '在苍茫中传灯': '姚斌的长期投资随笔，跨度十余年，覆盖价值投资、商业史与公司案例。',
  '方伟看十年': '以产品与商业分析见长的投资写作，关注公司质量与长期价值。',
  '梁孝永康': '公司分析与投资理念的长期记录，从个股案例到价值投资方法。',
  '唐僧的碎碎念': '金融从业者的多元随笔，涉及宏观、债券市场、投资与个人成长。',
}

export default function BloggersPage() {
  const bloggers = getBloggers()
  const totalArticles = bloggers.reduce((sum, b) => sum + b.count, 0)

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="博主文章"
        subtitle={`四位长期关注的投资写作者，共 ${totalArticles.toLocaleString()} 篇文章。可以按作者、年份和主题浏览。`}
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      <CatalogStats items={[
        { value: bloggers.length, label: '位博主' },
        { value: totalArticles.toLocaleString(), label: '篇文章' },
        { value: getAllBloggerTags().length, label: '个主题标签' },
      ]} />

      {/* Blogger cards */}
      <div className="archive-card-grid">
        {bloggers.map(blogger => (
          <Link
            key={blogger.name}
            href={`/bloggers/${encodeURIComponent(blogger.name)}`}
            className="archive-content-card group"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="archive-content-card__title group-hover:text-primary transition-colors">
                {blogger.name}
              </h2>
              <span className="archive-content-card__badge">
                {blogger.count}篇
              </span>
            </div>
            
            <p className="archive-content-card__summary">
              {BLOGGER_DESCRIPTIONS[blogger.name] || `${blogger.name}的投资思考与商业分析`}
            </p>

            <div className="archive-content-card__meta">
              <span className="flex items-center gap-1">
                <span>📅</span>
                <span>{blogger.dateRange}</span>
              </span>
              <span className="text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                浏览文章 →
              </span>
            </div>
          </Link>
        ))}
      </div>

    </PageContainer>
  )
}
