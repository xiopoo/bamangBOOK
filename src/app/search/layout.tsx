import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '全站搜索',
  description: '搜索小胖书房收录的人物、公司、概念、信件、演讲、访谈与文章。',
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
