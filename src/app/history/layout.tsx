import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '本地阅读记录',
  description: '查看保存在当前设备上的阅读进度。',
  alternates: { canonical: '/history' },
  robots: { index: false, follow: false },
}

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
