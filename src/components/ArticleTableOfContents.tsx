'use client'

import { useEffect, useState, useRef } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

export default function ArticleTableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const articleHeadings = document.querySelectorAll('article h2, article h3, article h4')
    const headingItems: TocItem[] = []
    
    articleHeadings.forEach((heading, index) => {
      let id = heading.getAttribute('id')
      if (!id || id === '') {
        id = `heading-${index}`
        heading.setAttribute('id', id)
      }
      headingItems.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      })
    })
    
    setHeadings(headingItems)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.getAttribute('id') || '')
          }
        })
      },
      { rootMargin: '-10% 0% -85% 0%' }
    )

    articleHeadings.forEach((heading) => {
      observerRef.current?.observe(heading)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  if (headings.length === 0) return null

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="bg-bg-card dark:bg-dark-card rounded-card border border-primary/10 p-4 shadow-card">
        <h3 className="font-semibold text-text dark:text-dark-text mb-3 flex items-center gap-2">
          <span>📋</span>
          文章目录
        </h3>
        <nav className="space-y-1">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block text-sm py-1.5 px-2 rounded hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors truncate ${
                activeId === heading.id
                  ? 'text-primary dark:text-primary-light font-medium'
                  : 'text-text-muted dark:text-dark-muted'
              }`}
              style={{ paddingLeft: `${(heading.level - 2) * 12 + 8}px` }}
              title={heading.text}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}