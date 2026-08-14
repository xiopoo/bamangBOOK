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

// 导航结构（阅读优先）：
//   人物    —— 按人读原典的总入口（每个人的资料从对应人物页进入）
//   原典    —— 按载体读：信件 / 问答 / 演讲与访谈（穷查理宝典、Wesco 等从芒格页进入）
//   研究    —— 本站对原典的解读：公司研究、投资概念、思维模型
//   延伸阅读 —— 衍生内容与外部文章：拆书、专栏、博主文章、中文文章，及全站总入口
const navGroups: { label: string; activePrefixes: string[]; sections: NavSection[] }[] = [
  {
    label: '人物',
    activePrefixes: ['/buffett', '/munger', '/duanyongping', '/people'],
    sections: [
      { links: [
        { href: '/buffett', label: '巴菲特', meta: '信件、问答、演讲与访谈' },
        { href: '/munger', label: '芒格', meta: '演讲、Wesco、穷查理宝典与思维模型' },
        { href: '/duanyongping', label: '段永平', meta: '博客、问答、演讲与访谈' },
        { href: '/people', label: '人物索引', meta: '按人物查找全部内容' },
      ] },
    ],
  },
  {
    label: '原典',
    activePrefixes: ['/letters', '/partnership', '/qa', '/meetings', '/buffett-faq', '/talks', '/interviews', '/munger/archive'],
    sections: [
      { title: '信件', links: [
        { href: '/letters', label: '股东信', meta: '1965—至今' },
        { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
      ] },
      { title: '问答', links: [
        { href: '/qa', label: '股东大会问答', meta: '中文整理' },
        { href: '/meetings', label: '英文原档', meta: '年会实录' },
        { href: '/buffett-faq', label: '主题问答', meta: '媒体与座谈' },
      ] },
      { title: '演讲与访谈', links: [
        { href: '/talks', label: '演讲', meta: '公开表达' },
        { href: '/interviews', label: '访谈', meta: '对话实录' },
        { href: '/munger/archive', label: '芒格影音', meta: '录音与录像' },
      ] },
    ],
  },
  {
    label: '研究',
    activePrefixes: ['/business-history', '/companies', '/concepts', '/model'],
    sections: [
      { links: [
        { href: '/business-history', label: '公司研究', meta: '经营、护城河与资本配置' },
        { href: '/companies', label: '公司索引', meta: '按公司查找' },
        { href: '/business-history/themes', label: '商业主题', meta: '从行业与商业史进入' },
        { href: '/concepts', label: '投资概念', meta: '概念索引' },
        { href: '/model', label: '思维模型', meta: '跨学科思维工具' },
      ] },
    ],
  },
  {
    label: '延伸阅读',
    activePrefixes: ['/books', '/columns', '/bloggers', '/articles', '/reading'],
    sections: [
      { links: [
        { href: '/books', label: '拆书', meta: '经典书籍拆解' },
        { href: '/columns', label: '专栏', meta: '系列文章' },
        { href: '/bloggers', label: '博主文章', meta: '外部优质文章' },
        { href: '/articles', label: '中文文章', meta: '本站整理' },
        { href: '/reading', label: '阅读总库', meta: '全站入口' },
      ] },
    ],
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
          return <div key={group.label} className="archive-nav__group" onMouseEnter={() => setOpenGroup(group.label)} onMouseLeave={() => setOpenGroup(null)}>
            <button type="button" className={`archive-nav__trigger ${active(group.activePrefixes) ? 'is-active' : ''}`} aria-expanded={isOpen} aria-haspopup="true" aria-controls={`nav-dropdown-${group.label}`} onClick={() => setOpenGroup(isOpen ? null : group.label)}>
              {group.label}<ChevronDown size={14} aria-hidden="true" />
            </button>
            {isOpen && <div id={`nav-dropdown-${group.label}`} className="archive-dropdown">
              {group.sections.map(section => (
                <div key={section.title || group.label} className="archive-dropdown__section">
                  {section.title && <p className="archive-dropdown__section-title">{section.title}</p>}
                  <div className="archive-dropdown__links">{section.links.map(link => <Link key={`${group.label}-${link.href}-${link.label}`} href={link.href}><span>{link.label}</span><small>{link.meta}</small></Link>)}</div>
                </div>
              ))}
            </div>}
          </div>
        })}
        <Link href="/about" className={pathname.startsWith('/about') ? 'is-active' : ''}>关于</Link>
      </nav>
      <div className="archive-masthead__tools">
        <Link href="/search" className="archive-tool" aria-label="全站搜索"><Search size={18} /><span>搜索</span></Link>
        <button type="button" className="archive-tool archive-tool--icon" onClick={toggleTheme} aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button ref={menuButtonRef} type="button" className="archive-menu-toggle" onClick={() => setMobileOpen(value => !value)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </div>
    {mobileOpen && <div id="mobile-navigation" className="archive-mobile-menu"><Link href="/search" className="archive-mobile-menu__search"><Search size={17} />搜索人物、公司、年份或概念</Link><div className="archive-mobile-menu__grid">{navGroups.map(group => <section key={group.label}><p>{group.label}</p>{group.sections.map(section => <div key={section.title || group.label} className="archive-mobile-menu__section">{section.title && <small className="archive-mobile-menu__section-title">{section.title}</small>}{section.links.map(link => <Link key={`${group.label}-${link.href}-${link.label}`} href={link.href}><span>{link.label}</span><small>{link.meta}</small></Link>)}</div>)}</section>)}<section><p>关于</p><Link href="/about"><span>关于复利书房</span><small>来源与编辑原则</small></Link></section></div></div>}
  </header>
}
