import Link from 'next/link'
import { ArrowRight, BookOpen, Download, ReceiptText } from 'lucide-react'
import AccountNav from '@/components/AccountNav'
import PageContainer from '@/components/PageContainer'

export const metadata = {
  title: '已购内容',
  description: '查看已购合订本、版本与阅读入口。',
  alternates: { canonical: '/my-study' },
  robots: { index: false, follow: false },
}

export default function MyStudyPage() {
  return (
    <>
      <PageContainer maxWidth="7xl" className="account-page">
        <AccountNav current="/my-study" />
        <main className="account-content">
          <header>
            <p className="study-label">我的内容</p>
            <h1>已购内容</h1>
            <p>已购合订本、当前版本与阅读入口会集中保存在这里。</p>
          </header>
          <section className="account-empty">
            <div className="account-empty__mark"><BookOpen size={26} /></div>
            <h2>这里还没有合订本</h2>
            <p>不购买也可以继续阅读网站上的全部免费内容。购买后，只会获得对应产品的独立访问权益。</p>
            <div>
              <Link href="/bound-edition" className="archive-button archive-button--solid">查看合订本 <ArrowRight size={16} /></Link>
              <Link href="/reading" className="archive-button">继续浏览免费内容</Link>
            </div>
          </section>
          <section className="account-capabilities">
            <article><BookOpen size={19} /><h3>在线阅读</h3><p>已购内容的阅读入口与最近位置。</p></article>
            <article><Download size={19} /><h3>文件领取</h3><p>通过受保护的时效链接下载对应 PDF。</p></article>
            <article><ReceiptText size={19} /><h3>订单与版本</h3><p>查询订单、版本说明与后续勘误。</p></article>
          </section>
        </main>
      </PageContainer>
    </>
  )
}
