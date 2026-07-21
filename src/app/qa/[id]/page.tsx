import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDocumentByFileName, getCategoryTitle, getCategoryIcon } from '@/lib/documents'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'

interface PageProps {
  params: { id: string }
}

export default function QADetailPage({ params }: PageProps) {
  const fileName = decodeURIComponent(params.id)
  const doc = getDocumentByFileName('qa', fileName)

  if (!doc) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress />
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10 sticky top-1 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/qa" className="text-sm text-primary hover:text-primary-light transition-colors mb-2 inline-flex items-center gap-1">
                ← 返回{getCategoryTitle('qa')}列表
              </Link>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-primary-light">{doc.title}</h1>
              <p className="text-sm text-text-muted dark:text-dark-muted">
                {getCategoryIcon('qa')} {getCategoryTitle('qa')}
                {doc.year && ` · ${doc.year}年`}
              </p>
            </div>
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <div className="flex gap-8">
          <main className="flex-1">
            <article className="bg-bg-card dark:bg-dark-card p-6 md:p-10 shadow-card rounded-card">
              <MarkdownContent content={doc.content} isQA={true} />
            </article>
          </main>
          <ArticleTableOfContents />
        </div>
      </div>

      <footer className="bg-bg-card dark:bg-dark-card border-t border-primary/10 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-text-muted dark:text-dark-muted">
          巴芒书房
        </div>
      </footer>
    </div>
  )
}