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
    <aside className="article-toc hidden lg:block">
      <div>
        <p>CONTENTS</p>
        <h3>文章目录</h3>
        <nav>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={activeId === heading.id ? 'is-active' : ''}
              style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
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
