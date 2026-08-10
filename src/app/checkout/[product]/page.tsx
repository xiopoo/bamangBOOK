import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react'
import Logo from '@/components/Logo'
import ProductCover from '@/components/ProductCover'
import { isProductSlug, productList, products } from '@/lib/commerce'

export function generateStaticParams() {
  return productList.map(product => ({ product: product.slug }))
}

export function generateMetadata({ params }: { params: { product: string } }) {
  if (!isProductSlug(params.product)) return { title: '结账' }
  return { title: `购买${products[params.product].title}`, alternates: { canonical: `/checkout/${params.product}` }, robots: { index: false, follow: false } }
}

export default function CheckoutPage({ params }: { params: { product: string } }) {
  if (!isProductSlug(params.product)) return <></>
  const product = products[params.product]

  return (
    <div className="checkout-shell">
      <header className="checkout-header"><Logo /><span><LockKeyhole size={15} />独立安全结账</span></header>
      <main className="checkout-card">
        <Link href="/bound-edition" className="checkout-back"><ArrowLeft size={15} />返回巴芒文集</Link>
        <div className="checkout-title"><p className="study-label">CHECKOUT · 结账</p><h1>购买{product.title}</h1></div>

        <section className="checkout-summary">
          <ProductCover compact variant={product.coverVariant} title={product.title} yearRange={product.yearRange} />
          <div><h2>{product.title}</h2><p>{product.subtitle}</p><span>{product.deliveryType} · 约 {product.pages} 页 · 数量 1</span></div>
          <strong>¥{product.price}</strong>
        </section>

        <dl className="checkout-total">
          <div><dt>商品小计</dt><dd>¥{product.price}</dd></div>
          <div><dt>应付总额</dt><dd>¥{product.price}</dd></div>
        </dl>

        <section className="checkout-block">
          <div className="checkout-block__heading"><span>01</span><div><h2>账户信息</h2><p>用于识别购买者与发放对应产品权益。</p></div></div>
          <label htmlFor="checkout-email">接收验证码的邮箱</label>
          <input id="checkout-email" type="email" placeholder="name@example.com" disabled />
          <small>验证码服务接入后启用，无需预先设置密码。</small>
        </section>

        <section className="checkout-block">
          <div className="checkout-block__heading"><span>02</span><div><h2>选择支付方式</h2><p>两种方式均需服务端确认后才发放权益。</p></div></div>
          <div className="checkout-payments">
            <button type="button" disabled>前往支付宝付款 · {product.price}元</button>
            <button type="button" disabled>生成微信支付二维码 · {product.price}元</button>
          </div>
          <p className="checkout-unavailable">支付商户与回调服务尚未配置，当前不会创建订单或扣款。</p>
        </section>

        <section className="checkout-block checkout-manual">
          <div className="checkout-block__heading"><span>03</span><div><h2>当前购买方式</h2><p>在线收银台启用前，可通过客服确认产品与交付。</p></div></div>
          <div className="checkout-manual__content">
            <Image src="/qrcode.jpeg" alt={`微信公众号"金家岭小胖"二维码`} width={132} height={132} />
            <div>
              <strong>扫码联系&ldquo;复利书房主理人&rdquo;</strong>
              <p>关注微信公众号&ldquo;金家岭小胖&rdquo;，发送&ldquo;巴芒文集 + {product.shortTitle}&rdquo;。客服会在付款前再次确认价格、版本、EPUB 交付方式、更新范围与退款条件。</p>
              <small>请勿向非官方页面提交付款信息；当前页面不会收集银行卡资料。</small>
            </div>
          </div>
        </section>

        <section className="checkout-delivery">
          <h2><ShieldCheck size={18} />交付与服务</h2>
          <ul>
            <li>客服购买按付款前书面确认的方式交付 {product.deliveryType}；在线收银台启用后，已购产品才会自动进入&ldquo;已购内容&rdquo;。</li>
            <li>交付形式：{product.deliveryType} 文件；当前版本：{product.version}。</li>
            <li>是否包含后续版本更新，将以购买时订单摘要为准。</li>
          </ul>
          <div>
            <Link href="/digital-product-policy">数字产品交付与退款说明</Link>
            <Link href="/terms">服务条款</Link>
            <Link href="/privacy">隐私政策</Link>
          </div>
          <p><MessageCircle size={16} />客服：微信公众号&ldquo;金家岭小胖&rdquo;</p>
        </section>
      </main>
    </div>
  )
}
