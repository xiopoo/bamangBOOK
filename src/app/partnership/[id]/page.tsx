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
  getAllPartnershipLetters,
  type PartnershipLetter,
} from '@/lib/partnership'

interface PageProps {
  params: { id: string }
}

function formatLetterTitle(letter: PartnershipLetter): string {
  if (!letter.subtitle) {
    return `${letter.year}年巴菲特致合伙人信`
  }
  return `${letter.year}年${formatPartnershipSubtitle(letter.subtitle)}巴菲特致合伙人信`
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
      <ReadingProgress />
      
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10 sticky top-1 z-30">
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
                巴菲特致合伙人的信
                {letter.subtitle && `（${formatPartnershipSubtitle(letter.subtitle)}）`}
              </p>
            </div>
            
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <div className="flex gap-8">
          <div className="flex-1">
            <ArticleContent content={content} />
          </div>
          <ArticleTableOfContents />
        </div>

        {/* 信件导航 */}
        <div className="flex justify-between mt-8 gap-4">
          {prev && (
            <Link
              href={`/partnership/${prev.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-card dark:bg-dark-card border border-primary/20 rounded-card hover:border-primary hover:text-primary dark:hover:text-primary-light text-text-muted dark:text-dark-muted transition-all hover:shadow-card-hover shadow-card"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{prev.year}年{prev.subtitle ? formatPartnershipSubtitle(prev.subtitle) : ''}</span>
            </Link>
          )}
          {next && (
            <Link
              href={`/partnership/${next.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-card dark:bg-dark-card border border-primary/20 rounded-card hover:border-primary hover:text-primary dark:hover:text-primary-light text-text-muted dark:text-dark-muted transition-all hover:shadow-card-hover shadow-card ml-auto"
            >
              <span>{next.year}年{next.subtitle ? formatPartnershipSubtitle(next.subtitle) : ''}</span>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      <footer className="bg-bg-card dark:bg-dark-card border-t border-primary/10 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-text-muted dark:text-dark-muted">
          巴芒书房 · 巴菲特致合伙人信
        </div>
      </footer>
    </div>
  )
}