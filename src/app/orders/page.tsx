import Link from 'next/link'
import { ArrowRight, ReceiptText } from 'lucide-react'
import AccountNav from '@/components/AccountNav'
import PageContainer from '@/components/PageContainer'

export const metadata = {
  title: '我的订单',
  alternates: { canonical: '/orders' },
  robots: { index: false, follow: false },
}

export default function OrdersPage() {
  return (
    <>
      <PageContainer maxWidth="7xl" className="account-page">
        <AccountNav current="/orders" />
        <main className="account-content">
          <header><p className="study-label">ORDERS · 订单</p><h1>我的订单</h1><p>查询产品、金额、支付状态与权益发放记录。</p></header>
          <section className="account-empty">
            <div className="account-empty__mark"><ReceiptText size={26} /></div>
            <h2>暂无订单</h2>
            <p>支付功能开放后，已创建、待支付、已付款与已退款订单都会保留在这里。</p>
            <Link href="/bound-edition" className="archive-button">查看巴芒文集 <ArrowRight size={16} /></Link>
          </section>
        </main>
      </PageContainer>
    </>
  )
}
