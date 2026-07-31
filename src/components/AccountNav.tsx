import Link from 'next/link'

const links = [
  { href: '/my-study', label: '已购内容' },
  { href: '/orders', label: '我的订单' },
  { href: '/my-study/profile', label: '个人资料' },
  { href: '/digital-product-policy', label: '客服与退款' },
]

export default function AccountNav({ current }: { current: string }) {
  return (
    <nav className="account-nav" aria-label="账户导航">
      <p>我的账户</p>
      {links.map(link => (
        <Link key={link.href} href={link.href} className={current === link.href ? 'is-active' : ''}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
