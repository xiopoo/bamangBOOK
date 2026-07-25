import Link from 'next/link'
import {
  Archive,
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  FileText,
  Handshake,
  Layers3,
  Network,
  PackageOpen,
  UserRound,
} from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import { getDocuments } from '@/lib/documents'
import {
  getPartnershipCount,
  getShareholderCount,
} from '@/lib/partnership'

const readingPackages = [
  {
    title: '亲笔信主线',
    description: '从合伙人信到伯克希尔股东信，按年份阅读巴菲特长期经营与投资思想的形成过程。',
    href: '/letters',
    icon: BookOpen,
  },
  {
    title: '会议问答主线',
    description: '用股东大会问答补足信件之外的现场解释、案例延展和芒格视角。',
    href: '/qa',
    icon: FileText,
  },
  {
    title: '概念与公司索引',
    description: '把高频概念、公司案例、人物资料拆成可回溯的知识节点。',
    href: '/concepts',
    icon: Brain,
  },
  {
    title: '知识图谱',
    description: '按概念、公司和人物关系回到原文年份，适合研究式阅读。',
    href: '/graph',
    icon: Network,
  },
]

const editionSections = [
  '合伙人信与有限合伙协议',
  '伯克希尔致股东信',
  '股东大会问答与实录',
  '演讲、访谈和专题文章',
  '投资概念、公司和人物档案',
  '专题信件与编辑说明',
]

export default function BoundEditionPage() {
  const partnershipCount = getPartnershipCount()
  const shareholderCount = getShareholderCount()
  const qaCount = getDocuments('qa').length
  const talksCount = getDocuments('talks').length
  const interviewsCount = getDocuments('interviews').length
  const articlesCount = getDocuments('articles').length
  const totalPrimaryDocs = partnershipCount + shareholderCount + qaCount + talksCount + interviewsCount

  return (
    <PageContainer maxWidth="6xl">
      <section className="border-b border-gray-200 pb-10 dark:border-gray-700 md:pb-14">
        <div className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <PackageOpen className="h-4 w-4" />
          文档专题
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
              小胖书房装订版阅读包
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg">
              把站内已经精校的信件、问答、演讲、概念和公司资料组织成一套可连续阅读的专题目录。这里不是外部下载页，而是全站资料的总装配台。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/reading" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-dark hover:text-white">
                <Archive className="h-4 w-4" />
                进入阅读库
              </Link>
              <Link href="/search" className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-dark-card dark:text-gray-100">
                搜索全部资料
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="border-y border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center gap-3">
              <Layers3 className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">当前收录</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">按站内内容动态统计</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <Stat value={String(totalPrimaryDocs)} label="核心文献" />
              <Stat value="1956-2025" label="时间跨度" />
              <Stat value={String(articlesCount)} label="专题文章" />
              <Stat value={String(partnershipCount + shareholderCount)} label="信件资料" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-12">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">专题结构</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">按阅读任务组织资料</h2>
        </div>
        <div className="grid gap-x-8 md:grid-cols-2">
          {readingPackages.map((item) => (
            <Link key={item.title} href={item.href} className="group border-t border-gray-200 py-5 transition-colors hover:border-primary dark:border-gray-700">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary dark:text-white">{item.title}</h3>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white/50 py-8 dark:border-gray-700 dark:bg-dark-card/30">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <div>
            <p className="text-sm font-medium text-primary">收录范围</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">一份总目录，覆盖多条主线</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {editionSections.map(section => (
              <div key={section} className="flex items-start gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm leading-6 text-gray-700 dark:text-gray-300">{section}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-12">
        <div className="grid gap-5 md:grid-cols-3">
          <IndexCard href="/partnership" icon={<Handshake className="h-5 w-5" />} title="合伙人信" meta={`${partnershipCount} 篇`} />
          <IndexCard href="/letters" icon={<BookOpen className="h-5 w-5" />} title="股东信" meta={`${shareholderCount} 篇`} />
          <IndexCard href="/companies" icon={<Building2 className="h-5 w-5" />} title="公司档案" meta="按企业案例回到原文" />
          <IndexCard href="/people" icon={<UserRound className="h-5 w-5" />} title="人物档案" meta="巴菲特、芒格和关键经营者" />
          <IndexCard href="/articles" icon={<FileText className="h-5 w-5" />} title="专题文章" meta={`${articlesCount} 篇`} />
          <IndexCard href="/learn" icon={<Brain className="h-5 w-5" />} title="学习路径" meta="从入门到专题研究" />
        </div>
      </section>

      <section className="mb-12 border-y border-primary/20 bg-primary/5 px-5 py-8 md:px-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">编辑原则</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          站内正文保留资料本身，不保留外部来源网址、网页营销尾巴和无关跳转。同步参考格式时，只吸收标题层级、自然段、表格、脚注和专题组织方式。
        </p>
      </section>

      <PageFooter />
    </PageContainer>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}

function IndexCard({ href, icon, title, meta }: {
  href: string
  icon: React.ReactNode
  title: string
  meta: string
}) {
  return (
    <Link href={href} className="group border-t border-gray-200 py-5 transition-colors hover:border-primary dark:border-gray-700">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary dark:bg-gray-800 dark:text-gray-300">
        {icon}
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary dark:text-white">{title}</h3>
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{meta}</p>
    </Link>
  )
}
