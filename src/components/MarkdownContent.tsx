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
      // —— 所有元素不再使用 Tailwind utility 硬编码样式，
      //    统一切换到 reading.css 中的 .prose (CN Reading Typography) 规范。
      //    —— 仅对 QA 模式保留结构包装（is-question / is-answer class），
      //    样式也通过 CSS 变量走全局规范。
      h2: ({ children }: any) => {
        const text = typeof children === 'string' ? children : ''
        const qa = isQA
        return (
          <h2 id={slugify(text)} className={qa ? 'qa-question-heading' : ''}>
            {qa ? (
              <>
                <span className="qa-question-mark">Q</span>
                <span className="flex-1">{children}</span>
              </>
            ) : (
              children
            )}
          </h2>
        )
      },
      h3: ({ children }: any) => {
        const text = typeof children === 'string' ? children : ''
        const qa = isQA
        return (
          <h3 id={slugify(text)} className={qa ? 'qa-question-heading' : ''}>
            {qa ? (
              <>
                <span className="qa-question-mark qa-question-mark--sm">Q</span>
                <span className="flex-1">{children}</span>
              </>
            ) : (
              children
            )}
          </h3>
        )
      },
      h4: ({ children }: any) => <h4>{children}</h4>,
      h5: ({ children }: any) => <h5>{children}</h5>,
      h6: ({ children }: any) => <h6>{children}</h6>,
      p: ({ children }: any) => {
        const text = Array.isArray(children)
          ? children.map((child) => (typeof child === 'string' ? child : '')).join('')
          : typeof children === 'string'
          ? children
          : ''

        if (isQA) {
          if (/^(股东|股东提问|提问|问题|问|Q)[：:]/i.test(text)) {
            return (
              <div className="qa qa--question">
                <p className="is-question">
                  <span className="qa__speaker qa__speaker--question">股东：</span>
                  {text.replace(/^(股东|股东提问|提问|问题|问|Q)[：:]/i, '')}
                </p>
              </div>
            )
          }

          if (/^(巴菲特|芒格|沃伦|查理|BUFFETT|MUNGER|A)[：:]/i.test(text)) {
            const speaker =
              text.match(/^(巴菲特|芒格|沃伦|查理|BUFFETT|MUNGER|A)[：:]/i)?.[1] || '回答'
            const speakerLabel = speaker.toUpperCase() === 'A' ? '回答' : speaker
            return (
              <div className="qa qa--answer">
                <p className="is-answer">
                  <span className="qa__speaker qa__speaker--answer">{speakerLabel}：</span>
                  {text.replace(/^(巴菲特|芒格|沃伦|查理|BUFFETT|MUNGER|A)[：:]/i, '')}
                </p>
              </div>
            )
          }

          const hasBoldQuestion =
            Array.isArray(children) &&
            children.some((child: any) => child?.type === 'strong')
          if (hasBoldQuestion || /^\d{1,3}[,，、.．]/.test(text)) {
            return (
              <div className="qa qa--question">
                <p className="is-question">{children}</p>
              </div>
            )
          }
        }

        return <p>{children}</p>
      },
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
        if (isBlock) {
          return <code className={codeClassName}>{children}</code>
        }
        return <code>{children}</code>
      },
      pre: ({ children }: any) => <pre>{children}</pre>,
      table: ({ children }: any) => (
        <table>
          {/* 不再套 wrapper，prose table 已经用 display:block + overflow 自己处理横滚 */}
          {children}
        </table>
      ),
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
    }),
    [isQA]
  )

  return (
    <div
      className={`prose mx-auto overflow-x-hidden break-words ${isQA ? 'prose--is-qa' : ''} ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
