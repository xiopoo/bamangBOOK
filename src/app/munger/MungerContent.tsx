'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, BookOpen, ChevronRight } from 'lucide-react'
import type { Person, RelatedPerson } from '@/lib/people'
import type { ModelMeta } from '@/lib/models'
import { logger } from '@/lib/logger'

interface MungerContentProps {
  person: Person
  relatedPeople: RelatedPerson[]
  talksCount: number
  qaCount: number
  modelGroups?: Array<{ id: string; name: string; icon: string; models: ModelMeta[] }>
  modelStats?: { total: number; disciplines: number; scenarios: number; core: number }
  archiveStats: { profiles: number; recordings: number; quotes: number; total: number }
}

const navSections = [
  { id: 'overview', label: '人物简介' },
  { id: 'archive', label: '芒格资料' },
  { id: 'philosophy', label: '思维模型' },
  { id: 'content', label: '核心著作' },
  { id: 'cases', label: '投资案例' },
  { id: 'quotes', label: '经典语录' },
]

const archiveProfiles = [
  { href: '/munger/archive/life', title: '生平', description: '1924—2023 年的人生轨迹' },
  { href: '/munger/archive/investing-philosophy', title: '投资哲学', description: '从烟蒂股到伟大企业' },
  { href: '/munger/archive/companies', title: '公司与职务', description: '伯克希尔、Wesco 与每日期刊' },
  { href: '/munger/archive/daily-journal', title: '每日期刊', description: '长期主持的股东问答记录' },
  { href: '/munger/archive/family', title: '家庭', description: '婚姻、子女与长期伙伴关系' },
  { href: '/munger/archive/philanthropy', title: '慈善', description: '教育捐赠与公共项目' },
  { href: '/munger/archive/architecture', title: '建筑', description: '宿舍设计及无窗方案争议' },
  { href: '/munger/archive/books', title: '书籍', description: '著述、推荐书目与相关传记' },
]

const concepts = [
  { name: '内在价值', count: 83, category: '价值评估' },
  { name: '护城河', count: 61, category: '竞争分析' },
  { name: '复利', count: 68, category: '投资原理' },
  { name: '资本配置', count: 61, category: '企业管理' },
  { name: '管理层', count: 80, category: '企业管理' },
  { name: '保险浮存金', count: 52, category: '金融业务' },
  { name: '股息', count: 67, category: '投资收益' },
  { name: '账面价值', count: 66, category: '价值评估' },
  { name: '保险业', count: 64, category: '金融业务' },
  { name: '低估', count: 59, category: '价值评估' },
  { name: '承保纪律', count: 57, category: '金融业务' },
  { name: '分散投资', count: 51, category: '投资原理' },
  { name: '回购', count: 50, category: '资本运作' },
  { name: '杠杆', count: 50, category: '投资原理' },
  { name: '留存收益', count: 48, category: '企业管理' },
  { name: '银行业', count: 45, category: '金融业务' },
  { name: '品牌', count: 44, category: '竞争分析' },
  { name: '通货膨胀', count: 42, category: '宏观经济' },
  { name: '竞争优势', count: 40, category: '竞争分析' },
  { name: '商誉', count: 38, category: '价值评估' },
]

const categories = [
  { name: '价值评估', count: 4, color: 'orange' },
  { name: '竞争分析', count: 3, color: 'blue' },
  { name: '投资原理', count: 4, color: 'green' },
  { name: '企业管理', count: 3, color: 'purple' },
  { name: '金融业务', count: 4, color: 'red' },
  { name: '资本运作', count: 1, color: 'yellow' },
  { name: '宏观经济', count: 1, color: 'gray' },
]

function ImportanceDots({ value }: { value: number }) {
  return (
    <span className="text-xs text-primary tracking-tighter" title={`重要度 ${value}/5`}>
      {'●'.repeat(value)}
      <span className="opacity-25">{'●'.repeat(Math.max(0, 5 - value))}</span>
    </span>
  )
}

