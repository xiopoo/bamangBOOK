#!/usr/bin/env node
/**
 * 内容盘点（阶段 0）
 * --------------------------------------------------
 * 递归扫描 content/ 下所有 .md，统计：
 *   - 每目录文件数与 frontmatter 覆盖率
 *   - content_type / person / year 字段覆盖率
 *   - 生成 inventory.json 作为重构基线（可回滚依据）
 *
 * 用法：node scripts/content-inventory.mjs [--json]
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const ROOT = path.join(process.cwd(), 'content')
const OUT = path.join(process.cwd(), 'scripts', 'content-inventory.json')

const EXCLUDED_FILES = new Set(['README.md', 'CONTENT_SCHEMA.md', 'bamang-README.md'])
const EXCLUDED_DIRS = new Set(['.git'])

function walk(dir) {
  const result = []
  let entries = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return result
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || EXCLUDED_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      result.push(...walk(full))
    } else if (entry.isFile() && entry.name.endsWith('.md') && !EXCLUDED_FILES.has(entry.name)) {
      result.push(full)
    }
  }
  return result
}

const files = walk(ROOT)
const byDirectory = new Map()
const byContentType = new Map()
const byPerson = new Map()
let withFrontmatter = 0
let hasContentType = 0
let hasPerson = 0
let hasYear = 0

const rows = files.map((file) => {
  const rel = path.relative(process.cwd(), file)
  const dir = path.relative(process.cwd(), path.dirname(file))
  const raw = fs.readFileSync(file, 'utf-8')
  const { data } = matter(raw)
  const fmKeys = Object.keys(data)
  const hasFm = fmKeys.length > 0
  if (hasFm) withFrontmatter++
  const contentType = typeof data.content_type === 'string' ? data.content_type : null
  const person = typeof data.person === 'string' ? data.person : null
  const year = data.year != null ? String(data.year) : null
  if (contentType) hasContentType++
  if (person) hasPerson++
  if (year) hasYear++

  const dirKey = dir.replace(/^content\//, '')
  byDirectory.set(dirKey, byDirectory.get(dirKey) || { files: 0, withFrontmatter: 0 })
  byDirectory.get(dirKey).files++
  if (hasFm) byDirectory.get(dirKey).withFrontmatter++
  if (contentType) byContentType.set(contentType, (byContentType.get(contentType) || 0) + 1)
  if (person) byPerson.set(person, (byPerson.get(person) || 0) + 1)

  return {
    file: rel,
    dir,
    hasFrontmatter: hasFm,
    content_type: contentType,
    person,
    year,
    title: typeof data.title === 'string' ? data.title : null,
    fields: fmKeys,
  }
})

rows.sort((a, b) => a.file.localeCompare(b.file, 'zh-Hans-CN'))

const inventory = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalFiles: files.length,
    withFrontmatter,
    withoutFrontmatter: files.length - withFrontmatter,
    fmCoverage: files.length ? Math.round((withFrontmatter / files.length) * 1000) / 10 : 0,
    hasContentType: `${hasContentType} (${files.length ? Math.round((hasContentType / files.length) * 100) : 0}%)`,
    hasPerson: `${hasPerson} (${files.length ? Math.round((hasPerson / files.length) * 100) : 0}%)`,
    hasYear: `${hasYear} (${files.length ? Math.round((hasYear / files.length) * 100) : 0}%)`,
  },
  byDirectory: Object.fromEntries(
    [...byDirectory.entries()].sort((a, b) => b[1].files - a[1].files)
  ),
  byContentType: Object.fromEntries([...byContentType.entries()].sort((a, b) => b[1] - a[1])),
  byPerson: Object.fromEntries([...byPerson.entries()].sort((a, b) => b[1] - a[1])),
}

fs.writeFileSync(OUT, JSON.stringify(inventory, null, 2), 'utf-8')

console.log(`\n内容盘点完成 — 共 ${files.length} 个 md 文件`)
console.log(`frontmatter 覆盖率: ${inventory.summary.fmCoverage}% (${withFrontmatter}/${files.length})`)
console.log(`有 content_type: ${inventory.summary.hasContentType}`)
console.log(`有 person:       ${inventory.summary.hasPerson}`)
console.log(`有 year:         ${inventory.summary.hasYear}`)
console.log('\n目录分布（文件数 / 有frontmatter）:')
for (const [dir, info] of [...byDirectory.entries()].sort((a, b) => b[1].files - a[1].files).slice(0, 25)) {
  console.log(`  ${String(info.files).padStart(4)} / ${String(info.withFrontmatter).padStart(4)}  ${dir}`)
}
console.log('\ncontent_type 分布:')
for (const [t, n] of [...byContentType.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${t}`)
}
console.log(`\n明细已写入 ${path.relative(process.cwd(), OUT)}`)
