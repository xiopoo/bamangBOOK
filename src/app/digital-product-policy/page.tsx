import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'

export const metadata = { title: '数字产品交付与退款说明', alternates: { canonical: '/digital-product-policy' } }

export default function DigitalProductPolicyPage() {
  return (
    <>
      <PageContainer maxWidth="4xl" className="policy-page">
        <header><p className="study-label">DELIVERY · 数字产品说明</p><h1>数字产品交付与退款说明</h1><p>购买前请阅读产品页与结账页中的版本和交付信息。</p></header>
        <section><h2>一、当前产品</h2><p>《巴菲特文集合订本》与《芒格文集合订本》均为单本一次性购买、分别授权的 PDF 数字产品。每本99元，不自动捆绑。</p></section>
        <section><h2>二、交付方式</h2><p>在线支付服务启用后，系统将在服务端确认付款，并把对应合订本放入购买者的“已购内容”。当前通过微信公众号客服购买时，客服会在付款前确认购买者、版本和 PDF 文件交付方式，并按确认结果完成交付。</p></section>
        <section><h2>三、版本与更新</h2><p>当前版本分别为“1956—2025 精读编排版”和“1924—2023 精读编排版”。是否包含后续版本更新，必须在购买时的订单摘要中明确，不作默认承诺。</p></section>
        <section><h2>四、退款规则</h2><p>在线收银台尚未开放。通过客服购买时，是否已交付或下载文件、产品能否完整退回、支付渠道规则及适用法律都会影响退款条件；具体规则须在付款前由客服书面确认。未明确交付与退款条件前，请不要付款。</p></section>
        <section><h2>五、勘误与客服</h2><p>发现文本或排版问题可提交勘误。产品、订单、交付或退款问题，请通过微信公众号“金家岭小胖”联系。</p></section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
