import type { MetadataRoute } from 'next'
import { readdirSync, existsSync } from 'fs'
import path from 'path'
import { getDocuments } from '@/lib/documents'
import { getAllPartnershipLetters } from '@/lib/partnership'
import { getBusinessHistories } from '@/lib/business-history'
import { siteConfig } from '@/lib/site'
import { almanackSections } from '@/lib/poor-charlies-almanack'
import { getWescoMeetings } from '@/lib/wesco-meetings'
import { getModels } from '@/lib/models'
import { getBooks } from '@/lib/books'
import { getColumns } from '@/lib/columns'
import { getAllArticles } from '@/lib/articles'
import { getAllMeetingYears } from '@/lib/meetings'
import { getAllBuffettFaqTopics } from '@/lib/buffett-faq'
import { getMungerLocalArchiveItems } from '@/lib/munger-archive'
import { getBloggers, getAllBloggerArticles } from '@/lib/bloggers'
import { getDYDocs, type DYSection } from '@/lib/duanyongping'
import { getAllBlogPosts, getBlogTags, getBlogCategories } from '@/lib/blog'

function namesIn(directory: string): string[] {
  const fullPath = path.join(process.cwd(), 'content', directory)
  if (!existsSync(fullPath)) return []
  return readdirSync(fullPath)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''))
}

