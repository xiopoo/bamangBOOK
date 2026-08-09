import DYList from '@/components/DYList'
import { getDYDocs } from '@/lib/duanyongping'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '段永平 · 雪球问答录',
  description: '段永平雪球问答 2212 条（2011—2025），按年份分卷，最密集、最直白的判断。',
  alternates: { canonical: '/duanyongping/qa' },
}

export default function Page() {
  const docs = getDYDocs('qa', false)
  return (
    <DYList
      docs={docs}
      basePath="/duanyongping/qa"
      title="段永平 · 雪球问答录"
      subtitle="2011—2025 年雪球问答，共 2212 条（仅首轮对话）。按年份分卷，几乎句句可落地。"
      metaField="year"
      indexOnly
      yearPath="/duanyongping/qa/year"
    />
  )
}
