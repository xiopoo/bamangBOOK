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
import { getMungerLocalArchiveItems } from '@/lib/munger-archive'

function namesIn(directory: string): string[] {
  const fullPath = path.join(process.cwd(), 'content', directory)
  if (!existsSync(fullPath)) return []
  return readdirSync(fullPath)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  const routes = [
    '', '/about', '/search', '/reading', '/learn', '/learn/path', '/buffett', '/munger', '/graph', '/talk', '/letters', '/partnership',
    '/concepts', '/companies', '/people', '/articles', '/qa', '/talks', '/interviews', '/bloggers',
    '/business-history', '/poor-charlies-almanack', '/munger/wesco', '/model', '/books', '/columns',
    '/bound-edition', '/terms', '/privacy', '/digital-product-policy',
  ]
  const urls = new Set(routes.map(route => `${baseUrl}${route}`))

  namesIn('concepts').forEach(name => urls.add(`${baseUrl}/concepts/${encodeURIComponent(name)}`))
  namesIn('companies').forEach(name => urls.add(`${baseUrl}/companies/${encodeURIComponent(name)}`))
  namesIn('people').forEach(name => urls.add(`${baseUrl}/people/${encodeURIComponent(name)}`))

  getDocuments('articles').forEach(doc => urls.add(`${baseUrl}/articles/${encodeURIComponent(doc.fileName)}`))
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
  getMungerLocalArchiveItems()
    .filter(item => item.section !== 'mental-models')
    .forEach(item => urls.add(`${baseUrl}/munger/archive/${item.slug.split('/').map(encodeURIComponent).join('/')}`))

  const letterYears = new Set(
    namesIn('letters').map(name => name.match(/(?:19|20)\d{2}/)?.[0]).filter(Boolean) as string[]
  )
  letterYears.forEach(year => urls.add(`${baseUrl}/letters/${year}`))

  return [...urls].map(url => ({ url, changeFrequency: 'monthly', priority: url === baseUrl ? 1 : 0.7 }))
}
