import Image from 'next/image'
import Link from 'next/link'

const footerLinks = [
  { href: '/buffett', label: '巴菲特' },
  { href: '/munger', label: '芒格' },
  { href: '/business-history', label: '公司研究' },
  { href: '/concepts', label: '投资方法' },
  { href: '/reading', label: '全部内容' },
  { href: '/bound-edition', label: '合订本' },
  { href: '/search', label: '全站搜索' },
  { href: '/about', label: '关于' },
  { href: '/terms', label: '服务条款' },
  { href: '/privacy', label: '隐私政策' },
]

export default function PageFooter() {
  return (
    <footer id="follow" className="archive-footer">
      <div className="archive-footer__inner">
        <div className="archive-footer__seal" aria-hidden="true">研</div>
        <div className="archive-footer__grid">
          <div className="archive-footer__brand">
            <h3>复利书房</h3>
            <p>巴菲特、芒格与公司研究。</p>
            <blockquote>阅读原典，形成自己的判断。</blockquote>
          </div>
          <nav aria-label="页脚阅读入口">
            <p>主要栏目</p>
            <div>
              {footerLinks.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            </div>
          </nav>
          <div className="archive-footer__follow">
            <p>关注我们</p>
            <Image src="/qrcode.jpeg" alt="微信公众号“金家岭小胖”二维码" width={92} height={92} />
            <span><strong>金家岭小胖</strong><br />个人思考与长期文章</span>
            <a href="https://xhslink.com/m/6OPiGk9H7w7" target="_blank" rel="noopener noreferrer">小红书：金融街小胖</a>
          </div>
        </div>
        <div className="archive-footer__note">
          <span>© 2026 复利书房</span>
          <span>本站内容用于学习、研究和资料检索，不构成投资建议，不提供收益承诺。</span>
          <span><Link href="/about">关于</Link> · <Link href="/search">全站搜索</Link></span>
        </div>
      </div>
    </footer>
  )
}
