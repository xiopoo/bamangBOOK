import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'

export default function ModelPage() {
  return (
    <PageContainer maxWidth="4xl">
      <PageHeader title="思维模型" subtitle="芒格多元思维框架（即将上线）" />
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🧠</div>
        <p className="text-text-muted dark:text-dark-muted">功能开发中，敬请期待</p>
      </div>
      <PageFooter />
    </PageContainer>
  )
}
