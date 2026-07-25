#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const STABLE_DIR = path.join(ROOT, 'tmp', 'ima-audit', 'raw', 'stable')
const WRITE = process.argv.includes('--write')
const REPORT_PATH = path.join(ROOT, 'reports', 'stable-knowledge-sync-preview.json')

function canonical(value) {
  return value
    .normalize('NFKC')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

function countMatches(value, expression) {
  return [...value.matchAll(expression)].length
}

function stripStableChrome(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const output = []
  let skippedDuplicateTitle = false

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()

    if (/^>\s*来源：https?:\/\//.test(trimmed)) continue
    if (/^原文链接：https?:\/\//.test(trimmed)) continue
    if (/^---+$/.test(trimmed) && /^原文链接：https?:\/\//.test((lines[index + 1] || '').trim())) continue
    if (trimmed === '## 常见问题') break

    // Stable pages repeat the H1 after a category label, e.g. “合伙人信”.
    if (!skippedDuplicateTitle && output.length >= 2 && /^#\s+/.test(trimmed)) {
      const firstTitle = output.find(item => /^#\s+/.test(item.trim()))
      if (firstTitle && canonical(firstTitle) === canonical(trimmed)) {
        skippedDuplicateTitle = true
        continue
      }
    }

    if (/^(?:合伙人信|概念|人物|专题)$/.test(trimmed)) continue
    output.push(line)
  }

  return output
    .join('\n')
    .replace(/\[([^\]]+)]\(https?:\/\/(?:www\.)?learnbuffett\.com[^)]*\)/g, '$1')
    .replace(/^\* \* \*$/gm, '---')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .concat('\n')
}

function tableCells(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map(cell => cell.trim())
}

function isSeparator(line) {
  const cells = tableCells(line)
  return cells.length > 1 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}

function tableRow(cells) {
  return `| ${cells.join(' | ')} |`
}

function normalizeLooseTables(markdown) {
  const lines = markdown.split('\n')
  const output = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!line.includes('|') || !isSeparator(lines[index + 1] || '')) {
      output.push(line)
      continue
    }

    const header = tableCells(line)
    const separator = tableCells(lines[index + 1])
    const columnCount = Math.max(header.length, separator.length)
    output.push(
      tableRow([...header, ...Array(Math.max(0, columnCount - header.length)).fill('')]),
      tableRow(Array(columnCount).fill('---'))
    )
    index += 1

    while (index + 1 < lines.length && lines[index + 1].includes('|')) {
      const cells = tableCells(lines[index + 1])
      output.push(tableRow([...cells, ...Array(Math.max(0, columnCount - cells.length)).fill('')].slice(0, columnCount)))
      index += 1
    }
  }

  return output.join('\n')
}

function blockKind(line) {
  const trimmed = line.trim()
  if (!trimmed) return 'blank'
  if (/^#{1,6}\s+/.test(trimmed)) return 'heading'
  if (/^>/.test(trimmed)) return 'quote'
  if (/^\|.*\|$/.test(trimmed)) return 'table'
  if (/^[-*+]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) return 'list'
  if (/^\[\^[^\]]+]:/.test(trimmed)) return 'footnote'
  if (/^(?:---|\*\*\*)$/.test(trimmed)) return 'rule'
  return 'prose'
}

function normalizeBlockSpacing(markdown) {
  const lines = markdown.split('\n')
  const output = []

  for (const line of lines) {
    const kind = blockKind(line)
    const previous = output.at(-1) ?? ''
    const previousKind = blockKind(previous)
    const needsBlankBefore =
      previous &&
      previousKind !== 'blank' &&
      kind !== 'blank' &&
      (
        kind === 'heading' ||
        (kind === 'table' && previousKind !== 'table') ||
        kind === 'rule' ||
        (kind === 'prose' && previousKind === 'prose') ||
        (kind === 'quote' && previousKind !== 'quote') ||
        (kind !== 'quote' && previousKind === 'quote') ||
        (kind === 'list' && previousKind !== 'list' && previousKind !== 'prose') ||
        (kind !== 'list' && previousKind === 'list')
      )

    if (needsBlankBefore) output.push('')
    output.push(line)

    if (kind === 'heading' || kind === 'rule') output.push('')
  }

  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim().concat('\n')
}

