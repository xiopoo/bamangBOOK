import { readdirSync, existsSync } from 'fs'
import path from 'path'
import { getPartnershipHrefForYear, PARTNERSHIP_YEAR_RANGE } from './partnership'
import {
  PEOPLE_ALIAS_MAP,
  resolveConceptCanonicalName,
  resolvePersonCanonicalName,
} from './entity-aliases'

function getContentIds(dir: string): Set<string> {
  const dirPath = path.join(process.cwd(), dir)
  if (!existsSync(dirPath)) return new Set()
  return new Set(
    readdirSync(dirPath)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  )
}

const companyIds = getContentIds('content/companies')
const conceptIds = getContentIds('content/concepts')
// 人物：以 content/people/ 实际文件名为主，别名表补充
const peopleFileIds = getContentIds('content/people')
const canonicalPeople = Object.keys(PEOPLE_ALIAS_MAP)
const allPeopleIds = new Set<string>([
  ...peopleFileIds,
  ...canonicalPeople.flatMap((k) => [k, ...(PEOPLE_ALIAS_MAP[k] || [])]),
])

export function resolvePersonCanonical(id: string): string {
  const canonical = resolvePersonCanonicalName(id)
  if (canonical !== id) return canonical
  // 其次：恰好是 people/ 下存在的文件名
  if (peopleFileIds.has(id)) return id
  return id
}

export function resolveEntityLink(entity: string): string {
  if (companyIds.has(entity)) {
    return `/companies/${encodeURIComponent(entity)}`
  }
  if (allPeopleIds.has(entity)) {
    return `/people/${encodeURIComponent(resolvePersonCanonical(entity))}`
  }
  const canonicalConcept = resolveConceptCanonicalName(entity)
  if (conceptIds.has(canonicalConcept)) {
    return `/concepts/${encodeURIComponent(canonicalConcept)}`
  }
  // 兜底：判断是否是“信件标题”模式，命中则指向对应年份信件
  const letterHref = resolveLetterTitleHref(entity)
  if (letterHref) return letterHref
  // 其余一律不再生成 /concepts/{entity}（否则会落到空占位页）。
  // 由调用方根据返回值决定降级为纯文本。
  return ''
}

// 识别“信件标题”类实体，如：
//   - 2012年股东信 / 2014年股东信
//   - berkshire_1979-巴菲特致股东信
//   - 1965年合伙人信 / partnership_1965-...
// 命中则返回 /letters/{year}
export function resolveLetterTitleHref(entity: string): string {
  let m = entity.match(/(\d{4})年/) // “2012年股东信”
  if (m) return resolveYearHref(Number(m[1]))
  m = entity.match(/berkshire_(\d{4})/) // “berkshire_1979-巴菲特致股东信”
  if (m) return resolveYearHref(Number(m[1]))
  m = entity.match(/partnership_(\d{4})/) // “partnership_1965-...”
  if (m) return getPartnershipHrefForYear(Number(m[1]))
  m = entity.match(/^(\d{4})/) // 纯年份开头
  if (m && entity.length <= 8) return resolveYearHref(Number(m[1]))
  return ''
}

function resolveYearHref(year: number): string {
  if (year >= PARTNERSHIP_YEAR_RANGE[0] && year < 1965) {
    return getPartnershipHrefForYear(year)
  }
  return `/letters/${year}`
}

export function resolveMarkdownEntityLinks(content: string): string {
  return content
    .replace(/\[\[([^\]]+)\]\]/g, (_match, entity: string) => {
      const href = resolveEntityLink(entity)
      return href ? `[${entity}](${href})` : entity
    })
    .replace(/\]\(\/letters\/(\d{4})\)/g, (_match, year: string) => {
      return `](${resolveYearHref(Number(year))})`
    })
}

export function resolvePersonContentFile(personName: string): string | null {
  const canonical = resolvePersonCanonical(personName)
  const candidates = [canonical, ...(PEOPLE_ALIAS_MAP[canonical] || [])]
  const peopleDir = path.join(process.cwd(), 'content/people')
  if (!existsSync(peopleDir)) return null

  for (const c of candidates) {
    const p = path.join(peopleDir, `${c}.md`)
    if (existsSync(p)) return p
  }

  // 兜底：查找包含 canonical 子串的人物档案文件名
  for (const file of readdirSync(peopleDir).filter((f) => f.endsWith('.md'))) {
    const name = file.replace(/\.md$/, '')
    if (name.includes(canonical)) return path.join(peopleDir, file)
  }
  return null
}

export { companyIds, conceptIds, peopleFileIds, allPeopleIds, PEOPLE_ALIAS_MAP }
