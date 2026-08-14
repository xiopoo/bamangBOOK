import PageContainer from '@/components/PageContainer'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import { duanYongpingArchive } from '@/lib/thinker-archives'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '段永平专题',
  description: '段永平的网易博客、雪球问答、演讲采访与公司里程碑：按栏目、年份与主题阅读第一手资料。',
  alternates: { canonical: '/duanyongping' },
  openGraph: {
    title: '段永平专题｜复利书房',
    description: '段永平网易博客、雪球问答、演讲采访与公司里程碑索引。',
  },
}

export default function DuanYongpingPage() {
  return (
    <PageContainer maxWidth="7xl">
      <ThinkerArchivePage archive={duanYongpingArchive} />
    </PageContainer>
  )
}
