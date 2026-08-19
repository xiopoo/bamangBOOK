import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '全站搜索',
  description: '搜索复利书房中的人物、信件、问答、演讲、公司研究和主题。',
  alternates: { canonical: '/search' },
  // 搜索页是纯客户端渲染，SSR 只输出「加载中...」（约 6 个字符），
  // 被索引会形成 thin content 拖累站点质量评分。
  // follow 保留，让爬虫仍能顺着页内链接继续发现内容。
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
