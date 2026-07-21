import { readFileSync, existsSync } from 'fs'
import path from 'path'

export interface BloggerArticle {
  title: string
  date: string
  year: number | null
  fileName: string
  url: string
  author: string
  account: string
  tags: string[]
  wordCount: number
}

export interface BloggerStats {
  total: number
  dateRange: string
  tags: { tag: string; count: number }[]
}

export interface BloggerData {
  name: string
  articles: BloggerArticle[]
  stats: BloggerStats
}

const INDEX_PATH = path.join(process.cwd(), 'content', 'bloggers', 'bloggers-index.json')
const BLOGGERS_DIR = path.join(process.cwd(), 'content', 'bloggers')

let _indexCache: BloggerData[] | null = null

function loadIndex(): BloggerData[] {
  if (_indexCache) return _indexCache
  if (!existsSync(INDEX_PATH)) return []
  try {
    _indexCache = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'))
    return _indexCache || []
  } catch {
    return []
  }
}

/** 获取所有博主列表 */
export function getBloggers(): { name: string; count: number; dateRange: string }[] {
  const data = loadIndex()
  return data.map(b => ({
    name: b.name,
    count: b.stats.total,
    dateRange: b.stats.dateRange,
  }))
}

/** 获取某博主的所有文章 */
export function getBloggerArticles(bloggerName: string): BloggerArticle[] {
  const data = loadIndex()
  const blogger = data.find(b => b.name === bloggerName)
  return blogger?.articles || []
}

/** 获取博主统计数据 */
export function getBloggerStats(bloggerName: string): BloggerStats | null {
  const data = loadIndex()
  const blogger = data.find(b => b.name === bloggerName)
  return blogger?.stats || null
}

/** 去除 frontmatter 块 */
function stripFrontmatter(content: string): string {
  const lines = content.split('\n')
  if (lines[0]?.trim() !== '---') return content
  let endIndex = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      endIndex = i
      break
    }
  }
  if (endIndex === -1) return content
  return lines.slice(endIndex + 1).join('\n')
}

/** 清理正文：去掉 WeChat 元数据行（重复标题、作者行、原文链接行） */
function cleanBodyContent(body: string): string {
  const lines = body.split('\n')
  const result: string[] = []
  let skippedH1 = false

  for (const line of lines) {
    const trimmed = line.trim()
    
    // 跳过文章开头的 H1 标题（页面 header 已显示）
    if (!skippedH1 && trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      skippedH1 = true
      continue
    }
    // 跳过 WeChat 元数据行
    if (trimmed.startsWith('> ') && (
      trimmed.includes('·') && (trimmed.includes('202') || trimmed.includes('201')) || // 作者/日期行
      trimmed.includes('原文链接') ||  // 原文链接行
      trimmed.startsWith('> [原文链接]')
    )) {
      continue
    }
    // 跳过空白的引用行
    if (trimmed === '>' || trimmed === '') {
      // 不跳过空白行，但跳过单独的 >
      if (trimmed === '>') continue
    }
    
    result.push(line)
  }
  
  // 去除开头多余的空行
  while (result.length > 0 && result[0].trim() === '') {
    result.shift()
  }
  
  return result.join('\n')
}

/** 构建微信 URL → 站内路径的映射表 */
function buildUrlMap(): Map<string, string> {
  const data = loadIndex()
  const map = new Map<string, string>()
  
  for (const blogger of data) {
    for (const article of blogger.articles) {
      if (!article.url) continue
      try {
        const urlObj = new URL(article.url)
        if (!urlObj.hostname.includes('weixin.qq.com')) continue
        
        // 短链接格式: /s/XXXXX
        if (urlObj.pathname.startsWith('/s/')) {
          const articlePath = `/bloggers/${encodeURIComponent(blogger.name)}/${encodeURIComponent(article.fileName)}`
          const shortId = urlObj.pathname.replace('/s/', '')
          if (shortId) map.set(shortId, articlePath)
        }
      } catch { /* skip malformed URLs */ }
    }
  }
  
  return map
}

