#!/usr/bin/env node
/**
 * 派生索引生成器（阶段 1c）
 * --------------------------------------------------
 * 从「单一事实来源」——md frontmatter + 正文——生成站点使用的索引 json。
 * 取代此前手写的 talks/interviews/qa/letters/partnership-index.json。
 *
 * 生成物字段格式与旧索引保持一致（title/year/wordCount/contentLength/fileName[±.md]/person[英文ID]），
 * 保证 documents.ts / reading-library.ts 等消费方零改动。
 *
 * wordCount 口径：中文字符数 + 英文单词数；contentLength：去 frontmatter 后字符数。
 *
 * 用法：node scripts/generate-archive-index.mjs
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT = path.join(process.cwd(), 'content')

// 中文 person → 英文 ID（站点生态使用英文 ID，前端再转换显示名）
const PERSON_EN = { 巴菲特: 'buffett', 芒格: 'munger', 段永平: 'duanyongping' }

const CATEGORIES = [
  { dir: 'letters', indexFile: 'letters-index.json', withExt: true, withPerson: false },
  { dir: 'partnership', indexFile: 'partnership-index.json', withExt: true, withPerson: false },
  { dir: 'qa', indexFile: 'qa-index.json', withExt: false, withPerson: false },
  { dir: 'talks', indexFile: 'talks-index.json', withExt: false, withPerson: true },
  { dir: 'interviews', indexFile: 'interviews-index.json', withExt: false, withPerson: true },
]

function countWords(content) {
  const cjk = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const latin = (content.match(/[A-Za-z]+/g) || []).length
  return cjk + latin
}

let total = 0
for (const cat of CATEGORIES) {
  const dirPath = path.join(CONTENT, cat.dir)
  if (!fs.existsSync(dirPath)) continue
  const rows = []
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8')
    const { data, content } = matter(raw)
    const row = {
      title: data.title || file.replace(/\.md$/, ''),
      year: data.year != null ? Number(data.year) : null,
      wordCount: countWords(content),
      contentLength: content.length,
      fileName: cat.withExt ? file : file.replace(/\.md$/, ''),
    }
    if (cat.withPerson && data.person && PERSON_EN[data.person]) {
      row.person = PERSON_EN[data.person]
    }
    rows.push(row)
  }
  // 年份升序，无年份排末尾
  rows.sort((a, b) => {
    const ya = a.year ?? Number.POSITIVE_INFINITY
    const yb = b.year ?? Number.POSITIVE_INFINITY
    return ya - yb || a.fileName.localeCompare(b.fileName)
  })
  fs.writeFileSync(path.join(CONTENT, cat.indexFile), JSON.stringify(rows, null, 2), 'utf-8')
  total += rows.length
  console.log(`${cat.indexFile}: ${rows.length} 条`)
}
console.log(`\n共生成 ${total} 条索引，来源均为 md frontmatter + 正文。`)
