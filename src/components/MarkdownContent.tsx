'use client'

import { isValidElement, useMemo, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkCjkEmphasis from '@/lib/remark-cjk-emphasis'

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

function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return getNodeText(node.props.children)
  return ''
}

function getImageAlt(src: unknown, alt: unknown): string {
  if (typeof alt === 'string' && alt.trim()) return alt.trim()
  const rawName = typeof src === 'string' ? src.split('/').pop()?.split('?')[0] || '' : ''
  let name = rawName
  try { name = decodeURIComponent(rawName) } catch {}
  name = name.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[-_]+/g, ' ').trim()
  return name && !/^[a-f0-9]{12,}$/i.test(name) ? `原始资料附图：${name}` : '原始资料附图'
}

function normalizeMarkdownStructure(content: string): string {
  let removedFirstH1 = false
  let inFence = false

  const stripped = (content || '').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')

  const normalized = stripped
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence
        return line
      }
      if (inFence) return line

      // 历史导入内容（如网易博客）常把段首排版空格转成半角缩进；
      // CommonMark 会把行首 4+ 空格或 tab 解析为“缩进代码块”（深色 pre 块），
      // 导致正文变成大面积黑底且不换行、无法阅读。
      // 仅对非列表/非引用/非表格的缩进行去掉缩进，还原为普通段落。
      let normalized = line.replace(/^(\t+| {4,})(?![*+\-\d]|>\s|\|)/, '')
      normalized = normalized.replace(/^(\s*)(#{1,6})(?=[^\s#])/, '$1$2 ')
      normalized = normalized.replace(/^(\s*\*{2,3})#(?=关于付费星球)/, '$1')
      if (/\*{4,}/.test(normalized)) {
        normalized = normalized.replace(/\*/g, '')
      }
      if (/^\s*#{1,6}\s*$/.test(normalized)) return ''
      if (!removedFirstH1 && /^\s*#\s+\S/.test(normalized)) {
        removedFirstH1 = true
        return ''
      }
      return normalized
    })
    .join('\n')

  // 少量演讲/采访稿把“下一题”直接粘在上一段句末；这里仅处理明确的“编号＋关于”结构。
  return normalized.replace(
    /([。！？；）)])(?=\d{1,3}[,，、.．]\s*关于)/g,
    '$1\n\n'
  )
}

const speakerPattern = /(股东(?:提问)?|提问|问题|问|记者|听众|主持人|巴菲特|芒格|沃伦|查理|BUFFETT|MUNGER|A)[：:]/i

