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
  const routes = [
    '', '/about', '/search', '/buffett', '/munger', '/letters', '/partnership',
    '/concepts', '/companies', '/people', '/qa', '/talks', '/interviews', '/bloggers', '/articles',
    '/business-history', '/poor-charlies-almanack', '/munger/wesco', '/model', '/books', '/columns',
    '/duanyongping', '/duanyongping/blog', '/duanyongping/qa', '/duanyongping/talks', '/duanyongping/milestones',
    '/about/revisions',
    '/bound-edition', '/terms', '/privacy', '/digital-product-policy',
    '/blog',
  ]
  const urls = new Set(routes.map(route => `${baseUrl}${route}`))

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
  getAllBlogPosts().forEach(post => urls.add(`${baseUrl}${post.canonicalPath}`))
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
    getDYDocs(section, false).forEach(doc => urls.add(`${baseUrl}/duanyongping/${section}/${doc.slug}`))
  })

  const letterYears = new Set(
    namesIn('letters').map(name => name.match(/(?:19|20)\d{2}/)?.[0]).filter(Boolean) as string[]
  )
  letterYears.forEach(year => urls.add(`${baseUrl}/letters/${year}`))

  return [...urls].map(url => ({ url, changeFrequency: 'monthly', priority: url === baseUrl ? 1 : 0.7 }))
}
