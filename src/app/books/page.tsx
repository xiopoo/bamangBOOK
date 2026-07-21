import Link from 'next/link'
import { BookOpen, Upload, Star, Clock, ChevronRight, FileText, Lightbulb, Quote } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'

const books = [
  {
    id: 1,
    title: '穷查理宝典',
    author: '彼得·考夫曼',
    cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=book%20cover%20of%20Poor%20Charlies%20Almanack%20investment%20wisdom&image_size=square',
    rating: 4.9,
    readTime: '2小时',
    keyPoints: ['多元思维框架', '逆向思维', '人类误判心理学'],
    chapters: 12,
  },
  {
    id: 2,
    title: '聪明的投资者',
    author: '本杰明·格雷厄姆',
    cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=book%20cover%20of%20The%20Intelligent%20Investor%20value%20investment&image_size=square',
    rating: 4.8,
    readTime: '3小时',
    keyPoints: ['内在价值', '安全边际', '市场先生'],
    chapters: 20,
  },
  {
    id: 3,
    title: '巴菲特之道',
    author: '罗伯特·哈格斯特朗',
    cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=book%20cover%20of%20The%20Warren%20Buffett%20Way%20investment&image_size=square',
    rating: 4.7,
    readTime: '2.5小时',
    keyPoints: ['护城河', '资本配置', '长期持有'],
    chapters: 15,
  },
  {
    id: 4,
    title: '滚雪球',
    author: '艾丽斯·施罗德',
    cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=book%20cover%20of%20The%20Snowball%20Warren%20Buffett%20biography&image_size=square',
    rating: 4.8,
    readTime: '4小时',
    keyPoints: ['复利', '人生选择', '财富积累'],
    chapters: 25,
  },
  {
    id: 5,
    title: '竞争优势',
    author: '迈克尔·波特',
    cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=book%20cover%20of%20Competitive%20Advantage%20business%20strategy&image_size=square',
    rating: 4.6,
    readTime: '3小时',
    keyPoints: ['五力模型', '竞争战略', '价值链'],
    chapters: 18,
  },
  {
    id: 6,
    title: '投资最重要的事',
    author: '霍华德·马克斯',
    cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=book%20cover%20of%20The%20Most%20Important%20Thing%20investing&image_size=square',
    rating: 4.7,
    readTime: '2小时',
    keyPoints: ['第二层思维', '风险控制', '周期'],
    chapters: 12,
  },
]

const benefits = [
  {
    icon: FileText,
    title: '结构化拆解',
    description: '核心观点、案例分析、金句摘录、深度思考',
  },
  {
    icon: Lightbulb,
    title: 'AI深度解读',
    description: '智能提炼精华，节省80%阅读时间',
  },
  {
    icon: Quote,
    title: '知识关联',
    description: '与股东信、投资概念相互链接',
  },
]

export default function BooksPage() {
  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-white border-b border-primary/10 -mx-4 -mt-8 md:-mt-12 mb-8">
        <div className="px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-primary font-medium">拆书专栏</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">深度拆书</h1>
          <p className="text-gray-600">
            AI驱动的书籍拆解，提炼核心观点，建立知识关联，让阅读更高效
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-gray-50 rounded-xl p-4 text-center"
            >
              <benefit.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="font-semibold text-gray-900">{benefit.title}</div>
              <div className="text-sm text-gray-500 mt-1">{benefit.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <StatBadge icon={<BookOpen className="w-6 h-6 text-primary" />} count="16" label="已拆解书籍" />
        <StatBadge icon={<FileText className="w-6 h-6 text-primary" />} count="200+" label="核心要点" />
        <StatBadge icon={<Quote className="w-6 h-6 text-primary" />} count="50+" label="知识关联" />
      </div>

      {/* Books Grid */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">已拆解书籍</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/detail/${book.id}`}
              className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 rounded-lg text-sm font-medium">
                  {book.rating}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-dark transition-colors">
                  {book.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{book.author}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {book.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {book.chapters} 章
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {book.keyPoints.map((point) => (
                    <span
                      key={point}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upload Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl">上传你的书籍</h3>
            <p className="text-white/80 text-sm mt-1">
              上传 PDF 或 TXT，AI 将按结构化模板拆解
            </p>
          </div>
        </div>
        <p className="text-white/80 mb-6">
          拆解内容包括：核心观点提炼、经典案例分析、金句摘录、深度思考问题
        </p>
        <button className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors">
          选择文件上传
        </button>
      </section>

      <PageFooter />
    </PageContainer>
  )
}
