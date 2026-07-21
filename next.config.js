/** @type {import('next').NextConfig} */
const nextConfig = {
  // 大文件目录不打包进 serverless function，运行时通过 fs 直接读取
  serverExternalPackages: [],
}

module.exports = nextConfig
