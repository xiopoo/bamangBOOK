import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

const MODELS_DIR = path.join(process.cwd(), 'content/models')

/** 学科展示顺序（与 mungermodels.com 的格栅顺序一致） */
export const DISCIPLINE_ORDER: Array<{ id: string; name: string; icon: string }> = [
  { id: 'meta', name: '元认知与思维方法论', icon: '🧭' },
  { id: 'psych', name: '心理学', icon: '🧠' },
  { id: 'math', name: '数学与统计学', icon: '📐' },
  { id: 'econ', name: '微观经济学', icon: '📈' },
  { id: 'physics', name: '物理学与化学', icon: '⚛️' },
  { id: 'bio', name: '生物学与进化论', icon: '🧬' },
  { id: 'eng', name: '工程学', icon: '⚙️' },
  { id: 'complex', name: '复杂系统与决策科学', icon: '🌀' },
  { id: 'mgmt', name: '管理学与商业', icon: '🏛️' },
  { id: 'invest', name: '投资学与金融学', icon: '💰' },
  { id: 'accounting', name: '会计学', icon: '🧾' },
  { id: 'law', name: '法学与政治学', icon: '⚖️' },
  { id: 'history', name: '历史学与哲学', icon: '📜' },
  { id: 'decision', name: '投资原则与品格', icon: '🪨' },
]

export interface ModelMeta {
  slug: string
  title: string
  english: string
  discipline: string
  disciplineName: string
  importance: number
  scenarios: string[]
  description: string
  source: string
  sourceUrl: string
}

export interface ModelDetail extends ModelMeta {
  content: string
}

/** 路径安全校验：拒绝分隔符 / 上跳 / 空字节，并断言解析后仍在 models 目录内。 */
function resolveModelPath(slug: string): string | null {
  if (!slug || /[\\/\0]/.test(slug) || slug.includes('..')) return null
  const resolved = path.resolve(MODELS_DIR, `${slug}.md`)
  if (resolved !== path.join(MODELS_DIR, `${slug}.md`)) return null
  if (!resolved.startsWith(MODELS_DIR + path.sep)) return null
  return resolved
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

function parseModel(slug: string, raw: string): ModelDetail {
  const { data, content } = matter(raw)
  return {
    slug,
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : slug,
    english: typeof data.english === 'string' ? data.english.trim() : '',
    discipline: typeof data.discipline === 'string' ? data.discipline : '',
    disciplineName: typeof data.disciplineName === 'string' ? data.disciplineName : '',
    importance: typeof data.importance === 'number' ? data.importance : Number(data.importance) || 0,
    scenarios: toStringArray(data.scenarios),
    description: typeof data.description === 'string' ? data.description : '',
    source: typeof data.source === 'string' ? data.source : '',
    sourceUrl: typeof data.sourceUrl === 'string' ? data.sourceUrl : '',
    content,
  }
}

export const MUNGER_ARCHIVE_MODEL_SLUG_MAP: Record<string, string> = {
  'authority-misinfluence': 'authority-misinfluence-tendency',
  'availability-misweighing': 'availability-misweighing-tendency',
  'circle-of-competence': 'circle-of-competence',
  'contrast-misreaction': 'contrast-misreaction-tendency',
  curiosity: 'curiosity-tendency',
  'deprival-superreaction': 'deprival-superreaction-tendency',
  'disliking-hating': 'disliking-hating-tendency',
  'doubt-avoidance': 'doubt-avoidance-tendency',
  'drug-misinfluence': 'drug-misinfluence-tendency',
  'envy-jealousy': 'envy-jealousy-tendency',
  'excessive-self-regard': 'excessive-self-regard-tendency',
  'incentive-superresponse': 'reward-and-punishment-superresponse-tendency',
  'inconsistency-avoidance': 'inconsistency-avoidance-tendency',
  inversion: 'inversion',
  'kantian-fairness': 'kantian-fairness-tendency',
  'latticework-of-mental-models': 'latticework-of-mental-models',
  'liking-loving': 'liking-loving-tendency',
  lollapalooza: 'lollapalooza-tendency',
  'man-with-a-hammer': 'man-with-a-hammer-syndrome',
  'margin-of-safety': 'margin-of-safety',
  'mere-association': 'influence-from-mere-association-tendency',
  'moats-and-durable-advantage': 'moat',
  'opportunity-cost': 'opportunity-cost',
  overoptimism: 'overoptimism-tendency',
  'psychological-denial': 'simple-pain-avoiding-psychological-denial',
  'psychology-of-human-misjudgment': 'psychology-of-human-misjudgment',
  'reason-respecting': 'reason-respecting-tendency',
  reciprocation: 'reciprocation-tendency',
  'senescence-misinfluence': 'senescence-misinfluence-tendency',
  'sit-on-your-ass-investing': 'sit-on-your-ass-investing',
  'social-proof': 'social-proof-tendency',
  'stress-influence': 'stress-influence-tendency',
  twaddle: 'twaddle-tendency',
  'two-track-analysis': 'two-track-analysis',
  'use-it-or-lose-it': 'use-it-or-lose-it-tendency',
}

export function getCanonicalModelSlugForArchiveSlug(archiveSlug: string): string | null {
  return MUNGER_ARCHIVE_MODEL_SLUG_MAP[archiveSlug] ?? null
}

function toMeta(detail: ModelDetail): ModelMeta {
  const { content: _content, ...meta } = detail
  return meta
}

let cachedModels: ModelMeta[] | null = null

/** 读取全部模型元信息，按重要度（高→低）、slug 排序。进程内缓存。 */
export function getModels(): ModelMeta[] {
  if (cachedModels) return cachedModels
  if (!existsSync(MODELS_DIR)) return []
  cachedModels = readdirSync(MODELS_DIR)
    .filter(name => name.endsWith('.md') && !name.startsWith('.'))
    .map(name => {
      const slug = name.replace(/\.md$/, '')
      return toMeta(parseModel(slug, readFileSync(path.join(MODELS_DIR, name), 'utf-8')))
    })
    .sort((a, b) => b.importance - a.importance || a.slug.localeCompare(b.slug))
  return cachedModels
}

export function getModelBySlug(slug: string): ModelDetail | null {
  const filePath = resolveModelPath(slug)
  if (!filePath || !existsSync(filePath)) return null
  try {
    return parseModel(slug, readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

/** 按学科分组（沿用固定学科顺序），组内按重要度排序。 */
export function getModelsByDiscipline(): Array<{ id: string; name: string; icon: string; models: ModelMeta[] }> {
  const all = getModels()
  const groups = DISCIPLINE_ORDER.map(d => ({
    ...d,
    models: all.filter(m => m.discipline === d.id),
  })).filter(g => g.models.length > 0)
  // 未归入已知学科的模型兜底展示
  const known = new Set(DISCIPLINE_ORDER.map(d => d.id))
  const others = all.filter(m => !known.has(m.discipline))
  if (others.length > 0) {
    groups.push({ id: 'other', name: '其他', icon: '📌', models: others })
  }
  return groups
}

export function getModelStats() {
  const models = getModels()
  return {
    total: models.length,
    disciplines: new Set(models.map(m => m.discipline).filter(Boolean)).size,
    scenarios: new Set(models.flatMap(m => m.scenarios)).size,
    core: models.filter(m => m.importance >= 5).length,
  }
}
