import type { Metadata } from 'next'
import ClientRedirect from '@/components/ClientRedirect'

export const metadata: Metadata = {
  title: '芒格原典总入口（已迁移）',
  description: '该入口已合并到芒格专题。',
  alternates: { canonical: '/munger' },
  robots: { index: false, follow: true },
}

export default function MungerOriginalsPage() {
  return <ClientRedirect href="/munger" />
}
