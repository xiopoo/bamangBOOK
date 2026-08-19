'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  ClipboardList,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  Landmark,
  Lightbulb,
  Loader2,
  Mic,
  PenLine,
  Search,
  User,
  Users,
  X,
} from 'lucide-react'
import { suggestStaticContent, type StaticSearchItem, type StaticSearchItemType } from '@/lib/static-search-client'
import '@/styles/components/command-palette.css'

/** 类型 → 中文标签（与搜索页保持一致的词汇表） */
const TYPE_LABELS: Record<string, string> = {
  concept: '概念',
  company: '公司',
  person: '人物',
  letter: '股东信',
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

const TYPE_ICONS: Record<string, typeof Search> = {
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

/** 空态时给出的高频入口，避免用户对着空输入框发呆 */
const QUICK_LINKS: { href: string; label: string; meta: string }[] = [
  { href: '/buffett', label: '巴菲特', meta: '信件 · 问答 · 演讲' },
  { href: '/munger', label: '芒格', meta: '演讲 · Wesco 问答 · 思维模型' },
  { href: '/duanyongping', label: '段永平', meta: '博客 · 问答 · 公司实践' },
  { href: '/letters', label: '股东信', meta: '1965 年至今，按年连读' },
  { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
  { href: '/business-history', label: '公司研究', meta: '护城河与资本配置' },
]

const RECENT_KEY = 'bamang-recent-queries'
const RECENT_MAX = 5

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string').slice(0, RECENT_MAX) : []
  } catch {
    return []
  }
}

function writeRecent(query: string) {
  try {
    const next = [query, ...readRecent().filter(item => item !== query)].slice(0, RECENT_MAX)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* 隐私模式下 localStorage 不可用，静默降级 */
  }
}

interface FlatRow {
  key: string
  href: string
  label: string
  meta: string
  type?: StaticSearchItemType
  /** 分组标题（仅第一行携带，用于渲染小节表头） */
  groupLabel?: string
}

/**
 * 全站命令面板（⌘K / Ctrl+K / 斜杠键唤起）。
 *
 * 为什么值得做：本站是上万篇文献的档案库，改造前唯一的检索入口是
 * 「点击放大镜 → 跳转 /search 页 → 再输入」，三步才能开始找东西。
 * 命令面板把它压成"随处一个快捷键 → 直接跳到目标文档"，
 * 对高频重读的老用户是数量级的效率差别。
 *
 * 可访问性实现（ARIA 1.2 combobox 模式）：
 *  - 输入框 role=combobox + aria-expanded + aria-controls + aria-activedescendant
 *  - 结果列表 role=listbox，每行 role=option + aria-selected
 *  - 焦点始终留在输入框，用 aria-activedescendant 移动"虚拟焦点"，
 *    这样打字与选择可以同时进行（原生 focus 移动会打断输入）
 *  - 面板 role=dialog + aria-modal，Esc 关闭并把焦点还给唤起它的元素
 *  - Tab 在面板内循环（焦点陷阱），不会漏到背后的页面
 */
export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<StaticSearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [recent, setRecent] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  /** 记录唤起面板前的焦点元素，关闭时归还焦点（键盘用户不会"丢失位置"） */
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // —— 唤起 / 关闭 ——
  const openPalette = useCallback(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    setRecent(readRecent())
    setOpen(true)
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    setQuery('')
    setItems([])
    setActiveIndex(0)
    // 等退场动画结束再归还焦点，避免焦点环在消失的面板上闪一下
    setTimeout(() => restoreFocusRef.current?.focus?.(), 60)
  }, [])

  // —— 全局快捷键：⌘K / Ctrl+K 开关；"/" 在非输入态唤起 ——
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isCmdK) {
        event.preventDefault()
        setOpen(prev => {
          if (prev) return false
          restoreFocusRef.current = document.activeElement as HTMLElement | null
          setRecent(readRecent())
          return true
        })
        return
      }

      if (event.key === '/' && !open) {
        // 用户正在输入框里打字时，"/" 就是普通字符，不能抢走
        const target = event.target as HTMLElement | null
        const tag = target?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
        event.preventDefault()
        openPalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, openPalette])

  // —— 打开时锁滚动 + 聚焦输入框 ——
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    // 补上滚动条宽度，避免锁滚动瞬间页面横向跳动（CLS）
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 40)
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      clearTimeout(focusTimer)
    }
  }, [open])

  // —— 搜索（180ms 防抖，比原先 250ms 更跟手，但仍能避免每键一次索引扫描）——
  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!q) {
      setItems([])
      setLoading(false)
      setActiveIndex(0)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await suggestStaticContent(q, 12)
        setItems(result)
        setActiveIndex(0)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, open])

  // —— 把结果拍平成键盘可遍历的一维行列表，并标注分组表头 ——
  const rows: FlatRow[] = useMemo(() => {
    const q = query.trim()

    if (!q) {
      const recentRows: FlatRow[] = recent.map((item, index) => ({
        key: `recent-${index}`,
        href: `/search?q=${encodeURIComponent(item)}`,
        label: item,
        meta: '最近搜索',
        groupLabel: index === 0 ? '最近搜索' : undefined,
      }))
      const quickRows: FlatRow[] = QUICK_LINKS.map((link, index) => ({
        key: `quick-${link.href}`,
        href: link.href,
        label: link.label,
        meta: link.meta,
        groupLabel: index === 0 ? '快速进入' : undefined,
      }))
      return [...recentRows, ...quickRows]
    }

    // 按类型分组，组的先后顺序沿用得分顺序（首次出现即定序）
    const grouped = new Map<string, StaticSearchItem[]>()
    for (const item of items) {
      const list = grouped.get(item.type) || []
      list.push(item)
      grouped.set(item.type, list)
    }

    const flat: FlatRow[] = []
    for (const [type, list] of grouped) {
      list.forEach((item, index) => {
        flat.push({
          key: `${type}-${item.url}`,
          href: item.url,
          label: item.name,
          meta: item.description || `${item.count} 处提及`,
          type: item.type,
          groupLabel: index === 0 ? TYPE_LABELS[type] || type : undefined,
        })
      })
    }

    // 末行：把当前关键词送到完整搜索页（结果超过 12 条时的出口）
    flat.push({
      key: 'see-all',
      href: `/search?q=${encodeURIComponent(q)}`,
      label: `在全站搜索「${q}」`,
      meta: '查看全部结果与筛选',
      groupLabel: flat.length > 0 ? undefined : '继续搜索',
    })

    return flat
  }, [query, items, recent])

  // —— 选中并跳转 ——
  const commit = useCallback(
    (row: FlatRow) => {
      const q = query.trim()
      if (q) writeRecent(q)
      closePalette()
      router.push(row.href)
    },
    [query, closePalette, router]
  )

  // —— 面板内键盘处理 ——
  const onPanelKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closePalette()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (rows.length === 0) return
      setActiveIndex(prev => {
        const next = event.key === 'ArrowDown' ? prev + 1 : prev - 1
        // 循环选择：到底回到顶部，符合命令面板的普遍预期
        return (next + rows.length) % rows.length
      })
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(Math.max(0, rows.length - 1))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const row = rows[activeIndex]
      if (row) commit(row)
      return
    }

    // 焦点陷阱：面板只有输入框和关闭按钮两个可聚焦点，
    // Tab 一律回到输入框，确保焦点不会溜到背后的页面上
    if (event.key === 'Tab') {
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([disabled]), [href]'
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  // —— 键盘移动虚拟焦点时把当前行滚进可视区 ——
  useEffect(() => {
    if (!open) return
    const activeEl = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open, rows.length])

  return (
    <>
      {/* 触发按钮由 SiteHeader 提供；这里额外暴露一个全局事件入口，
          让页面内任意"搜索"按钮都能唤起面板（见 openCommandPalette 导出） */}
      <PaletteBridge onOpen={openPalette} />

      <AnimatePresence>
        {open && (
          <motion.div
            className="cmdk-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closePalette}
          >
            <motion.div
              ref={panelRef}
              className="cmdk-panel"
              role="dialog"
              aria-modal="true"
              aria-label="全站搜索"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={event => event.stopPropagation()}
              onKeyDown={onPanelKeyDown}
            >
              <div className="cmdk-input-row">
                <Search size={18} className="cmdk-input-row__icon" aria-hidden="true" />
                <input
                  ref={inputRef}
                  className="cmdk-input"
                  type="text"
                  role="combobox"
                  aria-expanded={rows.length > 0}
                  aria-controls="cmdk-listbox"
                  aria-autocomplete="list"
                  aria-activedescendant={rows[activeIndex] ? `cmdk-row-${activeIndex}` : undefined}
                  placeholder="搜索人物、公司、年份、概念或原文…"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                {loading && <Loader2 size={16} className="cmdk-spinner" aria-hidden="true" />}
                <button type="button" className="cmdk-close" onClick={closePalette} aria-label="关闭搜索">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* 结果数变化播报给读屏用户（视觉用户从列表变化即可感知） */}
              <p className="ui-sr-only" role="status" aria-live="polite">
                {query.trim()
                  ? loading
                    ? '正在搜索'
                    : `找到 ${items.length} 条结果`
                  : ''}
              </p>

              <div className="cmdk-list" id="cmdk-listbox" role="listbox" aria-label="搜索结果" ref={listRef}>
                {rows.length === 0 && !loading && (
                  <div className="cmdk-empty">
                    <Compass size={20} aria-hidden="true" />
                    <p>没有匹配「{query.trim()}」的资料</p>
                    <span>试试更短的关键词，或换成人物名、公司名、年份</span>
                  </div>
                )}

                {rows.map((row, index) => {
                  const Icon = row.type ? TYPE_ICONS[row.type] || FileText : row.meta === '最近搜索' ? Clock : Compass
                  const isActive = index === activeIndex
                  return (
                    <div key={row.key}>
                      {row.groupLabel && <p className="cmdk-group">{row.groupLabel}</p>}
                      <button
                        type="button"
                        id={`cmdk-row-${index}`}
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive}
                        className="cmdk-row"
                        // 用 mouseMove 而非 mouseEnter：鼠标静止在某行上时，
                        // 键盘上下移动不会被"鼠标还悬停在原处"强行拽回来
                        onMouseMove={() => setActiveIndex(index)}
                        onClick={() => commit(row)}
                      >
                        <Icon size={16} className="cmdk-row__icon" aria-hidden="true" />
                        <span className="cmdk-row__text">
                          <strong>{row.label}</strong>
                          <small>{row.meta}</small>
                        </span>
                        {row.type && <span className="cmdk-row__type">{TYPE_LABELS[row.type]}</span>}
                        <ArrowRight size={14} className="cmdk-row__arrow" aria-hidden="true" />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="cmdk-footer">
                <span>
                  <kbd className="ui-kbd">↑</kbd>
                  <kbd className="ui-kbd">↓</kbd>
                  选择
                </span>
                <span>
                  <kbd className="ui-kbd">↵</kbd>
                  打开
                </span>
                <span>
                  <kbd className="ui-kbd">esc</kbd>
                  关闭
                </span>
                <span className="cmdk-footer__hint">复利书房 · 全站检索</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * 事件桥：让不方便拿到 React 上下文的地方（如服务端渲染的头部按钮）
 * 通过 window 事件唤起面板。SiteHeader 的搜索按钮走的就是这条路。
 */
function PaletteBridge({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const handler = () => onOpen()
    window.addEventListener('bamang:open-search', handler)
    return () => window.removeEventListener('bamang:open-search', handler)
  }, [onOpen])
  return null
}

/** 任意组件调用即可唤起命令面板 */
export function openCommandPalette() {
  window.dispatchEvent(new Event('bamang:open-search'))
}
