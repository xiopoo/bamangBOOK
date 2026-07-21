import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'

export interface ReadingItem {
  title: string
  fileName: string
  filePath: string
  year?: number | null
  sourceDir: string
  href: string
}

export interface ReadingCategory {
  name: string
  icon: string
  items: ReadingItem[]
  totalCount: number
}

export interface ReadingAuthor {
  name: string
  categories: ReadingCategory[]
  totalCount: number
}

export type AuthorId = 'buffett' | 'munger' | 'schloss' | 'other'
export type CategoryId = 'partnership' | 'shareholder-letter' | 'talk' | 'interview' | 'qa' | 'article' | 'company-analysis' | 'other'

interface CategoryDef {
  id: CategoryId
  name: string
  icon: string
}

const CATEGORIES: Record<CategoryId, CategoryDef> = {
  'partnership': { id: 'partnership', name: '合伙人信', icon: '📩' },
  'shareholder-letter': { id: 'shareholder-letter', name: '股东信', icon: '📨' },
  'talk': { id: 'talk', name: '演讲', icon: '🎤' },
  'interview': { id: 'interview', name: '访谈', icon: '🎙️' },
  'qa': { id: 'qa', name: '股东大会', icon: '❓' },
  'article': { id: 'article', name: '文章', icon: '📖' },
  'company-analysis': { id: 'company-analysis', name: '公司分析', icon: '🏢' },
  'other': { id: 'other', name: '其他', icon: '📄' },
}

/**
 * 根据文件名判断作者
 */
function classifyAuthor(fileName: string): AuthorId {
  if (fileName.startsWith('芒格：') || fileName.startsWith('Wesco_') || fileName.startsWith('芒格：')) {
    return 'munger'
  }
  if (fileName.startsWith('施洛斯：')) {
    return 'schloss'
  }
  if (fileName.startsWith('巴菲特') || fileName.startsWith('伯克希尔') ||
      fileName.startsWith('巴菲特：') || fileName.startsWith('巴菲特致') ||
      fileName.startsWith('巴菲特谈') || fileName.startsWith('巴菲特奥')) {
    return 'buffett'
  }
  return 'other'
}

/**
 * 根据文件名判断 pdf-documents-formatted 中的文件类别
 */
function classifyPdfDocCategory(fileName: string): CategoryId | null {
  if (fileName.startsWith('巴菲特致股东的信_')) return 'shareholder-letter'
  if (fileName.startsWith('巴菲特致合伙人的信_')) return 'partnership'
  if (fileName.startsWith('伯克希尔股东大会')) return 'qa'
  if (fileName.startsWith('Wesco_股东大会')) return 'qa'

  // 演讲类
  if (/演讲|谈话/.test(fileName)) return 'talk'

  // 访谈/对话/专访类
  if (/对话|专访|接见|CNBC|采访|罗斯/.test(fileName)) return 'interview'

  // 公司分析类
  if (fileName.startsWith('我最看好的股票') || fileName.startsWith('企业收藏家')) return 'company-analysis'

  return 'article'
}

/**
 * 加载所有已索引的内容
 */
