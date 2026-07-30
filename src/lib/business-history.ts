import { existsSync, readFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BUSINESS_HISTORY_DIR = path.join(process.cwd(), 'content/business-history')

interface CompanyStudyManifestItem {
  slug: string
  company: string
  sourcePdf: string
  summary: string
  tags: string[]
}

const COMPANY_STUDY_MANIFEST: CompanyStudyManifestItem[] = [
  {
    slug: '01-迪士尼：把故事变成跨代复利资产',
    company: 'Disney',
    sourcePdf: 'Disney.pdf',
    summary: '从故事、角色、乐园、消费品与分发渠道之间的协同，理解迪士尼如何经营跨代际 IP。',
    tags: ['IP', '体验经济', '资本配置'],
  },
  {
    slug: '04-Formula One：把分散比赛变成全球稀缺内容平台',
    company: 'Formula One',
    sourcePdf: 'Formula-One.pdf',
    summary: '研究 F1 如何集中赛事商业权，把稀缺赛历转化为版权、办赛、赞助与现场体验收入。',
    tags: ['体育', '媒体版权', '平台'],
  },
  {
    slug: '05-Ferrari：稀缺不是少生产，而是让价值增长快于产量',
    company: 'Ferrari',
    sourcePdf: 'Ferrari.pdf',
    summary: '从产品分配、赛车历史、个性化与客户分层，理解 Ferrari 的奢侈品式增长。',
    tags: ['奢侈品', '汽车', '品牌'],
  },
  {
    slug: '05-可口可乐：把一杯饮料变成全球分工系统',
    company: 'Coca-Cola',
    sourcePdf: 'Coca-Cola.pdf',
    summary: '拆解品牌、装瓶体系与全球渠道如何把一杯饮料变成跨世纪的分工与复利系统。',
    tags: ['品牌', '消费品', '渠道'],
  },
  {
    slug: '06-台积电：不与客户竞争的制造复利',
    company: 'TSMC',
    sourcePdf: 'TSMC.pdf',
    summary: '从可信中立、先进制程、良率与资本开支飞轮，理解纯晶圆代工模式的长期优势。',
    tags: ['半导体', '制造', '资本密集'],
  },
  {
    slug: '07-Alphabet：搜索入口如何长成AI基础设施',
    company: 'Alphabet',
    sourcePdf: 'Alphabet.pdf',
    summary: '追踪搜索广告、默认分发与数据反馈形成的现金机器，以及 AI 带来的再投资考题。',
    tags: ['搜索', '广告', 'AI'],
  },
  {
    slug: '08-Meta：从社交图谱到AI推荐引擎',
    company: 'Meta Platforms',
    sourcePdf: 'Meta-Platforms-1.pdf',
    summary: '研究 Meta 如何从关系分发转向算法推荐，以及注意力、广告与算力之间的新平衡。',
    tags: ['社交网络', '广告', 'AI'],
  },
  {
    slug: '09-Epic Systems：把医院最难替换的软件做成四十年复利',
    company: 'Epic Systems',
    sourcePdf: 'Epic-Systems.pdf',
    summary: '从产品深度、实施能力、私有治理与高转换成本，理解医疗软件里的长期主义。',
    tags: ['医疗', '软件', '私有公司'],
  },
  {
    slug: '10-IKEA：把低价设计成一套全球经营系统',
    company: 'IKEA',
    sourcePdf: 'IKEA.pdf',
    summary: '拆解设计、平板包装、自助体验、供应链与门店动线如何共同实现结构性低价。',
    tags: ['零售', '供应链', '成本优势'],
  },
  {
    slug: '11-Indian Premier League：把板球变成稀缺直播资产',
    company: 'Indian Premier League',
    sourcePdf: 'Indian-Premier-League.pdf',
    summary: '研究 IPL 如何把城市球队、明星球员与印度注意力市场组织成高价值体育联盟。',
    tags: ['体育', '媒体版权', '印度'],
  },
  {
    slug: '12-Vanguard：把成本优势写进所有权结构',
    company: 'Vanguard',
    sourcePdf: 'Vanguard.pdf',
    summary: '从独特所有权、指数化与规模经济，理解 Vanguard 如何让低成本成为制度结果。',
    tags: ['资产管理', '指数基金', '所有权'],
  },
  {
    slug: '12-摩根大通：把风险纪律变成银行复利',
    company: 'JPMorgan Chase',
    sourcePdf: 'JP-Morgan-Chase.pdf',
    summary: '从存款、支付、资产负债表与危机选择权，理解大型银行如何把规模与纪律结合。',
    tags: ['银行', '风险管理', '规模经济'],
  },
  {
    slug: '13-玛氏：把家族耐心变成跨品类复利',
    company: 'Mars',
    sourcePdf: 'Mars.pdf',
    summary: '研究家族所有权如何支持玛氏从糖果扩展到宠物营养、医疗与跨品类长期经营。',
    tags: ['家族企业', '消费品', '宠物经济'],
  },
  {
    slug: '14-劳力士：把可靠性变成稀缺资产',
    company: 'Rolex',
    sourcePdf: 'Rolex.pdf',
    summary: '追踪工程可靠性、经典设计、授权渠道与克制供给如何共同塑造品牌稀缺性。',
    tags: ['奢侈品', '品牌', '稀缺性'],
  },
  {
    slug: '15-星巴克：第三空间如何穿越规模反噬',
    company: 'Starbucks',
    sourcePdf: 'Starbucks.pdf',
    summary: '研究第三空间如何规模化，以及客流、门店复杂度与资本结构带来的增长反噬。',
    tags: ['消费品牌', '连锁', '门店运营'],
  },
  {
    slug: '16-Trader Joe’s：把选择变少，把信任做大',
    company: "Trader Joe's",
    sourcePdf: 'Trader-Joes.pdf',
    summary: '从有限 SKU、自有品牌、高周转与员工投入，理解少选择如何积累零售信任。',
    tags: ['零售', '自有品牌', '运营'],
  },
]

const COMPANY_STUDY_BY_SLUG = new Map(COMPANY_STUDY_MANIFEST.map(item => [item.slug, item]))

export interface BusinessHistoryMeta {
  slug: string
  title: string
  company: string
  sourcePdf?: string
  date: string | null
  summary: string
  tags: string[]
  readMinutes: number
}

export interface BusinessHistoryDetail extends BusinessHistoryMeta {
  content: string
}

function resolveBusinessHistoryPath(slug: string): string | null {
  if (!slug || /[\\/\0]/.test(slug) || slug.includes('..')) return null
  const resolved = path.resolve(BUSINESS_HISTORY_DIR, `${slug}.md`)
  if (resolved !== path.join(BUSINESS_HISTORY_DIR, `${slug}.md`)) return null
  if (!resolved.startsWith(BUSINESS_HISTORY_DIR + path.sep)) return null
  return resolved
}

function titleFromContent(content: string, fallback: string): string {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

function estimateReadMinutes(content: string): number {
  const plain = content.replace(/\s+/g, '')
  return Math.max(1, Math.round(plain.length / 400))
}

function parseBusinessHistory(slug: string, raw: string): BusinessHistoryDetail {
  const { data, content } = matter(raw)
  const manifest = COMPANY_STUDY_BY_SLUG.get(slug)
  const title = typeof data.title === 'string' && data.title.trim()
    ? data.title.trim()
    : titleFromContent(content, slug)

  return {
    slug,
    title,
    company: manifest?.company
      || (typeof data.company === 'string' && data.company.trim() ? data.company.trim() : title.split('：')[0]),
    sourcePdf: manifest?.sourcePdf
      || (typeof data.sourcePdf === 'string' && data.sourcePdf.trim() ? data.sourcePdf.trim() : undefined),
    date: data.date ? String(data.date).slice(0, 10) : null,
    summary: manifest?.summary || (typeof data.summary === 'string' ? data.summary.trim() : ''),
    tags: manifest?.tags || toStringArray(data.tags),
    readMinutes: estimateReadMinutes(content),
    content,
  }
}

function toMeta(detail: BusinessHistoryDetail): BusinessHistoryMeta {
  return {
    slug: detail.slug,
    title: detail.title,
    company: detail.company,
    sourcePdf: detail.sourcePdf,
    date: detail.date,
    summary: detail.summary,
    tags: detail.tags,
    readMinutes: detail.readMinutes,
  }
}

export function getBusinessHistories(): BusinessHistoryMeta[] {
  if (!existsSync(BUSINESS_HISTORY_DIR)) return []
  return COMPANY_STUDY_MANIFEST
    .filter(item => existsSync(path.join(BUSINESS_HISTORY_DIR, `${item.slug}.md`)))
    .map(item => toMeta(parseBusinessHistory(
      item.slug,
      readFileSync(path.join(BUSINESS_HISTORY_DIR, `${item.slug}.md`), 'utf-8'),
    )))
}

export function getBusinessHistoryBySlug(slug: string): BusinessHistoryDetail | null {
  const filePath = resolveBusinessHistoryPath(slug)
  if (!filePath || !existsSync(filePath)) return null
  try {
    return parseBusinessHistory(slug, readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

export function getBusinessHistoryStats() {
  const items = getBusinessHistories()
  return {
    total: items.length,
    companies: new Set(items.map(item => item.company)).size,
    tags: new Set(items.flatMap(item => item.tags)).size,
  }
}
