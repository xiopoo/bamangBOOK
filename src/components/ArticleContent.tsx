'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkNumberedList from '@/lib/remark-numbered-list'
import rehypeNumberedList from '@/lib/rehype-numbered-list'
import rehypeSectionHeadings from '@/lib/rehype-section-headings'

interface ArticleContentProps {
  content: string
}

/**
 * 去掉 markdown 内容开头的重复标题和元数据。
 * 页面 header 已显示标题，内容里的 # h1 会重复渲染且字号过大。
 */
function stripLeadingMetadata(content: string): string {
  // 去掉从开头到第一个 "---" 分隔符之间的所有内容（含标题、来源引用等）
  const sepIndex = content.indexOf('\n---\n')
  if (sepIndex !== -1) {
    return content.slice(sepIndex + 5).replace(/^\n+/, '')
  }
  // 如果没有分隔符，只去掉第一行的 # 标题
  return content.replace(/^# .+\n\n?/, '')
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const cleanedContent = useMemo(() => stripLeadingMetadata(content), [content])

  return (
    <article className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkNumberedList]} 
        rehypePlugins={[rehypeNumberedList, rehypeSectionHeadings]}
      >
        {cleanedContent}
      </ReactMarkdown>
    </article>
  )
}