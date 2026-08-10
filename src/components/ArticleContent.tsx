'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkNumberedList from '@/lib/remark-numbered-list'
import remarkCjkEmphasis from '@/lib/remark-cjk-emphasis'
import rehypeNumberedList from '@/lib/rehype-numbered-list'
import rehypeSectionHeadings from '@/lib/rehype-section-headings'
import { normalizeImportedMarkdown } from '@/lib/normalize-letter-markdown'

interface ArticleContentProps {
  content: string
}

/**
 * 去掉 markdown 内容开头的重复标题和元数据。
 * 页面 header 已显示标题，内容里的 # h1 会重复渲染且字号过大。
 */
function stripLeadingMetadata(content: string): string {
  const withoutTitle = content.replace(/^# .+\n\n?/, '')

  // 部分文件在页首标题后带分隔线；正文内的分隔线必须保留。
  return withoutTitle.replace(/^---\n+/, '')
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const cleanedContent = useMemo(
    () => normalizeImportedMarkdown(stripLeadingMetadata(content)),
    [content]
  )

  // 不再用 Tailwind utility 覆盖样式，统一切换到 reading.css
  // 的 .prose (CN Reading Typography) 排版规范。
  // —— 合伙人信 (ArticleContent) 正文采用标准 prose 结构，
  //    首行缩进/两端对齐/段距全部由 reading.css 控制。
  const components = useMemo(() => ({
    table: ({ children }: any) => <table>{children}</table>,
    th: ({ children }: any) => <th>{children}</th>,
    td: ({ children }: any) => <td>{children}</td>,
  }), [])

  return (
    <div className="prose mx-auto overflow-x-hidden break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCjkEmphasis, remarkNumberedList]}
        rehypePlugins={[rehypeNumberedList, rehypeSectionHeadings]}
        components={components}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  )
}