function loadIndexedContent() {
  const cwd = process.cwd()
  const result: Record<AuthorId, { items: ReadingItem[]; dirs: Set<string> }> = {
    buffett: { items: [], dirs: new Set() },
    munger: { items: [], dirs: new Set() },
    schloss: { items: [], dirs: new Set() },
    other: { items: [], dirs: new Set() },
  }

  // 1. 合伙人信 (content/partnership/)
  const partnershipDir = path.join(cwd, 'content/partnership')
  if (existsSync(partnershipDir)) {
    const files = readdirSync(partnershipDir).filter(f => f.endsWith('.md'))
    files.forEach(f => {
      const title = f.replace(/\.md$/, '')
      result.buffett.items.push({
        title,
        fileName: f,
        filePath: `content/partnership/${f}`,
        sourceDir: 'partnership',
        href: `/partnership`,
      })
    })
  }

  // 2. 股东信 (content/letters/)
  const lettersDir = path.join(cwd, 'content/letters')
  if (existsSync(lettersDir)) {
    const files = readdirSync(lettersDir).filter(f => f.endsWith('.md'))
    files.forEach(f => {
      const match = f.match(/berkshire_(\d{4})/)
      const year = match ? parseInt(match[1]) : null
      const title = `巴菲特致股东的信 ${year || ''}`.trim()
      result.buffett.items.push({
        title,
        fileName: f,
        filePath: `content/letters/${f}`,
        year,
        sourceDir: 'letters',
        href: year ? `/letters/${year}` : '/letters',
      })
    })
  }

  // 3. 演讲 (content/talks/) - 从 talks-index.json 读取 person 字段
  const talksIndexPath = path.join(cwd, 'content/talks-index.json')
  if (existsSync(talksIndexPath)) {
    try {
      const talks: { title: string; year: number | null; fileName: string; person: string }[] =
        JSON.parse(readFileSync(talksIndexPath, 'utf-8'))
      talks.forEach(t => {
        const author = t.person === 'buffett' ? 'buffett' as AuthorId
          : t.person === 'munger' ? 'munger' as AuthorId
          : t.person === 'schloss' ? 'schloss' as AuthorId
          : 'other' as AuthorId
        result[author].items.push({
          title: t.title,
          fileName: t.fileName,
          filePath: `content/talks/${t.fileName}`,
          year: t.year,
          sourceDir: 'talks',
          href: `/talks/${encodeURIComponent(t.fileName.replace(/\.md$/, ''))}`,
        })
      })
    } catch { /* ignore */ }
  }

  // 4. 访谈 (content/interviews/) - 从 interviews-index.json
  const interviewsIndexPath = path.join(cwd, 'content/interviews-index.json')
  if (existsSync(interviewsIndexPath)) {
    try {
      const interviews: { title: string; year: number | null; fileName: string; person: string }[] =
        JSON.parse(readFileSync(interviewsIndexPath, 'utf-8'))
      interviews.forEach(t => {
        const author = t.person === 'buffett' ? 'buffett' as AuthorId
          : t.person === 'munger' ? 'munger' as AuthorId
          : t.person === 'schloss' ? 'schloss' as AuthorId
          : 'other' as AuthorId
        result[author].items.push({
          title: t.title,
          fileName: t.fileName,
          filePath: `content/interviews/${t.fileName}`,
          year: t.year,
          sourceDir: 'interviews',
          href: `/interviews/${encodeURIComponent(t.fileName.replace(/\.md$/, ''))}`,
        })
      })
    } catch { /* ignore */ }
  }

  // 5. 股东大会 (content/qa/) - 从 qa-index.json
  const qaIndexPath = path.join(cwd, 'content/qa-index.json')
  if (existsSync(qaIndexPath)) {
    try {
      const qas: { title: string; year: number | null; fileName: string }[] =
        JSON.parse(readFileSync(qaIndexPath, 'utf-8'))
      qas.forEach(t => {
        // 股东大会主要是巴菲特和芒格
        result.buffett.items.push({
          title: t.title,
          fileName: t.fileName,
          filePath: `content/qa/${t.fileName}`,
          year: t.year,
          sourceDir: 'qa',
          href: `/qa/${encodeURIComponent(t.fileName.replace(/\.md$/, ''))}`,
        })
      })
    } catch { /* ignore */ }
  }

  // 6. 专题文章 (content/articles/) - 从 articles-index.json
  const articlesIndexPath = path.join(cwd, 'content/articles-index.json')
  if (existsSync(articlesIndexPath)) {
    try {
      const articles: { title: string; year: number | null; fileName: string; person?: string }[] =
        JSON.parse(readFileSync(articlesIndexPath, 'utf-8'))
      articles.forEach(t => {
        const author = t.person
          ? (t.person === 'buffett' ? 'buffett' as AuthorId
            : t.person === 'munger' ? 'munger' as AuthorId
            : t.person === 'schloss' ? 'schloss' as AuthorId
            : 'other' as AuthorId)
          : classifyAuthor(t.fileName)
        result[author].items.push({
          title: t.title,
          fileName: t.fileName,
          filePath: `content/articles/${t.fileName}`,
          year: t.year,
          sourceDir: 'articles',
          href: `/reading/article/${encodeURIComponent(t.fileName.replace(/\.md$/, ''))}`,
        })
      })
    } catch { /* ignore */ }
  }

  // 7. 公司分析 (content/companies/)
  const companiesDir = path.join(cwd, 'content/companies')
  if (existsSync(companiesDir)) {
    const files = readdirSync(companiesDir).filter(f => f.endsWith('.md'))
    files.forEach(f => {
      const title = f.replace(/\.md$/, '')
      result.buffett.items.push({
        title,
        fileName: f,
        filePath: `content/companies/${f}`,
        sourceDir: 'companies',
        href: `/companies/${encodeURIComponent(title)}`,
      })
    })
  }

  return result
}

/**
 * 扫描 pdf-documents-formatted 中未被其他索引覆盖的文件
 */
