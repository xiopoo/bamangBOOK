export type ProductSlug = 'buffett-collection' | 'munger-collection'

export type Product = {
  id: string
  slug: ProductSlug
  title: string
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
    title: '《巴菲特文集合订本》',
    shortTitle: '巴菲特文集',
    price: 99,
    currency: 'CNY',
    version: '1956—2025 精读编排版',
    deliveryType: 'PDF',
    pages: 4585,
    coverVariant: 'buffett',
    yearRange: '1956—2025',
    description: '沿着信件与公开文字，连续理解巴菲特的投资方法、企业判断与资本配置思想如何形成和变化。',
  },
  'munger-collection': {
    id: 'prod_munger_collection',
    slug: 'munger-collection',
    title: '《芒格文集合订本》',
    shortTitle: '芒格文集',
    price: 99,
    currency: 'CNY',
    version: '1924—2023 精读编排版',
    deliveryType: 'PDF',
    pages: 1905,
    coverVariant: 'munger',
    yearRange: '1924—2023',
    description: '通过演讲、问答与重要文章，系统理解芒格如何连接商业、心理学和多元思维模型。',
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
