'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, BookOpen, ChevronRight } from 'lucide-react'
import type { Person, RelatedPerson } from '@/lib/people'

interface MungerContentProps {
  person: Person
  relatedPeople: RelatedPerson[]
  talksCount: number
  qaCount: number
}

const navSections = [
  { id: 'overview', label: '人物简介' },
  { id: 'philosophy', label: '思维模型' },
  { id: 'content', label: '核心著作' },
  { id: 'cases', label: '投资案例' },
  { id: 'quotes', label: '经典语录' },
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

const mentalModels = [
  {
    title: '多元思维框架',
    description: '跨学科思维，避免锤子思维',
    keyPoints: ['掌握多学科基本原理', '避免单一思维模式', '从多个角度分析问题'],
  },
  {
    title: '逆向思维',
    description: '想要成功，先想如何失败',
    keyPoints: ['先考虑风险而非收益', '避免灾难性错误', '从反面思考问题'],
  },
  {
    title: '人类误判心理学',
    description: '25个心理倾向影响决策',
    keyPoints: ['确认偏误', '从众心理', '损失厌恶'],
  },
  {
    title: '排列组合',
    description: '用数学思维分析商业',
    keyPoints: ['概率思维', '期望值计算', '决策树分析'],
  },
]

export default function MungerContent({ person, relatedPeople, talksCount, qaCount }: MungerContentProps) {
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
          <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-6 flex items-center gap-3">
            <Brain className="w-5 h-5 text-primary" />
            核心思维模型
          </h3>
          <div className="space-y-4">
            {mentalModels.map((model) => (
              <div
                key={model.title}
                className="bg-gradient-to-r from-primary/5 to-white dark:from-primary/10 dark:to-dark-card border border-primary/10 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-text dark:text-dark-text text-lg">{model.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{model.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary-light" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {model.keyPoints.map((point) => (
                    <span
                      key={point}
                      className="text-xs bg-white dark:bg-dark-card border border-primary/20 text-primary dark:text-primary-light px-3 py-1 rounded-full"
                    >
                      {point}
                    </span>
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
                href={`/munger/concept/${concept.name}`}
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

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
            href="/qa?person=munger"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">❓</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">Wesco 问答</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{qaCount}场</div>
          </Link>
          <Link
            href="/interviews"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🎙️</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">访谈</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">30场</div>
          </Link>
          <Link
            href="/model"
            className="bg-white dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🧠</div>
            <div className="text-sm font-medium text-text dark:text-dark-text">思维模型</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">7个</div>
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
            "想要得到某样东西，最好的办法是让自己配得上它。"
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
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">61家公司档案</div>
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