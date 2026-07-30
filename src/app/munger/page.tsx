import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import { getModels } from '@/lib/models'
import { getMungerLocalArchiveStats } from '@/lib/munger-archive'
import { getMungerOriginals } from '@/lib/munger-originals'
import { getWescoMeetings } from '@/lib/wesco-meetings'
import { mungerArchive } from '@/lib/thinker-archives'

export default function MungerPage() {
  const stats = getMungerLocalArchiveStats()

  return (
    <>
      <PageContainer maxWidth="7xl">
        <ThinkerArchivePage
          archive={mungerArchive}
          stats={[
            { value: stats.total, label: '篇人物档案' },
            { value: getWescoMeetings().length, label: '场 Wesco 问答' },
            { value: getModels().length, label: '个思维模型' },
            { value: getMungerOriginals().length, label: '封 Wesco 股东信' },
          ]}
        />
      </PageContainer>
      <PageFooter />
    </>
  )
}
