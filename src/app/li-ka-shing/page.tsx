import PageContainer from '@/components/PageContainer'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import { liKaShingArchive } from '@/lib/thinker-archives'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '李嘉诚专题',
  description: '李嘉诚的年报主席报告书、汕头大学演讲、媒体访谈、股东会答问与公开信函：按栏目阅读第一手资料。',
  alternates: { canonical: '/li-ka-shing' },
  openGraph: {
    title: '李嘉诚专题｜复利书房',
    description: '年报、汕大演讲、访谈与业绩会答问，170 篇一手原典。',
  },
}

export default function LiKaShingPage() {
  return (
    <PageContainer maxWidth="7xl">
      <ThinkerArchivePage archive={liKaShingArchive} />
    </PageContainer>
  )
}
