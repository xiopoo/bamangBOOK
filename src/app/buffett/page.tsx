import PageContainer from '@/components/PageContainer'
import ThinkerArchivePage from '@/components/ThinkerArchivePage'
import BlogEntityLinks from '@/components/BlogEntityLinks'
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
      {/* 相关博客文章（B-05：博客与档案双向打通） */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <BlogEntityLinks entityName="巴菲特" title="与巴菲特相关的博客文章" />
      </div>
    </PageContainer>
  )
}
