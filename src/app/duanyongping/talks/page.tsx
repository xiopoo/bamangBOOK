import DYList from '@/components/DYList'
import { getDYDocs } from '@/lib/duanyongping'
import type { Metadata } from 'next'

const talksCount = getDYDocs('talks').length

export const metadata: Metadata = {
  title: '段永平 · 演讲、采访与文章',
  description: `段永平历年演讲、采访与人物文章 ${talksCount} 篇（1999—2025）。`,
  alternates: { canonical: '/duanyongping/talks' },
}

export default function Page() {
  const docs = getDYDocs('talks')
  return (
    <DYList
      docs={docs}
      basePath="/duanyongping/talks"
      title="段永平 · 演讲、采访与文章"
      subtitle="1999—2025 年公开演讲、访谈与经标注的第三方人物文章。"
      metaField="year"
      groupByYearEnabled
      showItemDate={false}
    />
  )
}
