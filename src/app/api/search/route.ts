import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import Fuse from 'fuse.js'

// 缓存搜索结果索引
let searchIndex: SearchItem[] | null = null
let fuseInstance: Fuse<SearchItem> | null = null
let lastBuildTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

interface SearchItem {
  id: string
  name: string
  type: 'concept' | 'company' | 'person' | 'letter' | 'article' | 'qa' | 'talk' | 'interview'
  description: string
  count: number
  years: number[]
  url: string
  content?: string
}

interface IndexItem {
  id: string
  count: number
  years: number[]
}

interface IndexData {
  concepts: IndexItem[]
  people: IndexItem[]
  companies: IndexItem[]
}

function extractDescription(content: string): string {
  // 去除Markdown格式，提取前200个字符作为描述
  const cleaned = content
    .replace(/^#\s+.*$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[{2}([^\]]+)\]{2}/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
  
  return cleaned.slice(0, 200).replace(/\n/g, ' ').trim()
}

function readMarkdownFile(filePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'content', filePath)
    if (!existsSync(fullPath)) return ''
    return readFileSync(fullPath, 'utf-8')
  } catch {
    return ''
  }
}

function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = []
  const contentDir = path.join(process.cwd(), 'content')

  // 读取index.json获取计数和年份数据
  let indexData: IndexData = { concepts: [], people: [], companies: [] }
  const indexPath = path.join(contentDir, 'index.json')
  if (existsSync(indexPath)) {
    try {
      indexData = JSON.parse(readFileSync(indexPath, 'utf-8'))
    } catch { /* ignore */ }
  }

  // 索引概念(concepts)
  const conceptsDir = path.join(contentDir, 'concepts')
  if (existsSync(conceptsDir)) {
    const conceptFiles = readdirSync(conceptsDir).filter(f => f.endsWith('.md'))
    for (const file of conceptFiles) {
      const id = file.replace('.md', '')
      const content = readMarkdownFile(`concepts/${file}`)
      const description = extractDescription(content)
      const conceptData = indexData.concepts?.find((c: IndexItem) => c.id === id)
      
      items.push({
        id,
        name: id,
        type: 'concept',
        description,
        count: conceptData?.count || 0,
        years: conceptData?.years || [],
        url: `/concepts/${encodeURIComponent(id)}`,
        content,
      })
    }
  }

  // 索引公司(companies)
  const companiesDir = path.join(contentDir, 'companies')
  if (existsSync(companiesDir)) {
    const companyFiles = readdirSync(companiesDir).filter(f => f.endsWith('.md'))
    for (const file of companyFiles) {
      const id = file.replace('.md', '')
      const content = readMarkdownFile(`companies/${file}`)
      const description = extractDescription(content)
      const companyData = indexData.companies?.find((c: IndexItem) => c.id === id)
      
      items.push({
        id,
        name: id,
        type: 'company',
        description,
        count: companyData?.count || 0,
        years: companyData?.years || [],
        url: `/companies/${encodeURIComponent(id)}`,
        content,
      })
    }
  }

  // 索引人物(people)
  const peopleDir = path.join(contentDir, 'people')
  if (existsSync(peopleDir)) {
    const peopleFiles = readdirSync(peopleDir).filter(f => f.endsWith('.md'))
    for (const file of peopleFiles) {
      const id = file.replace('.md', '')
      const content = readMarkdownFile(`people/${file}`)
      const description = extractDescription(content)
      const personData = indexData.people?.find((p: IndexItem) => p.id === id)
      
      items.push({
        id,
        name: id,
        type: 'person',
        description,
        count: personData?.count || 0,
        years: personData?.years || [],
        url: `/people/${encodeURIComponent(id)}`,
        content,
      })
    }
  }

  // 索引信件(letters) - 支持信件内容搜索
  const lettersDir = path.join(contentDir, 'letters')
  if (existsSync(lettersDir)) {
    const letterYears = readdirSync(lettersDir).filter(f => !f.startsWith('.') && !f.includes('json'))
    for (const year of letterYears) {
      const yearDir = path.join(lettersDir, year)
      if (existsSync(yearDir)) {
        const letterFiles = readdirSync(yearDir).filter(f => f.endsWith('.md'))
        for (const file of letterFiles) {
          const content = readMarkdownFile(`letters/${year}/${file}`)
          const description = extractDescription(content)
          const yearNum = parseInt(year)
          
          items.push({
            id: `${year}-${file}`,
            name: `${year}年巴菲特致股东信`,
            type: 'letter',
            description: description || `这是巴菲特${year}年致股东的信`,
            count: 1,
            years: [yearNum],
            url: `/letters/${year}`,
            content,
          })
        }
      }
    }
  }

  // 索引文章(articles) - 支持文章内容搜索
  const articlesDir = path.join(contentDir, 'articles')
  if (existsSync(articlesDir)) {
    const articleFiles = readdirSync(articlesDir).filter(f => f.endsWith('.md'))
    for (const file of articleFiles) {
      const id = file.replace('.md', '')
      const content = readMarkdownFile(`articles/${file}`)
      const description = extractDescription(content)
      const match = id.match(/(\d{4})/)
      const yearNum = match ? parseInt(match[1]) : 0
      
      items.push({
        id,
        name: id,
        type: 'article',
        description: description || '专题文章',
        count: 1,
        years: yearNum > 0 ? [yearNum] : [],
        url: `/reading/article/${encodeURIComponent(id)}`,
        content,
      })
    }
  }

  // 索引问答(qa) - 支持问答内容搜索
  const qaDir = path.join(contentDir, 'qa')
  if (existsSync(qaDir)) {
    const qaFiles = readdirSync(qaDir).filter(f => f.endsWith('.md'))
    for (const file of qaFiles) {
      const id = file.replace('.md', '')
      const content = readMarkdownFile(`qa/${file}`)
      const description = extractDescription(content)
      const match = id.match(/(\d{4})/)
      const yearNum = match ? parseInt(match[1]) : 0
      
      items.push({
        id,
        name: id,
        type: 'qa',
        description: description || '股东大会问答',
        count: 1,
        years: yearNum > 0 ? [yearNum] : [],
        url: `/qa/${encodeURIComponent(id)}`,
        content,
      })
    }
  }

  // 索引演讲(talks) - 支持演讲内容搜索
  const talksDir = path.join(contentDir, 'talks')
  if (existsSync(talksDir)) {
    const talkFiles = readdirSync(talksDir).filter(f => f.endsWith('.md'))
    for (const file of talkFiles) {
      const id = file.replace('.md', '')
      const content = readMarkdownFile(`talks/${file}`)
      const description = extractDescription(content)
      const match = id.match(/(\d{4})/)
      const yearNum = match ? parseInt(match[1]) : 0
      
      items.push({
        id,
        name: id,
        type: 'talk',
        description: description || '演讲',
        count: 1,
        years: yearNum > 0 ? [yearNum] : [],
        url: `/talks/${encodeURIComponent(id)}`,
        content,
      })
    }
  }

  // 索引访谈(interviews) - 支持访谈内容搜索
  const interviewsDir = path.join(contentDir, 'interviews')
  if (existsSync(interviewsDir)) {
    const interviewFiles = readdirSync(interviewsDir).filter(f => f.endsWith('.md'))
    for (const file of interviewFiles) {
      const id = file.replace('.md', '')
      const content = readMarkdownFile(`interviews/${file}`)
      const description = extractDescription(content)
      const match = id.match(/(\d{4})/)
      const yearNum = match ? parseInt(match[1]) : 0
      
      items.push({
        id,
        name: id,
        type: 'interview',
        description: description || '访谈',
        count: 1,
        years: yearNum > 0 ? [yearNum] : [],
        url: `/interviews/${encodeURIComponent(id)}`,
        content,
      })
    }
  }

  return items
}

