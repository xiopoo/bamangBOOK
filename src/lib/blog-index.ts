// 段永平网易博客阅读优化 —— 客户端数据层
//
// 生产环境为静态导出（output:'export'），无运行时 API。
// 全部数据由 scripts/generate-blog-index.mjs 在构建期预生成到 public/duanyongping/：
//   - blog-index.json   轻量元数据 + 摘要（年份导航 / 搜索 / 筛选 / 分页）
//   - blog-content/<slug>.json  单篇全文（点击展开时按需 fetch）
//
// 本文件仅负责类型定义与客户端 fetch 封装，不引入任何 Node 依赖，
// 可被 'use client' 组件安全引用。

export type BlogIndexItem = {
  slug: string
  title: string
  date?: string
  year?: string
  platform?: string
  source?: string
  sourceUrl?: string
  articleId?: string
  commentCount?: string
  duanCommentCount?: string
  summary: string
}

export type BlogYearStat = { year: string; count: number }

export type BlogIndex = {
  generatedAt: string
  total: number
  years: BlogYearStat[]
  items: BlogIndexItem[]
}

/** 按需获取的单篇全文。 */
export type BlogContent = { slug: string; title: string; content: string }

const INDEX_URL = '/duanyongping/blog-index.json'
const contentUrl = (slug: string) => `/duanyongping/blog-content/${slug}.json`

/** 拉取轻量索引（年份导航 / 搜索 / 筛选的数据源）。 */
export async function fetchBlogIndex(signal?: AbortSignal): Promise<BlogIndex> {
  const res = await fetch(INDEX_URL, { signal })
  if (!res.ok) throw new Error(`博客索引加载失败（${res.status}）`)
  return (await res.json()) as BlogIndex
}

/** 按需拉取单篇全文；展开卡片时调用，避免一次性传输全部正文。 */
export async function fetchBlogContent(slug: string, signal?: AbortSignal): Promise<BlogContent> {
  const res = await fetch(contentUrl(slug), { signal })
  if (!res.ok) throw new Error(`博文加载失败（${res.status}）`)
  return (await res.json()) as BlogContent
}
