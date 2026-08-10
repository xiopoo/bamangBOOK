import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'

export const metadata: Metadata = {
  title: '来源与编辑原则',
  description: '复利书房如何区分原文、译文和编辑整理，如何标注来源、完整度、核对状态与修订记录。',
  alternates: { canonical: '/about/editorial' },
}

const rules = [
  ['原文优先', '尽量回到原始信件、会议记录、演讲录音、采访和公司披露，不用二手概括替代可获得的原始材料。'],
  ['状态分开', '原文、译文、编辑整理、已校对、部分缺失和待核对分别标注，不把整理稿包装成作者原话。'],
  ['保留上下文', '保留人物、年份、资料类型和原始讨论场景；节选内容明确说明，不用金句替代完整论证。'],
  ['承认缺漏', '无法确认来源、版本或完整度时直接标为未知、部分或待核对，不通过模糊措辞隐藏问题。'],
  ['持续修订', '修正标题、译文、段落、来源或链接后更新修订日期；重大修订在修订记录中说明。'],
  ['纠错开放', '任何读者都可以通过关于页面提供原始资料或指出错漏，核实后更新页面。'],
]

export default function EditorialPrinciplesPage() {
  return <PageContainer maxWidth="5xl">
    <PageHeader title="来源与编辑原则" subtitle="网站提供的不是“请相信我们”，而是来源、状态、完整度和可继续核对的线索。" backHref="/about" backLabel="返回关于" />
    <div className="archive-catalog__groups">{rules.map(([title, description], index) => <section key={title} className="archive-catalog-section"><header><h2>{String(index + 1).padStart(2, '0')} · {title}</h2></header><p className="py-4 leading-8 text-[var(--archive-ink-soft)]">{description}</p></section>)}</div>
  </PageContainer>
}
