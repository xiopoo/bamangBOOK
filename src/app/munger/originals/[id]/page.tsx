import { redirect } from 'next/navigation'
import { getMungerOriginals } from '@/lib/munger-originals'

interface PageProps {
  params: { id: string }
}

export function generateStaticParams() {
  return getMungerOriginals().map(item => ({ id: item.id }))
}

export default function MungerOriginalPage({ params }: PageProps) {
  redirect('/munger')
}
