/**
 * 段永平网易博客 · 阅读优化预处理脚本
 *
 * 问题：/duanyongping/blog 原页面一次性渲染全部 597 篇博文（按年 <details> 全展开），
 *       导致页面过长、首屏渲染量巨大、定位困难。
 *
 * 方案（契合生产环境 output:'export' 无运行时 API 的约束）：
 *   1. 生成轻量索引 public/duanyongping/blog-index.json
 *        —— 仅含标题/日期/年份/平台/评论数/摘要，供客户端筛选、搜索、分页/无限滚动，
 *           体积远小于全文，避免一次性传输全部正文。
 *   2. 为每篇博文生成全文碎片 public/duanyongping/blog-content/<slug>.json
 *        —— 用户点击「展开全文」时客户端按需 fetch，实现「初始仅摘要、点开才加载全文」，
 *           单页 DOM 与网络负载都大幅下降。
 *
 * slug / year / 标题消歧逻辑与 src/lib/duanyongping.ts 保持一致，
 * 确保列表标题、内链、[slug] 详情页三者完全对应。
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import matter from 'gray-matter'

const ROOT = process.cwd()
const BLOG_DIR = path.join(ROOT, 'content', 'duanyongping', 'blog')
const PUBLIC_DIR = path.join(ROOT, 'public', 'duanyongping')
const INDEX_PATH = path.join(PUBLIC_DIR, 'blog-index.json')
const CONTENT_DIR = path.join(PUBLIC_DIR, 'blog-content')

function slugFromFileName(fileName) {
  return crypto.createHash('md5').update(fileName).digest('hex').slice(0, 16)
}

function inferSourceYear(data, fileName, title, date) {
  const explicit = data.year
  if (typeof explicit === 'string' && /^\d{4}$/.test(explicit)) return explicit
  if (typeof explicit === 'number' && /^\d{4}$/.test(String(explicit))) return String(explicit)
  const sourceText = `${title} ${fileName}`
  const match = sourceText.match(/(?:^|[^\d])(19\d{2}|20\d{2})(?=[^\d]|$)/)
  return match?.[1] || (typeof date === 'string' ? date.slice(0, 4) : undefined)
}

function resolveDate(data) {
  const d = data.date ?? data.published_at
  if (typeof d === 'string') return d
  if (d instanceof Date) return d.toISOString()
  return undefined
}

/** 与详情页渲染一致：把正文里指向本栏目 .md 的相对链接改写为站内详情页 URL。 */
function rewriteRelativeMdLinks(content, slugMap) {
  return content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const trimmed = url.trim()
    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('#') || trimmed.startsWith('/')) return match
    if (!trimmed.endsWith('.md')) return match
    let decoded = trimmed
    try { decoded = decodeURIComponent(trimmed) } catch { /* keep */ }
    const slug = slugMap[decoded]
    if (slug) return `[${text}](/duanyongping/blog/${slug})`
    return text
  })
}

/** 生成摘要：跳过 h1 标题与连续「>」来源引用块，截断评论区，压平标记后取前 ~160 字。 */
function summarize(content) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  let i = 0
  const skipEmpty = () => { while (i < lines.length && !lines[i].trim()) i += 1 }
  skipEmpty()
  // 跳过与列表标题重复的 h1
  if (lines[i] && /^#\s+/.test(lines[i])) i += 1
  skipEmpty()
  // 跳过顶部来源引用块（连续 > 行）
  while (i < lines.length && lines[i].startsWith('>')) i += 1
  skipEmpty()
  let body = lines.slice(i).join('\n')
  // 截断文末自动附带的评论区（标记形如「**评论区（共 N 条」），并去掉其前可选分隔线
  let c = body.indexOf('**评论区（共')
  if (c < 0) c = body.indexOf('评论区（共')
  if (c > 0) {
    body = body.slice(0, c).replace(/\s*-{3,}\s*$/, '')
  }
  return body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '[图片]')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

function collectFiles(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'attachments' || entry.name === '按年份') continue
      const sub = path.join(dir, entry.name)
      for (const f of fs.readdirSync(sub)) {
        if (f.endsWith('.md')) out.push(path.join(sub, f))
      }
    } else if (entry.name.endsWith('.md')) {
      out.push(path.join(dir, entry.name))
    }
  }
  return out
}

