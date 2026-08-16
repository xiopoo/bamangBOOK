'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'

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
//   类别 —— 按内容类型浏览：股东信、问答、演讲、访谈、著作等（人物维度与类别维度正交）
//   公司研究 —— 深度研究、公司索引与投资概念
//   关于 —— 直接进入站点定位页（无下拉）
const navGroups: NavGroup[] = [
  {
    label: '人物',
    activePrefixes: ['/buffett', '/munger', '/duanyongping', '/people', '/bloggers'],
    sections: [
      { title: '巴菲特', links: [
        { href: '/buffett', label: '沃伦·巴菲特', meta: '信件、问答、演讲与访谈' },
      ] },
      { title: '芒格', links: [
        { href: '/munger', label: '查理·芒格', meta: '演讲、股东大会问答（西科 / 每日期刊）、穷查理宝典与思维模型' },
      ] },
      { title: '段永平', links: [
        { href: '/duanyongping', label: '段永平', meta: '博客、问答、演讲与访谈' },
      ] },
      { title: '博主文章', links: [
        { href: '/bloggers', label: '四位微信博主', meta: '投资写作' },
      ] },
    ],
  },
  {
    label: '类别',
    activePrefixes: ['/letters', '/partnership', '/qa', '/meetings', '/buffett-faq', '/talks', '/interviews', '/poor-charlies-almanack', '/munger/archive', '/munger/wesco', '/munger/daily-journal', '/munger/originals', '/model', '/duanyongping/blog', '/duanyongping/qa', '/duanyongping/talks'],
    sections: [
      { title: '信件与问答', links: [
        { href: '/letters', label: '股东信', meta: '1965—至今' },
        { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
        { href: '/qa', label: '股东大会问答', meta: '中文整理' },
        { href: '/meetings', label: '股东大会实录', meta: '年会实录' },
      ] },
      { title: '演讲与访谈', links: [
        { href: '/talks', label: '演讲', meta: '公开演讲' },
        { href: '/interviews', label: '访谈', meta: '媒体访谈' },
      ] },
      { title: '段永平写作', links: [
        { href: '/duanyongping/blog', label: '网易博客', meta: '投资札记' },
        { href: '/duanyongping/qa', label: '雪球问答', meta: '问答录' },
        { href: '/duanyongping/talks', label: '演讲访谈', meta: '公开表达' },
      ] },
      { title: '芒格著作', links: [
        { href: '/poor-charlies-almanack', label: '穷查理宝典', meta: '《穷查理宝典》' },
        { href: '/model', label: '思维模型', meta: '跨学科思维工具' },
      ] },
    ],
  },
  {
    label: '公司研究',
    activePrefixes: ['/business-history', '/companies', '/concepts'],
    sections: [
      { links: [
        { href: '/business-history', label: '深度研究', meta: '经营、护城河与资本配置' },
        { href: '/companies', label: '公司索引', meta: '按公司查找' },
        { href: '/concepts', label: '投资概念', meta: '概念索引' },
      ] },
    ],
  },
  {
    label: '关于',
    href: '/about',
    activePrefixes: ['/about', '/terms', '/privacy'],
    sections: [],
  },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setOpenGroup(null); setMobileOpen(false) }, [pathname])
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenGroup(null) }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenGroup(null)
      setMobileOpen(value => {
        if (value) requestAnimationFrame(() => menuButtonRef.current?.focus())
        return false
      })
    }
    document.addEventListener('mousedown', outside); document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape) }
  }, [])
  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [mobileOpen])

  if (pathname.startsWith('/checkout') || pathname.startsWith('/payment') || pathname.startsWith('/login')) return null
  const active = (prefixes: string[]) => prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

  return <header ref={headerRef} className="archive-masthead">
    <div className="archive-masthead__inner">
      <Logo />
      <nav className="archive-nav" aria-label="主要栏目">
        {navGroups.map(group => {
          const isOpen = openGroup === group.label
          const activeClass = active(group.activePrefixes) ? 'is-active' : ''
          if (group.href) {
            return <div key={group.label} className="archive-nav__group">
              <Link href={group.href} className={`archive-nav__trigger ${activeClass}`}>{group.label}</Link>
            </div>
          }
          return <div key={group.label} className="archive-nav__group" onMouseEnter={() => setOpenGroup(group.label)} onMouseLeave={() => setOpenGroup(null)}>
            <button type="button" className={`archive-nav__trigger ${activeClass}`} aria-expanded={isOpen} aria-haspopup="true" aria-controls={`nav-dropdown-${group.label}`} onClick={() => setOpenGroup(isOpen ? null : group.label)}>
              {group.label}<ChevronDown size={14} aria-hidden="true" />
            </button>
            {isOpen && <div id={`nav-dropdown-${group.label}`} className={`archive-dropdown${group.label === '类别' ? ' archive-dropdown--inline' : ''}`}>
              {group.sections.map(section => (
                <div key={section.title || group.label} className="archive-dropdown__section">
                  {section.title && <p className="archive-dropdown__section-title">{section.title}</p>}
                  <div className="archive-dropdown__links">{section.links.map(link => <Link key={`${group.label}-${link.href}-${link.label}`} href={link.href}><span>{link.label}</span><small>{link.meta}</small></Link>)}</div>
                </div>
              ))}
            </div>}
          </div>
        })}
      </nav>
      <div className="archive-masthead__tools">
        <Link href="/search" className="archive-tool archive-tool--icon" aria-label="全站搜索"><Search size={18} /></Link>
        <button type="button" className="archive-tool archive-tool--icon" onClick={toggleTheme} aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button ref={menuButtonRef} type="button" className="archive-menu-toggle" onClick={() => setMobileOpen(value => !value)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </div>
    {mobileOpen && <div id="mobile-navigation" className="archive-mobile-menu"><Link href="/search" className="archive-mobile-menu__search"><Search size={17} />搜索人物、公司、年份或概念</Link><div className="archive-mobile-menu__grid">{navGroups.map(group => group.href
      ? <section key={group.label}><Link href={group.href}>{group.label}</Link></section>
      : <section key={group.label}><p>{group.label}</p>{group.sections.map(section => <div key={section.title || group.label} className="archive-mobile-menu__section">{section.title && <small className="archive-mobile-menu__section-title">{section.title}</small>}{section.links.map(link => <Link key={`${group.label}-${link.href}-${link.label}`} href={link.href}><span>{link.label}</span><small>{link.meta}</small></Link>)}</div>)}</section>)}</div><button type="button" onClick={toggleTheme} className="archive-mobile-menu__theme" aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}{theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}</button></div>}
  </header>
}
