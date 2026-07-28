'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Logo from './Logo'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'

const sections = [
  {
    label: '巴菲特专栏',
    description: '巴菲特亲笔与亲述的第一手资料',
    links: [
      { href: '/partnership', icon: '🤝', label: '合伙人信', count: '37' },
      { href: '/letters', icon: '✉️', label: '股东信', count: '60' },
      { href: '/qa', icon: '❓', label: '股东大会实录', count: '52' },
      { href: '/talks?person=buffett', icon: '🎤', label: '演讲' },
      { href: '/articles', icon: '📝', label: '研究文章' },
      { href: '/interviews', icon: '🎙️', label: '访谈' },
      { href: '/columns', icon: '✍️', label: '投资专栏' },
      { href: '/books', icon: '📖', label: '深度拆书' },
    ],
  },
  {
    label: '芒格专栏',
    description: '查理·芒格的文章、演讲与多元思维模型',
    links: [
      { href: '/munger', icon: '🧔', label: '文章·演讲' },
      { href: '/munger/wesco', icon: '❓', label: 'Wesco 股东大会', count: '14' },
      { href: '/poor-charlies-almanack', icon: '📕', label: '穷查理宝典' },
      { href: '/munger/archive', icon: '🎧', label: '影音档案', count: '35' },
      { href: '/munger/originals', icon: '📜', label: 'Wesco 股东信', count: '13' },
      { href: '/model', icon: '🧠', label: '思维模型', count: '232' },
    ],
  },
  {
    label: '博主专栏',
    description: '四位博主的投资思考与商业分析',
    links: [
      { href: '/bloggers/唐僧的碎碎念', icon: '📚', label: '唐僧的碎碎念' },
      { href: '/bloggers/在苍茫中传灯', icon: '📚', label: '在苍茫中传灯' },
      { href: '/bloggers/方伟看十年', icon: '📚', label: '方伟看十年' },
      { href: '/bloggers/梁孝永康', icon: '📚', label: '梁孝永康' },
    ],
  },
  {
    label: '百科与索引',
    description: '概念、公司与人物的速查词典',
    links: [
      { href: '/concepts', icon: '💡', label: '投资概念' },
      { href: '/companies', icon: '🏢', label: '公司档案' },
      { href: '/people', icon: '👤', label: '人物档案' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const NavLink = ({ href, icon, label, count }: { href: string; icon: string; label: string; count?: string }) => (
    <Link
      href={href}
      onClick={() => setIsOpen(false)}
      className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
        isActive(href)
          ? 'bg-primary/10 text-primary dark:bg-primary/20'
          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </span>
      {count && <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>}
    </Link>
  )

  return (
    <>
      <button
        className="fixed left-3 top-3 z-50 rounded-md bg-primary p-2 text-white shadow-lg md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? '关闭导航' : '打开导航'}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-60 transform overflow-y-auto border-r border-gray-200 bg-white/95 backdrop-blur-sm transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-dark-card/95 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-100 p-4 dark:border-gray-700" onClick={() => setIsOpen(false)}>
            <Logo showSubtitle={false} />
          </div>

          <div className="border-b border-gray-100 px-3 py-2.5 dark:border-gray-700">
            <SearchBar />
          </div>

          <nav className="flex-1 overflow-y-auto py-3">
            <div className="space-y-6 px-2">
              <div>
                <NavLink href="/" icon="⌂" label="书房首页" />
              </div>

              {sections.map(section => (
                <div key={section.label}>
                  <div className="mb-2 px-3">
                    <div className="text-xs font-semibold tracking-wide text-gray-400 dark:text-gray-500">
                      {section.label}
                    </div>
                    {section.description && (
                      <p className="mt-0.5 text-[11px] leading-snug text-gray-400/80 dark:text-gray-500/80">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {section.links.map(link => (
                      <NavLink key={link.href} {...link} />
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-3 dark:border-gray-700">
                <NavLink href="/search" icon="🔎" label="全站搜索" />
                <NavLink href="/about" icon="ⓘ" label="编辑原则" />
              </div>
            </div>
          </nav>

          <div className="border-t border-gray-100 p-3 dark:border-gray-700">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