function main() {
  fs.mkdirSync(CONTENT_DIR, { recursive: true })
  // 直接覆盖写入（不预先清理旧文件）：
  // 删除/重命名博文产生的孤儿 JSON 不会被索引引用，无用户可见影响，
  // 且可避免 safe-delete 垫片对逐个文件 trash 造成的构建卡顿。

  const files = collectFiles(BLOG_DIR)
  const slugMap = {}
  const rawDocs = []

  for (const fp of files) {
    const fileName = path.basename(fp)
    const { data, content } = matter(fs.readFileSync(fp, 'utf-8'))
    const titleRaw = data.title || fileName
    const title = String(titleRaw).replace(/记念/g, '纪念')
    const date = resolveDate(data)
    const slug = slugFromFileName(fileName)
    slugMap[fileName] = slug
    rawDocs.push({
      slug,
      fileName,
      title,
      date,
      year: inferSourceYear(data, fileName, String(titleRaw), date),
      platform: data.platform,
      source: data.source,
      sourceUrl: data.source_url,
      articleId: data.article_id,
      commentCount: data.comment_count,
      duanCommentCount: data.duan_comment_count,
      content,
    })
  }

  // 与 lib 排序一致：blog 按日期正序，再消歧
  rawDocs.sort((a, b) => {
    const ka = a.date || a.year || ''
    const kb = b.date || b.year || ''
    if (ka !== kb) return ka.localeCompare(kb)
    return a.slug.localeCompare(b.slug)
  })

  // 标题消歧（同名不同文）：第 2 篇起追加日期或序号，与详情页 getDYDoc 保持一致
  const counts = new Map()
  for (const d of rawDocs) counts.set(d.title, (counts.get(d.title) || 0) + 1)
  const emitted = new Map()
  const usedSuffix = new Map()
  for (const d of rawDocs) {
    if ((counts.get(d.title) || 0) <= 1) continue
    const nth = (emitted.get(d.title) || 0) + 1
    emitted.set(d.title, nth)
    const datePart = (d.date || '').slice(0, 10)
    const suffixes = usedSuffix.get(d.title) || new Set()
    if (nth === 1) {
      if (datePart) suffixes.add(datePart)
      usedSuffix.set(d.title, suffixes)
      continue
    }
    let suffix = datePart && !suffixes.has(datePart) ? datePart : `第${nth}篇`
    while (suffixes.has(suffix)) suffix = `${suffix}·${d.slug.slice(0, 6)}`
    suffixes.add(suffix)
    usedSuffix.set(d.title, suffixes)
    d.title = `${d.title}（${suffix}）`
  }

  // 写全文碎片（重写相对 md 链接）
  for (const d of rawDocs) {
    const body = rewriteRelativeMdLinks(d.content, slugMap)
    fs.writeFileSync(
      path.join(CONTENT_DIR, `${d.slug}.json`),
      JSON.stringify({ slug: d.slug, title: d.title, content: body }, null, 0),
      'utf-8',
    )
  }

  // 年份导航数据（含每年计数），降序排列，供客户端侧栏/标签页直接使用
  const yearCounts = new Map()
  for (const d of rawDocs) {
    const y = d.year || '未知'
    yearCounts.set(y, (yearCounts.get(y) || 0) + 1)
  }
  const years = Array.from(yearCounts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year.localeCompare(a.year))

  // 写轻量索引（默认按日期倒序，便于「最新优先」浏览；客户端可二次排序）
  const items = rawDocs
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      date: d.date,
      year: d.year,
      platform: d.platform,
      source: d.source,
      sourceUrl: d.sourceUrl,
      articleId: d.articleId,
      commentCount: d.commentCount,
      duanCommentCount: d.duanCommentCount,
      summary: summarize(d.content),
    }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  fs.writeFileSync(
    INDEX_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), total: items.length, years, items }, null, 2),
    'utf-8',
  )

  console.log(`✅ 博客索引已生成：${items.length} 篇 → ${path.relative(ROOT, INDEX_PATH)}`)
  console.log(`✅ 全文碎片已生成：${rawDocs.length} 个 → ${path.relative(ROOT, CONTENT_DIR)}`)
}

main()
