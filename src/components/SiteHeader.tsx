'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { useTheme } from './ThemeProvider'
import { getSpaceHref } from '@/lib/site-spaces'

const navGroups = [
  {
    label: '巴菲特',
    description: '原始记录、思想、事业与公司',
    links: [
      { href: getSpaceHref('buffett'), label: '巴菲特档案', meta: '总览' },
      { href: '/partnership', label: '合伙人信', meta: '1956—1970' },
      { href: '/letters', label: '伯克希尔股东信', meta: '历年原文' },
      { href: '/qa', label: '股东大会实录', meta: '问答档案' },
      { href: '/talks?person=buffett', label: '演讲', meta: '公开讲话' },
      { href: '/interviews', label: '访谈', meta: '对话记录' },
    ],
  },
  {
    label: '芒格',
    description: '原始记录、思想、生平与事业',
    links: [
      { href: getSpaceHref('munger'), label: '芒格档案', meta: '总览' },
      { href: '/munger/wesco', label: 'Wesco 股东大会', meta: '中文问答' },
      { href: '/poor-charlies-almanack', label: '穷查理宝典', meta: '统一阅读' },
      { href: '/munger/archive', label: '芒格档案', meta: '生平·演讲·语录' },
      { href: '/munger/originals', label: 'Wesco 股东信', meta: '英文原文' },
      { href: '/model', label: '思维模型', meta: '232 个' },
      { href: '/concepts', label: '重要概念', meta: '主题索引' },
      { href: '/books', label: '深度拆书', meta: '书籍' },
    ],
  },
  {
    label: '专栏',
    description: '公司研究、专题文章与作者档案',
    links: [
      { href: '/columns', label: '投资专栏', meta: '专题写作' },
      { href: '/articles', label: '研究文章', meta: '文章库' },
      { href: '/business-history', label: '公司深度研究', meta: '16 家公司' },
      { href: '/bloggers', label: '博主专栏', meta: '作者索引' },
      { href: '/bloggers/唐僧的碎碎念', label: '唐僧的碎碎念', meta: '专栏' },
      { href: '/bloggers/在苍茫中传灯', label: '在苍茫中传灯', meta: '专栏' },
      { href: '/bloggers/方伟看十年', label: '方伟看十年', meta: '专栏' },
      { href: '/bloggers/梁孝永康', label: '梁孝永康', meta: '专栏' },
    ],
  },
  {
    label: '百科',
    description: '公司、人物、概念与阅读工具',
    links: [
      { href: '/companies', label: '公司档案', meta: '企业索引' },
      { href: '/people', label: '人物档案', meta: '人物索引' },
      { href: '/concepts', label: '投资概念', meta: '概念索引' },
      { href: '/graph', label: '知识图谱', meta: '关系浏览' },
      { href: '/reading', label: '阅读记录', meta: '阅读工具' },
      { href: '/learn', label: '学习室', meta: '自主探索' },
      { href: '/history', label: '历史索引', meta: '时间线' },
      { href: '/bound-edition', label: '合订本', meta: '收藏阅读' },
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
    const close = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenGroup(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const isGroupActive = (links: typeof navGroups[number]['links']) =>
    links.some(({ href }) => pathname.startsWith(href.split('?')[0]))

  return (
    <header ref={headerRef} className="archive-masthead">
      <div className="archive-masthead__inner">
        <Logo />

        <nav className="archive-nav" aria-label="主要栏目">
          {navGroups.map((group) => {
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
                  className={`archive-nav__trigger ${isGroupActive(group.links) ? 'is-active' : ''}`}
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                >
                  {group.label}
                  <ChevronDown size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="archive-dropdown">
                    <div className="archive-dropdown__intro">
                      <span>{group.label}档案</span>
                      <p>{group.description}</p>
                    </div>
                    <div className="archive-dropdown__links">
                      {group.links.map((link) => (
                        <Link key={`${group.label}-${link.href}-${link.label}`} href={link.href}>
                          <span>{link.label}</span>
                          <small>{link.meta}</small>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <Link href="/about" className={pathname.startsWith('/about') ? 'is-active' : ''}>
            关于
          </Link>
        </nav>

        <div className="archive-masthead__tools">
          <Link href="/search" className="archive-tool" aria-label="全站搜索">
            <Search size={19} strokeWidth={1.7} />
            <span>搜索</span>
          </Link>
          <button
            type="button"
            className="archive-tool archive-tool--icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到暗色模式'}
          >
            {theme === 'dark' ? <Sun size={19} strokeWidth={1.7} /> : <Moon size={19} strokeWidth={1.7} />}
          </button>
          <button
            type="button"
            className="archive-menu-toggle"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          >
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="archive-mobile-menu">
          <div className="archive-mobile-menu__tools">
            <Link href="/search">
              <Search size={17} />
              搜索全站
            </Link>
            <Link href="/about">关于与编辑原则</Link>
          </div>
          <div className="archive-mobile-menu__grid">
            {navGroups.map((group) => (
              <section key={group.label}>
                <p>{group.label}</p>
                {group.links.map((link) => (
                  <Link key={`mobile-${group.label}-${link.href}-${link.label}`} href={link.href}>
                    <span>{link.label}</span>
                    <small>{link.meta}</small>
                  </Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
