/** @type {import('next').NextConfig} */
const nextConfig = {
  // 全站内容在构建时生成静态 HTML，避免 Hobby 计划为大量 SSG 页面
  // 创建超过 12 个 Serverless Functions。
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
