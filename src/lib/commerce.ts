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
  deliveryType: 'PDF'
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
    subtitle: '巴菲特论企业、资本与长期复利',
    shortTitle: '巴菲特卷',
    price: 99,
    currency: 'CNY',
    version: '2026年8月终稿版',
    deliveryType: 'PDF',
    pages: 400,
    coverVariant: 'buffett',
    yearRange: '1956—2025',
    description: '沿着巴菲特六十年的公开记录，按「所有者起点—企业质量—人与制度—资本配置—风险与复利」五篇十五章，讲清他的投资方法如何形成与变化。',
  },
  'munger-collection': {
    id: 'prod_munger_collection',
    slug: 'munger-collection',
    title: '《理性的格栅》',
    subtitle: '芒格论思维模型、商业判断与人生智慧',
    shortTitle: '芒格卷',
    price: 99,
    currency: 'CNY',
    version: '2026年8月终稿版',
    deliveryType: 'PDF',
    pages: 360,
    coverVariant: 'munger',
    yearRange: '1924—2023',
    description: '从「一把锤子」的比喻出发，用十六章把芒格的多元思维模型、误判心理学与避错方法组织成一套可以实际使用的判断框架。',
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
