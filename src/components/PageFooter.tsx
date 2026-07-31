import Image from 'next/image'
import Link from 'next/link'

const footerLinks = [
  { href: '/buffett', label: '巴菲特档案' },
  { href: '/munger', label: '芒格档案' },
  { href: '/business-history', label: '企业研究' },
  { href: '/concepts', label: '主题索引' },
  { href: '/bound-edition', label: '合订本' },
  { href: '/search', label: '全站搜索' },
  { href: '/references', label: '引用与参考' },
  { href: '/about', label: '编辑原则' },
]

export default function PageFooter() {
  return (
    <footer id="follow" className="archive-footer">
      <div className="archive-footer__inner">
        <div className="archive-footer__seal" aria-hidden="true">藏</div>
        <div className="archive-footer__grid">
          <div className="archive-footer__brand">
            <h3>小胖书房</h3>
            <p>投资思想与商业史的长期档案。</p>
            <blockquote>阅读原典，形成自己的判断。</blockquote>
          </div>
          <nav aria-label="页脚阅读入口">
            <p>核心入口</p>
            <div>
              {footerLinks.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            </div>
          </nav>
          <div className="archive-footer__follow">
            <p>书房之外</p>
            <Image src="/qrcode.jpeg" alt="微信公众号“金家岭小胖”二维码" width={92} height={92} />
            <span><strong>金家岭小胖</strong><br />个人思考与长期文章</span>
            <a href="https://xhslink.com/m/6OPiGk9H7w7" target="_blank" rel="noopener noreferrer">小红书：金融街小胖</a>
          </div>
        </div>
        <div className="archive-footer__note">
          <span>© 2026 小胖书房</span>
          <span>本站内容用于学习、研究和资料检索，不构成投资建议，不提供收益承诺。</span>
          <span><Link href="/about">编辑原则</Link> · <Link href="/references">引用与参考</Link> · <Link href="/search">全站搜索</Link></span>
        </div>
      </div>
    </footer>
  )
}
