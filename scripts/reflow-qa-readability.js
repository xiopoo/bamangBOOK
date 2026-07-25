#!/usr/bin/env node
/**
 * 股东大会问答全量可读性重排脚本
 *
 * 原则：不增删一个字，只做结构重排（分段 / 标题 / 说话人分块）。
 * 处理四类问题：
 *   1. PDF 硬换行残留（句中断行，如 2025 实录）→ 合并为完整段落
 *   2. 句中粘连的说话人标签（如 “……。巴菲特：……”）→ 拆分为独立段落
 *   3. 编号主题粘连正文（如 “1，关于收购我们没有公式。……”）→ 首句提升为 H2 标题
 *   4. 超长段落（数千字一段）→ 按句子边界切分为 120–220 字左右的可读段落
 *
 * 完整性校验：重排前后去除所有空白与 '#' 标记后的字符流必须完全一致，否则跳过该文件。
 *
 * 用法：
 *   node scripts/reflow-qa-readability.js --dry   # 干跑，仅输出统计
 *   node scripts/reflow-qa-readability.js         # 实际写入
 */

const fs = require('fs')
const path = require('path')

const QA_DIR = path.join(__dirname, '..', 'content', 'qa')
const DRY_RUN = process.argv.includes('--dry')

// 已知说话人标签（段首或句中粘连时用于拆段）
const SPEAKERS = [
  '巴菲特', '芒格', '股东', '提问者', '主持人', '阿贝尔', '听众', '记者',
  'Becky', 'BECKY', 'BeckiAmick', 'GregAbel', 'Greg', 'AjitJain', 'Ajit',
  'WalterScott', 'MarcHamburg', 'RonOlson', 'TED', 'TODD', 'OID',
]
const SPEAKER_ALT = SPEAKERS.join('|')
// 段首说话人
const RE_SPEAKER_START = new RegExp(`^(?:${SPEAKER_ALT}|Q\\d+|[A-Z]{2})[：:]`)
// 句末标点 + 说话人 → 拆段（前一句必须以终止符/右括号/右引号结尾）
const RE_INLINE_SPEAKER = new RegExp(
  `([。！？…”」』)）])\\s*((?:${SPEAKER_ALT})[：:])`, 'g'
)

// 终止性标点（用于判断段落/句子是否完整结束）
const TERMINAL = /[。！？…”」』)）:：;；—]$/
// 句子切分点：终止符 + 可选的右引号/右括号
const RE_SENT = /([。！？；]+[”」』)）]*)/g

const LONG_PARA = 300   // 超过该长度的段落进行句级切分
const CHUNK_TARGET = 180 // 切分后目标段长

