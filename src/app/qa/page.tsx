import type { Metadata } from 'next'
import DocumentArchivePage from '@/components/DocumentArchivePage'

export const metadata: Metadata = { title: '股东大会问答', description: '伯克希尔股东大会现场问答记录，按时间顺序阅读。', alternates: { canonical: '/qa' } }
export default function QAPage() {
  return <DocumentArchivePage category="qa" title="股东大会问答" pathname="/qa" exclude={fileName => fileName.startsWith('Wesco_股东大会_')} />
}
