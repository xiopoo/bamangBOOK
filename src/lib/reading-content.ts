export type ReadingContentType =
  | '信件'
  | '合伙人信'
  | '股东信'
  | '股东大会'
  | '问答'
  | '演讲'
  | '访谈'
  | '公司研究'
  | '商业史'
  | '文章'
  | '书籍'

export type ReadingContentStatus =
  | '原文'
  | '译文'
  | '编辑整理'
  | '已校对'
  | '部分内容缺失'
  | '待核对'

export type ReadingCompleteness = '完整' | '部分' | '未知'

export interface ReadingContentSummary {
  id: string
  slug: string
  href: string
  canonicalPath: string
  title: string
  shortTitle?: string
  dek?: string
  personIds: string[]
  companyIds?: string[]
  year?: number
  date?: string
  contentType: ReadingContentType
  sourceLabel: string
  sourceUrl?: string
  status: ReadingContentStatus
  translated: boolean
  reviewedAt?: string
  publishedAt?: string
  updatedAt?: string
  readMinutes: number
  completeness: ReadingCompleteness
  topics: string[]
}

export interface ReadingContent extends ReadingContentSummary {
  translationMethod?: string
  editorMethod?: string
  missingNote?: string
  body: string
  previousId?: string
  nextId?: string
}

export function assertReadingContentSummary(
  item: Partial<ReadingContentSummary>,
  context = 'reading content',
): asserts item is ReadingContentSummary {
  const required: Array<keyof ReadingContentSummary> = [
    'id', 'slug', 'href', 'canonicalPath', 'title', 'contentType',
    'sourceLabel', 'status', 'readMinutes', 'completeness',
  ]
  const missing = required.filter(key => item[key] === undefined || item[key] === '')
  if (missing.length > 0) {
    throw new Error(`${context} is missing required fields: ${missing.join(', ')}`)
  }
  if (item.href?.includes('undefined') || item.canonicalPath?.includes('undefined')) {
    throw new Error(`${context} contains an undefined route segment`)
  }
  if (!Number.isFinite(item.readMinutes) || Number(item.readMinutes) < 1) {
    throw new Error(`${context} must have a positive readMinutes value`)
  }
}
