'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Moon, Search, Sun, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'
import { getSpaceHref } from '@/lib/site-spaces'

const navGroups = [
  {
    label: '巴菲特',
    description: '信件、股东大会与长期投资方法',
    activePrefixes: ['/buffett', '/partnership', '/letters', '/qa'],
    links: [
      { href: getSpaceHref('buffett'), label: '巴菲特', meta: '人物专题' },
      { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
      { href: '/letters', label: '伯克希尔股东信', meta: '1965—至今' },
      { href: '/qa', label: '伯克希尔股东大会', meta: '现场问答' },
    ],
  },
  {
    label: '芒格',
    description: '演讲、问答与多元思维方法',
    activePrefixes: ['/munger', '/poor-charlies-almanack'],
    links: [
      { href: getSpaceHref('munger'), label: '查理·芒格', meta: '人物专题' },
      { href: '/munger/wesco', label: 'Wesco 问答', meta: '会议记录' },
      { href: '/munger/archive', label: '演讲与访谈', meta: '公开表达' },
      { href: '/munger/originals', label: 'Wesco 股东信', meta: '英文原文' },
      { href: '/poor-charlies-almanack', label: '《穷查理宝典》', meta: '演讲与文章' },
    ],
  },
]

const directLinks = [
  { href: '/business-history', label: '企业研究' },
  { href: '/concepts', label: '主题索引' },
  { href: '/learn', label: '阅读室' },
  { href: '/bound-edition', label: '合订本' },
  { href: '/about', label: '关于' },
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
          <Link href="/reading" className={pathname.startsWith('/reading') ? 'is-active' : ''}>
            原典
          </Link>
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
          <Link href="/login" className="archive-tool" aria-label="登录或进入我的书房">
            <UserRound size={17} /><span>登录</span>
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
            <Link href="/login"><UserRound size={17} />登录 / 我的书房</Link>
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
              <Link href="/reading"><span>原典</span></Link>
              {directLinks.map(link => <Link key={`mobile-${link.href}`} href={link.href}><span>{link.label}</span></Link>)}
            </section>
          </div>
        </div>
      )}
    </header>
  )
}
