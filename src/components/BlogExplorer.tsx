'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import MarkdownContent from '@/components/MarkdownContent'
import { fetchBlogContent, fetchBlogIndex, type BlogContent, type BlogIndex, type BlogIndexItem } from '@/lib/blog-index'

const PAGE_SIZE = 20

type SortKey = 'newest' | 'oldest'

function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="加载中"
    />
  )
}

export interface BlogExplorerProps {
  /** 构建期由服务端读入的索引；为空时组件在挂载后自行 fetch（兼容 dev 未预生成场景）。 */
  initialIndex?: BlogIndex | null
}

export default function BlogExplorer({ initialIndex = null }: BlogExplorerProps) {
  const [index, setIndex] = useState<BlogIndex | null>(initialIndex)
  const [loadError, setLoadError] = useState<string | null>(null)

  // —— 筛选状态 ——
  const [year, setYear] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  // —— 分页 / 展开状态 ——
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [contents, setContents] = useState<Record<string, BlogContent>>({})
  const [contentError, setContentError] = useState<Record<string, string>>({})
  const [loadingSlugs, setLoadingSlugs] = useState<Set<string>>(new Set())
  const abortRef = useRef<Record<string, AbortController>>({})

  // 缺失索引时（dev 未预生成）挂载后自行拉取
  useEffect(() => {
    if (initialIndex) return
    let cancelled = false
    fetchBlogIndex()
      .then((idx) => { if (!cancelled) setIndex(idx) })
      .catch((e) => { if (!cancelled) setLoadError(String(e?.message || e)) })
    return () => { cancelled = true }
  }, [initialIndex])

  const items = useMemo(() => index?.items ?? [], [index])
  const yearStats = useMemo(() => index?.years ?? [], [index])

  // —— 过滤 + 排序 ——
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = items
    if (year !== 'all') list = list.filter((i) => (i.year || '未知') === year)
    if (q) {
      list = list.filter(
        (i) =>
          (i.title || '').toLowerCase().includes(q) ||
          (i.summary || '').toLowerCase().includes(q) ||
          (i.date || '').includes(q),
      )
    }
    if (from) list = list.filter((i) => (i.date || '') >= from)
    if (to) list = list.filter((i) => (i.date || '') <= to)
    const sorted = [...list].sort((a, b) => {
      const ka = a.date || ''
      const kb = b.date || ''
      return sort === 'newest' ? kb.localeCompare(ka) : ka.localeCompare(kb)
    })
    return sorted
  }, [items, year, query, from, to, sort])

  // 任一筛选项变化时回到第一页
  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [year, query, from, to, sort])

  const visibleItems = useMemo(() => filtered.slice(0, visible), [filtered, visible])
  const hasMore = visible < filtered.length

  // —— 无限滚动：sentinel 进入视口即加载下一页 ——
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, filtered.length])

  // —— 按需加载单篇全文 ——
  const loadContent = useCallback(
    (slug: string) => {
      if (contents[slug] || loadingSlugs.has(slug)) return
      const ac = new AbortController()
      abortRef.current[slug] = ac
      setLoadingSlugs((prev) => new Set(prev).add(slug))
      fetchBlogContent(slug, ac.signal)
        .then((c) => setContents((prev) => ({ ...prev, [slug]: c })))
        .catch((e) => {
          if (!ac.signal.aborted) setContentError((prev) => ({ ...prev, [slug]: String(e?.message || e) }))
        })
        .finally(() =>
          setLoadingSlugs((prev) => {
            const n = new Set(prev)
            n.delete(slug)
            return n
          }),
        )
    },
    [contents, loadingSlugs],
  )

  const toggleExpand = useCallback(
    (slug: string) => {
      setExpanded((prev) => {
        const n = new Set(prev)
        if (n.has(slug)) {
          n.delete(slug)
        } else {
          n.add(slug)
          loadContent(slug)
        }
        return n
      })
    },
    [loadContent],
  )

  // 卸载时取消进行中的请求
  useEffect(() => {
    const map = abortRef.current
    return () => {
      Object.values(map).forEach((ac) => ac.abort())
    }
  }, [])

  const resetFilters = () => {
    setYear('all')
    setQuery('')
    setFrom('')
    setTo('')
    setSort('newest')
  }

  const yearTabs: { key: string; label: string; count: number }[] = useMemo(() => {
    const all = { key: 'all', label: '全部', count: items.length }
    const rest = yearStats.map((y) => ({ key: y.year, label: y.year, count: y.count }))
    return [all, ...rest]
  }, [yearStats, items.length])

  if (!index && !loadError) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-text-muted dark:text-dark-muted">
        <Spinner className="text-primary" />
        <span>正在加载博客索引…</span>
      </div>
    )
  }
  if (loadError) {
    return (
      <div className="rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        索引加载失败：{loadError}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* —— 年份导航：桌面侧栏（sticky）/ 移动端横向标签页 —— */}
      <aside className="lg:w-56 lg:shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
          {yearTabs.map((t) => {
            const active = year === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setYear(t.key)}
                className={`flex shrink-0 items-center justify-between gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors lg:rounded-lg lg:justify-start ${
                  active
                    ? 'bg-primary text-white dark:bg-primary-light dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-pressed={active}
              >
                <span>{t.label}</span>
                <span
                  className={`text-xs ${active ? 'text-white/80 dark:text-gray-900/70' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* —— 主区：搜索 / 筛选 / 列表 —— */}
      <main className="min-w-0 flex-1">
        {/* 搜索与筛选栏 */}
        <div className="mb-5 rounded-card border border-gray-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索标题或摘要关键词…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:bg-white dark:border-dark-border dark:bg-gray-800 dark:text-dark-text dark:focus:bg-gray-900"
                aria-label="搜索博文"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-text outline-none focus:border-primary dark:border-dark-border dark:bg-gray-800 dark:text-dark-text"
                aria-label="排序方式"
              >
                <option value="newest">最新优先</option>
                <option value="oldest">最早优先</option>
              </select>
              {(year !== 'all' || query || from || to) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-text-muted transition-colors hover:border-primary hover:text-primary dark:border-dark-border dark:text-dark-muted dark:hover:text-primary-light"
                >
                  清除
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted dark:text-dark-muted">
            <span>日期：</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-text dark:border-dark-border dark:bg-gray-800 dark:text-dark-text"
              aria-label="起始日期"
            />
            <span>至</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-text dark:border-dark-border dark:bg-gray-800 dark:text-dark-text"
              aria-label="结束日期"
            />
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-3 text-sm text-text-muted dark:text-dark-muted">
          共 <span className="font-semibold text-text dark:text-dark-text">{filtered.length}</span> 篇
          {filtered.length !== visibleItems.length && (
            <span> · 已显示 {visibleItems.length} 篇</span>
          )}
        </div>

        {/* 列表 */}
        {visibleItems.length === 0 ? (
          <div className="rounded-card border border-dashed border-gray-200 p-10 text-center text-sm text-text-muted dark:border-dark-border dark:text-dark-muted">
            没有符合条件的博文，试试调整年份、关键词或日期范围。
          </div>
        ) : (
          <div className="space-y-3">
            {visibleItems.map((item) => (
              <BlogCard
                key={item.slug}
                item={item}
                expanded={expanded.has(item.slug)}
                loading={loadingSlugs.has(item.slug)}
                content={contents[item.slug]}
                error={contentError[item.slug]}
                onToggle={() => toggleExpand(item.slug)}
              />
            ))}
          </div>
        )}

        {/* 无限滚动哨兵 + 兜底按钮 */}
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <button
              type="button"
              onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length))}
              className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-text-muted transition-colors hover:border-primary hover:text-primary dark:border-dark-border dark:text-dark-muted dark:hover:text-primary-light"
            >
              加载更多（剩余 {filtered.length - visibleItems.length} 篇）
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function BlogCard({
  item,
  expanded,
  loading,
  content,
  error,
  onToggle,
}: {
  item: BlogIndexItem
  expanded: boolean
  loading: boolean
  content?: BlogContent
  error?: string
  onToggle: () => void
}) {
  return (
    <article className="rounded-card border border-gray-100 bg-white transition-all hover:border-primary/40 dark:border-dark-border dark:bg-dark-card dark:hover:border-primary-light/40">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(item.year || item.date) && (
            <span className="text-sm font-medium text-primary dark:text-primary-light">
              {item.date?.slice(0, 10) || item.year}
            </span>
          )}
          <h3 className="text-base font-medium text-text dark:text-dark-text">{item.title}</h3>
        </div>

        <p className="mt-1.5 text-sm leading-relaxed text-text-muted dark:text-dark-muted">
          {item.summary || '（无摘要）'}
        </p>

        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline dark:text-primary-light"
          >
            {loading ? (
              <>
                <Spinner className="text-primary dark:text-primary-light" /> 加载全文…
              </>
            ) : expanded ? (
              <>收起 ▲</>
            ) : (
              <>展开全文 ▼</>
            )}
          </button>
          <Link
            href={`/duanyongping/blog/${encodeURIComponent(item.slug)}`}
            className="text-xs text-text-muted transition-colors hover:text-primary hover:underline dark:text-dark-muted dark:hover:text-primary-light"
          >
            独立阅读页 ↗
          </Link>
          {item.duanCommentCount && (
            <span className="text-xs text-text-muted dark:text-dark-muted">
              段永平回复 {item.duanCommentCount} 条
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-5 pt-4 dark:border-dark-border">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">全文加载失败：{error}</p>
          ) : content ? (
            <MarkdownContent content={content.content} className="text-sm leading-relaxed" />
          ) : (
            <div className="flex items-center gap-2 py-4 text-sm text-text-muted dark:text-dark-muted">
              <Spinner className="text-primary" /> 正在加载全文…
            </div>
          )}
        </div>
      )}
    </article>
  )
}
