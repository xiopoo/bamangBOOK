import { BookOpenCheck, CheckCircle2, Scale, SearchCheck } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'

const principles = [
  { icon: BookOpenCheck, title: '区分原文与整理', text: '股东信、合伙人信等原始资料与概念卡片、公司档案等二次整理内容分别标注，避免把归纳表述当作原话。' },
  { icon: SearchCheck, title: '提供核对线索', text: '概念和公司页面尽可能关联相关年份、人物与资料入口，帮助读者回到上下文核对。' },
  { icon: CheckCircle2, title: '持续修订', text: '发现翻译、标题、段落或实体关系错误后进行修订；尚未核验的内容不包装成确定结论。' },
  { icon: Scale, title: '保持使用边界', text: '本站用于学习、研究和资料检索，不提供个股推荐、收益承诺、实时估值或个性化投资建议。' },
]

export const metadata = {
  title: '关于与编辑原则',
  description: '了解小胖书房的资料范围、编辑方法、核验边界与内容使用说明。',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <PageContainer maxWidth="4xl">
      <PageHeader title="关于与编辑原则" subtitle="这座书房如何整理资料，以及哪些结论不应由它代替你做出" backHref="/" backLabel="返回首页" />

      <section className="py-4">
        <p className="text-lg leading-8 text-gray-700 dark:text-gray-300">
          小胖书房是一套个人阅读与研究库。它先服务日常阅读、资料检索、摘录复盘和写作准备，再逐步沉淀概念、公司、人物和年份之间的关联。
        </p>
      </section>

      <section className="mt-6 border-t border-gray-200 dark:border-gray-700">
        {principles.map(({ icon: Icon, title, text }) => (
          <div key={title} className="grid gap-3 border-b border-gray-200 py-6 dark:border-gray-700 sm:grid-cols-[180px_1fr]">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"><Icon className="h-5 w-5 text-primary" />{title}</h2>
            <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 bg-primary/5 px-6 py-7">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">内容与隐私说明</h2>
        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
          当前站点不提供账户、付费或个性化投资服务。搜索和阅读功能以资料浏览为目的；外部链接由第三方独立运营。若内容涉及版权、署名或事实修订，可通过页脚标注的公众号联系维护者。
        </p>
      </section>

      <PageFooter />
    </PageContainer>
  )
}
