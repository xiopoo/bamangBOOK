'use client'

import { useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import ReadingProgressBar from '@/components/ReadingProgress'
import type { LetterData, LetterItem } from '@/lib/letters'

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
        return `[${entity}](/concepts/${encodeURIComponent(entity)})`
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
    a: ({ href, children }: any) => (
      <a href={href} className="text-primary hover:text-primary-light underline underline-offset-4 decoration-1">
        {children}
      </a>
    ),
    h2: ({ children }: any) => {
      const text = typeof children === 'string' ? children : ''
      return (
        <h2 
          id={slugify(text)}
          className="text-2xl md:text-2.5xl font-serif font-bold text-text dark:text-dark-text mt-10 mb-5 flex items-center gap-3 pb-2 border-b border-primary/20 dark:border-primary/30"
        >
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          {children}
        </h2>
      )
    },
    h3: ({ children }: any) => {
      const text = typeof children === 'string' ? children : ''
      return (
        <h3 
          id={slugify(text)}
          className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4 flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-primary/60 dark:bg-primary-light/60 rounded-full" />
          {children}
        </h3>
      )
    },
    p: ({ children }: any) => (
      <p className="text-text/80 dark:text-dark-text leading-[1.8] text-justify [text-indent:2em] mb-6">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="text-text/80 dark:text-dark-text">{children}</li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-text-muted dark:text-dark-muted my-6 bg-bg-card dark:bg-dark-card py-3 pr-4 rounded-r-lg">
        {children}
      </blockquote>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-text dark:text-dark-text">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ),
    pre: ({ children }: any) => (
      <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{children}</pre>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse">{children}</table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-gray-200 dark:border-dark-border px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left dark:text-dark-text">{children}</th>
    ),
    td: ({ children }: any) => (
      <td className="border border-gray-200 dark:border-dark-border px-4 py-2 dark:text-dark-text">{children}</td>
    ),
    hr: () => <hr className="my-8 border-gray-200 dark:border-dark-border" />,
  }), [])

  const renderContent = (content: string, index?: number) => {
    const processed = processContent(content)
    return (
      <div key={index ?? 0} className="prose prose-gray mx-auto overflow-x-hidden break-words dark:text-dark-text">
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

      <article ref={contentRef} className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-6 md:p-10 lg:p-12 shadow-sm hover:shadow-md transition-shadow">
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
