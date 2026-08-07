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
    title: '《巴菲特文集》',
    subtitle: '人物 · 合伙 · 股东信 · 年会 · 写作 · 演讲 · 访谈',
    shortTitle: '巴菲特文集',
    price: 99,
    currency: 'CNY',
    version: '精读编排版',
    deliveryType: 'EPUB',
    pages: 760,
    coverVariant: 'buffett',
    yearRange: '1956—2025',
    description: '按七卷编排巴菲特六十年的公开记录：人生与事业、早期文章及合伙人信、伯克希尔股东信、股东大会问答、专题写作、公开演讲、访谈与课堂——每一篇标注原始出处、时间与背景。',
  },
  'munger-collection': {
    id: 'prod_munger_collection',
    slug: 'munger-collection',
    title: '《芒格文集》',
    subtitle: '人物 · 经典 · 实践 · 模型 · 品格 · 复习',
    shortTitle: '芒格文集',
    price: 99,
    currency: 'CNY',
    version: '精读编排版',
    deliveryType: 'EPUB',
    pages: 820,
    coverVariant: 'munger',
    yearRange: '1924—2023',
    description: '按十三卷编排芒格的思维与判断体系：人生与事业、《穷查理宝典》核心、Wesco与每日期刊实践、对话访谈、思维方法论、心理模型、商业判断、品格修炼，附232个模型身份溯源与主题索引。',
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
