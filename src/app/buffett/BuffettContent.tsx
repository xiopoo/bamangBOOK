'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Person, RelatedPerson } from '@/lib/people'

interface BuffettContentProps {
  person: Person
  relatedPeople: RelatedPerson[]
  partnershipCount: number
  shareholderCount: number
  minShareholderYear: number
  maxShareholderYear: number
  talksCount: number
  interviewsCount: number
}

const navSections = [
  { id: 'overview', label: '人物简介' },
  { id: 'philosophy', label: '投资理念' },
  { id: 'content', label: '核心著作' },
  { id: 'cases', label: '投资案例' },
  { id: 'quotes', label: '经典语录' },
]

export default function BuffettContent({
  person,
  relatedPeople,
  partnershipCount,
  shareholderCount,
  minShareholderYear,
  maxShareholderYear,
  talksCount,
  interviewsCount,
}: BuffettContentProps) {
  const [activeNav, setActiveNav] = useState('overview')

  const scrollToSection = (id: string) => {
    setActiveNav(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <nav className="sticky top-4 z-30 bg-white/95 dark:bg-dark-card/95 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 mb-8">
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

      <section id="philosophy" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          投资理念
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <div className="mt-8 bg-gradient-to-r from-primary/5 to-white dark:from-primary/10 dark:to-dark-card rounded-xl border border-primary/10 p-6">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
            "投资成功的关键不在于智商，而在于纪律。"
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">— 沃伦·巴菲特</p>
        </div>
      </section>

      <section id="content" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          核心著作 / 言论集
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/partnership"
            className="group bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-8 hover:shadow-lg dark:hover:shadow-black/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                🤝
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text dark:text-dark-text mb-2">
                  致合伙人信
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  1956-1970年，巴菲特合伙基金时期的信件
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-2xl font-bold text-primary">{partnershipCount}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">封信件</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    15年时间跨度
                  </div>
                </div>
              </div>
              <div className="text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                →
              </div>
            </div>
          </Link>

          <Link
            href="/letters"
            className="group bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-8 hover:shadow-lg dark:hover:shadow-black/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                📬
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text dark:text-dark-text mb-2">
                  致股东信
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {minShareholderYear}-{maxShareholderYear}年，伯克希尔哈撒韦时期的年度信件
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{shareholderCount}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">封信件</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {maxShareholderYear - minShareholderYear + 1}年时间跨度
                  </div>
                </div>
              </div>
              <div className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                →
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <Link
            href="/talks?person=buffett"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🎤</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">演讲</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{talksCount}场</div>
          </Link>
          <Link
            href="/interviews?person=buffett"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🎙️</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">访谈</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{interviewsCount}场</div>
          </Link>
          <Link
            href="/qa"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">❓</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">股东大会问答</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">40场</div>
          </Link>
          <Link
            href="/articles"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">专题文章</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">95篇</div>
          </Link>
        </div>
      </section>

      <section id="cases" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          投资案例分析
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
              <div className="font-medium text-text dark:text-dark-text mb-2">消费品行业</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">可口可乐、吉列、喜诗糖果 — 品牌护城河与定价权</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4">
              <div className="font-medium text-text dark:text-dark-text mb-2">金融行业</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">GEICO保险、美国运通、富国银行 — 浮存金与商业模式</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4">
              <div className="font-medium text-text dark:text-dark-text mb-2">科技行业</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">苹果 — 消费科技与生态系统</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4">
              <div className="font-medium text-text dark:text-dark-text mb-2">媒体行业</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">华盛顿邮报 — 优质资产与长期价值</p>
            </div>
          </div>
        </div>
      </section>

      <section id="quotes" className="mb-12">
        <h2 className="text-2xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-primary dark:bg-primary-light rounded-full" />
          经典语录集锦
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {person.quotes.map((quote, index) => (
            <div
              key={index}
              className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-gray-400 text-3xl mb-3">"</div>
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
            "在别人恐惧时贪婪，在别人贪婪时恐惧。"
          </p>
          <p className="mt-4 text-lg text-primary dark:text-primary-light font-medium">
            — 沃伦·巴菲特
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
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">61家公司档案</div>
          </Link>
          <Link
            href="/talk"
            className="text-center p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🍵</div>
            <div className="text-sm font-medium text-primary dark:text-primary-light">AI对话</div>
            <div className="text-xs text-primary/70 dark:text-primary-light/70 mt-0.5">与巴菲特对话</div>
          </Link>
        </div>
      </section>
    </>
  )
}