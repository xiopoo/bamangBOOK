import PageContainer from './PageContainer'
import PageHeader from './PageHeader'
import DocumentArchiveFilters from './DocumentArchiveFilters'
import { getDocuments, type DocumentCategory, type DocumentItem } from '@/lib/documents'
import { personDisplayName } from '@/lib/people'

interface DocumentArchivePageProps {
  category: DocumentCategory
  title: string
  subtitle?: string
  pathname: string
  /** 覆盖个别条目的跳转地址（如 Wesco 问答直接指向其专题页，而非站内跳转页）。 */
  hrefFor?: (doc: DocumentItem) => string | undefined
}

/** 类别档案列表页：标题 + 人物标签筛选 + 按年代分组的朴素时间线。
 *  类别是页面维度（问答 / 演讲 / 访谈），人物标签提供内容维度的交叉浏览。 */
export default function DocumentArchivePage({ category, title, subtitle, pathname, hrefFor }: DocumentArchivePageProps) {
  const all = getDocuments(category)
  const sorted = all.slice().sort((a, b) => (a.year ?? Number.POSITIVE_INFINITY) - (b.year ?? Number.POSITIVE_INFINITY) || a.fileName.localeCompare(b.fileName))

  return <PageContainer maxWidth="7xl">
    <PageHeader title={title} subtitle={subtitle} backHref="/" backLabel="返回首页" />
    <DocumentArchiveFilters
      items={sorted.map(doc => {
        const ids = (Array.isArray(doc.person) ? doc.person : [doc.person]).filter((id): id is string => Boolean(id))
        return { id: doc.id, href: hrefFor?.(doc) || doc.href, title: doc.title, year: doc.year, personIds: ids, person: ids.map(personDisplayName).join('、'), contentType: doc.contentType, readMinutes: doc.readMinutes, status: doc.status }
      })}
    />
  </PageContainer>
}
