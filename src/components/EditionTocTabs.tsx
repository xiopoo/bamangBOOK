'use client'

import { useState } from 'react'

export type EditionTocBook = {
  id: string
  index: string
  title: string
  sub: string
  /* 所有者的眼光：五篇 · 十五章 */
  parts?: [string, string[]][]
  /* 理性的格栅：五篇 · 十六章 */
  chapters?: string[]
  appendix: string
}

export default function EditionTocTabs({ books }: { books: EditionTocBook[] }) {
  const [active, setActive] = useState(0)
  const book = books[active]

  return (
    <div className="edition-toc__tabs">
      <div className="edition-toc__tablist" role="tablist" aria-label="两卷书目录">
        {books.map((b, i) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            id={`edition-toc-tab-${b.id}`}
            aria-selected={i === active}
            aria-controls={`edition-toc-panel-${b.id}`}
            className={`edition-toc__tab${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            <span>{b.index}</span>
            <div>
              <strong>{b.title}</strong>
              <small>{b.sub}</small>
            </div>
          </button>
        ))}
      </div>

      <div
        id={`edition-toc-panel-${book.id}`}
        role="tabpanel"
        aria-labelledby={`edition-toc-tab-${book.id}`}
        className="edition-toc__panel"
      >
        {book.parts ? (
          <div className="edition-toc__parts">
            {book.parts.map(([part, chapters]) => (
              <div key={part} className="edition-toc__part">
                <h4>{part}</h4>
                <ol>
                  {chapters.map(title => <li key={title}>{title}</li>)}
                </ol>
              </div>
            ))}
          </div>
        ) : (
          <ol className="edition-toc__flat">
            {book.chapters?.map((title, i) => (
              <li key={title}>
                <span className="edition-toc__n">{String(i + 1).padStart(2, '0')}</span>
                {title}
              </li>
            ))}
          </ol>
        )}
        <p className="edition-toc__appendix">{book.appendix}</p>
      </div>
    </div>
  )
}
