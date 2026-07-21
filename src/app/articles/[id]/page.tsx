import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDocumentByFileName, getDocuments, getCategoryTitle, getCategoryIcon } from '@/lib/documents'
import ReadingProgress from '@/components/ReadingProgress'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import MarkdownContent from '@/components/MarkdownContent'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'

interface PageProps {
  params: { id: string }
}

// Get readable category name from directory
function getCategoryName(subDir: string): string {
  const map: Record<string, string> = {
    '01-投资理念': '投资理念与方法',
    '02-股市宏观': '股市与宏观判断',
    '03-公司分析': '公司/行业分析',
    '04-人物传记': '人物传记与纪念',
    '05-政策社会': '政策与社会评论',
    '06-备忘录': '致股东信/备忘录',
    '07-伯克希尔史': '伯克希尔历史',
    '08-芒格专题': '芒格专题',
    '09-其他': '其他',
  }
  return map[subDir] || subDir
}

export default function ArticleDetailPage({ params }: PageProps) {
  const fileName = decodeURIComponent(params.id)
  const doc = getDocumentByFileName('articles', fileName)

  if (!doc) {
    notFound()
  }

  // Extract sub-directory prefix from the path
  const subDir = fileName.split('/')[0] || ''
  const categoryName = getCategoryName(subDir)

  // Find related articles in the same sub-directory
  const allDocs = getDocuments('articles')
  const relatedDocs = allDocs
    .filter(d => 
      d.fileName !== fileName && // exclude self
      d.fileName.startsWith(subDir + '/') // same category
    )
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      <ReadingProgress />
      <header className="bg-bg-card dark:bg-dark-card border-b border-primary/10 sticky top-1 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link href="/articles" className="text-sm text-primary hover:text-primary-light transition-colors mb-1 inline-flex items-center gap-1">
                ← 返回{getCategoryTitle('articles')}列表
              </Link>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary dark:text-primary-light">{doc.title}</h1>
              <p className="text-sm text-text-muted dark:text-dark-muted flex items-center gap-2 flex-wrap">
                <span>{getCategoryIcon('articles')} {categoryName}</span>
                {doc.year && <span>· {doc.year}年</span>}
              </p>
            </div>
            <FontSizeControlFixed />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
        <div className="flex gap-8">
          <main className="flex-1 min-w-0">
            <article className="bg-bg-card dark:bg-dark-card p-4 sm:p-6 md:p-10 shadow-card rounded-card">
              <MarkdownContent content={doc.content} />
            </article>

            {/* Related articles in same category */}
            {relatedDocs.length > 0 && (
              <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 font-serif mb-4">
                  同分类文章 · {categoryName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedDocs.map(related => (
                    <Link
                      key={related.fileName}
                      href={`/articles/${encodeURIComponent(related.fileName)}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {related.title}
                        </div>
                        {related.year && (
                          <div className="text-xs text-text-muted dark:text-dark-muted">{related.year}年</div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {(related.wordCount / 1000).toFixed(1)}千字
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Link href="/articles" className="text-sm text-primary hover:text-primary-light">
                    查看全部{categoryName} →
                  </Link>
                </div>
              </div>
            )}
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