export default function MungerContent({
  person,
  relatedPeople,
  talksCount,
  qaCount,
  modelGroups,
  modelStats,
  archiveStats,
}: MungerContentProps) {
  const [activeNav, setActiveNav] = useState('overview')

  const scrollToSection = (id: string) => {
    setActiveNav(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  logger.info('munger-content:concepts', '渲染核心投资概念入口，统一指向 /concepts 体系', {
    count: concepts.length,
    firstHref: concepts[0] ? `/concepts/${encodeURIComponent(concepts[0].name)}` : null,
  })

  return (
    <>
      <nav className="bg-white/95 dark:bg-dark-card/95 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 mb-8">
        <div className="flex flex-wrap gap-1">
          {navSections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === section.id
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </nav>

      <section id="overview" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          人物简介
        </h2>

        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {person.bio}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary/60 dark:bg-primary-light/60 rounded-full" />
              主要成就
            </h3>
            <ul className="space-y-3">
              {person.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary-light mt-1">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary/60 dark:bg-primary-light/60 rounded-full" />
              核心著作
            </h3>
            <ul className="space-y-3">
              {person.books.map((book, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary dark:text-primary-light mt-1">📚</span>
                  <div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{book.title}</span>
                    {book.year && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{book.year}</span>
                    )}
                    {book.description && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{book.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href="/poor-charlies-almanack"
          className="group mt-6 flex flex-col justify-between gap-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-white to-accent/10 p-6 transition hover:border-primary/40 hover:shadow-card-hover dark:from-primary/20 dark:via-dark-card dark:to-accent/10 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">FEATURED READING</p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-text dark:text-dark-text">
              《穷查理宝典》统一阅读
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted dark:text-dark-muted">
              按原书顺序阅读卷首导读、三章方法论、十一场演讲与芒格推荐书目。
            </p>
          </div>
          <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium text-primary">
            开始阅读
            <ChevronRight className="transition group-hover:translate-x-1" size={18} />
          </span>
        </Link>

        {relatedPeople.length > 0 && (
          <div className="mt-6 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30 p-6">
            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary/60 dark:bg-primary-light/60 rounded-full" />
              相关人物
            </h3>
            <div className="flex flex-wrap gap-4">
              {relatedPeople.map((rp) => (
                <Link
                  key={rp.id}
                  href={rp.href}
                  className="flex items-center gap-3 bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border px-4 py-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <div className="font-medium text-text dark:text-dark-text">{rp.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{rp.relationship}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="archive" className="munger-column-archive">
        <header className="munger-column-archive__heading">
          <div>
            <p>查理·芒格</p>
            <h2>演讲、访谈与相关资料</h2>
          </div>
          <p>
            把生平、事业、演讲访谈和主题语录归入同一栏目，所有条目均可在站内连续阅读。
          </p>
        </header>

        <div className="munger-column-archive__stats">
          <div><strong>{archiveStats.profiles}</strong><span>篇生平与事业</span></div>
          <div><strong>{archiveStats.recordings}</strong><span>篇演讲与访谈</span></div>
          <div><strong>{archiveStats.quotes}</strong><span>组主题语录</span></div>
          <div><strong>{modelStats?.total ?? 0}</strong><span>个思维模型</span></div>
        </div>

        <div className="munger-column-archive__profiles">
          {archiveProfiles.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>

        <div className="munger-column-archive__categories">
          <Link href="/munger/archive#recordings">
            <span>演讲与访谈</span>
            <strong>{archiveStats.recordings} 篇 →</strong>
          </Link>
          <Link href="/munger/archive#quotes">
            <span>主题语录</span>
            <strong>{archiveStats.quotes} 组 →</strong>
          </Link>
          <Link href="/model">
            <span>多元思维模型</span>
            <strong>{modelStats?.total ?? 0} 个 →</strong>
          </Link>
          <Link href="/munger/wesco">
            <span>Wesco 股东大会</span>
            <strong>中文问答 →</strong>
          </Link>
        </div>

        <Link href="/munger/archive" className="munger-column-archive__all">
          查看全部 {archiveStats.total} 篇芒格资料 →
        </Link>
      </section>

      <section id="philosophy" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          思维模型与投资理念
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {person.investmentPhilosophy.map((philosophy, index) => (
            <div
              key={index}
              className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-3">💡</div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">{philosophy}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text dark:text-dark-text flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary" />
              多元思维格栅
            </h3>
            {modelStats && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {modelStats.total} 个模型 · {modelStats.disciplines} 个学科
              </span>
            )}
          </div>
          <div className="space-y-6">
            {(modelGroups ?? []).map((group) => (
              <div key={group.id}>
                <h4 className="flex items-center gap-2 text-base font-serif font-bold text-primary dark:text-primary-light mb-3">
                  <span>{group.icon}</span>
                  <span>{group.name}</span>
                  <span className="text-xs font-normal text-text-muted dark:text-dark-muted">
                    {group.models.length} 个
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.models.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/model/${m.slug}`}
                      className="group bg-white dark:bg-dark-card rounded-card shadow-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-text dark:text-dark-text group-hover:text-primary transition-colors">
                          {m.title}
                        </div>
                        <ImportanceDots value={m.importance} />
                      </div>
                      {m.english && (
                        <div className="text-xs text-text-muted dark:text-dark-muted font-mono mt-0.5">
                          {m.english}
                        </div>
                      )}
                      {m.description && (
                        <p className="text-xs text-text-muted dark:text-dark-muted mt-2 line-clamp-2">
                          {m.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-6 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            概念分类
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-text dark:text-dark-text">{cat.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cat.count} 个概念</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text dark:text-dark-text flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary" />
              核心投资概念
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{concepts.length} 个概念</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {concepts.map((concept) => (
              <Link
                key={concept.name}
                href={`/concepts/${encodeURIComponent(concept.name)}`}
                className="block p-3 bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light">
                    {concept.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {concept.count} 次引用
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{concept.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <section id="content" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          核心著作 / 言论集
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <Link
            href="/munger"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">💡</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">核心概念</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">49个</div>
          </Link>
          <Link
            href="/talks?person=munger"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🎤</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">演讲</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{talksCount}场</div>
          </Link>
          <Link
            href="/munger/wesco"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">❓</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">Wesco 问答</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{qaCount}场</div>
          </Link>
          <Link
            href="/munger/archive"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-sm font-medium text-text dark:text-dark-text">芒格资料</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{archiveStats.total}篇</div>
          </Link>
          <Link
            href="/model"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🧠</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">思维模型</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {modelStats?.total ?? 0} 个
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">📖 推荐阅读</h3>
          <div className="space-y-3">
            {person.books.map((book) => (
              <div key={book.title} className="bg-white dark:bg-dark-card rounded-lg p-4 flex items-start gap-4">
                <div className="text-2xl">📚</div>
                <div>
                  <div className="font-medium text-text dark:text-dark-text">{book.title}</div>
                  {book.year && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">{book.year}</span>
                  )}
                  {book.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{book.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cases" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          投资案例分析
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {person.investmentCases.map((company) => (
            <Link
              key={company}
              href={`/companies/${encodeURIComponent(company)}`}
              className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-3 text-center hover:shadow-md transition-shadow group"
            >
              <div className="text-sm font-medium text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                {company}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">🔍 案例分析视角</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-dark-card rounded-lg p-4">
              <div className="font-medium text-text dark:text-dark-text mb-2">零售行业</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">好市多 — 会员制零售与成本控制</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4">
              <div className="font-medium text-text dark:text-dark-text mb-2">新能源行业</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">比亚迪 — 多元化业务与长期布局</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4">
              <div className="font-medium text-text dark:text-dark-text mb-2">消费品行业</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">可口可乐 — 品牌价值与定价权</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4">
              <div className="font-medium text-text dark:text-dark-text mb-2">金融行业</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">富国银行 — 银行业务与风险管理</p>
            </div>
          </div>
        </div>
      </section>

      <section id="quotes" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-dark-card rounded-full" />
          经典语录集锦
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {person.quotes.map((quote, index) => (
            <div
              key={index}
              className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-gray-400 text-3xl mb-3">&ldquo;</div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {quote.text}
              </p>
              {quote.source && (
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {quote.source}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">— {person.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-8 text-center">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic">
            &ldquo;想要得到某样东西，最好的办法是让自己配得上它。&rdquo;
          </p>
          <p className="mt-4 text-lg text-primary dark:text-primary-light font-medium">
            — 查理·芒格
          </p>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4">📚 快速导航</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/graph"
            className="text-center p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🕸️</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">知识图谱</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">探索概念关联</div>
          </Link>
          <Link
            href="/concepts"
            className="text-center p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">💡</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">投资概念</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">35+核心概念</div>
          </Link>
          <Link
            href="/companies"
            className="text-center p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">投资公司</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">61家公司资料</div>
          </Link>
          <Link
            href="/talk"
            className="text-center p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🍵</div>
            <div className="text-sm font-medium text-primary dark:text-primary-light">AI对话</div>
            <div className="text-xs text-primary/70 dark:text-primary-light/70 mt-0.5">与芒格对话</div>
          </Link>
        </div>
      </section>
    </>
  )
}
