import PageContainer from '@/components/PageContainer'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import { getModels } from '@/lib/models'
import { getMungerLocalArchiveStats } from '@/lib/munger-archive'
import { getWescoMeetings } from '@/lib/wesco-meetings'
import { mungerArchive } from '@/lib/thinker-archives'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '查理·芒格专题',
  description: '芒格的 Wesco 问答、Daily Journal、公开演讲、思维模型与误判心理学索引：按人物与主题阅读第一手资料。',
  alternates: { canonical: '/munger' },
  openGraph: {
    title: '查理·芒格专题｜复利书房',
    description: '芒格 Wesco 问答、演讲、思维模型与误判心理学索引。',
  },
}

export default function MungerPage() {
  const stats = getMungerLocalArchiveStats()

  return (
    <>
      <PageContainer maxWidth="7xl">
        <ThinkerArchivePage
          archive={mungerArchive}
          stats={[
            { value: stats.total, label: '篇相关内容' },
            { value: getWescoMeetings().length, label: '场 Wesco 问答' },
            { value: getModels().length, label: '个思维模型' },
            { value: stats.recordings, label: '篇演讲与访谈' },
          ]}
        />
      </PageContainer>
    </>
  )
}
