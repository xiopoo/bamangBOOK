import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'

export const metadata = { title: '隐私政策', alternates: { canonical: '/privacy' } }

export default function PrivacyPage() {
  return (
    <>
      <PageContainer maxWidth="4xl" className="policy-page">
        <header><p className="study-label">PRIVACY · 隐私政策</p><h1>隐私政策</h1><p>最后修订：2026年7月30日</p></header>
        <section><h2>一、收集的信息</h2><p>账户功能启用后，仅收集完成登录、订单、交付与客服所需的信息，例如邮箱或手机号、订单状态、购买产品与必要的支付结果标识。</p></section>
        <section><h2>二、信息用途</h2><p>信息用于验证码登录、订单确认、产品权益发放、版本或勘误通知、退款处理与安全审计，不用于与服务无关的营销画像。</p></section>
        <section><h2>三、支付信息</h2><p>银行卡、支付宝或微信支付的敏感支付数据由合规支付服务处理。小胖书房不自行保存银行卡信息，支付密钥也不会暴露在浏览器中。</p></section>
        <section><h2>四、本地阅读数据</h2><p>在跨设备同步功能上线前，免费内容的阅读进度仅保存在当前浏览器本地。清除浏览器数据可能同时清除这些记录。</p></section>
        <section><h2>五、保存与安全</h2><p>订单与支付事件会按适用法律、会计及争议处理需要保存。下载链接应采用带时效的签名地址，避免公开暴露已购文件。</p></section>
        <section><h2>六、联系</h2><p>如需查询、更正或处理账户相关信息，可通过微信公众号“金家岭小胖”联系维护者。</p></section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