function formatNumberedQALine(line: string): string {
  const match = line.match(/^(\s*)(#{2,6}\s+)?(\d{1,3}[,，、.．]\s*)(.+)$/)
  if (!match) return line

  const [, indent, heading, number, body] = match
  const speaker = speakerPattern.exec(body)

  if (speaker) {
    const title = body.slice(0, speaker.index).trim()
    const speech = body.slice(speaker.index + speaker[0].length).trim()
    const isQuestionSpeaker = /^(股东|股东提问|提问|问题|问|记者|听众|主持人)$/i.test(speaker[1])
    const fallbackTitle = isQuestionSpeaker ? '问题' : `${speaker[1]}的回答`
    const questionHeading = `${heading || '### '}${number}${title || fallbackTitle}`
    return speech ? `${indent}${questionHeading}\n\n${speaker[1]}：${speech}` : `${indent}${questionHeading}`
  }

  // 损坏的史料偶尔把整段回答塞进标题。保留内容，但降为问答段落，避免巨型标题。
  if (body.length > 120) return `${indent}${number}${body.trim()}`

  // 问答史料中的裸编号行统一提升为问题标题，避免同一页有的条目有 Q、有的没有。
  if (!heading) return `${indent}### ${number}${body.trim()}`
  return `${indent}${heading}${number}${body.trim()}`
}

function formatQAContent(content: string): string {
  const result = normalizeMarkdownStructure(content)
    .split('\n')
    .flatMap((line) =>
      // 按行处理，因此永远不会在 Markdown 的 ### 标题标记内部切开。
      line
        .replace(/([。！？；）)])(?=\d{1,3}[,，、.．]\s*(?:股东|问题|关于|为什么|如何|能否|是否|[A-Za-z\u4e00-\u9fa5]))/g, '$1\n\n')
        .split('\n')
    )
    .map((line) =>
      line
        .replace(/\*{2}([：:])\*{2}/g, '$1')
        .replace(
          /^(\s*#{2,6}\s+)\*{1,3}(\d{1,3}[,，、.．]\s*.+?)\*{1,3}\s*$/,
          '$1$2'
        )
    )
    .map(formatNumberedQALine)
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

    let result = normalizeMarkdownStructure(content)
    if (result.includes('[[')) {
      result = result.replace(/\[\[([^\]]+)\]\]/g, (match, entity: string) => {
        const resolved = linkResolver?.(entity)
        return resolved ? `[${entity}](${resolved})` : entity
      })
    }
    return escapeTextAngleBrackets(result)
  }, [content, linkResolver, isQA])

  const markdownComponents = useMemo(
    () => ({
      // —— 所有元素不再使用 Tailwind utility 硬编码样式，
      //    统一切换到 reading.css 中的 .prose (CN Reading Typography) 规范。
      //    —— 仅对 QA 模式保留结构包装（is-question / is-answer class），
      //    样式也通过 CSS 变量走全局规范。
      h1: ({ children }: any) => <h2>{children}</h2>,
      h2: ({ children }: any) => {
        const text = getNodeText(children)
        const qa = isQA && /^\d{1,3}[,，、.．]/.test(text.trim())
        return (
          <h2 id={slugify(text)} className={qa ? 'qa-question-heading' : ''}>
            {qa ? (
              <>
                <span className="qa-question-mark" aria-hidden="true">Q</span>
                {children}
              </>
            ) : (
              children
            )}
          </h2>
        )
      },
      h3: ({ children }: any) => {
        const text = getNodeText(children)
        const qa = isQA && /^\d{1,3}[,，、.．]/.test(text.trim())
        return (
          <h3 id={slugify(text)} className={qa ? 'qa-question-heading' : ''}>
            {qa ? (
              <>
                <span className="qa-question-mark qa-question-mark--sm" aria-hidden="true">Q</span>
                {children}
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
        const text = getNodeText(children)

        if (isQA) {
          if (/^(股东|股东提问|提问|问题|问|记者|听众|主持人|Q)[：:]/i.test(text)) {
            const speaker = text.match(/^(股东|股东提问|提问|问题|问|记者|听众|主持人|Q)[：:]/i)?.[1] || '股东'
            const speakerLabel = /^(提问|问题|问|Q)$/i.test(speaker) ? '股东' : speaker
            return (
              <div className="qa qa--question">
                <p className="is-question">
                  <span className="qa__speaker qa__speaker--question">{speakerLabel}：</span>
                  {text.replace(/^(股东|股东提问|提问|问题|问|记者|听众|主持人|Q)[：:]/i, '')}
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

        // 阅读优先重构：正文中的「编者按/来源说明」整段降噪——
        // 加 prose-editorial-note 类（小字、弱色、侧边细线），退居正文之后，不打断阅读节奏。
        if (!isQA && /^(编者按|【编者按】|\(编者按|（编者按)/.test(text.trim())) {
          return <p className="prose-editorial-note">{children}</p>
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
        <img src={src} alt={getImageAlt(src, alt)} />
      ),
    }),
    [isQA]
  )

  return (
    <div
      className={`prose mx-auto overflow-x-hidden break-words ${isQA ? 'prose--is-qa' : ''} ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkCjkEmphasis]} components={markdownComponents}>
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
