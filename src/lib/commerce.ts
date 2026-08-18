export type ProductSlug = 'buffett-collection' | 'munger-collection'

export type Product = {
  id: string
  slug: ProductSlug
  title: string
  subtitle: string
  shortTitle: string
  price: number
  currency: 'CNY'
  version: string
  deliveryType: 'EPUB' | 'PDF'
  pages: number
  coverVariant: 'buffett' | 'munger'
  yearRange: string
  description: string
}

export const products: Record<ProductSlug, Product> = {
  'buffett-collection': {
    id: 'prod_buffett_collection',
    slug: 'buffett-collection',
    title: '《所有者的眼光》',
    subtitle: '所有者起点 · 好企业 · 人与制度 · 资本配置 · 风险与复利',
    shortTitle: '所有者的眼光',
    price: 99,
    currency: 'CNY',
    version: '精读编排版',
    deliveryType: 'PDF',
    pages: 305,
    coverVariant: 'buffett',
    yearRange: '1956—2025',
    description: '按五篇十五章编排巴菲特六十年的思考：所有者的起点、好企业如何创造价值、人与制度、资本配置、风险与复利——每一篇/章标注原始出处、时间与背景。',
  },
  'munger-collection': {
    id: 'prod_munger_collection',
    slug: 'munger-collection',
    title: '《理性的格栅》',
    subtitle: '知识格栅 · 概率与逆向 · 误判心理 · 商业资本 · 品格人生',
    shortTitle: '理性的格栅',
    price: 99,
    currency: 'CNY',
    version: '精读编排版',
    deliveryType: 'PDF',
    pages: 213,
    coverVariant: 'munger',
    yearRange: '1924—2023',
    description: '按五篇十六章编排芒格的思维与判断体系：从一元思维到多元格栅、概率与逆向、误判心理学、商业判断与资本配置、合作品格与人生，附232个模型身份溯源与三种检查工具。',
  },
}

export const productList = Object.values(products)

export function isProductSlug(value: string): value is ProductSlug {
  return value in products
}

export type OrderStatus = 'created' | 'pending' | 'paid' | 'failed' | 'closed' | 'refunded'
export type EntitlementStatus = 'active' | 'revoked'

export type UserRecord = {
  id: string
  email?: string
  phone?: string
  createdAt: string
  status: 'active' | 'disabled'
}

export type OrderRecord = {
  id: string
  userId: string
  productId: string
  amount: number
  currency: 'CNY'
  paymentChannel: 'wechat' | 'alipay'
  paymentStatus: OrderStatus
  createdAt: string
  paidAt?: string
  refundedAt?: string
}

export type EntitlementRecord = {
  id: string
  userId: string
  productId: string
  orderId: string
  status: EntitlementStatus
  grantedAt: string
  revokedAt?: string
}

export type PaymentEventRecord = {
  providerEventId: string
  orderId: string
  eventType: string
  processedAt: string
}
