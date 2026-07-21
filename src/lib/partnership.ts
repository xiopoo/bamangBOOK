import { readdirSync, existsSync, readFileSync } from 'fs'
import path from 'path'

/**
 * 巴菲特合伙人信 / 股东信 · 列表数据层
 * --------------------------------------------------
 * 统一封装两类信件的文件解析逻辑，供 /partnership、/letters 页面复用，
 * 消除此前两个页面里几乎重复的 parsePartnershipFilename / sortLetters。
 */

export interface PartnershipLetter {
  id: number
  year: number
  subtitle: string
  filename: string
}

export interface YearGroup {
  year: number
  letters: PartnershipLetter[]
}

export interface ShareholderLetter {
  year: number
  filename: string
}

// 合伙人时期：1956-1970（巴菲特合伙基金）
export const PARTNERSHIP_YEAR_RANGE: [number, number] = [1956, 1970]

/**
 * 解析合伙人信文件名
 * 形如：partnership_1965年中-巴菲特致合伙人信.md
 *      partnership_1968111日-巴菲特致合伙人信.md
 */
export function parsePartnershipFilename(file: string): { year: number; subtitle: string } {
  const match = file.match(/partnership_(\d{4})(.*?)-(?:巴菲特致合伙人信|有限合伙协议)\.md$/)
  if (!match) return { year: 0, subtitle: '' }
  return {
    year: parseInt(match[1], 10),
    subtitle: match[2],
  }
}

/**
 * 子标题排序键：全年 < 年中 < 具体日期（按月/日）
 */
export function getPartnershipSortKey(subtitle: string): [number, number] {
  if (subtitle === '') return [0, 0]
  if (subtitle === '年中') return [1, 0]
  const monthMatch = subtitle.match(/(\d+)月/)
  const dayMatch = subtitle.match(/(\d+)日/)
  const month = monthMatch ? parseInt(monthMatch[1], 10) : 99
  const day = dayMatch ? parseInt(dayMatch[1], 10) : 0
  return [month + 2, day]
}

export function sortPartnershipLetters(letters: PartnershipLetter[]): PartnershipLetter[] {
  return [...letters].sort((a, b) => {
    const [aMonth, aDay] = getPartnershipSortKey(a.subtitle)
    const [bMonth, bDay] = getPartnershipSortKey(b.subtitle)
    if (aMonth !== bMonth) return aMonth - bMonth
    return aDay - bDay
  })
}

/** 把原始 subtitle 格式化为展示用的副标题 */
export function formatPartnershipSubtitle(subtitle: string): string {
  if (!subtitle) return '全年'
  if (subtitle === '年中') return '年中'
  return subtitle.replace(/^年/, '')
}

/**
 * 读取合伙企业时期的全部信件，并按年份分组（每年内按时间排序）。
 */
export function getPartnershipYearGroups(): YearGroup[] {
  const dir = path.join(process.cwd(), 'content/partnership')
  if (!existsSync(dir)) return []

  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  const letters = files
    .map((file, index) => {
      const { year, subtitle } = parsePartnershipFilename(file)
      return { id: index + 1, year, subtitle, filename: file }
    })
    .filter((l) => l.year >= PARTNERSHIP_YEAR_RANGE[0] && l.year <= PARTNERSHIP_YEAR_RANGE[1])

  const yearMap = new Map<number, PartnershipLetter[]>()
  letters.forEach((letter) => {
    if (!yearMap.has(letter.year)) yearMap.set(letter.year, [])
    yearMap.get(letter.year)!.push(letter)
  })

  return Array.from(yearMap.entries())
    .map(([year, groupLetters]) => ({
      year,
      letters: sortPartnershipLetters(groupLetters),
    }))
    .sort((a, b) => a.year - b.year)
}

export function getPartnershipCount(): number {
  return getPartnershipYearGroups().reduce((sum, g) => sum + g.letters.length, 0)
}

/**
 * 解析股东信文件名：berkshire_1988-巴菲特致股东信.md → 1988
 */
export function parseShareholderYear(file: string): number {
  const match = file.match(/berkshire_(\d{4})/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * 读取伯克希尔股东信列表，按年份倒序。
 * startYear 默认 1965（伯克希尔时期起点）。
 */
export function getShareholderLetters(startYear = 1965): ShareholderLetter[] {
  const dir = path.join(process.cwd(), 'content/letters')
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => ({ year: parseShareholderYear(file), filename: file }))
    .filter((l) => l.year >= startYear)
    .sort((a, b) => a.year - b.year)
}

export function getShareholderCount(startYear = 1965): number {
  return getShareholderLetters(startYear).length
}

/**
 * 获取所有合伙人信列表（按年份和时间排序）
 */
export function getAllPartnershipLetters(): PartnershipLetter[] {
  const yearGroups = getPartnershipYearGroups()
  return yearGroups.flatMap(group => group.letters)
}

/**
 * 根据ID获取合伙人信
 */
export function getPartnershipLetterById(id: number): { content: string; letter: PartnershipLetter | null } | null {
  const allLetters = getAllPartnershipLetters()
  const letter = allLetters.find(l => l.id === id)
  
  if (!letter) return null
  
  const dir = path.join(process.cwd(), 'content/partnership')
  const fullPath = path.join(dir, letter.filename)
  
  if (!existsSync(fullPath)) return null
  
  const content = readFileSync(fullPath, 'utf-8')
  return {
    content,
    letter
  }
}

/**
 * 根据文件名获取合伙人信（备用方法）
 */
export function getPartnershipLetterByFilename(filename: string): { content: string; letter: PartnershipLetter | null } | null {
  const dir = path.join(process.cwd(), 'content/partnership')
  
  // 尝试直接查找
  let fullPath = path.join(dir, filename)
  if (existsSync(fullPath)) {
    const { year, subtitle } = parsePartnershipFilename(filename)
    const allLetters = getAllPartnershipLetters()
    const letter = allLetters.find(l => l.filename === filename)
    return {
      content: readFileSync(fullPath, 'utf-8'),
      letter: letter || { id: 0, year, subtitle, filename }
    }
  }
  
  // 如果直接查找失败，尝试遍历目录匹配（处理编码问题）
  try {
    const files = readdirSync(dir)
    for (const file of files) {
      if (file === filename || 
          file.replace('.md', '') === filename.replace('.md', '')) {
        fullPath = path.join(dir, file)
        const { year, subtitle } = parsePartnershipFilename(file)
        const allLetters = getAllPartnershipLetters()
        const letter = allLetters.find(l => l.filename === file)
        return {
          content: readFileSync(fullPath, 'utf-8'),
          letter: letter || { id: 0, year, subtitle, filename: file }
        }
      }
    }
  } catch (e) {
    console.error('Error reading partnership directory:', e)
  }
  
  return null
}

/**
 * 获取某封信的前后信件
 */
export function getAdjacentLettersById(id: number): { prev: PartnershipLetter | null; next: PartnershipLetter | null } {
  const allLetters = getAllPartnershipLetters()
  const currentIndex = allLetters.findIndex(l => l.id === id)
  
  if (currentIndex === -1) {
    return { prev: null, next: null }
  }
  
  return {
    prev: currentIndex > 0 ? allLetters[currentIndex - 1] : null,
    next: currentIndex < allLetters.length - 1 ? allLetters[currentIndex + 1] : null
  }
}
