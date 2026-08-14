import PageContainer from './PageContainer'
import PageHeader from './PageHeader'
import ArchiveList from './ArchiveList'
import { getDocuments, type DocumentCategory } from '@/lib/documents'
import { personDisplayName } from '@/lib/people'

interface DocumentArchivePageProps {
  category: DocumentCategory
  title: string
  subtitle?: string
  pathname: string
  exclude?: (fileName: string) => boolean
}

/** 原典档案列表页：标题 + 按年代分组的朴素时间线，无统计、无筛选、无附加入口。 */
export default function DocumentArchivePage({ category, title, subtitle, pathname, exclude }: DocumentArchivePageProps) {
  const all = getDocuments(category).filter(doc => !exclude?.(doc.fileName))
  const sorted = all.slice().sort((a, b) => (a.year ?? Number.POSITIVE_INFINITY) - (b.year ?? Number.POSITIVE_INFINITY) || a.fileName.localeCompare(b.fileName))

  return <PageContainer maxWidth="7xl">
    <PageHeader title={title} subtitle={subtitle} backHref="/reading" backLabel="返回阅读总库" />
    <ArchiveList
      items={sorted.map(doc => {
        const ids = (Array.isArray(doc.person) ? doc.person : [doc.person]).filter((id): id is string => Boolean(id))
        return { id: doc.id, href: doc.href, title: doc.title, year: doc.year, personIds: ids, person: ids.map(personDisplayName).join('、'), contentType: doc.contentType, readMinutes: doc.readMinutes, status: doc.status }
      })}
    />
  </PageContainer>
}
