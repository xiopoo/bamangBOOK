import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDocumentByFileName, getCategoryTitle, getCategoryIcon } from '@/lib/documents'
import { people } from '@/lib/people'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'

interface PageProps {
  params: { id: string }
}

export default function TalkDetailPage({ params }: PageProps) {
  const fileName = decodeURIComponent(params.id)
  const doc = getDocumentByFileName('talks', fileName)

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
              <Link href="/talks" className="text-sm text-primary hover:text-primary-light transition-colors mb-2 inline-flex items-center gap-1">
                ← 返回{getCategoryTitle('talks')}列表
              </Link>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-primary-light">{doc.title}</h1>
              <p className="text-sm text-text-muted dark:text-dark-muted">
                {getCategoryIcon('talks')} {getCategoryTitle('talks')}
                {doc.year && ` · ${doc.year}年`}
              </p>
              {doc.person && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-text-muted dark:text-dark-muted">相关人物：</span>
                  {(Array.isArray(doc.person) ? doc.person : [doc.person]).map((personId) => {
                    const person = people[personId]
                    if (!person) return null
                    return (
                      <Link
                        key={personId}
                        href={`/${personId}`}
                        className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary dark:text-primary-light px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
                      >
                        {person.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <div className="flex gap-8">
          <main className="flex-1">
            <article className="bg-bg-card dark:bg-dark-card p-6 md:p-10 shadow-card rounded-card">
              <MarkdownContent content={doc.content} />
            </article>
          </main>
          <ArticleTableOfContents />
        </div>
      </div>

      <footer className="bg-bg-card dark:bg-dark-card border-t border-primary/10 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-text-muted dark:text-dark-muted">
          价值投资知识宝库
        </div>
      </footer>
    </div>
  )
}