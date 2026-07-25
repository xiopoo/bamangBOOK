import Link from 'next/link'

const COLUMNS = [
  { href: '/buffett', title: '巴菲特专栏', desc: '合伙人信 · 股东信 · 大会实录 · 演讲文章' },
  { href: '/munger', title: '芒格专栏', desc: '演讲 · 文章 · 思维模型' },
  { href: '/bloggers', title: '博主专栏', desc: '博主原创学习笔记' },
]

/** 三大栏目导航入口 */
export default function ColumnNav() {
  return (
    <section className="py-6 md:py-8">
      <p className="mb-4 text-sm font-medium text-primary">栏目导航</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {COLUMNS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-lg border border-primary/15 bg-bg-card p-5 transition-colors hover:border-primary dark:bg-dark-card"
          >
            <h3 className="text-base font-semibold text-primary dark:text-primary-light group-hover:underline">
              {c.title}
            </h3>
            <p className="mt-1 text-sm text-text-muted dark:text-dark-muted">{c.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
