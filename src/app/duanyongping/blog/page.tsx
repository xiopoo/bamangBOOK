import fs from 'fs'
import path from 'path'
import BlogExplorer from '@/components/BlogExplorer'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import type { BlogIndex } from '@/lib/blog-index'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '段永平 · 网易博客',
  description:
    '段永平网易博客（2006—2020），按年份浏览、关键词搜索、日期筛选，点击展开全文与完整评论楼。',
  alternates: { canonical: '/duanyongping/blog' },
}

const INDEX_PATH = path.join(process.cwd(), 'public', 'duanyongping', 'blog-index.json')

/** 服务端读取构建期生成的轻量索引，首屏直出、无需客户端再发请求。 */
function readBlogIndex(): BlogIndex | null {
  try {
    if (!fs.existsSync(INDEX_PATH)) return null
    return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8')) as BlogIndex
  } catch {
    return null
  }
}

export default function Page() {
  const initialIndex = readBlogIndex()
  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="段永平 · 网易博客"
        subtitle="2006—2020 年原始博文与完整评论楼（含段永平本人逐条回复）。选择年份、搜索关键词或按日期筛选，点击展开全文。"
        backHref="/duanyongping"
        backLabel="返回段永平专题"
      />
      <div className="mt-6">
        <BlogExplorer initialIndex={initialIndex} />
      </div>
    </PageContainer>
  )
}