/** 去空白 + 去 # 的规范化，用于完整性校验 */
function normalize(text) {
  return text.replace(/[#\s]+/g, '')
}

/** 判断文件是否为硬换行残留文本（大量短行且多数行不以终止符结尾） */
function isHardWrapped(paras) {
  if (paras.length < 50) return false
  const short = paras.filter((p) => p.length < 60).length
  const dangling = paras.filter((p) => !TERMINAL.test(p)).length
  return short / paras.length > 0.5 && dangling / paras.length > 0.3
}

/** 合并硬换行：不以终止符结尾且下一段不是标题/说话人开头时拼接 */
function joinHardWrapped(paras) {
  const out = []
  for (const p of paras) {
    const prev = out[out.length - 1]
    const canJoin =
      prev !== undefined &&
      !prev.startsWith('#') &&
      !TERMINAL.test(prev) &&
      !p.startsWith('#') &&
      !RE_SPEAKER_START.test(p)
    if (canJoin) {
      // ASCII 单词跨行断开时补一个空格，中文直接拼接
      const glue = /[A-Za-z0-9]$/.test(prev) && /^[A-Za-z0-9]/.test(p) ? ' ' : ''
      out[out.length - 1] = prev + glue + p
    } else {
      out.push(p)
    }
  }
  return out
}

/** 句中粘连说话人 → 拆段 */
function splitInlineSpeakers(para) {
  return para.replace(RE_INLINE_SPEAKER, '$1\n\n$2').split(/\n\n/)
}

/**
 * 编号主题粘连：段首形如 “3，标题正文……” 且非说话人段。
 * 首句（≤48 字）提升为 H2；剩余文本保留为正文。文本本身一字不动。
 */
function promoteNumberedHeading(para) {
  const m = para.match(/^(\d{1,2}[，、,．.]\s*)([^\n]+)$/)
  if (!m || para.startsWith('#') || RE_SPEAKER_START.test(para)) return null
  const body = m[2]
  const sm = body.match(/^(.{2,46}?[。！？])([\s\S]*)$/)
  if (sm) {
    const head = `## ${m[1]}${sm[1]}`.replace(/。$/u, (c) => c) // 保留原句号，确保字符流一致
    const rest = sm[2].trim()
    return rest ? [head, rest] : [head]
  }
  // 整段很短（本身就是标题行）
  if (para.length <= 48) return [`## ${para}`]
  return null
}

/** 按句子边界把超长段落切成多个可读段落，括号/引号内不切 */
function splitLongParagraph(para) {
  if (para.length <= LONG_PARA || para.startsWith('#')) return [para]

  // 提取段首说话人标签，切分后仅保留在首段
  let prefix = ''
  let text = para
  const sp = para.match(RE_SPEAKER_START)
  if (sp) {
    prefix = sp[0]
    text = para.slice(prefix.length)
  }

  let sentences = tokenizeSentences(text, true)
  // 未闭合引号/括号会抑制切分点；仍存在超长句时忽略嵌套深度重试
  const maxSent = Math.max(...sentences.map((s) => s.length))
  if (maxSent > LONG_PARA * 1.5) {
    sentences = tokenizeSentences(text, false)
  }

  return assembleChunks(sentences, prefix)
}

/** 句子切分；trackDepth=false 时不考虑括号/引号嵌套 */
function tokenizeSentences(text, trackDepth) {
  const OPEN = new Set(['（', '(', '「', '『', '“', '《'])
  const CLOSE = new Set(['）', ')', '」', '』', '”', '》'])
  const sentences = []
  let buf = ''
  let depth = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    buf += ch
    if (trackDepth) {
      if (OPEN.has(ch)) depth++
      else if (CLOSE.has(ch) && depth > 0) depth--
    }
    if (depth === 0 && /[。！？；]/.test(ch)) {
      while (i + 1 < text.length && CLOSE.has(text[i + 1])) {
        buf += text[++i]
      }
      sentences.push(buf)
      buf = ''
    }
  }
  if (buf) sentences.push(buf)
  return sentences
}

/** 句子聚合为 ~CHUNK_TARGET 字的段落 */
function assembleChunks(sentences, prefix) {
  const chunks = []
  let cur = ''
  for (const s of sentences) {
    if (cur && cur.length + s.length > CHUNK_TARGET * 1.4) {
      chunks.push(cur)
      cur = s
    } else {
      cur += s
      if (cur.length >= CHUNK_TARGET) {
        chunks.push(cur)
        cur = ''
      }
    }
  }
  if (cur) chunks.push(cur)

  return chunks.map((c, i) => (i === 0 ? prefix + c : c)).filter(Boolean)
}

/** 单文件处理流水线 */
function processFile(raw) {
  // 保留可能存在的 frontmatter
  let frontmatter = ''
  let body = raw.replace(/\r\n/g, '\n')
  const fm = body.match(/^---\n[\s\S]*?\n---\n/)
  if (fm) {
    frontmatter = fm[0]
    body = body.slice(fm[0].length)
  }

  let paras = body
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  // 1. 硬换行合并
  if (isHardWrapped(paras)) paras = joinHardWrapped(paras)

  // 2. 句中说话人拆段
  paras = paras.flatMap((p) => (p.startsWith('#') ? [p] : splitInlineSpeakers(p)))

  // 3. 编号主题标题提升
  paras = paras.flatMap((p) => promoteNumberedHeading(p) || [p])

  // 4. 超长段落切分
  paras = paras.flatMap((p) => splitLongParagraph(p))

  const result = frontmatter + paras.join('\n\n').trim() + '\n'
  return result
}

// ---- 主流程 ----
const files = fs
  .readdirSync(QA_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort()

let changed = 0
let skipped = 0
const failures = []

for (const file of files) {
  const full = path.join(QA_DIR, file)
  const raw = fs.readFileSync(full, 'utf8')
  const next = processFile(raw)

  if (normalize(raw) !== normalize(next)) {
    failures.push(file)
    console.error(`✗ 完整性校验失败，已跳过: ${file}`)
    continue
  }

  if (next === raw) {
    skipped++
    continue
  }

  const beforeParas = raw.split(/\n{2,}/).length
  const afterParas = next.split(/\n{2,}/).length
  const beforeMax = Math.max(...raw.split('\n').map((l) => l.length))
  const afterMax = Math.max(...next.split('\n').map((l) => l.length))
  console.log(
    `✓ ${file} | 段落 ${beforeParas} → ${afterParas} | 最长行 ${beforeMax} → ${afterMax}${DRY_RUN ? ' (dry)' : ''}`
  )

  if (!DRY_RUN) fs.writeFileSync(full, next, 'utf8')
  changed++
}

console.log(
  `\n完成：改动 ${changed} 份，无需改动 ${skipped} 份，校验失败 ${failures.length} 份${DRY_RUN ? '（干跑模式，未写入）' : ''}`
)
if (failures.length) process.exit(1)
