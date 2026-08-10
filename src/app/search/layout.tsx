import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '全站搜索',
  description: '搜索复利书房中的人物、信件、问答、演讲、公司研究和主题。',
  alternates: { canonical: '/search' },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
