'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

const pathMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: '首页', href: '/' }],
  '/buffett': [
    { label: '首页', href: '/' },
    { label: '沃伦·巴菲特', href: '/buffett' },
  ],
  '/munger': [
    { label: '首页', href: '/' },
    { label: '芒格', href: '/munger' },
  ],
  '/partnership': [
    { label: '首页', href: '/' },
    { label: '沃伦·巴菲特', href: '/buffett' },
    { label: '合伙人信', href: '/partnership' },
  ],
  '/letters': [
    { label: '首页', href: '/' },
    { label: '沃伦·巴菲特', href: '/buffett' },
    { label: '股东信', href: '/letters' },
  ],
  '/talks': [
    { label: '首页', href: '/' },
    { label: '演讲', href: '/talks' },
  ],
  '/interviews': [
    { label: '首页', href: '/' },
    { label: '访谈', href: '/interviews' },
  ],
  '/qa': [
    { label: '首页', href: '/' },
    { label: '沃伦·巴菲特', href: '/buffett' },
    { label: '股东大会问答', href: '/qa' },
  ],
  '/concepts': [
    { label: '首页', href: '/' },
    { label: '概念', href: '/concepts' },
  ],
  '/companies': [
    { label: '首页', href: '/' },
    { label: '公司', href: '/companies' },
  ],
  '/people': [
    { label: '首页', href: '/' },
    { label: '人物', href: '/people' },
  ],
  '/graph': [
    { label: '首页', href: '/' },
    { label: '知识图谱', href: '/graph' },
  ],
  '/search': [
    { label: '首页', href: '/' },
    { label: '搜索', href: '/search' },
  ],
  '/history': [
    { label: '首页', href: '/' },
    { label: '阅读历史', href: '/history' },
  ],
  '/talk': [
    { label: '首页', href: '/' },
    { label: 'AI对话', href: '/talk' },
  ],
  '/model': [
    { label: '首页', href: '/' },
    { label: '芒格', href: '/munger' },
    { label: '思维模型', href: '/model' },
  ],
  '/reading': [
    { label: '首页', href: '/' },
    { label: '阅读库', href: '/reading' },
  ],
  '/business-history': [
    { label: '首页', href: '/' },
    { label: '研究', href: '/business-history' },
    { label: '公司深度研究', href: '/business-history' },
  ],
  '/bloggers': [
    { label: '首页', href: '/' },
    { label: '文章', href: '/bloggers' },
    { label: '博主文章', href: '/bloggers' },
  ],
  '/columns': [
    { label: '首页', href: '/' },
    { label: '文章', href: '/columns' },
    { label: '专栏', href: '/columns' },
  ],
  '/duanyongping': [
    { label: '首页', href: '/' },
    { label: '阅读', href: '/reading' },
    { label: '段永平', href: '/duanyongping' },
  ],
  '/munger/archive': [
    { label: '首页', href: '/' },
    { label: '阅读', href: '/reading' },
    { label: '芒格资料', href: '/munger/archive' },
  ],
  '/munger/wesco': [
    { label: '首页', href: '/' },
    { label: '芒格', href: '/munger' },
    { label: 'Wesco 股东大会', href: '/munger/wesco' },
  ],
  '/poor-charlies-almanack': [
    { label: '首页', href: '/' },
    { label: '芒格', href: '/munger' },
    { label: '穷查理宝典', href: '/poor-charlies-almanack' },
  ],
  '/books': [
    { label: '首页', href: '/' },
    { label: '研究', href: '/books' },
    { label: '经典书籍', href: '/books' },
  ],
}

interface BreadcrumbsProps {
  fallbackParent?: BreadcrumbItem
}

export default function Breadcrumbs({ fallbackParent }: BreadcrumbsProps) {
  const pathname = usePathname()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const basePath = Object.keys(pathMap)
      .sort((a, b) => b.length - a.length)
      .find(key => pathname === key || pathname.startsWith(`${key}/`))
    if (!basePath) {
      return [
        { label: '首页', href: '/' },
        ...(fallbackParent ? [fallbackParent] : []),
        { label: pathname.split('/').pop() || '未知页面' },
      ]
    }

    const baseCrumbs = pathMap[basePath]
    const remainingPath = pathname.slice(basePath.length)

    if (!remainingPath || remainingPath === '/') {
      return baseCrumbs
    }

    const parts = remainingPath.split('/').filter(Boolean)
    const crumbs = [...baseCrumbs]

    let currentPath = basePath
    parts.forEach((part) => {
      currentPath += `/${part}`
      let label = part
      try {
        label = decodeURIComponent(part)
      } catch {
      }
      crumbs.push({ label, href: currentPath })
    })

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-dark-muted mb-6">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        return (
          <div key={index} className="flex items-center gap-2">
            {!isLast && (
              <Link
                href={crumb.href || '/'}
                className="hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                {crumb.label}
              </Link>
            )}
            {isLast && (
              <span className="text-text dark:text-dark-text font-medium">
                {crumb.label}
              </span>
            )}
            {!isLast && (
              <span className="text-primary/30 dark:text-dark-border">/</span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
