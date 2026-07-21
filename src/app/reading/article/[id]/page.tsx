'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Article {
  id: string
  title: string
  content: string
}

export default function ReadingDetailPage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const decodedId = decodeURIComponent(params.id)
        const response = await fetch(`/api/article/${encodeURIComponent(decodedId)}`)
        if (response.ok) {
          const data = await response.json()
          setArticle(data)
        }
      } catch (error) {
        console.error('Failed to load article:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [params.id])

  if (loading) {
    return (
      <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--gray-500)' }}>加载中...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div>
        <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <Link href="/reading" style={{ color: 'var(--orange-600)', fontSize: '0.875rem' }}>
            ← 返回阅读库
          </Link>
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.75rem', marginTop: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ color: 'var(--gray-500)' }}>文章未找到</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-white border-b border-primary/20 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          <Link
            href="/reading"
            className="inline-flex items-center gap-2 text-primary text-sm mb-6 hover:text-primary-dark transition-colors"
          >
            ← 返回阅读库
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 md:py-12">
        <article className="prose prose-gray max-w-none leading-relaxed text-gray-800 whitespace-pre-wrap break-words overflow-x-hidden">
          {article.content}
        </article>
      </div>

      {/* Related Concepts */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pb-12">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            相关概念
          </h3>
          <div className="flex gap-3 flex-wrap">
            {['内在价值', '护城河', '安全边际', '复利'].map((concept) => (
              <Link
                key={concept}
                href={`/munger/concept/${concept}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-primary/40 hover:text-primary transition-colors"
              >
                {concept}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center">
        <p className="text-gray-500 text-sm">
          巴芒书房
        </p>
      </footer>
    </div>
  )
}
