'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'
import { openCommandPalette } from './CommandPalette'

interface NavLink {
  href: string
  label: string
  meta?: string
}

interface NavSection {
  title?: string
  links: NavLink[]
}

interface NavGroup {
  label: string
  activePrefixes: string[]
  sections: NavSection[]
  /** 存在时渲染为直接链接（无下拉），如「关于」直接进入 /about */
  href?: string
}

// 导航结构（双维度组织，文章打「人物 + 类别」两套标签，导航即两个浏览维度）：
//   人物 —— 巴菲特 / 芒格 / 段永平 / 博主文章，每人一个专题入口（资料类型在专题内）
//   类别 —— 按内容类型浏览：股东信、问答、演讲、访谈、文章（含公司研究）等（人物维度与类别维度正交）
//   电子书 —— 直接进入精装合订本页（无下拉）
//   关于 —— 直接进入站点定位页（无下拉）
const navGroups: NavGroup[] = [
  {
    label: '人物',
    activePrefixes: ['/buffett', '/munger', '/duanyongping', '/li-ka-shing', '/people', '/bloggers', '/poor-charlies-almanack', '/munger/archive', '/munger/wesco', '/munger/daily-journal', '/munger/originals', '/duanyongping/blog', '/duanyongping/qa', '/duanyongping/talks'],
    sections: [
      { title: '巴菲特', links: [
        { href: '/buffett', label: '巴菲特', meta: '信件、问答、演讲与访谈' },
      ] },
      { title: '芒格', links: [
        { href: '/munger', label: '芒格', meta: '演讲、股东大会问答、穷查理宝典与思维模型' },
      ] },
      { title: '段永平', links: [
        { href: '/duanyongping', label: '段永平', meta: '博客、问答、演讲与访谈' },
      ] },
      { title: '李嘉诚', links: [
        { href: '/li-ka-shing', label: '李嘉诚', meta: '年报、汕大演讲、访谈与业绩会答问' },
      ] },
      { title: '博主文章', links: [
        { href: '/bloggers', label: '博主文章', meta: '四位微信博主投资写作' },
      ] },
    ],
  },
  {
    label: '类别',
    activePrefixes: ['/letters', '/partnership', '/qa', '/meetings', '/talks', '/interviews', '/articles', '/business-history', '/companies', '/concepts', '/buffett-faq', '/model'],
    sections: [
      { title: '股东信', links: [
        { href: '/letters', label: '股东信', meta: '1965—至今' },
      ] },
      { title: '合伙人信', links: [
        { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
      ] },
      { title: '股东大会问答', links: [
        { href: '/qa', label: '中文整理版', meta: '含 Wesco 芒格问答' },
        { href: '/meetings', label: '英文原档', meta: '1994—2026 年会实录' },
      ] },
      { title: '演讲', links: [
        { href: '/talks', label: '演讲', meta: '公开演讲' },
      ] },
      { title: '访谈', links: [
        { href: '/interviews', label: '访谈', meta: '媒体访谈' },
      ] },
      { title: '文章', links: [
        { href: '/articles', label: '专题文章', meta: '巴菲特与芒格专题' },
        { href: '/business-history', label: '经营与资本配置', meta: '公司研究' },
        { href: '/companies', label: '公司索引', meta: '公司档案' },
        { href: '/concepts', label: '概念索引', meta: '护城河 · 能力圈' },
      ] },
    ],
  },
  {
    label: '电子书',
    href: '/bound-edition',
    activePrefixes: ['/bound-edition', '/digital-product-policy'],
    sections: [],
  },
  {
    label: '关于',
    href: '/about',
    activePrefixes: ['/about', '/terms', '/privacy'],
    sections: [],
  },
]

/** 下拉关闭宽限期：鼠标从触发器斜向移进下拉时不会中途关掉（原实现一移开就关，极易误关） */
const HOVER_CLOSE_GRACE = 160

export default function SiteHeader() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>()
  /** 各下拉内的链接引用，供方向键在下拉里移动焦点 */
  const dropdownItemsRef = useRef<Map<string, HTMLAnchorElement[]>>(new Map())

  // —— 路由变化：收起所有浮层 ——
  useEffect(() => {
    setOpenGroup(null)
    setDrawerOpen(false)
  }, [pathname])

  // —— 滚动感知：滚过一屏内的 12px 后压缩头部并加深投影 ——
  // 用 rAF 节流，避免 scroll 事件里直接 setState 造成的每帧重渲染
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12)
        frame = 0
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // —— 点击外部 / Esc 关闭 ——
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenGroup(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenGroup(null)
      setDrawerOpen(prev => {
        if (prev) requestAnimationFrame(() => menuButtonRef.current?.focus())
        return false
      })
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  // —— 抽屉打开时锁滚动（补偿滚动条宽度，避免布局横向跳动）——
  useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    // 焦点移入抽屉，键盘用户才能立刻操作它
    const timer = setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>('button, [href]')?.focus()
    }, 60)
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      clearTimeout(timer)
    }
  }, [drawerOpen])

  // —— 抽屉焦点陷阱：Tab 在抽屉内循环，不会溜到背后的页面 ——
  const onDrawerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return
    const focusables = drawerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href]')
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

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setOpenGroup(null), HOVER_CLOSE_GRACE)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => () => cancelClose(), [cancelClose])

  /** 触发器键盘操作：↓ 打开并进入第一项，Esc 关闭 */
  const onTriggerKeyDown = (event: React.KeyboardEvent, label: string) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpenGroup(label)
      requestAnimationFrame(() => dropdownItemsRef.current.get(label)?.[0]?.focus())
    }
  }

  /** 下拉内方向键上下移动焦点；Esc 回到触发器 */
  const onDropdownKeyDown = (event: React.KeyboardEvent, label: string) => {
    const items = dropdownItemsRef.current.get(label) || []
    if (items.length === 0) return
    const currentIndex = items.indexOf(document.activeElement as HTMLAnchorElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[(currentIndex + 1 + items.length) % items.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      items[(currentIndex - 1 + items.length) % items.length]?.focus()
    } else if (event.key === 'Tab') {
      // Tab 离开下拉即关闭，符合"下拉是临时浮层"的预期
      setOpenGroup(null)
    }
  }

  const registerItem = (label: string, index: number) => (node: HTMLAnchorElement | null) => {
    const list = dropdownItemsRef.current.get(label) || []
    if (node) list[index] = node
    dropdownItemsRef.current.set(label, list.filter(Boolean))
  }

  // 结算/支付/登录流程页隐藏全站导航，避免分散注意力导致流程中断
  if (pathname.startsWith('/checkout') || pathname.startsWith('/payment') || pathname.startsWith('/login')) return null

  const isActive = (prefixes: string[]) =>
    prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

  return (
    <>
      <header ref={headerRef} className="masthead" data-scrolled={scrolled}>
        <div className="masthead__inner">
          <Logo />

          <nav className="masthead__nav" aria-label="主要栏目">
            {navGroups.map(group => {
              const groupActive = isActive(group.activePrefixes)

              // 无下拉的直接链接（电子书 / 关于）
              if (group.href) {
                return (
                  <div key={group.label} className="masthead__group">
                    <Link
                      href={group.href}
                      className="masthead__trigger"
                      data-active={groupActive}
                      aria-current={pathname === group.href ? 'page' : undefined}
                    >
                      {group.label}
                      {/* 当前栏目的下划线用 layoutId 做位移动画，切换栏目时"滑"过去 */}
                      {groupActive && (
                        <motion.span layoutId="nav-underline" className="masthead__underline" />
                      )}
                    </Link>
                  </div>
                )
              }

              const isOpen = openGroup === group.label
              return (
                <div
                  key={group.label}
                  className="masthead__group"
                  onMouseEnter={() => {
                    cancelClose()
                    setOpenGroup(group.label)
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    className="masthead__trigger"
                    data-active={groupActive}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={`nav-dropdown-${group.label}`}
                    onClick={() => setOpenGroup(isOpen ? null : group.label)}
                    onKeyDown={event => onTriggerKeyDown(event, group.label)}
                  >
                    {group.label}
                    <ChevronDown size={14} aria-hidden="true" data-rotated={isOpen} />
                    {groupActive && (
                      <motion.span layoutId="nav-underline" className="masthead__underline" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={`nav-dropdown-${group.label}`}
                        className={`masthead__dropdown${group.label === '类别' ? ' masthead__dropdown--wide masthead__dropdown--right' : ''}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        onKeyDown={event => onDropdownKeyDown(event, group.label)}
                      >
                        {group.sections.map(section => (
                          <div key={section.title || group.label} className="masthead__dropdown-section">
                            {section.title && <p className="masthead__dropdown-title">{section.title}</p>}
                            <div className="masthead__dropdown-links">
                              {section.links.map((link, linkIndex) => (
                                <Link
                                  key={`${group.label}-${link.href}-${link.label}`}
                                  href={link.href}
                                  ref={registerItem(
                                    group.label,
                                    group.sections
                                      .slice(0, group.sections.indexOf(section))
                                      .reduce((sum, s) => sum + s.links.length, 0) + linkIndex
                                  )}
                                  aria-current={pathname === link.href ? 'page' : undefined}
                                >
                                  <span>{link.label}</span>
                                  {link.meta && <small>{link.meta}</small>}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </nav>

          <div className="masthead__tools">
            {/* 搜索：桌面端是带 ⌘K 提示的输入框造型（可发现性远高于一个放大镜图标），
                窄屏退化为图标按钮 */}
            <button type="button" className="masthead__search" onClick={openCommandPalette}>
              <Search size={16} aria-hidden="true" />
              <span className="masthead__search-label">搜索全站</span>
              <kbd className="ui-kbd masthead__search-kbd">⌘K</kbd>
              <span className="ui-sr-only">打开全站搜索，快捷键 Command 或 Control 加 K</span>
            </button>

            <button
              type="button"
              className="masthead__icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
              {/* 图标旋转淡入，让"切换生效了"这件事有明确的视觉确认 */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'grid', placeItems: 'center' }}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              className="masthead__icon-btn masthead__menu-toggle"
              onClick={() => setDrawerOpen(value => !value)}
              aria-expanded={drawerOpen}
              aria-controls="site-drawer"
              aria-label={drawerOpen ? '关闭菜单' : '打开菜单'}
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ===== 移动端抽屉 =====
          改造前是 {mobileOpen && <div>} 的硬切换：没有进出场动画、没有遮罩、
          没有焦点陷阱，且菜单挤在头部下方把内容推下去。
          现在是从右侧滑入的独立浮层 + 半透明遮罩 + 焦点陷阱。 */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="drawer-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              id="site-drawer"
              ref={drawerRef}
              className="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="站点导航"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              onKeyDown={onDrawerKeyDown}
            >
              <div className="drawer__head">
                <p className="drawer__title">目录</p>
                <button
                  type="button"
                  className="masthead__icon-btn"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="关闭菜单"
                >
                  <X size={18} />
                </button>
              </div>

              <button
                type="button"
                className="drawer__search"
                onClick={() => {
                  setDrawerOpen(false)
                  // 等抽屉退场再唤起搜索，避免两个浮层同时占屏
                  setTimeout(openCommandPalette, 180)
                }}
              >
                <Search size={16} aria-hidden="true" />
                搜索人物、公司、年份或概念
              </button>

              <nav className="drawer__nav" aria-label="站点栏目">
                {navGroups.map(group =>
                  group.href ? (
                    <Link
                      key={group.label}
                      href={group.href}
                      className="drawer__solo"
                      data-active={isActive(group.activePrefixes)}
                      aria-current={pathname === group.href ? 'page' : undefined}
                    >
                      {group.label}
                    </Link>
                  ) : (
                    <section key={group.label} className="drawer__group">
                      <p className="drawer__group-title">{group.label}</p>
                      {group.sections.map(section => (
                        <div key={section.title || group.label} className="drawer__section">
                          {section.links.map(link => (
                            <Link
                              key={`${group.label}-${link.href}-${link.label}`}
                              href={link.href}
                              className="drawer__link"
                              data-active={pathname === link.href}
                              aria-current={pathname === link.href ? 'page' : undefined}
                            >
                              <span>{link.label}</span>
                              {link.meta && <small>{link.meta}</small>}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </section>
                  )
                )}
              </nav>

              <button type="button" className="drawer__theme" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
