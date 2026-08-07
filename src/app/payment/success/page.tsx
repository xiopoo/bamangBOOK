import Link from 'next/link'
import { CheckCircle2, Clock3 } from 'lucide-react'
import Logo from '@/components/Logo'

export const metadata = { title: '支付结果', robots: { index: false, follow: false } }

export default function PaymentSuccessPage() {
  return (
    <div className="checkout-shell">
      <header className="checkout-header"><Logo /></header>
      <main className="payment-result">
        <div className="payment-result__icon"><Clock3 size={30} /></div>
        <p className="study-label">PAYMENT STATUS · 支付状态</p>
        <h1>支付正在确认，请不要重复付款</h1>
        <p>系统只会在服务端验证支付结果后发放对应产品权益。确认完成后，巴芒文集会自动出现在“已购内容”。</p>
        <dl>
          <div><dt>订单编号</dt><dd>确认后显示</dd></div>
          <div><dt>支付金额</dt><dd>以订单为准</dd></div>
          <div><dt>购买时间</dt><dd>确认后显示</dd></div>
          <div><dt>权益状态</dt><dd><CheckCircle2 size={15} />等待服务端确认</dd></div>
        </dl>
        <div className="payment-result__actions">
          <Link href="/my-study" className="archive-button archive-button--solid">查看已购内容</Link>
          <Link href="/orders" className="archive-button">查看订单</Link>
        </div>
        <small>如长时间未确认，请通过微信公众号“金家岭小胖”联系客服，并提供订单编号。</small>
      </main>
    </div>
  )
}
