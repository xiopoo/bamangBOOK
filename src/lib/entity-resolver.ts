import { readdirSync, existsSync } from 'fs'
import path from 'path'

// 人物标准化映射：canonical name -> 别名列表（包含中英文变体）
// 仍保留用于规范化（如 [[沃伦·巴菲特]] / [[Buffett]] 统一指向 巴菲特），
// 但识别人物不再仅依赖此表，而是同时用 content/people/ 实际文件名。
const PEOPLE_ALIAS_MAP: Record<string, string[]> = {
  '巴菲特': ['Buffett', '沃伦·巴菲特', 'Warren Buffett'],
  '芒格': ['Munger', 'Charlie Munger', '查理·芒格'],
  '格雷厄姆': ['Graham', '本杰明·格雷厄姆'],
  '格雷格·阿贝尔': ['Greg Abel', 'Abel', '阿贝尔'],
  '汤姆·墨菲': ['Tom Murphy'],
  '费雪': ['Fisher', '菲尔·费雪'],
  '皮特·利格尔': ['Pete Liegl'],
}

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
  // 优先：别名表命中（处理 Buffett -> 巴菲特 这类规范化）
  for (const [canonical, aliases] of Object.entries(PEOPLE_ALIAS_MAP)) {
    if (canonical === id || aliases.includes(id)) return canonical
  }
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
  if (conceptIds.has(entity)) {
    return `/concepts/${encodeURIComponent(entity)}`
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
  if (m) return `/letters/${m[1]}`
  m = entity.match(/berkshire_(\d{4})/) // “berkshire_1979-巴菲特致股东信”
  if (m) return `/letters/${m[1]}`
  m = entity.match(/partnership_(\d{4})/) // “partnership_1965-...”
  if (m) return `/letters/${m[1]}`
  m = entity.match(/^(\d{4})/) // 纯年份开头
  if (m && entity.length <= 8) return `/letters/${m[1]}`
  return ''
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
