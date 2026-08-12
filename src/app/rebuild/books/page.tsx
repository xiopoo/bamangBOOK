import Link from 'next/link'

export default function RebuildBooksPage() {
  return <main className="rebuild-shell rebuild-catalog"><header className="rebuild-header"><Link href="/rebuild" className="rebuild-brand"><span>↗</span><strong>复利书房</strong></Link><Link href="/rebuild">返回新站首页</Link></header><section><p>电子书 · 人工购买</p><h1>主题文集</h1><div className="rebuild-catalog-list"><article><small>巴菲特</small><h2>《巴菲特文集》</h2><p>所有者思维、好企业、资本配置、风险与复利。</p><strong>购买方式将在正式上线前公布。</strong></article><article><small>芒格</small><h2>《芒格文集》</h2><p>知识格栅、误判心理、商业判断与人生原则。</p><strong>购买方式将在正式上线前公布。</strong></article></div></section></main>
}
