import Link from 'next/link'
import Logo from '@/components/Logo'

export const metadata = {
  title: '登录复利书房',
  description: '登录后查看已购巴芒文集、订单与阅读进度。',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <Logo />
        <div className="auth-panel__heading">
          <p className="study-label">ACCOUNT · 账户</p>
          <h1>登录复利书房</h1>
          <p>登录后查看已购巴芒文集、订单与阅读进度。</p>
        </div>
        <form className="auth-form">
          <label htmlFor="email">邮箱</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" disabled />
          <button type="button" className="archive-button archive-button--solid" disabled>发送登录验证码</button>
          <p>邮箱验证码服务尚未接入。正式开放购买前，此处将启用一次性验证码登录。</p>
        </form>
        <div className="auth-panel__links">
          <Link href="/">继续浏览免费内容</Link>
          <Link href="/privacy">隐私政策</Link>
        </div>
      </div>
    </div>
  )
}
