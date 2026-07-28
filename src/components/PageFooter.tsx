import Image from 'next/image'
import Link from 'next/link'

const footerLinks = [
  { href: '/partnership', label: '合伙人信' },
  { href: '/letters', label: '股东信' },
  { href: '/qa', label: '股东大会问答' },
  { href: '/munger/archive', label: '芒格影音档案' },
  { href: '/munger/originals', label: '芒格原典' },
  { href: '/model', label: '思维模型' },
  { href: '/columns', label: '投资专栏' },
  { href: '/business-history', label: '商业史研究' },
]

export default function PageFooter() {
  return (
    <footer id="follow" className="archive-footer">
      <div className="archive-footer__inner">
        <div className="archive-footer__flourish">❧</div>
        <div className="archive-footer__grid">
          <div className="archive-footer__brand">
            <h3>
              小胖书房
            </h3>
            <p>系统整理巴菲特、芒格、长期主义投资与商业史资料。</p>
            <blockquote>“反过来想，总是反过来想。”</blockquote>
            <a
              href="https://xhslink.com/m/6OPiGk9H7w7"
              target="_blank"
              rel="noopener noreferrer"
            >
              BY 金融街小胖
            </a>
          </div>

          <nav aria-label="页脚阅读入口">
            <p>阅读入口</p>
            <div>
              {footerLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="archive-footer__follow">
            <p>关注公众号</p>
            <Image
              src="/qrcode.jpeg"
              alt="微信公众号二维码"
              width={96}
              height={96}
            />
            <span>在微信继续阅读</span>
          </div>
        </div>
        <div className="archive-footer__note">
          <span>© 2026 小胖书房</span>
          <span>本站内容仅供研究与资料参考，不构成投资建议。</span>
          <span><Link href="/about">编辑原则</Link> · <Link href="/search">全站搜索</Link></span>
        </div>
      </div>
    </footer>
  )
}
