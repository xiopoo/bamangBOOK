import { siteConfig } from '@/lib/site'

/**
 * 渲染 JSON-LD 结构化数据（SEO / GEO 共用）。
 * 用法：<JsonLd data={{ '@context': 'https://schema.org', '@type': 'Organization', ... }} />
 * 支持传入数组以在单个 <script> 中输出多个实体。
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

export interface ArticleJsonLdInput {
  /** 文章标题；Google 建议 headline 不超过 110 字符，过长会被截断 */
  title: string
  /** 站内路径，如 /qa/xxx，用于生成 @id 与 url */
  path: string
  description?: string
  /** ISO 8601 日期字符串；无真实日期时留空，不要编造 */
  datePublished?: string | null
  dateModified?: string | null
  /** 讲话人/作者，如「巴菲特」「芒格」；缺省用站点名 */
  authorName?: string | null
}

/**
 * 生成 Article 结构化数据。
 * 站内 7000+ 内容页此前只有 WebSite/Organization/BreadcrumbList，
 * 缺 Article 会导致搜索结果无法展示日期、也无法判断内容新鲜度。
 * 注意：datePublished / dateModified 必须来自真实元数据，缺失时直接省略字段，
 * 编造日期会被 Google 判为不可信并忽略整块结构化数据。
 */
export function articleJsonLd(input: ArticleJsonLdInput): Record<string, unknown> {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  const url = `${baseUrl}${input.path}`
  const toIso = (value?: string | null): string | undefined => {
    if (!value) return undefined
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  const published = toIso(input.datePublished)
  const modified = toIso(input.dateModified) || published

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title.slice(0, 110),
    ...(input.description ? { description: input.description } : {}),
    inLanguage: 'zh-CN',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    author: { '@type': input.authorName ? 'Person' : 'Organization', name: input.authorName || siteConfig.name },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.svg` },
    },
    image: [`${baseUrl}/og-v2.jpg`],
  }
}

export interface BreadcrumbCrumb {
  name: string
  href?: string
}

/** 生成 BreadcrumbList 结构化数据；末级（当前页）不传 href 或传空字符串 */
export function breadcrumbJsonLd(crumbs: BreadcrumbCrumb[]): Record<string, unknown> {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.href ? { item: `${baseUrl}${crumb.href}` } : {}),
    })),
  }
}
