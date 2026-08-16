'use client'

import Link from 'next/link'
import {
  type LucideIcon,
  Lightbulb,
  Building2,
  User,
  FileText,
  Users,
  PenLine,
  HelpCircle,
  Mic,
  BookOpen,
  Brain,
  Landmark,
  ClipboardList,
  Search,
} from 'lucide-react'

interface SearchResult {
  name: string
  type: 'concept' | 'company' | 'person' | 'letter' | 'partnership' | 'article' | 'qa' | 'talk' | 'interview' | 'blogger' | 'book' | 'column' | 'model' | 'meeting' | 'faq'
  description: string
  count: number
  years: number[]
  url: string
}

interface SearchResultsProps {
  query: string
  results: SearchResult[]
  total: number
  isLoading: boolean
}

const typeLabels: Record<string, string> = {
  concept: '概念',
  company: '公司',
  person: '人物',
  letter: '信件',
  partnership: '合伙人信',
  article: '文章',
  qa: '问答',
  talk: '演讲',
  interview: '访谈',
  blogger: '博主文章',
  book: '拆书',
  column: '专栏',
  model: '思维模型',
  meeting: '股东大会实录',
  faq: '主题问答',
}

// B-06：内容角色 —— 让用户分清「主理人写的文章」和「归档资料」
const roleOf: Record<string, string> = {
  article: '博客',
  column: '博客',
  book: '博客',
  model: '博客',
  concept: '概念',
  company: '公司',
  person: '人物',
  letter: '原典',
  partnership: '原典',
  qa: '原典',
  talk: '原典',
  interview: '原典',
  meeting: '原典',
  faq: '原典',
  blogger: '外部资料',
}

const roleLabels: Record<string, string> = {
  博客: '博客',
  原典: '原典',
  公司: '公司',
  概念: '概念',
  人物: '人物',
  外部资料: '外部资料',
}

