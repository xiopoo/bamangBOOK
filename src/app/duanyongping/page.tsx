import PageContainer from '@/components/PageContainer'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import BlogEntityLinks from '@/components/BlogEntityLinks'
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
      {/* 相关博客文章（B-05：博客与档案双向打通） */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <BlogEntityLinks entityName="段永平" title="与段永平相关的博客文章" />
      </div>
    </PageContainer>
  )
}
