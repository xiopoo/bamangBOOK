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

function escapeTextAngleBrackets(content: string): string {
  return content.replace(
    /<(?!(?:[A-Za-z][A-Za-z0-9-]*\b|\/[A-Za-z][A-Za-z0-9-]*\b|!--|!\[CDATA\[|\?))/g,
    '&lt;'
  )
}

function escapeAllAngleBrackets(content: string): string {
  return content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatQAContent(content: string): string {
  let result = content || ''

  // 详情页头部已展示标题，移除正文开头的 H1 行，避免重复 H1。
  result = result.replace(/^\s*#\s+[^\n]+\n?/, '')

  // 部分实录原文把下一个问题直接接在上一段末尾，先切回独立段落。
  result = result
    .replace(/([。！？；）)])(?=(?:#{2,6}\s*)?\d{1,3}[,，、.．]\s*)/g, '$1\n\n')
    .replace(/([^\n])(?=#{2,6}\s*\d{1,3}[,，、.．]\s*)/g, '$1\n\n')
    .replace(/([^\n])(?=\d{1,3}[,，、.．]\s*(?:股东|问题|关于|为什么|如何|能否|是否|[A-Za-z]))/g, '$1\n\n')

  result = result
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line

      const headingQuestion = line.match(/^(\s*#{2,6}\s*)(\d{1,3}[,，、.．]\s*.+)$/)
      if (headingQuestion) {
        return `${headingQuestion[1]}**${headingQuestion[2].trim()}**`
      }

      const numberedQuestion = line.match(/^(\s*)(\d{1,3}[,，、.．]\s*.+)$/)
      if (numberedQuestion && !trimmed.startsWith('**')) {
        return `${numberedQuestion[1]}**${numberedQuestion[2].trim()}**`
      }

      const explicitQuestion = line.match(/^(\s*)((?:股东|提问|问题|问|Q)[：:].+)$/i)
      if (explicitQuestion && !trimmed.startsWith('**')) {
        return `${explicitQuestion[1]}**${explicitQuestion[2].trim()}**`
      }

      return line
    })
    .join('\n')

  return escapeAllAngleBrackets(result)
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
    if (isQA) {
      return formatQAContent(content)
    }

    let result = content || ''
    if (result.includes('[[')) {
      result = result.replace(/\[\[([^\]]+)\]\]/g, (match, entity: string) => {
        const resolved = linkResolver?.(entity)
        return resolved ? `[${entity}](${resolved})` : entity
      })
    }
    // 详情页头部已展示标题，移除正文开头的 H1 行，避免页面内出现重复 H1（语义与视觉问题）
    result = result.replace(/^\s*#\s+[^\n]+\n?/, '')
    return escapeTextAngleBrackets(result)
  }, [content, linkResolver, isQA])

  const markdownComponents = useMemo(
    () => ({
      a: ({ href, children }: any) => (
        <a
          href={href}
          className="text-primary hover:text-primary-light underline underline-offset-4 decoration-1"
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
              className="font-serif font-bold text-text dark:text-dark-text flex items-start gap-3 pb-2 border-b border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 px-4 py-3 rounded-lg"
            >
              <span className="text-primary dark:text-primary-light text-xl shrink-0 mt-1">Q</span>
              <span className="flex-1">{children}</span>
            </h2>
          )
        }
        return (
          <h2 
            id={slugify(text)}
            className="font-serif font-bold text-text dark:text-dark-text flex items-center gap-3 pb-2 border-b border-primary/20 dark:border-primary/30"
          >
            <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
            {children}
          </h2>
        )
      },
      h3: ({ children }: any) => {
        const text = typeof children === 'string' ? children : ''
        if (isQA) {
          return (
            <h3
              id={slugify(text)}
              className="font-serif font-bold text-text dark:text-dark-text flex items-start gap-3 pb-2 border-b border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 px-4 py-3 rounded-lg"
            >
              <span className="text-primary dark:text-primary-light text-lg shrink-0 mt-1">Q</span>
              <span className="flex-1">{children}</span>
            </h3>
          )
        }
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
        const text = Array.isArray(children)
          ? children.map((child) => (typeof child === 'string' ? child : '')).join('')
          : typeof children === 'string' ? children : ''
        
        if (isQA) {
          if (/^(股东|股东提问|提问|问题|问|Q)[：:]/i.test(text)) {
            return (
              <div className="bg-primary/5 dark:bg-primary/10 border-l-4 border-primary pl-4 py-3 rounded-r-lg mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <span className="font-semibold text-primary dark:text-primary-light">股东：</span>
                  {text.replace(/^(股东|股东提问|提问|问题|问|Q)[：:]/i, '')}
                </p>
              </div>
            )
          }
          
          if (/^(巴菲特|芒格|沃伦|查理|BUFFETT|MUNGER|A)[：:]/i.test(text)) {
            const speaker = text.match(/^(巴菲特|芒格|沃伦|查理|BUFFETT|MUNGER|A)[：:]/i)?.[1] || '回答'
            const speakerLabel = speaker.toUpperCase() === 'A' ? '回答' : speaker
            return (
              <div className="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-3 rounded-r-lg mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {speakerLabel}：
                  </span>
                  {text.replace(/^(巴菲特|芒格|沃伦|查理|BUFFETT|MUNGER|A)[：:]/i, '')}
                </p>
              </div>
            )
          }

          const hasBoldQuestion = Array.isArray(children) && children.some((child: any) => child?.type === 'strong')
          if (hasBoldQuestion || /^\d{1,3}[,，、.．]/.test(text)) {
            return (
              <div className="bg-primary/5 dark:bg-primary/10 border-l-4 border-primary pl-4 py-3 rounded-r-lg mb-4">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-semibold">
                  {children}
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
      code: ({ className: codeClassName, children }: any) => {
        // 代码块（围栏代码）由 <pre> 包裹，globals.css 中 .prose pre code 已重置样式；
        // 这里仅对「行内代码」套用高亮背景，避免代码块内出现嵌套底色块。
        const isBlock = (typeof codeClassName === 'string' && /language-/.test(codeClassName)) ||
          String(children).includes('\n')
        if (isBlock) {
          return <code className={codeClassName}>{children}</code>
        }
        return (
          <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        )
      },
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

  const widthClass = className.includes('max-w-') ? '' : 'max-w-3xl'

  return (
    <div
      className={`prose ${widthClass} mx-auto overflow-x-hidden break-words dark:text-dark-text ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