const roleStyles: Record<string, string> = {
  博客: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  原典: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  公司: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  概念: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  人物: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  外部资料: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

const typeIcons: Record<string, LucideIcon> = {
  concept: Lightbulb,
  company: Building2,
  person: User,
  letter: FileText,
  partnership: Users,
  article: PenLine,
  qa: HelpCircle,
  talk: Mic,
  interview: Mic,
  blogger: BookOpen,
  book: BookOpen,
  column: PenLine,
  model: Brain,
  meeting: Landmark,
  faq: ClipboardList,
}

const typeColors: Record<string, string> = {
  concept: 'border-primary/20 hover:border-primary/45',
  company: 'border-primary/20 hover:border-primary/45',
  person: 'border-primary/20 hover:border-primary/45',
  letter: 'border-primary/20 hover:border-primary/45',
  partnership: 'border-primary/20 hover:border-primary/45',
  article: 'border-primary/20 hover:border-primary/45',
  qa: 'border-primary/20 hover:border-primary/45',
  talk: 'border-primary/20 hover:border-primary/45',
  interview: 'border-primary/20 hover:border-primary/45',
  blogger: 'border-primary/20 hover:border-primary/45',
  book: 'border-primary/20 hover:border-primary/45',
  column: 'border-primary/20 hover:border-primary/45',
  model: 'border-primary/20 hover:border-primary/45',
  meeting: 'border-primary/20 hover:border-primary/45',
  faq: 'border-primary/20 hover:border-primary/45',
}

const sectionColors: Record<string, string> = {
  concept: 'text-primary dark:text-primary-light',
  company: 'text-primary dark:text-primary-light',
  person: 'text-primary dark:text-primary-light',
  letter: 'text-primary dark:text-primary-light',
  partnership: 'text-primary dark:text-primary-light',
  article: 'text-primary dark:text-primary-light',
  qa: 'text-primary dark:text-primary-light',
  talk: 'text-primary dark:text-primary-light',
  interview: 'text-primary dark:text-primary-light',
  blogger: 'text-primary dark:text-primary-light',
  book: 'text-primary dark:text-primary-light',
  column: 'text-primary dark:text-primary-light',
  model: 'text-primary dark:text-primary-light',
  meeting: 'text-primary dark:text-primary-light',
  faq: 'text-primary dark:text-primary-light',
}

const sectionBg: Record<string, string> = {
  concept: 'bg-primary/5 dark:bg-primary/20',
  company: 'bg-primary/5 dark:bg-primary/20',
  person: 'bg-primary/5 dark:bg-primary/20',
  letter: 'bg-primary/5 dark:bg-primary/20',
  partnership: 'bg-primary/5 dark:bg-primary/20',
  article: 'bg-primary/5 dark:bg-primary/20',
  qa: 'bg-primary/5 dark:bg-primary/20',
  talk: 'bg-primary/5 dark:bg-primary/20',
  interview: 'bg-primary/5 dark:bg-primary/20',
  blogger: 'bg-primary/5 dark:bg-primary/20',
  book: 'bg-primary/5 dark:bg-primary/20',
  column: 'bg-primary/5 dark:bg-primary/20',
  model: 'bg-primary/5 dark:bg-primary/20',
}

// 高亮匹配关键词
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  const parts = text.split(regex)
  const normalizedQuery = query.toLocaleLowerCase()

  return (
    <>
      {parts.map((part, i) =>
        part.toLocaleLowerCase() === normalizedQuery ? (
          <mark key={i} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export default function SearchResults({ query, results, total, isLoading }: SearchResultsProps) {
  // 按类型分组
  const grouped = {
    concept: results.filter(r => r.type === 'concept'),
    company: results.filter(r => r.type === 'company'),
    person: results.filter(r => r.type === 'person'),
    letter: results.filter(r => r.type === 'letter'),
    partnership: results.filter(r => r.type === 'partnership'),
    article: results.filter(r => r.type === 'article'),
    qa: results.filter(r => r.type === 'qa'),
    talk: results.filter(r => r.type === 'talk'),
    interview: results.filter(r => r.type === 'interview'),
    blogger: results.filter(r => r.type === 'blogger'),
    book: results.filter(r => r.type === 'book'),
    column: results.filter(r => r.type === 'column'),
    model: results.filter(r => r.type === 'model'),
    meeting: results.filter(r => r.type === 'meeting'),
    faq: results.filter(r => r.type === 'faq'),
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="animate-spin h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">搜索中...</p>
      </div>
    )
  }

  // 无搜索词：引导空态（优先于空结果判断，避免空查询被误判为“搜索失败”）
  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpen className="w-12 h-12 mb-4 text-primary/40 dark:text-primary-light/40" strokeWidth={1.25} />
        <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
          搜索「复利书房」全部内容
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          输入关键词搜索信件、问答、演讲、概念或公司，回到具体原文和研究材料
        </p>
      </div>
    )
  }

  // 空结果：真实无结果
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Search className="w-12 h-12 mb-4 text-primary/40 dark:text-primary-light/40" strokeWidth={1.25} />
        <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
          未找到相关结果
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          抱歉，没有找到与「{query.trim()}」相关的内容。请尝试其他关键词，如{'\u201C'}复利{'\u201D'}、{'\u201C'}可口可乐{'\u201D'}、{'\u201C'}巴菲特{'\u201D'}等。
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* 搜索结果统计 */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          搜索「<span className="font-medium text-text dark:text-dark-text">{query}</span>」共找到
          <span className="font-semibold text-primary"> {total} </span>条结果
        </p>
      </div>

      {/* 按分类展示结果（B-06 排序：博客 → 实体 → 原典 → 研究 → 外部资料） */}
      <div className="space-y-8">
        {(['column', 'article', 'book', 'model', 'concept', 'company', 'person', 'letter', 'partnership', 'qa', 'talk', 'interview', 'blogger'] as const).map(type => {
          const items = grouped[type]
          if (items.length === 0) return null
          const Icon = typeIcons[type]

          return (
            <section key={type}>
              <h2 className={`text-lg font-semibold ${sectionColors[type]} mb-3 flex items-center gap-2`}>
                {Icon && <Icon className="w-4 h-4" strokeWidth={1.75} />}
                <span>{typeLabels[type]}</span>
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({items.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={`block bg-white dark:bg-dark-card border ${typeColors[type]} rounded-lg p-4 hover:shadow-sm dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-text dark:text-dark-text">
                            {highlightMatch(item.name, query)}
                          </h3>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${sectionBg[type]} ${sectionColors[type]} flex-shrink-0`}>
                            {typeLabels[type]}
                          </span>
                          {roleOf[item.type] && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${roleStyles[roleOf[item.type]]}`}>
                              {roleLabels[roleOf[item.type]]}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {highlightMatch(item.description, query)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {(item.type === 'concept' || item.type === 'company' || item.type === 'person') ? (
                          <>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              提及 {item.count} 次
                            </span>
                            {item.years.length > 0 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                跨 {item.years[0]}-{item.years[item.years.length - 1]}
                              </span>
                            )}
                          </>
                        ) : item.years.length > 0 ? (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {item.years[0]}年
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
