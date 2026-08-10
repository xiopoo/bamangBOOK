import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '投资知识图谱',
  description: '浏览人物、公司与投资概念之间的关联。',
  alternates: { canonical: '/graph' },
}

export default function GraphLayout({ children }: { children: React.ReactNode }) {
  return children
}
