import type { Metadata } from 'next'
import DocumentArchivePage from '@/components/DocumentArchivePage'

export const metadata: Metadata = { title: '演讲档案', description: '巴菲特、芒格历年公开演讲记录，按时间顺序阅读。', alternates: { canonical: '/talks' } }
export default function TalksPage() {
  return <DocumentArchivePage category="talks" title="演讲档案" pathname="/talks" />
}
