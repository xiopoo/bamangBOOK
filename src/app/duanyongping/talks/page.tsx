import DYList from '@/components/DYList'
import { getDYDocs } from '@/lib/duanyongping'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '段永平 · 演讲与采访',
  description: '段永平历年演讲与采访 14 篇（1999—2025）：财富人生、秦朔、波士堂、浙大、斯坦福、方三文、王石对话等。',
  alternates: { canonical: '/duanyongping/talks' },
}

export default function Page() {
  const docs = getDYDocs('talks')
  return (
    <DYList
      docs={docs}
      basePath="/duanyongping/talks"
      title="段永平 · 演讲与采访"
      subtitle="1999—2025 年公开演讲与访谈：万科财富人生、秦朔/网易/波士堂专访、浙大分享、斯坦福交流、方三文与王石对话等。"
      metaField="year"
      groupByYearEnabled={false}
    />
  )
}
