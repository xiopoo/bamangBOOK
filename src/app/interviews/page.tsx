import type { Metadata } from 'next'
import DocumentArchivePage from '@/components/DocumentArchivePage'

export const metadata: Metadata = { title: '访谈档案', description: '巴菲特、芒格及相关人物访谈实录，按时间顺序阅读。', alternates: { canonical: '/interviews' } }
export default function InterviewsPage() {
  return <DocumentArchivePage category="interviews" title="访谈档案" pathname="/interviews" />
}
