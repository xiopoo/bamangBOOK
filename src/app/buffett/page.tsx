import PageContainer from '@/components/PageContainer'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import { getDocuments } from '@/lib/documents'
import { getAllPartnershipLetters, getShareholderLetters } from '@/lib/partnership'
import { getTopCompanies, getTopConcepts } from '@/lib/recommendations'
import { buffettArchive } from '@/lib/thinker-archives'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '沃伦·巴菲特专题',
  description: '巴菲特的合伙人信、伯克希尔股东信、股东大会问答与公司研究索引：按人物、年份与主题阅读第一手资料。',
  alternates: { canonical: '/buffett' },
  openGraph: {
    title: '沃伦·巴菲特专题｜复利书房',
    description: '巴菲特合伙人信、股东信、股东大会问答与公司研究索引。',
    images: ['/og-v2.png'],
  },
}

export default function BuffettPage() {
  const partnershipCount = getAllPartnershipLetters().length
  const letterCount = getShareholderLetters().length
  const qaCount = getDocuments('qa').length

  return (
    <>
      <PageContainer maxWidth="7xl">
        <ThinkerArchivePage
          archive={buffettArchive}
          stats={[
            { value: partnershipCount + letterCount, label: '封信件' },
            { value: qaCount, label: '篇大会与问答' },
            { value: getTopConcepts(1000).length, label: '个概念入口' },
            { value: getTopCompanies(1000).length, label: '家公司索引' },
          ]}
        />
      </PageContainer>
    </>
  )
}
