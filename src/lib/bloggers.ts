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

/** 构建 per-blogger title→path，用于参考阅读段落优先在同博主下匹配 */
function buildPerBloggerTitleMap(): Map<string, Map<string, string>> {
  const data = loadIndex()
  const outer = new Map<string, Map<string, string>>()
  for (const blogger of data) {
    const inner = new Map<string, string>()
    for (const article of blogger.articles) {
      const k = article.title.replace(/["""''\s]+/g, '').toLowerCase()
      inner.set(k, `/bloggers/${encodeURIComponent(blogger.name)}/${encodeURIComponent(article.fileName)}`)
    }
    outer.set(blogger.name, inner)
  }
  return outer
}

const _titleKey = (s: string) => s.replace(/["""''\s]+/g, '').toLowerCase()

/**
 * 处理正文里的「参考阅读」段落：
 * - 逐行扫描每一个以「参考阅读：」开头的段落
 * - 后续非空行视作候选文章标题，优先在同博主、再在全局文章索引中精确匹配标题
 * - 能匹配：把候选标题替换为站内内链（作为有序列表渲染）
 * - 不能匹配：丢弃该行纯文本（避免无链接的占位文字）
 * - 若该段全部匹配失败：删除整个「参考阅读」段落
 */
export function processReferenceReading(content: string, bloggerName: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  const sameBloggerMap = buildPerBloggerTitleMap().get(bloggerName) ?? new Map<string, string>()
  const globalMap = buildTitleMap()

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() !== '参考阅读：') {
      result.push(line)
      i++
      continue
    }

    // 收集该段内的候选标题，直到遇到下一个 heading 或连续 3 个空行或 EOF
    const candidates: { raw: string; trimmed: string }[] = []
    let empties = 0
    let j = i + 1
    while (j < lines.length) {
      const l = lines[j]
      const trimmed = l.trim()
      if (/^#{1,6}\s/.test(trimmed)) break
      if (trimmed === '') {
        empties++
        if (empties > 2) break
        j++
        continue
      }
      empties = 0
      candidates.push({ raw: l, trimmed: trimmed.replace(/[\s\u3000]+$/g, '') })
      j++
    }

    // 生成链接列表
    const linked: { title: string; href: string }[] = []
    for (const c of candidates) {
      if (!c.trimmed) continue
      const k = _titleKey(c.trimmed)
      const href = sameBloggerMap.get(k) ?? globalMap.get(k)
      if (href) linked.push({ title: c.trimmed, href })
    }

    if (linked.length > 0) {
      // 保留 section title（换成更合理的层级），然后输出 markdown 内链列表
      result.push('### 参考阅读')
      result.push('')
      for (const item of linked) {
        // 标题中可能包含 []() 符号，做安全转义避免破坏 markdown
        const safeTitle = item.title.replace(/([[\]])/g, '\\$1')
        result.push(`- [${safeTitle}](${item.href})`)
      }
      result.push('')
    }
    // else：整个段删除，result 不写任何内容

    i = j
  }

  return result.join('\n')
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
  const filePath = path.join(BLOGGERS_DIR, bloggerName, fileName.endsWith('.md') ? fileName : `${fileName}.md`)
  if (!existsSync(filePath)) return null
  
  const rawContent = readFileSync(filePath, 'utf-8')
  const articles = getBloggerArticles(bloggerName)
  const article = articles.find(a => a.fileName === fileName)
  
  // 清理正文：去 frontmatter、去 WeChat 元数据、替换外链、处理参考阅读内链
  const body = stripFrontmatter(rawContent)
  const cleanedBody = cleanBodyContent(body)
  const replacedLinks = replaceWeChatLinks(cleanedBody)
  const finalContent = processReferenceReading(replacedLinks, bloggerName)
  
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