function normalizeStableMarkdown(markdown) {
  let seenTitle = false
  const demoted = normalizeLooseTables(stripStableChrome(markdown))
    .split('\n')
    .map(line => {
      if (!/^#\s+/.test(line)) return line
      if (!seenTitle) {
        seenTitle = true
        return line
      }
      return line.replace(/^#\s+/, '## ')
    })
    .join('\n')
  return normalizeBlockSpacing(demoted)
}

function stableToSitePath(fileName) {
  let match = fileName.match(/^partnership_(\d{4})(.*)-(.+)\.md$/)
  if (match) {
    const [, year, rawSuffix, title] = match
    let suffix = rawSuffix
    if (suffix) suffix = suffix
      .replace(/^年中$/, '-interim')
      .replace(/^年/, '-')
    if (year === '1970' && rawSuffix === '年2月') suffix = '-bond'
    const direct = path.join(ROOT, 'content', 'partnership', `partnership_${year}${suffix}-${title}.md`)
    if (fs.existsSync(direct) || rawSuffix) return direct
    const annual = path.join(ROOT, 'content', 'partnership', `partnership_${year}-annual-${title}.md`)
    return fs.existsSync(annual) ? annual : direct
  }

  match = fileName.match(/^concepts_(.+)\.md$/)
  if (match) return path.join(ROOT, 'content', 'concepts', `${match[1]}.md`)

  match = fileName.match(/^people_(.+)\.md$/)
  if (match) {
    const name = match[1]
      .replace(/^芒格$/, '查理·芒格')
      .replace(/^格雷厄姆$/, '本杰明·格雷厄姆')
    return path.join(ROOT, 'content', 'people', `${name}.md`)
  }

  match = fileName.match(/^special_(.+)\.md$/)
  if (match) {
    const base = match[1]
    const direct = path.join(ROOT, 'content', 'special', `${base}.md`)
    if (fs.existsSync(direct)) return direct
    const candidates = fs.existsSync(path.dirname(direct))
      ? fs.readdirSync(path.dirname(direct)).filter(name => name.startsWith(base) && name.endsWith('.md'))
      : []
    if (candidates.length === 1) return path.join(path.dirname(direct), candidates[0])
    return direct
  }

  return null
}

function structure(markdown) {
  return {
    chars: canonical(markdown).length,
    headings: countMatches(markdown, /^#{1,6}\s+\S/gm),
    paragraphs: markdown.split(/\n\s*\n+/).filter(Boolean).length,
    tables: countMatches(markdown, /^\s*\|.*\|\s*\n\s*\|?\s*:?-{3,}/gm),
  }
}

const files = fs.existsSync(STABLE_DIR)
  ? fs.readdirSync(STABLE_DIR).filter(file => file.endsWith('.md')).sort()
  : []

const report = []
let changed = 0
let added = 0

for (const fileName of files) {
  if (!/^(?:partnership_|concepts_|people_|special_)/.test(fileName)) continue

  const sitePath = stableToSitePath(fileName)
  if (!sitePath) continue

  const stablePath = path.join(STABLE_DIR, fileName)
  const stable = normalizeStableMarkdown(fs.readFileSync(stablePath, 'utf8'))
  const exists = fs.existsSync(sitePath)
  const before = exists ? fs.readFileSync(sitePath, 'utf8') : ''
  const beforeCanonical = canonical(before)
  const stableCanonical = canonical(stable)
  const containsSite = beforeCanonical && stableCanonical.includes(beforeCanonical)
  const identical = beforeCanonical === stableCanonical

  const item = {
    stable: path.relative(ROOT, stablePath),
    site: path.relative(ROOT, sitePath),
    exists,
    action: 'skip',
    before: structure(before),
    after: structure(stable),
    containsSite,
    identical,
  }

  if (before !== stable && (!exists || identical || containsSite || beforeCanonical.length < stableCanonical.length * 0.92)) {
    item.action = exists ? 'replace-with-stable-format' : 'add-missing'
    if (WRITE) {
      fs.mkdirSync(path.dirname(sitePath), { recursive: true })
      fs.writeFileSync(sitePath, stable)
    }
    if (exists) changed += 1
    else added += 1
  }

  report.push(item)
  console.log(`${WRITE ? 'WRITE' : 'DRY'} ${item.action}: ${item.site}`)
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
console.log(`${WRITE ? 'Updated' : 'Would update'} ${changed} file(s), add ${added} file(s). Report: ${path.relative(ROOT, REPORT_PATH)}`)
