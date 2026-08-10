import type { Metadata } from 'next'
import DocumentArchivePage from '@/components/DocumentArchivePage'

export const metadata: Metadata = { title: '股东大会问答', description: '伯克希尔股东大会现场问答记录，按人物、年份和状态筛选。', alternates: { canonical: '/qa' } }
export default function QAPage() {
  return <DocumentArchivePage category="qa" title="股东大会问答" subtitle="把观点放回问题、追问和当时的商业环境中理解。" pathname="/qa" exclude={fileName => fileName.startsWith('Wesco_股东大会_')} extraLink={{ href: '/munger/wesco', label: '查看 Wesco 问答 →' }} />
}
