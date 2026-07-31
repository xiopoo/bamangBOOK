import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'

export const metadata = { title: '服务条款', alternates: { canonical: '/terms' } }

export default function TermsPage() {
  return (
    <>
      <PageContainer maxWidth="4xl" className="policy-page">
        <header><p className="study-label">TERMS · 服务条款</p><h1>服务条款</h1><p>最后修订：2026年7月30日</p></header>
        <section><h2>一、服务范围</h2><p>小胖书房提供公开资料检索、阅读与数字合订本产品。公开内容不强制登录；账户用于识别订单、已购产品与相应访问权益。</p></section>
        <section><h2>二、内容边界</h2><p>本站内容用于学习、研究与资料检索，不构成投资建议，不提供收益承诺，也不替用户作出投资决定。</p></section>
        <section><h2>三、数字产品</h2><p>合订本按单本一次性购买。购买巴菲特文集不会自动获得芒格文集，反之亦然。产品名称、版本、文件形式、价格和更新范围以结账页订单摘要为准。</p></section>
        <section><h2>四、账户与使用</h2><p>用户应妥善保护登录邮箱或手机号。已购内容仅供购买者本人合理阅读与使用，不得未经许可公开传播、转售或批量复制。</p></section>
        <section><h2>五、支付与权益</h2><p>支付结果以支付渠道服务端回调及订单记录为准。系统不会仅凭浏览器跳转发放权益；退款后将按购买时适用的真实政策处理相应权益。</p></section>
        <section><h2>六、联系</h2><p>事实修订、版权、订单或产品问题，可通过微信公众号“金家岭小胖”联系维护者。</p></section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
