import type { Metadata } from 'next'
import DocumentArchivePage from '@/components/DocumentArchivePage'

export const metadata: Metadata = { title: '股东大会问答', description: '伯克希尔股东大会现场问答（巴菲特）与 Wesco 股东大会问答（芒格），按时间顺序阅读。', alternates: { canonical: '/qa' } }

export default function QAPage() {
  return <DocumentArchivePage
    category="qa"
    title="股东大会问答"
    subtitle="巴菲特 · 伯克希尔股东大会问答；芒格 · Wesco 股东大会问答"
    pathname="/qa"
    hrefFor={doc => {
      const match = doc.fileName.match(/^Wesco_股东大会_(\d{4})$/)
      return match ? `/munger/wesco/${match[1]}` : undefined
    }}
  />
}
