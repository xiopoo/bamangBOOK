/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开发环境保留动态路由，生产构建再输出静态站点。
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
