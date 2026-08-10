/** @type {import('next').NextConfig} */
const nextConfig = {
  // 使用 Vercel 原生 Next.js 输出。静态页面仍会在构建时 SSG，
  // 但保留 .next/routes-manifest.json 供 Vercel 正确识别和托管路由。
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
