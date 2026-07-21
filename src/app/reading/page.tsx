import Link from 'next/link'
import { FileText, Tag, Eye, ChevronRight } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'
import { getReadingLibrary, getReadingStats, type ReadingAuthor } from '@/lib/reading-library'

const CATEGORY_HREF: Record<string, string> = {
  '合伙人信': '/partnership',
  '股东信': '/letters',
  '演讲': '/talks',
  '访谈': '/interviews',
  '股东大会': '/qa',
  '文章': '/articles',
  '公司分析': '/companies',
}

export default function ReadingPage() {
  const stats = getReadingStats()

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-bg-card border-b border-primary/20 py-16 -mx-4 md:-mx-6 -mt-8 md:-mt-12 rounded-xl">
        <div className="px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-xl">
              📚
            </div>
            <span className="text-orange-600 font-medium text-sm">
              长期阅读库
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            阅读库
          </h1>
          <p className="text-gray-600">
            按作者与类别组织的内容索引，涵盖巴菲特、芒格、施洛斯等价值投资大师的经典文献
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBadge
            icon={<FileText className="w-5 h-5" />}
            count={stats.totalItems}
            label="总文献数"
          />
          <StatBadge
            icon={<Tag className="w-5 h-5" />}
            count={stats.authorCount}
            label="作者"
          />
          <StatBadge
            icon={<Eye className="w-5 h-5" />}
            count={stats.authorCounts['巴菲特'] || 0}
            label="巴菲特相关"
          />
          <StatBadge
            icon={<Eye className="w-5 h-5" />}
            count={(stats.authorCounts['芒格'] || 0) + (stats.authorCounts['施洛斯'] || 0)}
            label="芒格 & 施洛斯"
          />
        </div>
      </div>

      {/* Authors & Categories */}
      {stats.library.map((author) => (
        <AuthorSection key={author.name} author={author} />
      ))}

      <PageFooter />
    </PageContainer>
  )
}

function AuthorSection({ author }: { author: ReadingAuthor }) {
  return (
    <div className="pb-16">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AuthorAvatar name={author.name} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{author.name}</h2>
            <p className="text-sm text-gray-500">{author.totalCount} 篇文献</p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {author.categories.map((category) => {
          const href = CATEGORY_HREF[category.name]
          return (
            <Link
              key={category.name}
              href={href || '#'}
              className="block p-5 bg-white border border-gray-100 rounded-xl hover:border-orange-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{category.totalCount} 篇</span>
                <div className="flex -space-x-1">
                  {category.items.slice(0, 3).map((item, i) => (
                    <span
                      key={i}
                      className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center border-2 border-white"
                      title={item.title}
                    >
                      {item.title.charAt(0)}
                    </span>
                  ))}
                  {category.totalCount > 3 && (
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[10px] flex items-center justify-center border-2 border-white">
                      +{category.totalCount - 3}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function AuthorAvatar({ name }: { name: string }) {
  const avatars: Record<string, string> = {
    '巴菲特': '🧑‍💼',
    '芒格': '👨‍⚖️',
    '施洛斯': '👨‍🔬',
    '其他': '📚',
  }
  return (
    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
      {avatars[name] || '📚'}
    </div>
  )
}
