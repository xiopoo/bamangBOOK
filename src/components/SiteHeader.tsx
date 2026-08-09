'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'

const navGroups = [
  {
    label: '巴菲特',
    description: '从合伙人时期到伯克希尔年代，按资料类型直接进入。',
    activePrefixes: ['/buffett', '/letters', '/partnership', '/qa', '/talks', '/interviews'],
    links: [
      { href: '/buffett', label: '巴菲特主页', meta: '人物与资料总览' },
      { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
      { href: '/letters', label: '伯克希尔股东信', meta: '1965—至今' },
      { href: '/qa', label: '股东大会问答', meta: '历年现场记录' },
      { href: '/talks', label: '公开演讲', meta: '演讲文字稿' },
      { href: '/interviews', label: '访谈实录', meta: '对话与采访' },
    ],
  },
  {
    label: '芒格',
    description: '演讲、访谈、Wesco 问答与多元思维模型。',
    activePrefixes: ['/munger', '/poor-charlies-almanack', '/model'],
    links: [
      { href: '/munger', label: '芒格主页', meta: '人物与资料总览' },
      { href: '/munger/archive', label: '芒格资料', meta: '影音与文字档案' },
      { href: '/munger/archive/daily-journal', label: '每日期刊问答', meta: '2014—2023' },
      { href: '/munger/wesco', label: 'Wesco 问答', meta: '1987—2011' },
      { href: '/poor-charlies-almanack', label: '《穷查理宝典》', meta: '按原书阅读' },
      { href: '/model', label: '多元思维模型', meta: '跨学科工具' },
    ],
  },
  {
    label: '段永平',
    description: '网易博客、雪球问答、演讲采访与公司里程碑，按栏目与年份阅读第一手资料。',
    activePrefixes: ['/duanyongping'],
    links: [
      { href: '/duanyongping', label: '段永平主页', meta: '人物与资料总览' },
      { href: '/duanyongping/blog', label: '网易博客', meta: '2006—2020 · 597 篇' },
      { href: '/duanyongping/qa', label: '雪球问答录', meta: '2011—2025 · 2212 条' },
      { href: '/duanyongping/talks', label: '演讲、采访与文章', meta: '1999—2025' },
      { href: '/duanyongping/milestones', label: '公司与里程碑', meta: '步步高 / OPPO / vivo' },
    ],
  },
  {
    label: '研究与索引',
    description: '从商业史、投资概念和经典书籍多入口查找。',
    activePrefixes: ['/business-history', '/companies', '/people', '/concepts', '/books', '/learn'],
    links: [
      { href: '/business-history', label: '公司深度研究', meta: '经营与资本配置' },
      { href: '/companies', label: '公司索引', meta: '按公司查找' },
      { href: '/people', label: '人物索引', meta: '管理者与投资人' },
      { href: '/concepts', label: '投资概念', meta: '按主题查找' },
      { href: '/books', label: '经典书籍', meta: '核心要点' },
      { href: '/learn/path', label: '阅读路径', meta: '循序渐进阅读' },
    ],
  },
  {
    label: '博主文章',
    description: '进入博主总览，或直接选择长期关注的写作者。',
    activePrefixes: ['/bloggers'],
    links: [
      { href: '/bloggers', label: '全部博主文章', meta: '按作者与时间浏览' },
      { href: '/bloggers/唐僧的碎碎念', label: '唐僧的碎碎念', meta: '投资与商业观察' },
      { href: '/bloggers/在苍茫中传灯', label: '在苍茫中传灯', meta: '价值投资札记' },
      { href: '/bloggers/方伟看十年', label: '方伟看十年', meta: '产品与长期主义' },
      { href: '/bloggers/梁孝永康', label: '梁孝永康', meta: '投资思考' },
    ],
  },
]

const directLinks = [
  { href: '/bound-edition', label: '巴芒文集' },
  { href: '/about', label: '关于' },
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
      { href: '/munger/archive/daily-journal', label: '每日期刊问答', meta: '2014—2023' },
      { href: '/munger/wesco', label: 'Wesco 问答', meta: '1987—2011' },
      { href: '/model', label: '思维模型', meta: '跨学科工具' },
    ],
  },
  {
    label: '段永平',
    links: [
      { href: '/duanyongping', label: '段永平主页', meta: '人物与资料总览' },
      { href: '/duanyongping/blog', label: '网易博客', meta: '2006—2020' },
      { href: '/duanyongping/qa', label: '雪球问答录', meta: '2011—2025' },
      { href: '/duanyongping/talks', label: '演讲、采访与文章', meta: '1999—2025' },
    ],
  },
  {
    label: '研究与索引',
    links: [
      { href: '/business-history', label: '公司研究', meta: '经营与资本配置' },
      { href: '/concepts', label: '投资概念', meta: '按主题查找' },
      { href: '/books', label: '经典书籍', meta: '核心要点' },
      { href: '/bloggers', label: '博主文章', meta: '长期写作者' },
    ],
  },
  {
    label: '阅读与购买',
    links: [
      { href: '/reading', label: '全部内容', meta: '按人物与类型浏览' },
      { href: '/bound-edition', label: '巴芒文集', meta: '微信购买 PDF' },
      { href: '/about', label: '关于', meta: '站点与作者' },
    ],
  },
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
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenGroup(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenGroup(null)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const isActive = (prefixes: string[]) => prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (pathname.startsWith('/checkout') || pathname.startsWith('/payment') || pathname.startsWith('/login')) return null

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
                  className={`archive-nav__trigger ${isActive(group.activePrefixes) ? 'is-active' : ''}`}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  aria-controls={`nav-dropdown-${group.label}`}
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                >
                  {group.label}<ChevronDown size={14} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div id={`nav-dropdown-${group.label}`} className="archive-dropdown">
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
