import PageContainer from '@/components/PageContainer'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import { buffettArchive } from '@/lib/thinker-archives'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '沃伦·巴菲特专题',
  description: '巴菲特的合伙人信、伯克希尔股东信、股东大会问答与公司研究索引：按人物、年份与主题阅读第一手资料。',
  alternates: { canonical: '/buffett' },
  openGraph: {
    title: '沃伦·巴菲特专题｜复利书房',
    description: '巴菲特合伙人信、股东信、股东大会问答与公司研究索引。',
  },
}

export default function BuffettPage() {
  return (
    <PageContainer maxWidth="7xl">
      <ThinkerArchivePage archive={buffettArchive} />
    </PageContainer>
  )
}
