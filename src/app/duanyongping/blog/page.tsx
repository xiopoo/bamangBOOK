import DYList from '@/components/DYList'
import { getDYDocs } from '@/lib/duanyongping'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '段永平 · 网易博客',
  description: '段永平网易博客（2006—2020），含完整评论楼与本人逐条回复。',
  alternates: { canonical: '/duanyongping/blog' },
}

export default function Page() {
  const docs = getDYDocs('blog')
  return (
    <DYList
      docs={docs}
      basePath="/duanyongping/blog"
      title="段永平 · 网易博客"
      subtitle="2006—2020 年原始博文与完整评论楼（含段永平本人逐条回复）。"
      metaField="platform"
    />
  )
}
