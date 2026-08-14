import Link from 'next/link'

// 阅读优先重构：页脚只保留阅读内容入口，已移除电商（巴芒文集）、
// 知识图谱、阅读历史、已购内容等平台功能入口。
const footerLinks = [
  { href: '/buffett', label: '巴菲特' },
  { href: '/munger', label: '芒格' },
  { href: '/business-history', label: '公司研究' },
  { href: '/concepts', label: '投资方法' },
  { href: '/reading', label: '全部内容' },
  { href: '/search', label: '全站搜索' },
]

const aboutLinks = [
  { href: '/about', label: '关于复利书房' },
  { href: '/about/editorial', label: '来源与编辑原则' },
  { href: '/about/revisions', label: '修订记录' },
  { href: '/terms', label: '服务条款' },
  { href: '/privacy', label: '隐私政策' },
  { href: 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5NTk0MDU2NQ==&scene=124#wechat_redirect', label: '微信公众号 · 金家岭小胖', external: true },
  { href: 'https://xhslink.com/m/6OPiGk9H7w7', label: '小红书 · 金融街小胖', external: true },
]

export default function PageFooter() {
  return (
    <footer id="follow" className="archive-footer">
      <div className="archive-footer__inner">
        <div className="archive-footer__seal" aria-hidden="true">研</div>
        <div className="archive-footer__grid">
          <div className="archive-footer__brand">
            <h3>复利书房</h3>
            <p>巴菲特、芒格与段永平公开资料的阅读档案。</p>
            <Link href="/about" className="archive-footer__byline">由金融街小胖整理 · 了解来源与整理方法 →</Link>
          </div>

          <nav aria-label="页脚阅读入口">
            <p>主要栏目</p>
            <div>
              {footerLinks.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            </div>
          </nav>

          <div className="archive-footer__support">
            <p>关于本站</p>
            <div className="archive-footer__support-links">
              {aboutLinks.map(link => (
                <Link key={link.href} href={link.href} {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="archive-footer__note">
          <span>© 2026 复利书房</span>
          <span>本站内容用于学习、研究和资料检索，不构成投资建议，不提供收益承诺。</span>
        </div>
      </div>
    </footer>
  )
}
