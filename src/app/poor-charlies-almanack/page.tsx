import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen, ChevronRight, Library, Route } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import Breadcrumbs from '@/components/Breadcrumbs'
import AlmanackAudioPlayer from '@/components/AlmanackAudioPlayer'
import { almanackSections } from '@/lib/poor-charlies-almanack'
import { getAlmanackAudioTracks } from '@/lib/poor-charlies-audio'

export const metadata: Metadata = {
  title: '《穷查理宝典》统一阅读入口',
  description: '按原书顺序阅读《穷查理宝典》：中文演讲、章节导读、人类误判心理学与芒格推荐书目。',
  alternates: { canonical: '/poor-charlies-almanack' },
  openGraph: {
    title: '《穷查理宝典》统一阅读入口',
    description: '从芒格生平到十一场演讲，按原书结构连续阅读。',
    type: 'website',
  },
}

const groups = [
  {
    id: 'opening',
    title: '卷首与方法',
    description: '先理解芒格其人，再进入他的思维系统。',
    sections: almanackSections.slice(0, 4),
  },
  {
    id: 'talks',
    title: '第四章 · 十一场演讲',
    description: '从逆向思考、普世智慧，到经济学与人类误判心理学。',
    sections: almanackSections.slice(4, 15),
  },
  {
    id: 'appendix',
    title: '延伸阅读',
    description: '沿着芒格的书单继续搭建多元思维格栅。',
    sections: almanackSections.slice(15),
  },
]

export default function PoorCharliesAlmanackPage() {
  const fullTextCount = almanackSections.filter(section => section.kind === '原书演讲').length
  const translationCount = almanackSections.filter(section => section.kind === '中文译稿').length
  const audioTracks = getAlmanackAudioTracks()

  return (
    <PageContainer maxWidth="6xl">
      <Breadcrumbs fallbackParent={{ href: '/munger', label: '返回芒格' }} />
      <header className="border-b-2 border-[var(--archive-ink)] pb-8 pt-6">
        <p className="archive-kicker">Poor Charlie&rsquo;s Almanack</p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-[-0.04em] text-text dark:text-dark-text md:text-6xl">《穷查理宝典》</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted dark:text-dark-muted">按原书顺序统一阅读：卷首、前三章方法论、十一场演讲与芒格推荐书目。</p>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-white to-accent/10 p-6 shadow-card dark:from-primary/20 dark:via-dark-card dark:to-accent/10 md:p-10">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-primary/10" />
        <div className="absolute -right-3 top-12 h-28 w-28 rounded-full border border-primary/10" />
        <div className="relative max-w-3xl">
          <h2 className="font-serif text-3xl font-bold leading-tight text-text dark:text-dark-text md:text-5xl">
            从生平到十一讲，
            <br className="hidden sm:block" />
            按原书顺序连续阅读
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700 dark:text-gray-300">
            按 Stripe Press 2023 年英文删节版的结构重新组织：十场演讲沿用站内中文译稿，
            卷首、前三章与第十一讲为新增中文译稿。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/poor-charlies-almanack/${almanackSections[0].slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              从序言开始
              <ChevronRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="my-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
          <BookOpen className="mb-3 text-primary" size={22} />
          <strong className="block text-2xl text-text dark:text-dark-text">{fullTextCount}场</strong>
          <span className="text-sm text-text-muted dark:text-dark-muted">站内既有中文演讲正文</span>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
          <Route className="mb-3 text-primary" size={22} />
          <strong className="block text-2xl text-text dark:text-dark-text">{translationCount}篇</strong>
          <span className="text-sm text-text-muted dark:text-dark-muted">新增完整中文译稿</span>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
          <Library className="mb-3 text-primary" size={22} />
          <strong className="block text-2xl text-text dark:text-dark-text">{almanackSections.length}篇</strong>
          <span className="text-sm text-text-muted dark:text-dark-muted">按原书顺序连续阅读</span>
        </div>
      </section>

      <aside className="mb-10 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-sm leading-7 text-accent dark:border-accent/50 dark:bg-accent/10 dark:text-accent-light">
        <strong>版本与版权说明：</strong>
        本专题以 Stripe Press 2023 年英文删节版的结构为对照。十场演讲沿用站内既有中文译稿；
        卷首、前三章、第十一讲与推荐书目依据 Stripe Press 英文原版翻译。专名与疑难表述可对照官方英文原文。
      </aside>

      <div className="mb-10">
        <AlmanackAudioPlayer tracks={audioTracks} />
      </div>

      <div className="space-y-12">
        {groups.map(group => (
          <section key={group.id} id={group.id}>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-primary/15 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-text dark:text-dark-text">{group.title}</h2>
                <p className="mt-1 text-sm text-text-muted dark:text-dark-muted">{group.description}</p>
              </div>
              <span className="hidden text-xs tracking-widest text-primary sm:block">
                {String(group.sections.length).padStart(2, '0')} 篇资料
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {group.sections.map(section => (
                <Link
                  key={section.slug}
                  href={`/poor-charlies-almanack/${section.slug}`}
                  className="group flex min-h-36 items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover dark:border-dark-border dark:bg-dark-card"
                >
                  <span className="font-mono text-sm text-primary/70">{section.number}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                        {section.kind}
                      </span>
                      {section.year && (
                        <span className="text-xs text-text-muted dark:text-dark-muted">{section.year}</span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-text transition group-hover:text-primary dark:text-dark-text">
                      {section.title}
                    </h3>
                    {section.subtitle && (
                      <p className="mt-2 text-sm leading-6 text-text-muted dark:text-dark-muted">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-1 shrink-0 text-primary/50 transition group-hover:translate-x-1 group-hover:text-primary" size={20} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

    </PageContainer>
  )
}
