import type { Metadata } from 'next'
import DocumentArchivePage from '@/components/DocumentArchivePage'

export const metadata: Metadata = { title: '演讲档案', description: '巴菲特、芒格历年公开演讲记录，按人物、年份和状态筛选。', alternates: { canonical: '/talks' } }
export default function TalksPage() {
  return <DocumentArchivePage category="talks" title="演讲档案" subtitle="把公开表达放回具体年份和完整语境，按时间从早到晚阅读。" pathname="/talks" />
}