function getSearchIndex(): SearchItem[] {
  const now = Date.now()
  if (!searchIndex || now - lastBuildTime > CACHE_TTL) {
    searchIndex = buildSearchIndex()
    lastBuildTime = now
    fuseInstance = null // 重置fuse实例
  }
  return searchIndex
}

function getFuse(): Fuse<SearchItem> {
  if (!fuseInstance) {
    const items = getSearchIndex()
    fuseInstance = new Fuse(items, {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'description', weight: 0.3 },
        { name: 'content', weight: 0.2 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
    })
  }
  return fuseInstance
}

// 综合排序：结合相关性分数和热度
function sortResults(results: { item: SearchItem; score?: number | undefined }[]): SearchItem[] {
  const maxCount = Math.max(...results.map(r => r.item.count), 1)
  
  return results
    .map(result => {
      const relevance = result.score !== undefined ? 1 - result.score : 0.5
      const popularity = result.item.count / maxCount
      // 综合分数：相关性(60%) + 热度(40%)
      const combinedScore = relevance * 0.6 + popularity * 0.4
      return { ...result, combinedScore }
    })
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .map(r => r.item)
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  const type = searchParams.get('type') as 'concept' | 'company' | 'person' | 'letter' | 'article' | 'qa' | 'talk' | 'interview' | null
  const mode = searchParams.get('mode') // 'suggest' or 'search'

  if (!q) {
    return NextResponse.json({
      results: [],
      suggestions: [],
      total: 0,
      time: Date.now() - startTime,
    })
  }

  try {
    const fuse = getFuse()
    const results = fuse.search(q)

    // 按类型过滤
    let filtered = results
    if (type) {
      filtered = filtered.filter(r => r.item.type === type)
    }

    // 综合排序
    const sortedItems = sortResults(filtered)

    // 关键词联想模式 - 返回匹配的名称建议
    if (mode === 'suggest') {
      const suggestions = sortedItems.slice(0, 10).map(item => ({
        name: item.name,
        type: item.type,
        count: item.count,
        url: item.url,
      }))
      return NextResponse.json({
        suggestions,
        time: Date.now() - startTime,
      })
    }

    // 标准搜索模式 - 返回完整结果
    const total = sortedItems.length
    const pageResults = sortedItems.slice(0, 50)

    // 统计各类型数量
    const typeStats = {
      concept: sortedItems.filter(i => i.type === 'concept').length,
      company: sortedItems.filter(i => i.type === 'company').length,
      person: sortedItems.filter(i => i.type === 'person').length,
      letter: sortedItems.filter(i => i.type === 'letter').length,
      article: sortedItems.filter(i => i.type === 'article').length,
      qa: sortedItems.filter(i => i.type === 'qa').length,
      talk: sortedItems.filter(i => i.type === 'talk').length,
      interview: sortedItems.filter(i => i.type === 'interview').length,
    }

    return NextResponse.json({
      query: q,
      results: pageResults.map(item => ({
        name: item.name,
        type: item.type,
        description: item.description,
        count: item.count,
        years: item.years.slice(0, 10),
        url: item.url,
      })),
      total,
      typeStats,
      time: Date.now() - startTime,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '搜索过程中发生错误，请稍后重试' },
      { status: 500 }
    )
  }
}
