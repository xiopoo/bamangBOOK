import PageContainer from '@/components/PageContainer'

export const metadata = { title: '数字产品交付与退款说明', alternates: { canonical: '/digital-product-policy' } }

export default function DigitalProductPolicyPage() {
  return (
    <>
      <PageContainer maxWidth="4xl" className="policy-page">
        <header><p className="study-label">DELIVERY · 数字产品说明</p><h1>数字产品交付与退款说明</h1><p>购买前请阅读产品页中的版本、价格和交付信息。</p></header>
        <section><h2>一、当前产品</h2><p>《所有者的眼光》与《理性的格栅》均为单本一次性购买、分别授权的 PDF 数字产品。每本99元，不自动捆绑。</p></section>
        <section><h2>二、交付方式</h2><p>当前采用微信人工交付。添加购买微信 igrape，确认书名、价格和付款后，通过微信文件发送对应文集的完整 PDF 电子书，通常在确认付款后24小时内完成交付。</p></section>
        <section><h2>三、版本与更新</h2><p>当前版本为&ldquo;精读编排版&rdquo;。已购读者可免费获取后续更新版本。</p></section>
        <section><h2>四、退款规则</h2><p>PDF 属于发送后即可复制保存的数字产品。具体退款条件将在付款前通过微信说明并确认；如对版本、内容或交付方式仍有疑问，请先确认清楚再付款。</p></section>
        <section><h2>五、勘误与联系</h2><p>发现文本或排版问题可提交勘误。购买、交付或退款问题，请联系购买微信 igrape。</p></section>
      </PageContainer>
    </>
  )
}
