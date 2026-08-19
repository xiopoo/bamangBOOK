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
import { SkeletonList } from '@/components/ui/Skeleton'

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

// 徽章色调：与 ui.css .ui-badge[data-tone] 一一对应，组件里不写颜色。
// 博客=金 / 原典=赭红 / 实体(公司·概念·人物)=墨 / 外部资料=弱。
const roleTone: Record<string, 'oxblood' | 'gold' | 'ink' | 'muted'> = {
  博客: 'gold',
  原典: 'oxblood',
  公司: 'ink',
  概念: 'ink',
  人物: 'ink',
  外部资料: 'muted',
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

// 分组顺序（B-06：博客 → 实体 → 原典 → 外部资料）。
// 修复旧代码遗漏 meeting/faq 两类导致其实录与主题问答永不展示的问题。
const GROUP_ORDER = [
  'column', 'article', 'book', 'model',
  'concept', 'company', 'person',
  'letter', 'partnership', 'qa', 'talk', 'interview', 'meeting', 'faq',
  'blogger',
] as const

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
          <mark key={i} className="bg-[color-mix(in_srgb,var(--archive-oxblood)_12%,transparent)] text-[var(--archive-oxblood)] rounded-[3px] px-0.5">
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

  // 加载状态 → 骨架屏（替代"转圈"，CLS≈0，且形状与真实结果对齐）
  if (isLoading) {
    return <SkeletonList rows={10} label="搜索结果加载中" />
  }

  // 无搜索词：引导空态（优先于空结果判断，避免空查询被误判为"搜索失败"）
  if (!query.trim()) {
    return (
      <div className="ui-empty">
        <span className="ui-empty__icon">
          <BookOpen size={22} aria-hidden="true" />
        </span>
        <h2 className="ui-empty__title">搜索「复利书房」全部内容</h2>
        <p className="ui-empty__desc">
          输入关键词搜索信件、问答、演讲、概念或公司，回到具体原文和研究材料
        </p>
      </div>
    )
  }

  // 空结果：真实无结果
  if (results.length === 0) {
    return (
      <div className="ui-empty">
        <span className="ui-empty__icon">
          <Search size={22} aria-hidden="true" />
        </span>
        <h2 className="ui-empty__title">未找到相关结果</h2>
        <p className="ui-empty__desc">
          抱歉，没有找到与「{query.trim()}」相关的内容。请尝试其他关键词，如「复利」「可口可乐」「巴菲特」等。
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* 搜索结果统计（aria-live 让屏幕阅读器播报结果数量变化） */}
      <div className="mb-6">
        <p aria-live="polite" className="text-sm text-[var(--archive-ink-soft)]">
          搜索「<span className="font-medium text-[var(--archive-ink)]">{query}</span>」共找到
          <span className="font-semibold text-[var(--archive-oxblood)]"> {total} </span>条结果
        </p>
      </div>

      {/* 按分类展示结果 */}
      <div className="space-y-8">
        {GROUP_ORDER.map(type => {
          const items = grouped[type]
          if (items.length === 0) return null
          const Icon = typeIcons[type]

          return (
            <section key={type}>
              <h2 className="mb-4 flex items-center gap-2 font-serif text-[length:var(--step-1)] font-bold text-[var(--archive-ink)]">
                {Icon && <Icon className="h-4 w-4 text-[var(--archive-gold-deep)]" strokeWidth={1.75} />}
                <span>{typeLabels[type]}</span>
                <span className="text-sm font-normal text-[var(--archive-ink-faint)]">({items.length})</span>
              </h2>
              <div className="ui-card-grid">
                {items.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className="ui-card ui-card--interactive"
                  >
                    {/* 整卡可点：铺满链接，标题是唯一可被聚焦的链接名 */}
                    <span className="ui-card__link-overlay" aria-hidden="true" />
                    {roleOf[item.type] && (
                      <span className="ui-cluster">
                        <span className="ui-badge" data-tone={roleTone[roleOf[item.type]]}>
                          {roleLabels[roleOf[item.type]]}
                        </span>
                      </span>
                    )}
                    <h3 className="ui-card__title">{highlightMatch(item.name, query)}</h3>
                    {item.description && (
                      <p className="ui-card__body">{highlightMatch(item.description, query)}</p>
                    )}
                    <div className="ui-card__meta">
                      {(item.type === 'concept' || item.type === 'company' || item.type === 'person') && (
                        <span>提及 {item.count} 次</span>
                      )}
                      {item.years.length > 0 && (
                        <span>{item.years[0]} 年跨 {item.years[item.years.length - 1]}</span>
                      )}
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
