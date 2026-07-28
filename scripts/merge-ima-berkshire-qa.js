#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const RAW_DIR = path.join(ROOT, 'tmp', 'ima-audit', 'raw', 'qa')
const QA_DIR = path.join(ROOT, 'content', 'qa')
const WRITE = process.argv.includes('--write')
const requestedYears = process.argv
  .filter((arg) => /^\d{4}$/.test(arg))
  .map(Number)

const DEFAULT_YEARS = Array.from({ length: 23 }, (_, index) => 1994 + index)
const YEARS = requestedYears.length ? requestedYears : DEFAULT_YEARS

const PART_ORDER = new Map([
  ['第一', 0],
  ['第二', 1],
  ['第三', 2],
  ['第四', 3],
  ['第五', 4],
  ['第六', 5],
  ['上', 0],
  ['中', 1],
  ['下', 2],
])

function sortKey(file) {
  const session = file.includes('上午场') ? 0 : file.includes('下午场') ? 1 : 2
  const partMatch = file.match(/（(第一|第二|第三|第四|第五|第六|上|中|下)部分?）/)
  const part = partMatch ? PART_ORDER.get(partMatch[1]) ?? 9 : 9
  return [session, part, file]
}

function compareFiles(a, b) {
  const left = sortKey(a)
  const right = sortKey(b)
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] < right[index]) return -1
    if (left[index] > right[index]) return 1
  }
  return 0
}

function sectionTitle(year, file) {
  const stripped = file.replace(/\.md$/, '')
  const session = stripped.match(/(上午场|下午场)(?:（[上中下]）)?/)
  if (session) return session[0]

  const part = stripped.match(/（(第一|第二|第三|第四|第五|第六)部分）/)
  if (part) return part[1] + '部分'

  return stripped.replace(`${year}年伯克希尔股东大会Q&A `, '')
}

function cleanFragment(raw) {
  let value = raw.replace(/\r\n?/g, '\n').trim()

  const divider = value.match(/-{6,}\s*正文\s*-{6,}/)
  if (divider) {
    value = value.slice(divider.index + divider[0].length).trim()
  } else {
    value = value
      .replace(/^#{1,4}\s+.+(?:股东大会|伯克希尔).+\n+/, '')
      .replace(/^作者：.*\n+/m, '')
      .replace(/^链接：.*\n+/m, '')
      .replace(/^来源：.*\n+/m, '')
      .trim()
  }

  return value
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
}

function buildYear(year) {
  const rawYearDir = path.join(RAW_DIR, String(year))
  const target = path.join(QA_DIR, `伯克希尔股东大会实录_${year}.md`)
  if (!fs.existsSync(rawYearDir) || !fs.existsSync(target)) return null

  const files = fs
    .readdirSync(rawYearDir)
    .filter((file) => file.endsWith('.md'))
    .sort(compareFiles)

  if (!files.length) return null

  const sections = files.map((file) => {
    const full = path.join(rawYearDir, file)
    const body = cleanFragment(fs.readFileSync(full, 'utf8'))
    return `## ${sectionTitle(year, file)}\n\n${body}`
  })

  const note = [
    `# ${year} 年伯克希尔股东大会实录`,
    '',
    '> 版本说明：本页根据 IMA 资料库中已下载的分卷源文合并整理，按上午场、下午场及上中下分卷顺序排列。1994 年起官方视频来源为 CNBC/Berkshire 年会档案，中文翻译来源见 IMA 原始分卷记录。源文中标注“翻译略过”的大会流程按原样保留。',
    '',
  ].join('\n')

  return {
    target,
    files,
    content: note + sections.join('\n\n') + '\n',
  }
}

let changed = 0
let skipped = 0

for (const year of YEARS) {
  const built = buildYear(year)
  if (!built) {
    skipped += 1
    console.log(`SKIP ${year}: no complete markdown source or target page`)
    continue
  }

  const before = fs.readFileSync(built.target, 'utf8')
  const beforeChars = before.length
  const afterChars = built.content.length
  const status = before === built.content ? 'same' : WRITE ? 'write' : 'dry'

  if (before !== built.content) {
    changed += 1
    if (WRITE) fs.writeFileSync(built.target, built.content, 'utf8')
  }

  console.log(
    `${status.toUpperCase()} ${year}: ${built.files.length} source file(s), chars ${beforeChars} -> ${afterChars}`
  )
}

console.log(`${WRITE ? 'Updated' : 'Would update'} ${changed} file(s); skipped ${skipped}.`)