/** 构建文章标题 → 站内路径的映射表（用于长链接兜底匹配） */
function buildTitleMap(): Map<string, string> {
  const data = loadIndex()
  const map = new Map<string, string>()
  
  for (const blogger of data) {
    for (const article of blogger.articles) {
      // 用清理后的标题做 key（去除引号和多余空格）
      const cleanTitle = article.title.replace(/["""''\s]+/g, '').toLowerCase()
      const articlePath = `/bloggers/${encodeURIComponent(blogger.name)}/${encodeURIComponent(article.fileName)}`
      map.set(cleanTitle, articlePath)
    }
  }
  
  return map
}

/** 替换正文中的微信外链为站内链接 */
function replaceWeChatLinks(content: string): string {
  const urlMap = buildUrlMap()
  const titleMap = buildTitleMap()
  
  // 匹配 markdown 链接 [text](wechat_url)
  return content.replace(
    /\[([^\]]*)\]\((https?:\/\/mp\.weixin\.qq\.com\/s[^\s)]*)\)/g,
    (match, text, url) => {
      try {
        const urlObj = new URL(url)
        
        // 短链接: /s/XXXXX
        if (urlObj.pathname.startsWith('/s/') && !url.includes('__biz=')) {
          const shortId = urlObj.pathname.replace('/s/', '')
          const internalPath = urlMap.get(shortId)
          if (internalPath) {
            return `[${text}](${internalPath})`
          }
        }
        
        // 长链接: /s?__biz=...&sn=YYYYY&...
        const sn = urlObj.searchParams.get('sn')
        if (sn) {
          const internalPath = urlMap.get(sn)
          if (internalPath) {
            return `[${text}](${internalPath})`
          }
        }
        
        // 兜底：用短路径匹配
        if (urlObj.pathname.startsWith('/s/')) {
          const shortId = urlObj.pathname.replace('/s/', '').replace(/\?.*$/, '')
          const internalPath = urlMap.get(shortId)
          if (internalPath) {
            return `[${text}](${internalPath})`
          }
        }
      } catch {}
      
      // 按链接文字（标题）兜底匹配
      if (text) {
        const cleanText = text.replace(/["""''\s]+/g, '').toLowerCase()
        const internalPath = titleMap.get(cleanText)
        if (internalPath) {
          return `[${text}](${internalPath})`
        }
      }
      
      // 无匹配，去掉链接保留文字（避免死链）
      return text || ''
    }
  )
}

/** 获取单篇文章（返回清理后的内容） */
export function getBloggerArticle(bloggerName: string, fileName: string): { 
  title: string
  content: string
  date: string
  year: number | null
  url: string
  author: string
  account: string
  tags: string[]
  wordCount: number
} | null {
  const filePath = path.join(BLOGGERS_DIR, bloggerName, fileName)
  if (!existsSync(filePath)) return null
  
  const rawContent = readFileSync(filePath, 'utf-8')
  const articles = getBloggerArticles(bloggerName)
  const article = articles.find(a => a.fileName === fileName)
  
  // 清理正文：去 frontmatter、去 WeChat 元数据、替换外链
  const body = stripFrontmatter(rawContent)
  const cleanedBody = cleanBodyContent(body)
  const finalContent = replaceWeChatLinks(cleanedBody)
  
  if (!article) {
    return {
      title: fileName.replace('.md', ''),
      content: finalContent,
      date: '',
      year: null,
      url: '',
      author: bloggerName,
      account: bloggerName,
      tags: [],
      wordCount: 0,
    }
  }
  
  return {
    title: article.title,
    content: finalContent,
    date: article.date,
    year: article.year,
    url: article.url,
    author: article.author,
    account: article.account,
    tags: article.tags,
    wordCount: article.wordCount,
  }
}

/** 获取某博主的某一标签的所有文章 */
export function getBloggerArticlesByTag(bloggerName: string, tag: string): BloggerArticle[] {
  return getBloggerArticles(bloggerName).filter(a => a.tags.includes(tag))
}

/** 获取所有文章 */
export function getAllBloggerArticles(): (BloggerArticle & { blogger: string })[] {
  const data = loadIndex()
  const result: (BloggerArticle & { blogger: string })[] = []
  for (const blogger of data) {
    for (const article of blogger.articles) {
      result.push({ ...article, blogger: blogger.name })
    }
  }
  return result
}

/** 获取所有博主的全部标签（去重） */
export function getAllBloggerTags(): string[] {
  const data = loadIndex()
  const tags = new Set<string>()
  for (const blogger of data) {
    for (const article of blogger.articles) {
      for (const tag of article.tags) {
        tags.add(tag)
      }
    }
  }
  return Array.from(tags).sort()
}
