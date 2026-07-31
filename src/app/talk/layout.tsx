import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '资料问答测试版',
  description: '仅依据小胖书房已收录资料片段进行检索式问答。',
  robots: { index: false, follow: true },
}

export default function TalkLayout({ children }: { children: React.ReactNode }) {
  return children
}
