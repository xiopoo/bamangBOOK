import Link from 'next/link'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'

interface IndexItem {
  id: string
  count: number
  years: number[]
}

interface IndexData {
  total: {
    letters: number
    partnership: number
    concepts: number
    people: number
    companies: number
  }
  concepts: IndexItem[]
  people: IndexItem[]
  companies: IndexItem[]
  cooccurrence: Array<{
    concepts: string[]
    count: number
    years: number[]
  }>
}

async function getIndexData(): Promise<IndexData | null> {
  try {
    const indexPath = path.join(process.cwd(), 'content/index.json')
    if (existsSync(indexPath)) {
      const raw = readFileSync(indexPath, 'utf-8')
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return null
}

function StatsCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 text-center">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 dark:text-gray-500">{sub}</div>}
    </div>
  )
}

function ShelfCard({ href, icon, title, desc, highlight }: {
  href: string
  icon: string
  title: string
  desc: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-6 transition-all hover:shadow-lg group block ${
        highlight
          ? 'border-primary/30 bg-primary/[0.03] dark:border-primary/40 dark:bg-primary/[0.06]'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
        {title}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{desc}</div>
    </Link>
  )
}

export default async function HomePage() {
  const index = await getIndexData()
  const totalLetters = (index?.total.letters || 0) + (index?.total.partnership || 0)
  const totalConcepts = index?.concepts?.length || 0
  const totalCompanies = index?.companies?.length || 0
  const totalPeople = index?.people?.length || 0
  const crossLinks = index?.cooccurrence?.reduce((sum, c) => sum + c.count, 0) || 0

  const topConcepts = [...(index?.concepts || [])].sort((a, b) => b.count - a.count).slice(0, 12)
  const topCompanies = [...(index?.companies || [])].sort((a, b) => b.count - a.count).slice(0, 12)

  return (
    <PageContainer maxWidth="6xl">
      {/* Hero */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-primary dark:text-primary-light">价值投资知识库</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 font-serif">
          中文世界最系统的<br className="md:hidden" />价值投资知识库
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
          70年投资智慧，{totalLetters}封亲笔信，{crossLinks.toLocaleString()}+条交叉链接
          <br />
          每个概念、每家公司、每个人物——都能一键溯源到原文
        </p>
      </div>

      {/* 四大入口 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <ShelfCard href="/partnership" icon="📖" title="原文库" desc={`${totalLetters}封信件·1956-2025`} />
        <ShelfCard href="/concepts" icon="🧠" title="知识库" desc={`${totalConcepts}个概念·${totalCompanies}家公司`} />
        <ShelfCard href="/learn" icon="🗺️" title="学习路径" desc="入门→进阶→专题" highlight />
        <ShelfCard href="/graph" icon="🕸️" title="知识图谱" desc={`${(totalConcepts + totalCompanies + totalPeople).toLocaleString()}+节点`} />
      </div>

      {/* 统计数字 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatsCard value={String(totalLetters)} label="封信件" sub="1956-2025 完整收录" />
        <StatsCard value={String(totalConcepts)} label="个概念" sub="投资核心思想" />
        <StatsCard value={String(totalCompanies)} label="家公司" sub="投资案例分析" />
        <StatsCard value={`${index?.people?.length || 0}`} label="位人物" sub="核心人物传记" />
      </div>

      {/* 热门概念 */}
      {topConcepts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 font-serif">热门投资概念</h2>
          <div className="flex flex-wrap gap-2">
            {topConcepts.map(c => (
              <Link
                key={c.id}
                href={`/concepts/${encodeURIComponent(c.id)}`}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors text-sm border border-gray-200 dark:border-gray-700"
              >
                {c.id}
                <span className="text-primary font-medium text-xs">{c.count}</span>
              </Link>
            ))}
            <Link
              href="/concepts"
              className="inline-flex items-center rounded-full px-4 py-1.5 text-sm text-primary hover:bg-primary/5 transition-colors"
            >
              查看全部 →
            </Link>
          </div>
        </div>
      )}

      {/* 热门公司 */}
      {topCompanies.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 font-serif">重要公司</h2>
          <div className="flex flex-wrap gap-2">
            {topCompanies.map(c => (
              <Link
                key={c.id}
                href={`/companies/${encodeURIComponent(c.id)}`}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors text-sm border border-gray-200 dark:border-gray-700"
              >
                {c.id}
                <span className="text-primary font-medium text-xs">{c.count}</span>
              </Link>
            ))}
            <Link
              href="/companies"
              className="inline-flex items-center rounded-full px-4 py-1.5 text-sm text-primary hover:bg-primary/5 transition-colors"
            >
              查看全部 →
            </Link>
          </div>
        </div>
      )}

      {/* 快速入口 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <ShelfCard href="/partnership" icon="🤝" title="合伙人信" desc="1956-1970 合伙基金时期" />
        <ShelfCard href="/letters" icon="✉️" title="股东信" desc="1965-2024 每年一封" />
        <ShelfCard href="/qa" icon="💬" title="股东大会问答" desc="52篇问答实录" />
        <ShelfCard href="/interviews" icon="🎙️" title="访谈" desc="40篇媒体专访" />
        <ShelfCard href="/articles" icon="📝" title="深度文章" desc="78篇·9大专题分类" />
        <ShelfCard href="/talks" icon="🎤" title="演讲集" desc="22篇公开演讲" />
        <ShelfCard href="/people" icon="👤" title="人物档案" desc="10位核心人物" />
        <ShelfCard href="/concepts" icon="💡" title="投资概念" desc="35个核心概念" />
      </div>

      <PageFooter />
    </PageContainer>
  )
}
