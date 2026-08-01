'use client'

import { useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import ReadingProgressBar from '@/components/ReadingProgress'
import type { LetterData, LetterItem } from '@/lib/letters'
import { normalizeLetterMarkdown } from '@/lib/normalize-letter-markdown'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '')
    .trim()
}

interface LetterGraphData {
  year: string
  concepts: Array<{
    id: string
    name: string
    description: string
    count: number
    totalCount: number
    years: string[]
    relatedConcepts: Array<{ id: string; name: string; count: number }>
    relatedPeople: Array<{ id: string; name: string; count: number }>
  }>
  people: Array<{ id: string; name: string; count: number }>
  companies: Array<{ id: string; name: string; count: number }>
  summary: {
    conceptCount: number
    peopleCount: number
    companyCount: number
  }
}

interface LetterReaderProps {
  letterData: LetterData
  graphData: LetterGraphData | null
  year: number
  letterTitle: string
  isPartnerLetter: boolean
  isMultiLetter: boolean
}

export default function LetterReader({
  letterData,
  graphData,
  year,
  letterTitle,
  isPartnerLetter,
  isMultiLetter,
}: LetterReaderProps) {
  const {
    contentRef,
    currentProgress,
    hasSavedProgress,
    scrollToPosition,
  } = useReadingProgress(
    letterData.year,
    isPartnerLetter ? 'partnership' : 'letter',
    letterTitle
  )

  const topConcepts = useMemo(() => graphData?.concepts?.slice(0, 5) || [], [graphData])
  const relatedPeople = useMemo(() => graphData?.people || [], [graphData])
  const relatedCompanies = useMemo(() => graphData?.companies || [], [graphData])

  const processContent = useCallback((text: string): string => {
    if (!text) return ''
    if (!text.includes('[[')) return text
    // 防御性处理：先按 URL 段切分，只对非 URL 段执行 [[entity]] -> [entity](...) 转换，
    // 避免 URL 内部的中文 [[entity]] 被误识别为 Markdown 链接，导致来源链接被破坏。
    const urlRegex = /https?:\/\/\S+/g
    const convert = (segment: string) =>
      segment.replace(/\[\[([^\]]+)\]\]/g, (_match: string, entity: string) => {
        if (topConcepts.some(c => c.name === entity)) {
          return `[${entity}](/concepts/${encodeURIComponent(entity)})`
        }
        if (relatedPeople.some(p => p.name === entity)) {
          return `[${entity}](/people/${encodeURIComponent(entity)})`
        }
        if (relatedCompanies.some(c => c.name === entity)) {
          return `[${entity}](/companies/${encodeURIComponent(entity)})`
        }
        return entity
      })
    let result = ''
    let lastIndex = 0
    let urlMatch: RegExpExecArray | null
    while ((urlMatch = urlRegex.exec(text)) !== null) {
      result += convert(text.slice(lastIndex, urlMatch.index))
      // URL 段保留原文，把其中的 [[ / ]] 退化为普通方括号，
      // 避免下游 Markdown 解析器把 URL 内部的方括号误识别为链接。
      result += urlMatch[0].replace(/\[\[/g, '[').replace(/\]\]/g, ']')
      lastIndex = urlMatch.index + urlMatch[0].length
    }
    result += convert(text.slice(lastIndex))
    return result
  }, [topConcepts, relatedPeople, relatedCompanies])

  const markdownComponents = useMemo(() => ({
    // 隐藏 h1：页面 header 已显示标题，内容中的 h1 冗余且字号过大。
    h1: () => null,
    // 其余元素样式不再硬编码 Tailwind utility，统一走 reading.css 的
    // .prose (CN Reading Typography) 全局排版规范。
    h2: ({ children }: any) => {
      const text = typeof children === 'string' ? children : ''
      return <h2 id={slugify(text)}>{children}</h2>
    },
    h3: ({ children }: any) => {
      const text = typeof children === 'string' ? children : ''
      return <h3 id={slugify(text)}>{children}</h3>
    },
    h4: ({ children }: any) => <h4>{children}</h4>,
    h5: ({ children }: any) => <h5>{children}</h5>,
    h6: ({ children }: any) => <h6>{children}</h6>,
    p: ({ children }: any) => <p>{children}</p>,
    ul: ({ children }: any) => <ul>{children}</ul>,
    ol: ({ children }: any) => <ol>{children}</ol>,
    li: ({ children }: any) => <li>{children}</li>,
    blockquote: ({ children }: any) => <blockquote>{children}</blockquote>,
    strong: ({ children }: any) => <strong>{children}</strong>,
    em: ({ children }: any) => <em>{children}</em>,
    code: ({ className: codeClassName, children }: any) => {
      const isBlock =
        (typeof codeClassName === 'string' && /language-/.test(codeClassName)) ||
        String(children).includes('\n')
      if (isBlock) return <code className={codeClassName}>{children}</code>
      return <code>{children}</code>
    },
    pre: ({ children }: any) => <pre>{children}</pre>,
    table: ({ children }: any) => <table>{children}</table>,
    thead: ({ children }: any) => <thead>{children}</thead>,
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => <tr>{children}</tr>,
    th: ({ children }: any) => <th>{children}</th>,
    td: ({ children }: any) => <td>{children}</td>,
    hr: () => <hr />,
    a: ({ href, children }: any) => <a href={href}>{children}</a>,
    img: ({ src, alt }: any) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt || ''} />
    ),
  }), [])

  const renderContent = (content: string, index?: number) => {
    const processed = processContent(normalizeLetterMarkdown(content))
    return (
      <div
        key={index ?? 0}
        className="prose mx-auto overflow-x-hidden break-words"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {processed}
        </ReactMarkdown>
      </div>
    )
  }

  const showKnowledgePanel = topConcepts.length > 0 || relatedPeople.length > 0 || relatedCompanies.length > 0

  return (
    <>
      <ReadingProgressBar
        progress={currentProgress}
        hasSavedProgress={hasSavedProgress}
        onContinueReading={scrollToPosition}
        title={letterTitle}
      />

      <article ref={contentRef} className="min-w-0 max-w-full bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-6 md:p-10 lg:p-12 shadow-sm hover:shadow-md transition-shadow">
        {isMultiLetter ? (
          <div className="space-y-8">
            {letterData.letters!.map((letter: LetterItem, index: number) => (
              <div key={index}>
                {letterData.letters!.length > 1 && (
                  <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-gray-100 dark:border-dark-border">
                    {letter.title}
                  </h2>
                )}
                {renderContent(letter.content, index)}
                {index < letterData.letters!.length - 1 && (
                  <hr className="my-8 border-gray-200 dark:border-dark-border" />
                )}
              </div>
            ))}
          </div>
        ) : (
          letterData.content ? renderContent(letterData.content) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500 dark:text-gray-400">该年份的股东信暂未收录</p>
            </div>
          )
        )}
      </article>
    </>
  )
}
