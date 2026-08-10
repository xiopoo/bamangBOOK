import { redirect } from 'next/navigation'
import { getMungerOriginals } from '@/lib/munger-originals'
import type { Metadata } from 'next'

interface PageProps {
  params: { id: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `${params.id}（已迁移）`,
    description: '该原典入口已合并到芒格专题。',
    alternates: { canonical: '/munger' },
    robots: { index: false, follow: true },
  }
}

export function generateStaticParams() {
  return getMungerOriginals().map(item => ({ id: item.id }))
}

export default function MungerOriginalPage({ params }: PageProps) {
  redirect('/munger')
}
