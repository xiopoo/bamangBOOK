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
