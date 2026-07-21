/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 部署：确保 content/bloggers/ 在运行时可用
  experimental: {
    outputFileTracingIncludes: {
      '/bloggers': ['./content/bloggers/**/*'],
    },
  },
}

module.exports = nextConfig