export function generateStaticParams() {
  return [{ __metadata_id__: [] }]
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  // 注意：/search 已移出 sitemap —— 该页纯客户端渲染，SSR 仅输出「加载中...」，
  // 属 thin content，且已在 src/app/search/layout.tsx 设为 noindex。
  const routes = [
    '', '/about', '/buffett', '/munger', '/letters', '/partnership',
    '/concepts', '/companies', '/people', '/qa', '/talks', '/interviews', '/bloggers', '/articles',
    '/business-history', '/poor-charlies-almanack', '/munger/wesco', '/model', '/books', '/columns',
    '/duanyongping', '/duanyongping/blog', '/duanyongping/qa', '/duanyongping/talks', '/duanyongping/milestones',
    '/about/revisions',
    '/bound-edition', '/terms', '/privacy', '/digital-product-policy',
    '/blog',
  ]
  const urls = new Set(routes.map(route => `${baseUrl}${route}`))

  // lastmod 是 Google 唯一真正采用的 sitemap 信号（changefreq/priority 已被明确忽略）。
  // 关键前提：必须是真实修改时间。编造或全站同一时间会让 Google 直接忽略该字段，
  // 因此这里只为「确实有日期元数据」的内容写入，其余 URL 不带 lastmod（规范允许省略）。
  const lastmod = new Map<string, string>()
  const setLastmod = (url: string, value?: string | null) => {
    if (!value) return
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return   // 脏数据不写入，避免生成非法 XML
    const prev = lastmod.get(url)
    if (!prev || date > new Date(prev)) lastmod.set(url, date.toISOString())
  }

  namesIn('concepts').forEach(name => urls.add(`${baseUrl}/concepts/${encodeURIComponent(name)}`))
  namesIn('companies').forEach(name => urls.add(`${baseUrl}/companies/${encodeURIComponent(name)}`))
  namesIn('people').forEach(name => urls.add(`${baseUrl}/people/${encodeURIComponent(name)}`))

  getDocuments('qa')
    .filter(doc => !doc.fileName.startsWith('Wesco_股东大会_'))
    .forEach(doc => urls.add(`${baseUrl}/qa/${encodeURIComponent(doc.fileName)}`))
  getWescoMeetings().forEach(item => urls.add(`${baseUrl}/munger/wesco/${item.year}`))
  getDocuments('talks').forEach(doc => urls.add(`${baseUrl}/talks/${encodeURIComponent(doc.fileName)}`))
  getDocuments('interviews').forEach(doc => urls.add(`${baseUrl}/interviews/${encodeURIComponent(doc.fileName)}`))
  getAllPartnershipLetters().forEach(letter => urls.add(`${baseUrl}/partnership/${letter.id}`))
  getBusinessHistories().forEach(item => urls.add(`${baseUrl}/business-history/${encodeURIComponent(item.slug)}`))
  almanackSections.forEach(section => urls.add(`${baseUrl}/poor-charlies-almanack/${section.slug}`))
  getModels().forEach(model => urls.add(`${baseUrl}/model/${encodeURIComponent(model.slug)}`))
  getBooks().forEach(book => urls.add(`${baseUrl}/books/${encodeURIComponent(book.slug)}`))
  getColumns().forEach(column => urls.add(`${baseUrl}/columns/${encodeURIComponent(column.slug)}`))
  getAllArticles().forEach(article => urls.add(`${baseUrl}/articles/${encodeURIComponent(article.slug)}`))

  // 博客：入口、精选旧文别名页（canonical 指向旧 URL）、标签与分类
  getAllBlogPosts().forEach(post => {
    const url = `${baseUrl}${post.canonicalPath}`
    urls.add(url)
    setLastmod(url, post.updatedAt || post.date)
  })
  getBlogTags(50).forEach(({ tag }) => urls.add(`${baseUrl}/blog/tag/${encodeURIComponent(tag)}`))
  getBlogCategories().forEach(cat => urls.add(`${baseUrl}/blog/category/${encodeURIComponent(cat.label)}`))
  urls.add(`${baseUrl}/meetings`)
  getAllMeetingYears().forEach(({ year, sessions, clips }) => {
    [...sessions, ...clips].forEach(item => urls.add(`${baseUrl}/meetings/${year}/${encodeURIComponent(item.session)}`))
  })
  urls.add(`${baseUrl}/buffett-faq`)
  getAllBuffettFaqTopics()
    .filter(topic => topic.slug !== 'buffettfaq')
    .forEach(topic => urls.add(`${baseUrl}/buffett-faq/${encodeURIComponent(topic.slug)}`))
  getMungerLocalArchiveItems()
    .filter(item => item.section !== 'mental-models')
    .forEach(item => urls.add(`${baseUrl}/munger/archive/${item.slug.split('/').map(encodeURIComponent).join('/')}`))

  getBloggers().forEach(blogger => urls.add(`${baseUrl}/bloggers/${encodeURIComponent(blogger.name)}`))
  getAllBloggerArticles().forEach(article =>
    urls.add(`${baseUrl}/bloggers/${encodeURIComponent(article.blogger)}/${encodeURIComponent(article.fileName)}`)
  )

  const duanSections: DYSection[] = ['blog', 'qa', 'talks', 'milestones']
  duanSections.forEach(section => {
    getDYDocs(section, false).forEach(doc => {
      const url = `${baseUrl}/duanyongping/${section}/${doc.slug}`
      urls.add(url)
      setLastmod(url, doc.updatedAt || doc.publishedAt || doc.date)
    })
  })

  const letterYears = new Set(
    namesIn('letters').map(name => name.match(/(?:19|20)\d{2}/)?.[0]).filter(Boolean) as string[]
  )
  letterYears.forEach(year => urls.add(`${baseUrl}/letters/${year}`))

  // 按栏目更新频率返回差异化 changeFrequency（SEO 抓取节奏优化）：
  // - daily：首页（每日一读/今日一读每日刷新）
  // - weekly：持续编辑的栏目（博客 / 段永平档案 / 股东信年份索引）
  // - yearly：历史原文，几乎不再变动（股东信、穷查理宝典、概念/公司/人物词条）
  // - monthly：其余访谈/问答/会议等中等频率栏目
  function changeFrequencyFor(url: string): 'daily' | 'weekly' | 'monthly' | 'yearly' {
    const path = url.slice(baseUrl.length) || '/'
    if (path === '/') return 'daily'
    if (/^\/blog(\/|$)/.test(path) || /^\/duanyongping(\/|$)/.test(path)) return 'weekly'
    if (/^\/letters(\/|$)/.test(path) || /^\/poor-charlies-almanack(\/|$)/.test(path) || /^\/(concepts|companies|people)(\/|$)/.test(path)) return 'yearly'
    return 'monthly'
  }

  return [...urls].map(url => {
    const modified = lastmod.get(url)
    return {
      url,
      // 仅在有真实修改时间时输出 lastModified，其余留空由爬虫自行判断。
      ...(modified ? { lastModified: modified } : {}),
      changeFrequency: changeFrequencyFor(url),
      priority: url === baseUrl ? 1 : /^\/blog(\/|$)/.test(url.slice(baseUrl.length)) ? 0.8 : 0.7,
    }
  })
}
