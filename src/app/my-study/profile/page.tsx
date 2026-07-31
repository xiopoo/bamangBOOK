import AccountNav from '@/components/AccountNav'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'

export const metadata = {
  title: '个人资料',
  alternates: { canonical: '/my-study/profile' },
  robots: { index: false, follow: false },
}

export default function ProfilePage() {
  return (
    <>
      <PageContainer maxWidth="7xl" className="account-page">
        <AccountNav current="/my-study/profile" />
        <main className="account-content">
          <header><p className="study-label">PROFILE · 个人资料</p><h1>个人资料</h1><p>用于账户识别、订单通知与版本更新。</p></header>
          <section className="account-form-card">
            <label>登录邮箱<input type="email" placeholder="登录后显示" disabled /></label>
            <label>显示名称<input type="text" placeholder="未设置" disabled /></label>
            <button type="button" className="archive-button archive-button--solid" disabled>保存资料</button>
            <p>登录服务启用后可修改。</p>
          </section>
        </main>
      </PageContainer>
      <PageFooter />
    </>
  )
}
