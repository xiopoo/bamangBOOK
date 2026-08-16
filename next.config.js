/** @type {import('next').NextConfig} */
const nextConfig = {
  // 全站内容在构建时生成静态 HTML，避免 Hobby 计划为大量 SSG 页面
  // 创建超过 12 个 Serverless Functions。
  // 注意：output: 'export' 仅在构建（next build）时启用——dev 模式下 Next 对
  // 动态路由会误报 "missing generateStaticParams"（源码与产物均已正确导出），
  // 关闭 export 检查后 dev 可正常预览动态路由，生产导出行为不变。
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
