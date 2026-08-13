import Link from 'next/link'
import { resolveEntityLink } from '@/lib/entity-resolver'

interface EntityChipsProps {
  entities: string[]
}

/**
 * 文章页底部实体标签：把文章的 entities 元数据渲染为指向
 * 概念/公司/人物详情页的链接（未识别的实体降级为纯文本）。
 */
export default function EntityChips({ entities }: EntityChipsProps) {
  if (!entities.length) return null
  const links = entities.map(entity => ({ entity, href: resolveEntityLink(entity) }))
  if (!links.some(l => l.href)) return null

  return (
    <section className="mt-10 border-t border-primary/10 pt-6">
      <h2 className="mb-4 text-lg font-semibold text-primary dark:text-primary-light">
        关联条目
      </h2>
      <div className="flex flex-wrap gap-2">
        {links.map(({ entity, href }) =>
          href ? (
            <Link
              key={entity}
              href={href}
              className="rounded-card border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-primary transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/30 dark:text-primary-light"
            >
              {entity}
            </Link>
          ) : (
            <span
              key={entity}
              className="rounded-card border border-primary/15 bg-bg-card px-3 py-1.5 text-sm text-text-muted dark:border-primary/20 dark:text-dark-muted"
            >
              {entity}
            </span>
          )
        )}
      </div>
    </section>
  )
}
