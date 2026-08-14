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
  '/business-history': [
    { label: '首页', href: '/' },
    { label: '公司深度研究', href: '/business-history' },
  ],
  '/bloggers': [
    { label: '首页', href: '/' },
    { label: '博主文章', href: '/bloggers' },
  ],
  '/columns': [
    { label: '首页', href: '/' },
    { label: '专栏', href: '/columns' },
  ],
  '/duanyongping': [
    { label: '首页', href: '/' },
    { label: '段永平', href: '/duanyongping' },
  ],
  '/duanyongping/qa': [
    { label: '首页', href: '/' },
    { label: '段永平', href: '/duanyongping' },
    { label: '问答', href: '/duanyongping/qa' },
  ],
  '/duanyongping/blog': [
    { label: '首页', href: '/' },
    { label: '段永平', href: '/duanyongping' },
    { label: '博客', href: '/duanyongping/blog' },
  ],
  '/duanyongping/talks': [
    { label: '首页', href: '/' },
    { label: '段永平', href: '/duanyongping' },
    { label: '演讲', href: '/duanyongping/talks' },
  ],
  '/duanyongping/milestones': [
    { label: '首页', href: '/' },
    { label: '段永平', href: '/duanyongping' },
    { label: '里程碑', href: '/duanyongping/milestones' },
  ],
  '/meetings': [
    { label: '首页', href: '/' },
    { label: '股东大会英文原档实录', href: '/meetings' },
  ],
  '/buffett-faq': [
    { label: '首页', href: '/' },
    { label: '巴菲特主题问答', href: '/buffett-faq' },
  ],
  '/munger/archive': [
    { label: '首页', href: '/' },
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
    { label: '经典书籍', href: '/books' },
  ],
}

interface BreadcrumbsProps {
  fallbackParent?: BreadcrumbItem
}

export default function Breadcrumbs({ fallbackParent }: BreadcrumbsProps) {
  // 兼容直连 *.html 静态文件：归一化后再匹配路由，避免面包屑出现 "letters.html" 之类片段
  const rawPathname = usePathname()
  const pathname = rawPathname.replace(/\.html$/, '')

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

    // 动态路由的参数名段（如 year / page）不显示也不生成链接：
    // 它们不是真实页面，链接会导致 404；其余段仅作纯文本展示，避免死链。
    parts.forEach((part) => {
      let label = part
      try {
        label = decodeURIComponent(part)
      } catch {
      }
      // 全小写英文段视为动态参数名，跳过（最后一段除外，作为当前页标题展示）
      if (/^[a-z]+$/.test(part) && part !== parts[parts.length - 1]) {
        return
      }
      crumbs.push({ label })
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
