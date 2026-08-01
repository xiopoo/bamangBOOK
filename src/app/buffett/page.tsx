import PageContainer from '@/components/PageContainer'
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
    </>
  )
}
