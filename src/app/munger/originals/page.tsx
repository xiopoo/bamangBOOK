import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'
import { getMungerOriginals } from '@/lib/munger-originals'

export const metadata: Metadata = {
  title: 'Wesco 股东信 · 英文原文',
  description: '伯克希尔官网 Wesco 1997-2009 股东信英文原文，与中文股东大会问答分开归档。',
}

export default function MungerOriginalsPage() {
  const originals = getMungerOriginals()
  const totalWords = originals.reduce((sum, item) => sum + item.wordCount, 0)
  const firstYear = originals[0]?.year
  const lastYear = originals[originals.length - 1]?.year

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader
        title="Wesco 股东信 · 英文原文"
        subtitle="来自伯克希尔官网的 1997-2009 年官方股东信。它们不是 Wesco 股东大会问答。"
        backHref="/munger"
        backLabel="返回芒格专栏"
        sticky
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatBadge icon="📜" count={`${originals.length}篇`} label="原文" sub="官方 PDF 抽取" />
        <StatBadge icon="📝" count={`${(totalWords / 10000).toFixed(1)}万`} label="英文词数" sub="粗略统计" />
        <StatBadge icon="📅" count={`${firstYear}-${lastYear}`} label="年份" sub="Wesco 股东信" />
        <StatBadge icon="✓" count="官方" label="来源" sub="Berkshire/Wesco" />
      </div>

      <div className="mb-8 border-y border-gray-200 dark:border-gray-700 py-4 text-sm text-text-muted dark:text-dark-muted">
        想直接阅读芒格在现场回答股东的问题？
        <Link href="/munger/wesco" className="ml-2 text-primary dark:text-primary-light hover:underline">
          前往 Wesco 股东大会中文问答 →
        </Link>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-text dark:text-dark-text font-serif">Wesco Shareholder Letters</h2>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="space-y-2">
          {originals.map(item => (
            <Link
              key={item.id}
              href={`/munger/originals/${item.id}`}
              className="block bg-white dark:bg-dark-card p-4 rounded-lg border border-gray-100 dark:border-dark-border hover:shadow-card-hover hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary dark:text-primary-light">{item.year}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="mt-1 font-medium text-text dark:text-dark-text">{item.title}</h3>
                  <p className="text-xs text-text-muted dark:text-dark-muted mt-0.5">
                    {item.author} · Berkshire Hathaway official Wesco archive
                  </p>
                </div>
                <span className="text-xs text-text-muted dark:text-dark-muted whitespace-nowrap">
                  {(item.wordCount / 1000).toFixed(1)}k words
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <PageFooter />
    </PageContainer>
  )
}
