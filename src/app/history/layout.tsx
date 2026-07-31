import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '阅读历史',
  description: '保存在当前设备上的小胖书房阅读进度。',
  robots: { index: false, follow: true },
}

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
