import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import ArticleContent from '@/components/ArticleContent'
import RelatedArticles from '@/components/RelatedArticles'
import JsonLd, { breadcrumbJsonLd } from '@/components/JsonLd'
import {
  getPartnershipLetterById,
  getAdjacentLettersById,
  formatPartnershipSubtitle,
  formatPartnershipLabel,
  getAllPartnershipLetters,
  type PartnershipLetter,
} from '@/lib/partnership'

interface PageProps { params: { id: string } }

function formatLetterTitle(letter: PartnershipLetter): string {
  return `${letter.year}年${formatPartnershipLabel(letter)}`
}

export function generateMetadata({ params }: PageProps): Metadata {
  const id = parseInt(params.id, 10)
  const data = Number.isFinite(id) ? getPartnershipLetterById(id) : null
  if (!data?.letter) return { title: '巴菲特致合伙人信' }
  const title = formatLetterTitle(data.letter)
  return {
    title: `${title} · 巴菲特合伙人信`,
    description: `阅读${data.letter.year}年巴菲特致合伙人的信：${formatPartnershipSubtitle(data.letter.subtitle)}。`,
    alternates: { canonical: `/partnership/${id}` },
    openGraph: { title, type: 'article' },
  }
}

export async function generateStaticParams() {
  return getAllPartnershipLetters().map(letter => ({ id: letter.id.toString() }))
}

export default async function PartnershipLetterDetailPage({ params }: PageProps) {
  const id = parseInt(params.id, 10)
  if (!Number.isFinite(id)) notFound()
  const data = getPartnershipLetterById(id)
  if (!data?.letter) notFound()
  const { content, letter } = data
  const { prev, next } = getAdjacentLettersById(id)
  const title = formatLetterTitle(letter)
  const isAgreement = letter.filename.includes('有限合伙协议')

  return <>
    <JsonLd data={breadcrumbJsonLd([{ name: '首页', href: '/' }, { name: '沃伦·巴菲特', href: '/buffett' }, { name: '合伙人信', href: '/partnership' }, { name: title }])} />
    <ReadingArticleShell
      title={title}
      subtitle={isAgreement ? '巴菲特有限合伙协议' : `巴菲特致合伙人的信（${formatPartnershipSubtitle(letter.subtitle)}）`}
      backHref="/partnership"
      backLabel="返回合伙人信全集"
      metadata={{ person: '沃伦·巴菲特', year: letter.year, contentType: '合伙人信',
 readMinutes: Math.max(5, Math.round(content.length / 900)) }}
      previous={prev ? { href: `/partnership/${prev.id}`, title: formatLetterTitle(prev), meta: formatPartnershipSubtitle(prev.subtitle) } : null}
      next={next ? { href: `/partnership/${next.id}`, title: formatLetterTitle(next), meta: formatPartnershipSubtitle(next.subtitle) } : null}
      navigationLabel="按时间从早到晚的相邻合伙人信"
      related={<RelatedArticles source="partnership" fileName={letter.filename} />}
    ><ArticleContent content={content} /></ReadingArticleShell>
  </>
}
