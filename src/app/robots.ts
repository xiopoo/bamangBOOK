import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'

/**
 * AI 搜索/生成引擎爬虫（GEO）：
 * 允许 GPT、Perplexity、Claude、豆包（字节）等抓取公开内容，
 * 其中 OpenAI 显式排除爬取训练用的 Web 抓取器。
 */
const aiCrawlers = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-Web',
  'Google-Extended',
  'Bytespider',
  'Applebot-Extended',
  'meta-externalagent',
  'Amazonbot',
  'cohere-ai',
]

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  if (!siteConfig.hasProductionUrl) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout/', '/payment/', '/login', '/my-study', '/orders'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      ...aiCrawlers
        .filter(ua => ua !== 'GPTBot')
        .map(ua => ({
          userAgent: ua,
          allow: '/',
        })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
