import PageContainer from '@/components/PageContainer'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import BlogEntityLinks from '@/components/BlogEntityLinks'
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
  return (
    <PageContainer maxWidth="7xl">
      <ThinkerArchivePage archive={mungerArchive} />
      {/* 相关博客文章（B-05：博客与档案双向打通） */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <BlogEntityLinks entityName="芒格" title="与芒格相关的博客文章" />
      </div>
    </PageContainer>
  )
}
