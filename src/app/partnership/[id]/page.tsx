import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import ArticleContent from '@/components/ArticleContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import {
  getPartnershipLetterById,
  getAdjacentLettersById,
  formatPartnershipSubtitle,
  formatPartnershipLabel,
  getAllPartnershipLetters,
  type PartnershipLetter,
} from '@/lib/partnership'
import RelatedArticles from '@/components/RelatedArticles'
import JsonLd, { breadcrumbJsonLd } from '@/components/JsonLd'
import type { Metadata } from 'next'

interface PageProps {
  params: { id: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const id = parseInt(params.id, 10)
  const letterData = Number.isFinite(id) ? getPartnershipLetterById(id) : null
  if (!letterData?.letter) {
    return { title: '巴菲特致合伙人信' }
  }
  const { letter } = letterData
  const title = `${letter.year}年${formatPartnershipLabel(letter)}`
  return {
    title,
    description: `阅读${letter.year}年巴菲特致合伙人的信：${formatPartnershipSubtitle(letter.subtitle)}。`,
    alternates: { canonical: `/partnership/${id}` },
    openGraph: { title, type: 'article' },
  }
}

function formatLetterTitle(letter: PartnershipLetter): string {
  return `${letter.year}年${formatPartnershipLabel(letter)}`
}

export async function generateStaticParams() {
  const letters = getAllPartnershipLetters()
  return letters.map((letter) => ({
    id: letter.id.toString(),
  }))
}

export default async function PartnershipLetterDetailPage({ params }: PageProps) {
  const id = parseInt(params.id, 10)
  
  if (isNaN(id)) {
    notFound()
  }
  
  const letterData = getPartnershipLetterById(id)
  
  if (!letterData || !letterData.letter) {
    notFound()
  }
  
  const { content, letter } = letterData
  const { prev, next } = getAdjacentLettersById(id)
  const letterTitle = formatLetterTitle(letter)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <JsonLd data={breadcrumbJsonLd([
        { name: '首页', href: '/' },
        { name: '沃伦·巴菲特', href: '/buffett' },
        { name: '合伙人信', href: '/partnership' },
        { name: letterTitle },
      ])} />
      <ReadingProgress />
      
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/partnership" className="text-sm text-primary hover:text-primary-light transition-colors mb-2 inline-flex items-center gap-1">
                ← 返回合伙人信全集
              </Link>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary dark:text-primary-light">
                {letter.year}年
              </h1>
              <p className="text-sm text-text-muted dark:text-dark-muted">
                {letter.filename.includes('有限合伙协议')
                  ? '巴菲特有限合伙协议'
                  : `巴菲特致合伙人的信（${formatPartnershipSubtitle(letter.subtitle)}）`}
              </p>
            </div>
            
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="min-w-0 flex-1">
            <ArticleContent content={content} />
          </div>
          <ArticleTableOfContents />
        </div>

        {/* —— 合伙人信相邻导航：统一 CN Reading 阅读规范样式 —— */}
        <nav className="reading-nav-pair reading-adjacent" aria-label="相邻合伙人信导航">
          {prev ? (
            <Link href={`/partnership/${prev.id}`} className="nav-prev" rel="prev">
              <span className="reading-adjacent__label">‹ 上一封</span>
              <span className="reading-adjacent__title">
                {prev.year}年合伙人信{prev.subtitle ? ` · ${formatPartnershipSubtitle(prev.subtitle)}` : ''}
              </span>
            </Link>
          ) : (
            <span className="nav-pair-btn nav-prev" aria-disabled>
              <span className="reading-adjacent__label">已是第一封</span>
              <span className="reading-adjacent__title">巴菲特合伙人信归档起点</span>
            </span>
          )}
          {next ? (
            <Link href={`/partnership/${next.id}`} className="nav-next" rel="next">
              <span className="reading-adjacent__label">下一封 ›</span>
              <span className="reading-adjacent__title">
                {next.year}年合伙人信{next.subtitle ? ` · ${formatPartnershipSubtitle(next.subtitle)}` : ''}
              </span>
            </Link>
          ) : (
            <span className="nav-pair-btn nav-next" aria-disabled>
              <span className="reading-adjacent__label">已是最后一封</span>
              <span className="reading-adjacent__title">后续内容会持续更新</span>
            </span>
          )}
        </nav>
      </div>

      <RelatedArticles source="partnership" fileName={letter.filename} />

    </div>
  )
}
