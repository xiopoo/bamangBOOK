import DYList from '@/components/DYList'
import { getDYDocs } from '@/lib/duanyongping'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '段永平 · 公司与里程碑',
  description: '步步高 / OPPO / vivo 企业文化与周年讲话，看“本分”如何变成一套可运行的组织方法。',
  alternates: { canonical: '/duanyongping/milestones' },
}

export default function Page() {
  const docs = getDYDocs('milestones')
  return (
    <DYList
      docs={docs}
      basePath="/duanyongping/milestones"
      title="段永平 · 公司与里程碑"
      subtitle="步步高 / OPPO / vivo 企业文化与周年讲话的原始记录。"
      metaField="year"
      groupByYearEnabled={false}
    />
  )
}
