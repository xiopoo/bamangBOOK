'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'

const navGroups = [
  { label: '原典档案', activePrefixes: ['/reading', '/buffett', '/munger', '/duanyongping', '/letters', '/partnership', '/qa', '/talks', '/interviews', '/poor-charlies-almanack'], links: [
    { href: '/reading', label: '原典总览', meta: '按人物与资料类型进入' },
    { href: '/buffett', label: '巴菲特', meta: '信件、问答、演讲与访谈' },
    { href: '/munger', label: '芒格', meta: '演讲、问答与思维模型' },
    { href: '/duanyongping', label: '段永平', meta: '问答、访谈与公开表达' },
    { href: '/letters', label: '信件', meta: '合伙人信与股东信' },
    { href: '/qa', label: '股东大会问答', meta: '按年份查找' },
    { href: '/talks', label: '演讲与访谈', meta: '按人物和时间浏览' },
  ] },
  { label: '公司研究', activePrefixes: ['/business-history', '/companies'], links: [
    { href: '/business-history', label: '公司研究', meta: '经营、护城河与资本配置' },
    { href: '/companies', label: '公司索引', meta: '按公司查找研究' },
    { href: '/business-history/themes', label: '商业主题', meta: '从行业与商业史进入' },
  ] },
  { label: '阅读路径', activePrefixes: ['/learn', '/model', '/books', '/columns', '/bloggers'], links: [
    { href: '/learn/path', label: '从第一封合伙人信开始', meta: '循序渐进的入口' },
    { href: '/buffett', label: '巴菲特阅读路径', meta: '从信件到企业' },
    { href: '/munger', label: '芒格阅读路径', meta: '从投资到判断' },
    { href: '/duanyongping', label: '段永平阅读路径', meta: '公开表达与实践' },
    { href: '/model', label: '主题阅读', meta: '概念、模型与公司' },
  ] },
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
              <div className="archive-dropdown__links">{group.links.map(link => <Link key={`${group.label}-${link.href}-${link.label}`} href={link.href}><span>{link.label}</span><small>{link.meta}</small></Link>)}</div>
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
    {mobileOpen && <div id="mobile-navigation" className="archive-mobile-menu"><Link href="/search" className="archive-mobile-menu__search"><Search size={17} />搜索人物、公司、年份或概念</Link><div className="archive-mobile-menu__grid">{navGroups.map(group => <section key={group.label}><p>{group.label}</p>{group.links.map(link => <Link key={`${group.label}-${link.href}-${link.label}`} href={link.href}><span>{link.label}</span><small>{link.meta}</small></Link>)}</section>)}<section><p>关于</p><Link href="/about"><span>关于复利书房</span><small>来源与编辑原则</small></Link></section></div></div>}
  </header>
}
