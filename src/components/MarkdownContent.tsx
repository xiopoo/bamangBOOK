'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '')
    .trim()
}

interface MarkdownContentProps {
  content: string
  className?: string
  linkResolver?: (entity: string) => string | undefined
  isQA?: boolean
}

export default function MarkdownContent({
  content,
  className = '',
  linkResolver,
  isQA = false,
}: MarkdownContentProps) {
  const processedContent = useMemo(() => {
    if (!content || !content.includes('[[')) return content
    return content.replace(/\[\[([^\]]+)\]\]/g, (match, entity: string) => {
      const resolved = linkResolver?.(entity)
      const target = resolved ?? `/concepts/${encodeURIComponent(entity)}`
      return `[${entity}](${target})`
    })
  }, [content, linkResolver])

  const markdownComponents = useMemo(
    () => ({
      a: ({ href, children }: any) => (
        <a
          href={href}
          className="text-orange-600 hover:text-orange-700 underline underline-offset-4 decoration-1"
        >
          {children}
        </a>
      ),
      h2: ({ children }: any) => {
        const text = typeof children === 'string' ? children : ''
        if (isQA) {
          return (
            <h2 
              id={slugify(text)}
              className="text-2xl md:text-2.5xl font-serif font-bold text-text dark:text-dark-text mt-10 mb-2 flex items-start gap-3 pb-2 border-b border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 px-4 py-3 rounded-lg"
            >
              <span className="text-primary dark:text-primary-light text-xl shrink-0 mt-1">Q</span>
              <span className="flex-1">{children}</span>
            </h2>
          )
        }
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
      p: ({ children }: any) => {
        const text = typeof children === 'string' ? children : ''
        
        if (isQA) {
          if (text.startsWith('股东：') || text.startsWith('股东提问：') || text.startsWith('Q：')) {
            return (
              <div className="bg-primary/5 dark:bg-primary/10 border-l-4 border-primary pl-4 py-3 rounded-r-lg mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <span className="font-semibold text-primary dark:text-primary-light">股东：</span>
                  {text.replace(/^股东[：:]|^股东提问[：:]|^Q[：:]/, '')}
                </p>
              </div>
            )
          }
          
          if (text.startsWith('巴菲特：') || text.startsWith('芒格：') || text.startsWith('A：')) {
            return (
              <div className="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-3 rounded-r-lg mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {text.startsWith('巴菲特：') ? '巴菲特：' : text.startsWith('芒格：') ? '芒格：' : '回答：'}
                  </span>
                  {text.replace(/^巴菲特[：:]|^芒格[：:]|^A[：:]/, '')}
                </p>
              </div>
            )
          }
        }
        
        return (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {children}
          </p>
        )
      },
      ul: ({ children }: any) => (
        <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
      ),
      ol: ({ children }: any) => (
        <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
      ),
      li: ({ children }: any) => (
        <li className="text-gray-700 dark:text-gray-300">{children}</li>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 dark:text-gray-400 my-6 bg-primary/5 dark:bg-primary/10 py-3 pr-4 rounded-r-lg">
          {children}
        </blockquote>
      ),
      strong: ({ children }: any) => (
        <strong className="font-semibold text-text dark:text-dark-text">
          {children}
        </strong>
      ),
      em: ({ children }: any) => <em className="italic">{children}</em>,
      code: ({ children }: any) => (
        <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ),
      pre: ({ children }: any) => (
        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {children}
        </pre>
      ),
      table: ({ children }: any) => (
        <div className="overflow-x-auto my-6 rounded-lg shadow-card border border-gray-200 dark:border-dark-border">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      thead: ({ children }: any) => <thead>{children}</thead>,
      tbody: ({ children }: any) => <tbody>{children}</tbody>,
      tr: ({ children }: any) => <tr>{children}</tr>,
      th: ({ children }: any) => (
        <th className="text-center border border-gray-200 dark:border-dark-border bg-bg-card dark:bg-dark-card font-semibold text-text dark:text-dark-text sm:px-3 sm:py-2.5 px-2 py-1.5 font-serif text-xs sm:text-sm">
          {children}
        </th>
      ),
      td: ({ children }: any) => (
        <td className="text-center border border-gray-200 dark:border-dark-border text-text dark:text-dark-text sm:px-3 sm:py-2 px-2 py-1.5 text-xs sm:text-sm">
          {children}
        </td>
      ),
      hr: () => <hr className="my-8 border-gray-200 dark:border-dark-border" />,
    }),
    [isQA]
  )

  return (
    <div
      className={`prose prose-gray max-w-none overflow-x-hidden break-words dark:text-dark-text ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
