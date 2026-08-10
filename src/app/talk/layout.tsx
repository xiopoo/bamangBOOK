import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '档案问答',
  description: '基于站内公开档案检索相关内容和阅读出处。',
  alternates: { canonical: '/talk' },
  robots: { index: false, follow: true },
}

export default function TalkLayout({ children }: { children: React.ReactNode }) {
  return children
}
