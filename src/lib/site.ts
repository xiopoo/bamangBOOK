const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim()

export const siteConfig = {
  name: '小胖书房',
  title: '小胖书房｜巴菲特、芒格与公司研究',
  description: '整理巴菲特、芒格的信件、演讲和股东大会记录，持续发布公司研究、投资方法文章与专题内容。',
  url: configuredUrl || (vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//, '')}` : 'http://localhost:3000'),
  hasProductionUrl: Boolean(configuredUrl || vercelUrl),
}
