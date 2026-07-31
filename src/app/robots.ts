import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  if (!siteConfig.hasProductionUrl) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/checkout/', '/payment/', '/login', '/my-study', '/orders'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
