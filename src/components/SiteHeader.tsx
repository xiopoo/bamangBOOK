'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'

const navGroups = [
  {
    label: '内容',
    description: '信件、问答、演讲与文章',
    activePrefixes: [
      '/reading',
      '/partnership',
      '/letters',
      '/qa',
      '/talks',
      '/interviews',
      '/articles',
      '/columns',
      '/books',
      '/poor-charlies-almanack',
    ],
    links: [
      { href: '/reading', label: '全部内容', meta: '按人物和类型浏览' },
      { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
      { href: '/letters', label: '伯克希尔股东信', meta: '1965—至今' },
      { href: '/qa', label: '股东大会与问答', meta: '现场记录' },
      { href: '/talks', label: '演讲', meta: '公开表达' },
      { href: '/interviews', label: '访谈', meta: '对话记录' },
      { href: '/articles', label: '文章与文集', meta: '长期写作' },
      { href: '/poor-charlies-almanack', label: '《穷查理宝典》', meta: '芒格演讲与文章' },
    ],
  },
  {
    label: '人物',
    description: '巴菲特与芒格的第一手资料',
    activePrefixes: ['/buffett', '/munger'],
    links: [
      { href: '/buffett', label: '巴菲特', meta: '人物主页' },
      { href: '/munger', label: '芒格', meta: '人物主页' },
    ],
  },
  {
    label: '研究',
    description: '公司深度研究与思维模型',
    activePrefixes: ['/business-history', '/model'],
    links: [
      { href: '/business-history', label: '公司深度研究', meta: '经营与资本配置' },
      { href: '/model', label: '多元思维模型', meta: '跨学科工具' },
    ],
  },
  {
    label: '索引',
    description: '按概念、公司、人物查找',
    activePrefixes: ['/concepts', '/companies', '/people'],
    links: [
      { href: '/concepts', label: '概念索引', meta: '投资概念' },
      { href: '/companies', label: '公司索引', meta: '按公司查找' },
      { href: '/people', label: '人物索引', meta: '按人物查找' },
    ],
  },
]

const directLinks = [
  { href: '/bound-edition', label: '合订本' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setOpenGroup(null)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenGroup(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const isGroupActive = (prefixes: string[]) =>
    prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (pathname.startsWith('/checkout') || pathname.startsWith('/payment') || pathname.startsWith('/login')) {
    return null
  }

  return (
    <header ref={headerRef} className="archive-masthead">
      <div className="archive-masthead__inner">
        <Logo />
        <nav className="archive-nav" aria-label="主要栏目">
          {navGroups.map(group => {
            const isOpen = openGroup === group.label
            return (
              <div
                key={group.label}
                className="archive-nav__group"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  type="button"
                  className={`archive-nav__trigger ${isGroupActive(group.activePrefixes) ? 'is-active' : ''}`}
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                >
                  {group.label}<ChevronDown size={14} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="archive-dropdown">
                    <div className="archive-dropdown__intro">
                      <span>{group.label}</span>
                      <p>{group.description}</p>
                    </div>
                    <div className="archive-dropdown__links">
                      {group.links.map(link => (
                        <Link key={`${group.label}-${link.href}`} href={link.href}>
                          <span>{link.label}</span><small>{link.meta}</small>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {directLinks.map(link => (
            <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? 'is-active' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="archive-masthead__tools">
          <Link href="/search" className="archive-tool" aria-label="全站搜索">
            <Search size={18} /><span>搜索</span>
          </Link>
          <button type="button" className="archive-tool archive-tool--icon" onClick={toggleTheme} aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" className="archive-menu-toggle" onClick={() => setMobileOpen(value => !value)} aria-expanded={mobileOpen} aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="archive-mobile-menu">
          <div className="archive-mobile-menu__tools">
            <Link href="/search"><Search size={17} />搜索人物、公司、年份或概念</Link>
          </div>
          <div className="archive-mobile-menu__grid">
            {navGroups.map(group => (
              <section key={group.label}>
                <p>{group.label}</p>
                {group.links.map(link => (
                  <Link key={`mobile-${group.label}-${link.href}`} href={link.href}>
                    <span>{link.label}</span><small>{link.meta}</small>
                  </Link>
                ))}
              </section>
            ))}
            <section>
              <p>主要栏目</p>
              {directLinks.map(link => <Link key={`mobile-${link.href}`} href={link.href}><span>{link.label}</span></Link>)}
            </section>
          </div>
        </div>
      )}
    </header>
  )
}
