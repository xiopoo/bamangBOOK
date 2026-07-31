import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '沃伦·巴菲特档案',
  description: '从合伙人信、股东信、演讲和公司案例进入巴菲特的投资与资本配置思想。',
  alternates: { canonical: '/buffett' },
}
import PageFooter from '@/components/PageFooter'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import { getDocuments } from '@/lib/documents'
import { getAllPartnershipLetters, getShareholderLetters } from '@/lib/partnership'
import { getTopCompanies, getTopConcepts } from '@/lib/recommendations'
import { buffettArchive } from '@/lib/thinker-archives'

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
      <PageFooter />
    </>
  )
}
