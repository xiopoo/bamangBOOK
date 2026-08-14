import { getDocuments } from './documents'
import { getShareholderLetters, getAllPartnershipLetters } from './partnership'
import { getDYDocs } from './duanyongping'
import { getAllArticles } from './articles'

export interface RecentItem {
  title: string
  href: string
  meta: string
  year: number
}

function yearOf(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 1900 && n < 2100 ? n : 0
}

/** 从任意文档数组里取「年份最新」的 n 条，按年份倒序。 */
function latest<T>(items: T[], n: number, year: (item: T) => number): T[] {
  return items
    .filter(item => year(item) > 0)
    .sort((a, b) => year(b) - year(a))
    .slice(0, n)
}

/**
 * 首页「最近更新」内容流：跨栏目聚合各原典/文章的最新条目，
 * 按年份倒序，构成博客式阅读入口。构建期执行，数据量小、开销可控。
 */
export function getRecentUpdates(limit = 14): RecentItem[] {
  const items: RecentItem[] = []
  const push = (title: string, href: string, meta: string, year: number) => {
    if (year > 0) items.push({ title, href, meta, year })
  }

  latest(getShareholderLetters(), 6, l => l.year).forEach(l =>
    push('巴菲特致伯克希尔股东的信', `/letters/${l.year}`, `股东信 · ${l.year}`, l.year))
  latest(getAllPartnershipLetters(), 4, l => l.year).forEach(l =>
    push(`致合伙人信（${l.subtitle}）`, `/partnership/${l.id}`, `合伙人信 · ${l.year}`, l.year))
  latest(getDocuments('qa').filter(d => !d.fileName.startsWith('Wesco_')), 6, d => yearOf(d.year)).forEach(d =>
    push(d.title, d.href, `股东大会问答 · ${d.year}`, yearOf(d.year)))
  latest(getDocuments('talks'), 5, d => yearOf(d.year)).forEach(d =>
    push(d.title, d.href, `演讲 · ${d.year}`, yearOf(d.year)))
  latest(getDocuments('interviews'), 5, d => yearOf(d.year)).forEach(d =>
    push(d.title, d.href, `访谈 · ${d.year}`, yearOf(d.year)))
  latest(getDYDocs('blog', false), 6, d => yearOf(d.year)).forEach(d =>
    push(d.title, `/duanyongping/blog/${d.slug}`, `段永平博客 · ${d.year}`, yearOf(d.year)))
  latest(getDYDocs('talks', false), 4, d => yearOf(d.year)).forEach(d =>
    push(d.title, `/duanyongping/talks/${d.slug}`, `段永平演讲 · ${d.year}`, yearOf(d.year)))
  latest(getAllArticles(), 3, a => yearOf(a.year)).forEach(a =>
    push(a.title, `/articles/${a.slug}`, `文章 · ${a.year}`, yearOf(a.year)))

  items.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'zh'))
  return items.slice(0, limit)
}
