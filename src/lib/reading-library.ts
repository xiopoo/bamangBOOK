import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { getDYDocs, type DYSection } from './duanyongping'
import {
  type LucideIcon,
  Mail,
  Send,
  Mic,
  HelpCircle,
  MessageCircle,
  BookOpen,
  Flag,
  Building2,
  FileText,
} from 'lucide-react'

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
  icon: LucideIcon
  items: ReadingItem[]
  totalCount: number
}

export interface ReadingAuthor {
  name: string
  categories: ReadingCategory[]
  totalCount: number
}

export type AuthorId = 'buffett' | 'munger' | 'duan' | 'schloss' | 'other'
export type CategoryId = 'partnership' | 'shareholder-letter' | 'talk' | 'interview' | 'qa' | 'duan-qa' | 'article' | 'milestone' | 'company-analysis' | 'other'

interface CategoryDef {
  id: CategoryId
  name: string
  icon: LucideIcon
}

const CATEGORIES: Record<CategoryId, CategoryDef> = {
  'partnership': { id: 'partnership', name: '合伙人信', icon: Mail },
  'shareholder-letter': { id: 'shareholder-letter', name: '股东信', icon: Send },
  'talk': { id: 'talk', name: '演讲', icon: Mic },
  'interview': { id: 'interview', name: '访谈', icon: Mic },
  'qa': { id: 'qa', name: '股东大会', icon: HelpCircle },
  'duan-qa': { id: 'duan-qa', name: '问答', icon: MessageCircle },
  'article': { id: 'article', name: '文章', icon: BookOpen },
  'milestone': { id: 'milestone', name: '公司里程碑', icon: Flag },
  'company-analysis': { id: 'company-analysis', name: '公司分析', icon: Building2 },
  'other': { id: 'other', name: '其他', icon: FileText },
}

function partnershipDisplayTitle(fileName: string): { title: string; year: number | null } {
  const base = fileName.replace(/\.md$/, '')
  const match = base.match(/^partnership_(\d{4})(?:-([^-]+))?-(.+)$/)
  if (!match) return { title: '巴菲特合伙人信', year: null }

  const [, year, qualifier, subject] = match
  const qualifierLabel: Record<string, string> = {
    annual: '年度信',
    interim: '年中信',
  }
  const edition = qualifier ? qualifierLabel[qualifier] || qualifier : ''
  return {
    title: `${year} 年${edition ? ` ${edition}` : ''}${subject === '有限合伙协议' ? '有限合伙协议' : '巴菲特致合伙人信'}`,
    year: Number(year),
  }
}

/**
 * 加载所有已索引的内容
 */
function loadIndexedContent() {
  const cwd = process.cwd()
  const result: Record<AuthorId, { items: ReadingItem[]; dirs: Set<string> }> = {
    buffett: { items: [], dirs: new Set() },
    munger: { items: [], dirs: new Set() },
    duan: { items: [], dirs: new Set() },
    schloss: { items: [], dirs: new Set() },
    other: { items: [], dirs: new Set() },
  }

  // 1. 合伙人信 (content/partnership/)
  const partnershipDir = path.join(cwd, 'content/partnership')
  if (existsSync(partnershipDir)) {
    const files = readdirSync(partnershipDir).filter(f => f.endsWith('.md'))
    files.forEach(f => {
      const { title, year } = partnershipDisplayTitle(f)
      result.buffett.items.push({
        title,
        fileName: f,
        filePath: `content/partnership/${f}`,
        year,
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
          filePath: `content/talks/${t.fileName}${t.fileName.endsWith('.md') ? '' : '.md'}`,
          year: t.year,
          sourceDir: 'talks',
          href: `/talks/${encodeURIComponent(t.fileName)}`,
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
          filePath: `content/interviews/${t.fileName}${t.fileName.endsWith('.md') ? '' : '.md'}`,
          year: t.year,
          sourceDir: 'interviews',
          href: `/interviews/${encodeURIComponent(t.fileName)}`,
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
        const isWesco = t.fileName.startsWith('Wesco_股东大会_')
        const author = isWesco ? result.munger : result.buffett
        author.items.push({
          title: t.title,
          fileName: t.fileName,
          filePath: `content/qa/${t.fileName}${t.fileName.endsWith('.md') ? '' : '.md'}`,
          year: t.year,
          sourceDir: 'qa',
          href: isWesco && t.year
            ? `/munger/wesco/${t.year}`
            : `/qa/${encodeURIComponent(t.fileName)}`,
        })
      })
    } catch { /* ignore */ }
  }

  // 6. 公司分析 (content/companies/)
  const companiesDir = path.join(cwd, 'content/companies')
  if (existsSync(companiesDir)) {
    const files = readdirSync(companiesDir).filter(f => f.endsWith('.md'))
    files.forEach(f => {
      const title = f.replace(/\.md$/, '')
      result.other.items.push({
        title,
        fileName: f,
        filePath: `content/companies/${f}`,
        sourceDir: 'companies',
        href: `/companies/${encodeURIComponent(title)}`,
      })
    })
  }

  // 7. 段永平原典资料。只读取元数据，目录页不加载正文。
  const duanSections: Array<{ section: DYSection; sourceDir: string }> = [
    { section: 'blog', sourceDir: 'duan-blog' },
    { section: 'qa', sourceDir: 'duan-qa' },
    { section: 'talks', sourceDir: 'duan-talks' },
    { section: 'milestones', sourceDir: 'duan-milestones' },
  ]
  for (const { section, sourceDir } of duanSections) {
    for (const doc of getDYDocs(section, false)) {
      result.duan.items.push({
        title: doc.title,
        fileName: doc.fileName,
        filePath: `content/duanyongping/${section}/${doc.fileName}`,
        year: doc.year ? Number(doc.year) : null,
        sourceDir,
        href: `/duanyongping/${section}/${doc.slug}`,
      })
    }
  }

  return result
}

/**
 * 获取完整阅读库索引
 */
export function getReadingLibrary(): ReadingAuthor[] {
  const indexed = loadIndexedContent()

  const authors: { id: AuthorId; name: string; items: ReadingItem[] }[] = [
    { id: 'buffett', name: '巴菲特', items: [...indexed.buffett.items] },
    { id: 'munger', name: '芒格', items: [...indexed.munger.items] },
    { id: 'duan', name: '段永平', items: [...indexed.duan.items] },
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
        case 'duan-qa':
          catId = 'duan-qa'
          break
        case 'duan-talks':
          catId = 'talk'
          break
        case 'duan-milestones':
          catId = 'milestone'
          break
        case 'duan-blog':
          catId = 'article'
          break
        case 'companies':
          catId = 'company-analysis'
          break
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
    const categoryOrder: CategoryId[] = ['partnership', 'shareholder-letter', 'talk', 'interview', 'qa', 'duan-qa', 'article', 'milestone', 'company-analysis', 'other']
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
