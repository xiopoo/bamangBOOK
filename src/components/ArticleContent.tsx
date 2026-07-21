'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkNumberedList from '@/lib/remark-numbered-list'
import rehypeNumberedList from '@/lib/rehype-numbered-list'
import rehypeSectionHeadings from '@/lib/rehype-section-headings'

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  return (
    <article className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkNumberedList]} 
        rehypePlugins={[rehypeNumberedList, rehypeSectionHeadings]}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}