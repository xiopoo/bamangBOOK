import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '知识关联浏览器',
  description: '沿概念、公司与人物之间经过资料验证的关系探索小胖书房。',
  alternates: { canonical: '/graph' },
}

export default function GraphLayout({ children }: { children: React.ReactNode }) {
  return children
}
