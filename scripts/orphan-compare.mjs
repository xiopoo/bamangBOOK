/**
 * 孤儿内容对比分析（只读）
 *
 * 目的：把 content/ 下 src/ 完全不消费的 md 文件与已呈现的档案内容做标题级对比，
 * 识别「重复/已被覆盖」「可补充为档案」「需人工判断」三类，产出归类报告。
 *
 * 用法：node scripts/orphan-compare.mjs
 * 输出：scripts/orphan-compare-report.json（机器可读）+ 控制台汇总
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')

// src/ 消费的目录（已呈现内容，作为对比基准）
const PRESENTED_DIRS = [
  'letters', 'partnership', 'qa', 'talks', 'interviews',
  'companies', 'concepts', 'people', 'business-history',
  'duanyongping', 'bloggers', 'buffett-quotes',
  'munger-archive', 'munger-originals', 'models', 'books', 'columns',
]

// 孤儿目录（src 零引用）
const ORPHAN_DIRS = [
  'articles', 'buffettfaq', 'buffettfaq_cnbc',
  'li-lu', 'special', 'wechat', 'source-documents',
]

const MD_RE = /\.md$/i

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (MD_RE.test(entry.name)) out.push(full)
  }
  return out
}

/** 提取 frontmatter title / H1 / 文件名作为标题 */
function extractTitle(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (fm) {
    const title = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m)
    if (title) return title[1].trim()
  }
  const h1 = raw.match(/^#\s+(.+)$/m)
  if (h1) return h1[1].trim()
  return path.basename(file, '.md').trim()
}

/** 归一化标题：去空白标点、小写，便于模糊匹配 */
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[\s\u3000\-—_・·.。，,：:；;！!？?（）()「」『』【】\[\]"'‘’“”#*|/\\+]/g, '')
}

function contentSignature(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim()
  const first = body.split(/\n+/).find(l => l.trim().length > 20)
  return first ? first.trim().slice(0, 120) : ''
}

// 1. 收集已呈现内容的标题索引
const presented = new Map() // normalizedTitle -> { path, title }
const presentedSigs = []
for (const dir of PRESENTED_DIRS) {
  for (const file of walk(path.join(CONTENT, dir))) {
    const title = extractTitle(file)
    const key = normalizeTitle(title)
    if (!presented.has(key)) presented.set(key, { path: file, title })
    const sig = contentSignature(file)
    if (sig) presentedSigs.push({ key, sig, title, path: file })
  }
}
console.log(`已呈现内容：${presented.size} 个唯一标题，签名样本 ${presentedSigs.length} 条`)

// 2. 逐孤儿文件对比
const report = { generatedAt: new Date().toISOString(), groups: [] }
let totalOrphans = 0
let dupCount = 0
let newCount = 0

for (const dir of ORPHAN_DIRS) {
  const files = walk(path.join(CONTENT, dir))
  const group = { dir, files: files.length, duplicates: [], candidates: [], manual: [] }

  for (const file of files) {
    totalOrphans += 1
    const rel = path.relative(CONTENT, file)
    const title = extractTitle(file)
    const key = normalizeTitle(title)
    const sig = contentSignature(file)

    // a) 标题完全匹配
    const exact = presented.get(key)
    // b) 标题包含匹配（双方长度≥6 且一方包含另一方）
    let contains = null
    if (!exact) {
      for (const [pk, info] of presented) {
        if (key.length >= 6 && pk.length >= 6 && (key.includes(pk) || pk.includes(key))) {
          contains = info
          break
        }
      }
    }
    // c) 首段签名匹配（≥24 字符相同片段，用于录音转写/信件类）
    let sigMatch = null
    if (!exact && !contains && sig.length >= 24) {
      for (const p of presentedSigs) {
        if (p.sig.length >= 24 && sig.includes(p.sig.slice(0, 24))) {
          sigMatch = p
          break
        }
      }
    }

    const hit = exact || contains || sigMatch
    const entry = { file: rel, title, key, match: hit ? { title: hit.title, path: hit.path, kind: exact ? 'exact' : contains ? 'contains' : 'signature' } : null }
    if (hit) {
      dupCount += 1
      group.duplicates.push(entry)
    } else if (sig.length > 0) {
      newCount += 1
      group.candidates.push(entry)
    } else {
      group.manual.push(entry)
    }
  }

  group.duplicates.sort((a, b) => a.file.localeCompare(b.file))
  group.candidates.sort((a, b) => a.file.localeCompare(b.file))
  report.groups.push(group)
  const d = group.duplicates.length
  const c = group.candidates.length
  const m = group.manual.length
  console.log(`\n[${dir}] ${group.files} 篇：重复=${d} 新内容=${c} 待人工=${m}`)
}

console.log(`\n合计孤儿 ${totalOrphans} 篇：疑似重复 ${dupCount}，新内容候选 ${newCount}，待人工 ${totalOrphans - dupCount - newCount}`)
fs.writeFileSync(path.join(ROOT, 'scripts/orphan-compare-report.json'), JSON.stringify(report, null, 2))
console.log(`报告已写入 scripts/orphan-compare-report.json`)
