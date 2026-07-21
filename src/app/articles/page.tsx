import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import StatBadge from '@/components/StatBadge'
import PageFooter from '@/components/PageFooter'
import { getDocuments } from '@/lib/documents'

const CATEGORIES = [
  { dir: '01-投资理念', label: '投资理念与方法', desc: '估值方法、能力圈、市场先生、所有者收益等', icon: '🎯', count: 15 },
  { dir: '02-股市宏观', label: '股市与宏观判断', desc: '1974-2008 年的关键市场判断、通胀、美元', icon: '📊', count: 15 },
  { dir: '03-公司分析', label: '公司/行业分析', desc: 'GEICO、喜诗糖果、BNSF、巴菲特早期荐股', icon: '🏢', count: 12 },
  { dir: '04-人物传记', label: '人物传记与纪念', desc: '格雷厄姆、芒格、巴菲特青春、卢米斯', icon: '👤', count: 11 },
  { dir: '05-政策社会', label: '政策与社会评论', desc: '股票期权、股息税、慈善、收入分配', icon: '⚖️', count: 5 },
  { dir: '06-备忘录', label: '致股东信/备忘录', desc: '致经理人备忘录、所罗门股东信、股东手册', icon: '📋', count: 6 },
  { dir: '07-伯克希尔史', label: '伯克希尔历史', desc: '合伙时代、伯克希尔 50 年、投资历史', icon: '🏛️', count: 7 },
  { dir: '08-芒格专题', label: '芒格专题', desc: '实践思维演讲、学院派经济学、DJ 年会', icon: '🧩', count: 5 },
  { dir: '09-其他', label: '其他', desc: '杰米·戴蒙致股东信、财富杂志·恐龙', icon: '📎', count: 2 },
]

export default function ArticlesPage() {
  const documents = getDocuments('articles')
  const totalCount = documents.length
  const totalWords = documents.reduce((sum, d) => sum + d.wordCount, 0)

  // Group documents by their subdirectory prefix
  const docsByCategory = CATEGORIES.map(cat => ({
    ...cat,
    docs: documents.filter(d => d.fileName.startsWith(cat.dir + '/'))
  }))

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="📝 深度文章"
        subtitle="巴菲特与芒格的专题文章、研究报告和深度分析"
        backHref="/"
        backLabel="返回首页"
        sticky
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatBadge icon="📖" count={`${totalCount}篇`} label="文章" sub="精心编选" />
        <StatBadge icon="📝" count={`${(totalWords / 10000).toFixed(1)}万`} label="总字数" sub="深度内容" />
        <StatBadge icon="📂" count={`${CATEGORIES.length}个`} label="专题分类" sub="按主题浏览" />
        <StatBadge icon="📅" count="1951-2025" label="时间跨度" sub="70余年" />
      </div>

      {/* Category sections */}
      <div className="space-y-8">
        {docsByCategory.map(cat => (
          <section key={cat.dir}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">{cat.icon}</span>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif">{cat.label}</h2>
              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                {cat.docs.length}篇
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {cat.docs.length > 0 ? (
              <div className="space-y-2">
                {cat.docs.map(doc => (
                  <Link
                    key={doc.fileName}
                    href={`/articles/${encodeURIComponent(doc.fileName)}`}
                    className="block bg-white dark:bg-dark-card p-3.5 rounded-lg border border-gray-100 dark:border-dark-border hover:shadow-card-hover hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {doc.year && (
                            <span className="text-sm font-medium text-primary dark:text-primary-light whitespace-nowrap">
                              {doc.year}
                            </span>
                          )}
                          <h3 className="text-base font-medium text-text dark:text-dark-text truncate">{doc.title}</h3>
                        </div>
                      </div>
                      <span className="text-xs text-text-muted dark:text-dark-muted whitespace-nowrap flex-shrink-0">
                        {(doc.wordCount / 1000).toFixed(1)}千字
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-text-muted dark:text-dark-muted py-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                {cat.desc}
              </div>
            )}
          </section>
        ))}
      </div>

      <PageFooter />
    </PageContainer>
  )
}
