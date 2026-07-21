'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Logo from './Logo'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'

// Track which sections are expanded on desktop
const DEFAULT_EXPANDED: Record<string, boolean> = {
  'source': true,
  'knowledge': true,
  'bloggers': true,
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(DEFAULT_EXPANDED)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const NavLink = ({ href, icon, label, count }: { href: string; icon: string; label: string; count?: string | number }) => (
    <Link
      href={href}
      onClick={() => setIsOpen(false)}
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
        isActive(href)
          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </span>
      {count && (
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </Link>
  )

  const SectionToggle = ({ id, icon, label }: { id: string; icon: string; label: string }) => {
    const isExpanded = expanded[id] ?? true
    return (
      <button
        onClick={() => toggle(id)}
        className="flex items-center justify-between w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="text-[10px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)' }}>
          ▼
        </span>
      </button>
    )
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-3 left-3 z-50 p-2 bg-primary text-white rounded-lg shadow-lg md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="打开导航"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white/95 dark:bg-dark-card/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div onClick={() => setIsOpen(false)}>
              <Logo showSubtitle={false} />
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
            <SearchBar />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3">
            <div className="px-2 space-y-0.5">
              {/* Home */}
              <NavLink href="/" icon="🏠" label="首页" />

              <div className="mt-3" />

              {/* 原文库 */}
              <SectionToggle id="source" icon="📖" label="原文库" />
              {expanded.source && (
                <div className="ml-4 space-y-0.5">
                  <NavLink href="/partnership" icon="🤝" label="合伙人信" count="24" />
                  <NavLink href="/letters" icon="✉️" label="股东信" count="60" />
                  <NavLink href="/qa" icon="❓" label="股东大会问答" count="52" />
                  <NavLink href="/talks" icon="🎤" label="演讲集" count="22" />
                </div>
              )}

              <div className="mt-2" />

              {/* 知识库 */}
              <SectionToggle id="knowledge" icon="🧠" label="知识库" />
              {expanded.knowledge && (
                <div className="ml-4 space-y-0.5">
                  <NavLink href="/concepts" icon="💡" label="投资概念" count="35" />
                  <NavLink href="/companies" icon="🏢" label="公司分析" count="66" />
                  <NavLink href="/people" icon="👤" label="人物档案" count="10" />
                  <NavLink href="/articles" icon="📝" label="深度文章" count="78" />
                  <NavLink href="/interviews" icon="🎙️" label="访谈记录" count="40" />
                </div>
              )}

              <div className="mt-2" />

              {/* 博主文章 */}
              <SectionToggle id="bloggers" icon="📡" label="博主文章" />
              {expanded.bloggers && (
                <div className="ml-4 space-y-0.5">
                  <NavLink href={`/bloggers/${encodeURIComponent('在苍茫中传灯')}`} icon="📡" label="在苍茫中传灯" count="947" />
                  <NavLink href={`/bloggers/${encodeURIComponent('方伟看十年')}`} icon="📡" label="方伟看十年" count="891" />
                  <NavLink href={`/bloggers/${encodeURIComponent('梁孝永康')}`} icon="📡" label="梁孝永康" count="511" />
                  <NavLink href={`/bloggers/${encodeURIComponent('唐僧的碎碎念')}`} icon="📡" label="唐僧的碎碎念" count="445" />
                </div>
              )}

              <div className="mt-3" />

              {/* 学习路径 & 图谱 */}
              <NavLink href="/learn" icon="🗺️" label="学习路径" />
              <NavLink href="/graph" icon="🕸️" label="知识图谱" />

              {/* Buffet & Munger people pages */}
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <NavLink href="/buffett" icon="👤" label="沃伦·巴菲特" />
                <NavLink href="/munger" icon="👤" label="查理·芒格" />
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
