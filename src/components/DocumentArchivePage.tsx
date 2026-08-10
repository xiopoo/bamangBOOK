import PageContainer from './PageContainer'
import PageHeader from './PageHeader'
import DocumentArchiveClient from './DocumentArchiveClient'
import CatalogStats from './CatalogStats'
import { getDocuments, type DocumentCategory } from '@/lib/documents'
import { people } from '@/lib/people'

interface DocumentArchivePageProps {
  category: DocumentCategory
  title: string
  subtitle: string
  pathname: string
  exclude?: (fileName: string) => boolean
  extraLink?: { href: string; label: string }
}

export default function DocumentArchivePage({ category, title, subtitle, pathname, exclude, extraLink }: DocumentArchivePageProps) {
  const all = getDocuments(category).filter(doc => !exclude?.(doc.fileName))
  const personOptions = [...new Set(all.flatMap(doc => Array.isArray(doc.person) ? doc.person : [doc.person]).filter(Boolean))] as string[]
  const yearOptions = [...new Set(all.map(doc => doc.year).filter((year): year is number => Boolean(year)))].sort((a, b) => a - b)
  const sorted = all.slice().sort((a, b) => (a.year ?? Number.POSITIVE_INFINITY) - (b.year ?? Number.POSITIVE_INFINITY) || a.fileName.localeCompare(b.fileName))
  const firstYear = yearOptions[0]
  const lastYear = yearOptions[yearOptions.length - 1]

  return <PageContainer maxWidth="7xl">
    <PageHeader title={title} subtitle={subtitle} backHref="/reading" backLabel="返回原典总览" />
    <CatalogStats items={[
      { value: `${all.length} 篇`, label: '资料总数', detail: '连续目录' },
      { value: firstYear && lastYear ? `${firstYear}—${lastYear}` : '年份待考', label: '时间范围', detail: '按时间从早到晚' },
      { value: `${personOptions.length} 位`, label: '相关人物', detail: '可筛选' },
    ]} />
    <DocumentArchiveClient
      title={title}
      pathname={pathname}
      items={sorted.map(doc => {
        const ids = (Array.isArray(doc.person) ? doc.person : [doc.person]).filter((id): id is string => Boolean(id))
        return { id: doc.id, href: doc.href, title: doc.title, year: doc.year, personIds: ids, person: ids.map(id => people[id]?.name || id).join('、'), contentType: doc.contentType, readMinutes: doc.readMinutes, status: doc.status }
      })}
      people={personOptions.map(id => ({ value: id, label: people[id]?.name || id }))}
      years={yearOptions}
      statuses={[...new Set(all.map(doc => doc.status))]}
      extraLink={extraLink}
    />
  </PageContainer>
}
