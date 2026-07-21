import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText, Tag, ChevronRight } from 'lucide-react'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

interface ConceptPageProps {
  params: {
    name: string
  }
}

async function getIndexData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/index`, { cache: 'no-store' })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.error('Failed to fetch index data:', e)
  }
  return null
}

async function getLetters() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/letters`, { cache: 'no-store' })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.error('Failed to fetch letters:', e)
  }
  return []
}

async function getConceptContent(name: string): Promise<string | null> {
  try {
    const conceptPath = path.join(process.cwd(), 'content/concepts', `${name}.md`)
    if (existsSync(conceptPath)) {
      return readFileSync(conceptPath, 'utf-8')
    }
  } catch (e) {
    console.error('Failed to read concept content:', e)
  }
  return null
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { name } = params
  const index = await getIndexData()
  const letters = await getLetters()
  const conceptContent = await getConceptContent(name)

  // Find concept data from index
  const concept = index?.concepts?.find((c: { id: string }) => c.id === name)

  // Find related letters that contain this concept
  const relatedLetters = concept?.years
    ?.map((year: string) => {
      const letter = letters.find((l: { year: string }) => l.year === year)
      return letter ? { year: parseInt(year), excerpt: letter.excerpt || `${year}年致股东信` } : null
    })
    .filter(Boolean)
    .slice(0, 10) || []

  // Find related concepts (co-occurring concepts)
  const allConceptIds = index?.concepts?.map((c: { id: string }) => c.id) || []
  const relatedConcepts = allConceptIds
    .filter((id: string) => id !== name)
    .slice(0, 6)
    .map((id: string) => {
      const relatedConcept = index?.concepts?.find((c: { id: string }) => c.id === id)
      return { name: id, count: relatedConcept?.count || 0 }
    })

  if (!concept) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/munger" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors">
              <ArrowLeft className="w-5 h-5" />
              返回芒格智慧库
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{name}</h1>
          <p className="text-gray-500">暂无内容</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-white border-b border-primary/10">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/munger" className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors">
              <ArrowLeft className="w-5 h-5" />
              返回芒格智慧库
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{name}</h1>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-sm font-medium">
              出现 {concept.count} 次
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              跨越 {concept.years?.length || 0} 年
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Concept Content */}
        {conceptContent && (
          <section className="mb-12">
            <article className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {conceptContent}
              </ReactMarkdown>
            </article>
          </section>
        )}

        {/* Related Concepts */}
        {relatedConcepts.length > 0 && (
          <section className="mb-12 bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Tag className="w-5 h-5 text-primary" />
              关联概念
            </h2>
            <div className="flex flex-wrap gap-3">
              {relatedConcepts.map((concept: { name: string; count: number }) => (
                <Link
                  key={concept.name}
                  href={`/munger/concept/${concept.name}`}
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-sm hover:border-primary hover:text-primary-dark transition-colors"
                >
                  <span className="font-medium">{concept.name}</span>
                  <span className="text-gray-400 text-xs">({concept.count})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Letters */}
        {relatedLetters.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              在股东信中的引用 ({concept.count}次)
            </h2>
            <div className="space-y-4">
              {relatedLetters.map((letter: { year: number; excerpt: string }) => (
                <Link
                  key={letter.year}
                  href={`/letters/${letter.year}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 border border-transparent hover:border-primary/20 dark:hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{letter.year}年致股东信</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{letter.excerpt}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* No data message */}
        {(!relatedConcepts.length && !relatedLetters.length) && (
          <section className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>暂无相关数据</p>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            巴芒书房
          </p>
        </div>
      </footer>
    </div>
  )
}
