import type { Metadata } from 'next'
import DocumentArchivePage from '@/components/DocumentArchivePage'

export const metadata: Metadata = { title: '访谈档案', description: '巴菲特、芒格及相关人物访谈实录，按人物、年份和状态筛选。', alternates: { canonical: '/interviews' } }
export default function InterviewsPage() {
  return <DocumentArchivePage category="interviews" title="访谈档案" subtitle="在提问、追问和对话中理解判断成立的条件。" pathname="/interviews" />
}
