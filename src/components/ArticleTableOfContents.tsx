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
  const [isOpen, setIsOpen] = useState(false) // 移动端折叠状态
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // 目录只对应文章正文；不能扫描整页，否则「相关推荐」等模块的标题也会混入。
    const contentRoot = document.querySelector('[data-toc-content]')
    if (!contentRoot) return

    const articleHeadings = contentRoot.querySelectorAll('h2, h3, h4')
    const headingItems: TocItem[] = []
    const usedIds = new Set<string>()

    articleHeadings.forEach((heading, index) => {
      let id = heading.getAttribute('id')
      const baseId = id || `heading-${index}`
      let uniqueId = baseId
      let duplicateIndex = 2
      while (usedIds.has(uniqueId)) {
        uniqueId = `${baseId}-${duplicateIndex}`
        duplicateIndex += 1
      }
      if (id !== uniqueId) heading.setAttribute('id', uniqueId)
      id = uniqueId
      usedIds.add(id)
      headingItems.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
      })
    })

    setHeadings(headingItems)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 只把第一个相交（最靠近顶部正在读）的条目设为 active，避免批量
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          )
        if (visible[0]) {
          setActiveId(visible[0].target.getAttribute('id') || '')
        }
      },
      {
        // 顶部 12% 作为阅读线，滚动时贴近的章节先高亮
        rootMargin: '-12% 0% -80% 0%',
        threshold: [0, 0.15, 1],
      }
    )

    articleHeadings.forEach((heading) => {
      observerRef.current?.observe(heading)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  if (headings.length === 0) return null

  // 点击目录项：平滑滚动 + 移动端自动折叠
  const handleJump = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      const top =
        el.getBoundingClientRect().top + window.scrollY - 96 /* 96px sticky header offset */
      window.scrollTo({ top, behavior: 'smooth' })
      history.replaceState(null, '', `#${id}`)
    }
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setIsOpen(false)
    }
  }

  return (
    <aside className="article-toc" aria-label="章节目录">
      {/* 移动端折叠头 */}
      <button
        type="button"
        className="article-toc__toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="article-toc-list"
      >
        <span className="article-toc__toggle-badge">{headings.length}</span>
        <span className="article-toc__toggle-label">章节目录</span>
        <span
          className={`article-toc__toggle-caret ${isOpen ? 'is-open' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        id="article-toc-list"
        className={`article-toc__panel ${isOpen ? 'is-open' : ''}`}
      >
        <p className="article-toc__eyebrow">目录</p>
        <h3 className="article-toc__title">章节目录</h3>
        <nav className="article-toc__nav" aria-label="章节目录导航">
          {headings.map((heading) => {
            const active = activeId === heading.id
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => handleJump(heading.id, e)}
                className={`article-toc__link${active ? ' is-active' : ''}`}
                style={{ paddingLeft: `${12 + (heading.level - 2) * 14}px` }}
                title={heading.text}
                aria-current={active ? 'location' : undefined}
              >
                <span className="article-toc__link-indicator" aria-hidden="true" />
                <span className="article-toc__link-text">{heading.text}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