function loadPdfFormattedContent(existingDirs: Record<AuthorId, Set<string>>) {
  const cwd = process.cwd()
  const result: Record<AuthorId, ReadingItem[]> = {
    buffett: [],
    munger: [],
    schloss: [],
    other: [],
  }

  const dir = path.join(cwd, 'content/pdf-documents-formatted')
  if (!existsSync(dir)) return result

  const files = readdirSync(dir).filter(f => f.endsWith('.md'))

  files.forEach(fileName => {
    // 跳过已在其他目录索引过的文件（避免重复）
    // 如果文件名模式在已有索引中出现过，跳过
    if (fileName.startsWith('巴菲特致股东的信_') || fileName.startsWith('伯克希尔股东大会') ||
        fileName.startsWith('巴菲特致合伙人的信_')) {
      // 这些类型已被其他来源覆盖，跳过
      return
    }

    // 跳过已有索引目录中的演讲/访谈文件
    if (fileName.includes('演讲') || fileName.includes('对话') ||
        fileName.includes('专访') || fileName.includes('CNBC') ||
        fileName.includes('接见') || fileName.includes('采访')) {
      return
    }

    const author = classifyAuthor(fileName)
    const category = classifyPdfDocCategory(fileName)
    if (category === null) return

    const title = fileName.replace(/\.md$/, '')
    result[author].push({
      title,
      fileName,
      filePath: `content/pdf-documents-formatted/${fileName}`,
      sourceDir: 'pdf-documents-formatted',
      href: `/reading/article/${encodeURIComponent(fileName.replace(/\.md$/, ''))}`,
    })
  })

  return result
}

/**
 * 获取完整阅读库索引
 */
export function getReadingLibrary(): ReadingAuthor[] {
  const indexed = loadIndexedContent()
  const extra = loadPdfFormattedContent({ buffett: new Set(), munger: new Set(), schloss: new Set(), other: new Set() })

  const authors: { id: AuthorId; name: string; items: ReadingItem[] }[] = [
    { id: 'buffett', name: '巴菲特', items: [...indexed.buffett.items, ...extra.buffett] },
    { id: 'munger', name: '芒格', items: [...indexed.munger.items, ...extra.munger] },
    { id: 'schloss', name: '施洛斯', items: [...indexed.schloss.items, ...extra.schloss] },
    { id: 'other', name: '其他', items: [...indexed.other.items, ...extra.other] },
  ]

  return authors.map(author => {
    const categoriesMap = new Map<CategoryId, ReadingItem[]>()

    for (const item of author.items) {
      let catId: CategoryId

      switch (item.sourceDir) {
        case 'partnership':
          catId = 'partnership'
          break
        case 'letters':
          catId = 'shareholder-letter'
          break
        case 'talks':
          catId = 'talk'
          break
        case 'interviews':
          catId = 'interview'
          break
        case 'qa':
          catId = 'qa'
          break
        case 'companies':
          catId = 'company-analysis'
          break
        case 'articles':
        case 'pdf-documents-formatted': {
          // 根据文件名进一步细分
          const fileName = item.fileName
          if (/演讲|谈话/.test(fileName)) catId = 'talk'
          else if (/对话|专访|接见|CNBC|采访|罗斯/.test(fileName)) catId = 'interview'
          else if (fileName.startsWith('巴菲特致股东的信')) catId = 'shareholder-letter'
          else if (fileName.startsWith('巴菲特致合伙人的信') || fileName.startsWith('巴菲特合伙')) catId = 'partnership'
          else if (fileName.startsWith('伯克希尔股东大会') || fileName.startsWith('Wesco_股东大会')) catId = 'qa'
          else if (fileName.startsWith('我最看好的股票') || fileName.startsWith('企业收藏家')) catId = 'company-analysis'
          else catId = 'article'
          break
        }
        default:
          catId = 'article'
      }

      if (!categoriesMap.has(catId)) {
        categoriesMap.set(catId, [])
      }
      categoriesMap.get(catId)!.push(item)
    }

    const categories: ReadingCategory[] = []
    let authorTotal = 0

    for (const [catId, items] of categoriesMap.entries()) {
      const def = CATEGORIES[catId]
      categories.push({
        name: def.name,
        icon: def.icon,
        items,
        totalCount: items.length,
      })
      authorTotal += items.length
    }

    // 按分类排序
    const categoryOrder: CategoryId[] = ['partnership', 'shareholder-letter', 'talk', 'interview', 'qa', 'article', 'company-analysis', 'other']
    categories.sort((a, b) => {
      const aIdx = categoryOrder.indexOf(Object.entries(CATEGORIES).find(([, v]) => v.name === a.name)?.[0] as CategoryId || 'other')
      const bIdx = categoryOrder.indexOf(Object.entries(CATEGORIES).find(([, v]) => v.name === b.name)?.[0] as CategoryId || 'other')
      return aIdx - bIdx
    })

    return {
      name: author.name,
      categories,
      totalCount: authorTotal,
    }
  }).filter(a => a.totalCount > 0)
}

/**
 * 获取统计信息
 */
export function getReadingStats() {
  const library = getReadingLibrary()
  let totalItems = 0
  const authorCounts: Record<string, number> = {}

  for (const author of library) {
    authorCounts[author.name] = author.totalCount
    totalItems += author.totalCount
  }

  return {
    totalItems,
    authorCount: library.length,
    authorCounts,
    library,
  }
}
