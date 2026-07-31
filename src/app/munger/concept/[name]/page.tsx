import { readdirSync } from 'fs'
import path from 'path'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: { name: string }
}

export const dynamicParams = false

export function generateStaticParams() {
  try {
    return readdirSync(path.join(process.cwd(), 'content/concepts'))
      .filter((file) => file.endsWith('.md'))
      .map((file) => ({ name: file.replace(/\.md$/, '') }))
  } catch {
    return []
  }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const name = decodeURIComponent(params.name)
  return {
    title: `${name} · 概念旧址`,
    alternates: { canonical: `/concepts/${encodeURIComponent(name)}` },
    robots: { index: false, follow: true },
  }
}

export default function LegacyMungerConceptPage({ params }: PageProps) {
  const name = decodeURIComponent(params.name)
  redirect(`/concepts/${encodeURIComponent(name)}`)
}
