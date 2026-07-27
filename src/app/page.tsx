import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  FileText,
  Handshake,
  Library,
  MessageSquareText,
  Mic2,
  Search,
  StickyNote,
} from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import ColumnNav from '@/components/ColumnNav'
import { getDocuments } from '@/lib/documents'
import { getBloggers } from '@/lib/bloggers'
import { getShareholderLetters } from '@/lib/partnership'

function PrimaryLink({
  href,
  icon,
  title,
  description,
  meta,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  meta: string
}) {
  return (
    <Link
      href={href}
      className="group block border-t border-gray-200 py-5 transition-colors hover:border-primary dark:border-gray-700"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">{title}</h2>
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{meta}</p>
    </Link>
  )
}

function QuietLink({
  href,
  label,
  count,
}: {
  href: string
  label: string
  count: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-gray-200 py-3 text-sm transition-colors hover:border-primary hover:text-primary dark:border-gray-700"
    >
      <span className="font-medium text-gray-800 dark:text-gray-100">{label}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>
    </Link>
  )
}

export default function HomePage() {
  const articleCount = getDocuments('articles').length
  const qaCount = getDocuments('qa').length
  const talkCount = getDocuments('talks').length
  const interviewCount = getDocuments('interviews').length
  const bloggerCount = getBloggers().reduce((sum, blogger) => sum + blogger.count, 0)
  const shareholderYears = getShareholderLetters().map((letter) => letter.year)
  const shareholderYearRange = shareholderYears.length > 0
    ? `${Math.min(...shareholderYears)}-${Math.max(...shareholderYears)}`
    : '1965-'

  return (
    <PageContainer maxWidth="5xl">
      <section className="border-b border-gray-200 pb-10 dark:border-gray-700 md:pb-12">
        <div className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <Library className="h-4 w-4" />
          个人阅读与研究库
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
          小胖书房
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
          先把这里做成一个每天愿意打开的阅读器：安静读原文，随手查资料，把值得反复看的内容沉淀成自己的研究笔记。
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/partnership" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-dark hover:text-white">
            <BookOpen className="h-4 w-4" />
            开始阅读
          </Link>
          <Link href="/search" className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-dark-card dark:text-gray-100">
            <Search className="h-4 w-4" />
            搜索书房
          </Link>
        </div>
      </section>

      <ColumnNav />

      <section className="py-10 md:py-12">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">第一阶段</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">舒服的阅读器</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            这一阶段只保留阅读、搜索和个人研究素材，不再把站点做成展示型数据库。
          </p>
        </div>
        <div className="grid gap-x-8 md:grid-cols-3">
          <PrimaryLink
            href="/partnership"
            icon={<Handshake className="h-5 w-5" />}
            title="巴菲特合伙人信"
            description="按年份读早期投资方法、业绩解释和写给合伙人的真实语气。"
            meta="1956-1970"
          />
          <PrimaryLink
            href="/letters"
            icon={<BookOpen className="h-5 w-5" />}
            title="伯克希尔股东信"
            description="作为长期主义和企业经营的主线阅读材料，保持精校排版。"
            meta={shareholderYearRange}
          />
          <PrimaryLink
            href="/qa"
            icon={<MessageSquareText className="h-5 w-5" />}
            title="股东大会问答"
            description="用问答方式回到具体问题：投资、管理、人生、市场和错误。"
            meta={`${qaCount} 篇`}
          />
        </div>
      </section>

      <section className="grid gap-10 border-y border-gray-200 py-10 dark:border-gray-700 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-medium text-primary">研究素材</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">不抢阅读主线，但随时可查</h2>
          <div className="mt-5">
            <QuietLink href="/talks" label="公开演讲" count={`${talkCount} 篇`} />
            <QuietLink href="/interviews" label="访谈记录" count={`${interviewCount} 篇`} />
            <QuietLink href="/articles" label="研究文章" count={`${articleCount} 篇`} />
            <QuietLink href="/bloggers" label="个人素材库" count={`${bloggerCount.toLocaleString()} 篇`} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-primary">下一步建设</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">让阅读长出自己的笔记</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            <p className="flex gap-3">
              <StickyNote className="mt-1 h-4 w-4 shrink-0 text-primary" />
              每篇文章保留干净正文、目录、上下篇和搜索入口，减少装饰性模块。
            </p>
            <p className="flex gap-3">
              <FileText className="mt-1 h-4 w-4 shrink-0 text-primary" />
              后续再加个人批注、摘录卡片、阅读进度和主题笔记，不急着做商业化页面。
            </p>
            <p className="flex gap-3">
              <Mic2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
              演讲、访谈、问答作为研究材料，服务写作和复盘，不再占据首页主舞台。
            </p>
          </div>
        </div>
      </section>

      <PageFooter />
    </PageContainer>
  )
}
