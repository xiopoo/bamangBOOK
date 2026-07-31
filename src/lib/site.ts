const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim()

export const siteConfig = {
  name: '小胖书房',
  title: '小胖书房｜投资思想与商业史档案',
  description: '系统整理巴菲特、查理·芒格的信件、演讲、问答、企业案例、思维模型与商业史资料。阅读原典，形成自己的判断。',
  url: configuredUrl || (vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//, '')}` : 'http://localhost:3000'),
  hasProductionUrl: Boolean(configuredUrl || vercelUrl),
}
