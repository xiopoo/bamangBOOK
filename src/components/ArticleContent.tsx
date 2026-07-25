'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkNumberedList from '@/lib/remark-numbered-list'
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

  const components = useMemo(() => ({
    p: ({ children }: any) => (
      <p className="text-text/80 dark:text-dark-text leading-[1.8] text-justify [text-indent:2em] mb-6">
        {children}
      </p>
    ),
    table: ({ children }: any) => (
      <div className="max-w-full overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-dark-border">
        <table className="w-full min-w-max border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="whitespace-nowrap border border-gray-200 dark:border-dark-border px-3 py-2.5 bg-gray-50 dark:bg-gray-800 font-semibold text-right first:text-left dark:text-dark-text">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="whitespace-nowrap border border-gray-200 dark:border-dark-border px-3 py-2 text-right first:text-left dark:text-dark-text">
        {children}
      </td>
    ),
  }), [])

  return (
    <article className="prose prose-lg min-w-0 max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkNumberedList]} 
        rehypePlugins={[rehypeNumberedList, rehypeSectionHeadings]}
        components={components}
      >
        {cleanedContent}
      </ReactMarkdown>
    </article>
  )
}
