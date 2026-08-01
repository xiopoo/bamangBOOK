'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'

const primaryLinks = [
  { href: '/buffett', label: '巴菲特', activePrefixes: ['/buffett', '/letters', '/partnership', '/qa'] },
  { href: '/munger', label: '芒格', activePrefixes: ['/munger', '/poor-charlies-almanack', '/model'] },
  { href: '/business-history', label: '公司研究', activePrefixes: ['/business-history', '/companies'] },
  { href: '/concepts', label: '投资方法', activePrefixes: ['/concepts'] },
  { href: '/bloggers', label: '博主文章', activePrefixes: ['/bloggers'] },
  { href: '/bound-edition', label: '合订本', activePrefixes: ['/bound-edition'] },
]

const mobileSections = [
  {
    label: '巴菲特',
    links: [
      { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
      { href: '/letters', label: '伯克希尔股东信', meta: '1965—至今' },
      { href: '/qa', label: '股东大会问答', meta: '现场记录' },
    ],
  },
  {
    label: '芒格',
    links: [
      { href: '/munger/archive', label: '演讲与访谈', meta: '影音与文字稿' },
      { href: '/munger/wesco', label: 'Wesco 问答', meta: '1996—2011' },
      { href: '/model', label: '思维模型', meta: '跨学科工具' },
    ],
  },
  {
    label: '研究与索引',
    links: [
      { href: '/business-history', label: '公司研究', meta: '经营与资本配置' },
      { href: '/concepts', label: '投资概念', meta: '按主题查找' },
      { href: '/bloggers', label: '博主文章', meta: '长期写作者' },
    ],
  },
  {
    label: '阅读与购买',
    links: [
      { href: '/reading', label: '全部内容', meta: '按人物与类型浏览' },
      { href: '/bound-edition', label: '电子合订本', meta: '微信购买 PDF' },
      { href: '/about', label: '关于本站', meta: '编辑与来源说明' },
    ],
  },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => setMobileOpen(false), [pathname])

  const isActive = (prefixes: string[]) => prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (pathname.startsWith('/checkout') || pathname.startsWith('/payment') || pathname.startsWith('/login')) return null

  return (
    <header className="archive-masthead">
      <div className="archive-masthead__inner">
        <Logo />
        <nav className="archive-nav" aria-label="主要栏目">
          {primaryLinks.map(link => (
            <Link key={link.href} href={link.href} className={isActive(link.activePrefixes) ? 'is-active' : ''}>
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
            {mobileSections.map(section => (
              <section key={section.label}>
                <p>{section.label}</p>
                {section.links.map(link => (
                  <Link key={link.href} href={link.href}><span>{link.label}</span><small>{link.meta}</small></Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
