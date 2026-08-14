/**
 * 图片预处理（P-02）
 *
 * 对超过阈值的 PNG/JPEG 生成 WebP 版本，保留原图作为 source，不破坏内容归档。
 * 页面 Markdown 引用优先改写为 .webp（浏览器全支持），二维码/封面等关键图
 * 使用较高质量参数（-q 82），避免压缩到影响识别。
 *
 * 用法：
 *   node scripts/optimize-images.mjs          # 处理 content/ 与 public/ 下的大图
 *   node scripts/optimize-images.mjs --dry    # 只输出统计，不写入
 */
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SIZE_THRESHOLD = 800 * 1024 // 超过 800KB 才转换
const QUALITY = 82                // 二维码/封面/试读页保持可识别
const DRY = process.argv.includes('--dry')

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg'])

// 扫描范围：已知大图集中在段永平 talks/milestones 附件；public/ 全量兜底
const SCAN_ROOTS = [
  path.join(ROOT, 'content/duanyongping'),
  path.join(ROOT, 'public'),
]

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      walk(full, out)
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push(full)
    }
  }
  return out
}

/** 生成 webp：保留原图，输出同名 .webp */
function toWebp(filePath) {
  const webpPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp')
  if (fs.existsSync(webpPath)) return { webpPath, reused: true }
  try {
    execFileSync('cwebp', ['-q', String(QUALITY), filePath, '-o', webpPath], { stdio: 'pipe' })
    return { webpPath, reused: false }
  } catch (err) {
    console.warn(`[warn] cwebp 转换失败，跳过：${filePath}（${err.message.split('\n')[0]}）`)
    return null
  }
}

/** 把 markdown 里的 ![](attachments/x.png) 改写为 .webp（若已生成） */
function rewriteMarkdownReferences() {
  let rewritten = 0
  const allMd = []
  for (const root of SCAN_ROOTS) {
    if (root.includes('public')) continue // 只改 content 下的 md
    if (!fs.existsSync(root)) continue
    walkMd(root, allMd)
  }
  for (const mdPath of allMd) {
    let content = fs.readFileSync(mdPath, 'utf-8')
    const updated = content.replace(/!\[([^\]]*)\]\(([^)]*\.(?:png|jpe?g))\)/gi, (match, alt, src) => {
      const cleanSrc = decodeURIComponent(src)
      const base = path.basename(cleanSrc)
      const webpBase = base.replace(/\.(png|jpe?g)$/i, '.webp')
      const srcDir = path.dirname(cleanSrc)
      const relDir = srcDir !== '.' ? srcDir : 'attachments'
      const candidate = path.join(path.dirname(mdPath), relDir, webpBase)
      if (fs.existsSync(candidate)) {
        const webpSrc = src.replace(/\.(png|jpe?g)$/i, '.webp')
        rewritten++
        return `![${alt}](${webpSrc})`
      }
      return match
    })
    if (updated !== content) {
      if (!DRY) fs.writeFileSync(mdPath, updated, 'utf-8')
    }
  }
  return rewritten
}

function walkMd(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, out)
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

function main() {
  if (DRY) console.log('🔍 DRY RUN：只统计，不写入\n')

  const candidates = []
  for (const root of SCAN_ROOTS) {
    for (const filePath of walk(root)) {
      const size = fs.statSync(filePath).size
      if (size > SIZE_THRESHOLD) candidates.push({ filePath, size })
    }
  }

  // 去重：public/ 与 content/ 可能是同一批文件的同步副本，只处理 content 源
  const contentSet = new Set(candidates.filter(c => c.filePath.includes(path.sep + 'content' + path.sep)).map(c => c.filePath))
  const publicOnly = candidates.filter(c => !contentSet.has(c.filePath))

  let converted = 0
  let savedBefore = 0
  let savedAfter = 0
  const stats = []

  const processFile = ({ filePath, size }) => {
    const result = toWebp(filePath)
    if (!result) return
    const webpSize = fs.statSync(result.webpPath).size
    stats.push({
      file: path.relative(ROOT, filePath),
      before: (size / 1024).toFixed(0) + 'KB',
      after: (webpSize / 1024).toFixed(0) + 'KB',
      ratio: size > 0 ? Math.round((1 - webpSize / size) * 100) + '%' : '-',
    })
    savedBefore += size
    savedAfter += webpSize
    if (!result.reused) converted++
  }

  for (const c of candidates.filter(c => c.filePath.includes(path.sep + 'content' + path.sep))) processFile(c)
  for (const c of publicOnly) processFile(c)

  console.log(`🖼️  大图扫描：${candidates.length} 张超过 ${SIZE_THRESHOLD / 1024}KB`)
  console.log(`   ${converted} 张已生成 WebP（原图保留为 source）`)

  if (stats.length > 0) {
    console.log('\n转换统计：')
    for (const s of stats.slice(0, 30)) {
      console.log(`   ${s.file}  ${s.before} → ${s.after}  (${s.ratio})`)
    }
    if (stats.length > 30) console.log(`   … 等共 ${stats.length} 张`)
    console.log(`\n  合计：${(savedBefore / 1024 / 1024).toFixed(1)}MB → ${(savedAfter / 1024 / 1024).toFixed(1)}MB`)
  }

  const mdRewritten = rewriteMarkdownReferences()
  console.log(`\n📝 Markdown 引用改写：${mdRewritten} 处指向 .webp`)

  if (DRY) console.log('\n（DRY RUN 未写入任何文件）')
}

main()
