import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import { getBloggers } from '@/lib/bloggers'

const BLOGGER_DESCRIPTIONS: Record<string, string> = {
  '在苍茫中传灯': '姚斌的投资随笔，涵盖价值投资、复杂科学、商业思维等多元领域，以跨界视角解读投资本质。',
  '方伟看十年': '投资向善的产品与投资分析，聚焦商业模式、企业护城河和长期价值，以产品经理视角看投资。',
  '梁孝永康': '以长期价值投资为核心，分享公司分析、投资理念与人生感悟，文字质朴，思考深邃。',
  '唐僧的碎碎念': '金融从业者的多元思考，横跨宏观经济、债券市场、个人成长与社会观察，犀利幽默，不拘一格。',
}

export default function BloggersPage() {
  const bloggers = getBloggers()
  const totalArticles = bloggers.reduce((sum, b) => sum + b.count, 0)

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="📡 博主文章"
        subtitle="精选知名投资公众号博主的优质内容，多视角理解价值投资"
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary">{bloggers.length}</div>
          <div className="text-sm text-text-muted dark:text-dark-muted mt-1">位博主</div>
        </div>
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary">{totalArticles}</div>
          <div className="text-sm text-text-muted dark:text-dark-muted mt-1">篇文章</div>
        </div>
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary">12</div>
          <div className="text-sm text-text-muted dark:text-dark-muted mt-1">个主题标签</div>
        </div>
      </div>

      {/* Blogger cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bloggers.map(blogger => (
          <Link
            key={blogger.name}
            href={`/bloggers/${encodeURIComponent(blogger.name)}`}
            className="group block bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 hover:shadow-card-hover hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                {blogger.name}
              </h2>
              <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium whitespace-nowrap">
                {blogger.count}篇
              </span>
            </div>
            
            <p className="text-sm text-text-muted dark:text-dark-muted mb-4 leading-relaxed">
              {BLOGGER_DESCRIPTIONS[blogger.name] || `${blogger.name}的投资思考与商业分析`}
            </p>

            <div className="flex items-center justify-between text-xs text-text-muted dark:text-dark-muted">
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

      <PageFooter />
    </PageContainer>
  )
}
