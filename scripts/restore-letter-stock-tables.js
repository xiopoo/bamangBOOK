#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const PDF_TEXT = path.join(ROOT, 'tmp', 'pdfs', 'buffett-letters-layout.txt')
const WRITE = process.argv.includes('--write')
const previewArgument = process.argv.find((arg) => arg.startsWith('--preview-dir='))
const PREVIEW_DIR = previewArgument
  ? path.resolve(ROOT, previewArgument.slice('--preview-dir='.length))
  : null

// One-based line ranges in the layout-preserving text extracted from the local
// 60-year reference PDF. Each range contains the published stock-holdings table.
const TABLES = {
  1979: [24506, 24523, 'oldPlain'],
  1980: [25168, 25189, 'old'],
  1981: [26360, 26375, 'old'],
  1982: [26872, 26883, 'old'],
  1984: [30458, 30473, 'oldPlain'],
  1985: [33467, 33476, 'oldPlain'],
  1988: [41656, 41662, 'unit'],
  1989: [44263, 44269, 'unit'],
  1990: [47734, 47741, 'unit'],
  1992: [58995, 59007, 'unit'],
  1994: [73192, 73203, 'unit'],
  1998: [109553, 109565, 'four'],
  1999: [116960, 116969, 'four'],
  2000: [124039, 124046, 'four'],
  2001: [134129, 134139, 'four'],
  2002: [143297, 143309, 'four'],
  2003: [155190, 155207, 'five'],
  2004: [164303, 164315, 'five'],
  2005: [175464, 175484, 'five'],
  2006: [189834, 189853, 'five'],
  2007: [199341, 199362, 'five'],
  2008: [211076, 211096, 'five'],
  2009: [227340, 227355, 'five'],
  2010: [238780, 238800, 'five'],
  2011: [249419, 249439, 'five'],
  2012: [257349, 257368, 'five'],
  2013: [268097, 268118, 'five'],
  2014: [280070, 280090, 'five'],
  2015: [290366, 290386, 'five'],
  2016: [299405, 299426, 'five'],
  2017: [306245, 306266, 'five'],
  2018: [312379, 312398, 'five'],
  2020: [322329, 322354, 'five'],
}

function cleanCell(value) {
  return value.replace(/^\$\s*/, '').replace(/\s+/g, ' ').trim()
}

function splitColumns(line) {
  return line
    .replace(/^\f/, '')
    .trim()
    .split(/\s{2,}/)
    .map(cleanCell)
    .filter(Boolean)
}

function parseRow(line, mode) {
  const source = line.replace(/^\f/, '').trim()
  if (!source || /^(?:股份数量|上年|公司名称)/.test(source) || /^\d{3,5}$/.test(source)) return null
  const summary = source.match(/^(其他|总计|合计|股票投资合计|全部权益|所有其他控股公司)\s+\$?([\d,.]+)\s+\$?([\d,.]+)$/)
  if (summary) {
    if (mode === 'five') return ['', summary[1], '', summary[2], summary[3]]
    return ['', summary[1], summary[2], summary[3]]
  }

  if (mode === 'old') {
    const match = source.match(/^\S+\s+(?:\d[\d,]*\s+)?(\d[\d,]*)\s+([abc])\.\s*(.+?)\s+\$?([\d,.]+)\s+\$?([\d,.]+)$/i)
    if (!match) return null
    return [`${match[1]} (${match[2].toLowerCase()})`, match[3], match[4], match[5]]
  }

  if (mode === 'oldPlain') {
    const match = source.match(/^\S+\s+(?:\d[\d,]*\s+)?(\d[\d,]*)\s+(.+?)\s+\$?([\d,.]+)\s+\$?([\d,.]+)$/)
    if (!match) return null
    return [match[1], match[2], match[3], match[4]]
  }

  if (mode === 'unit') {
    const match = source.match(/^(\d[\d,]*)\s+(.+?)\s+\$?([\d,.]+)\s+\$?([\d,.]+)(?:\s+\d+(?:\.\d+)?)?$/)
    if (!match) return null
    return [match[1], match[2], match[3], match[4]]
  }

  if (mode === 'four') {
    const match = source.match(/^(\d[\d,]*)\s+(.+?)\s+\$?([\d,.]+)\s+\$?([\d,.]+)$/)
    if (!match) return null
    return [match[1], match[2], match[3], match[4]]
  }

  if (mode === 'five') {
    const match = source.match(/^(\d[\d,]*)\s+(.+?)\s+(\d+(?:\.\d+)?%?)\s+\$?([\d,.]+)\s+\$?([\d,.]+)$/)
    if (!match) return null
    return [match[1], match[2], match[3].endsWith('%') ? match[3] : `${match[3]}%`, match[4], match[5]]
  }

  return null
}

function markdownRows(rows) {
  return rows.map((row) => `| ${row.join(' | ')} |`).join('\n')
}

function findBrokenStockTable(lines) {
  let start = -1
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\|.*(?:股数|股份数|持股数量).*\|$/.test(lines[index])) continue
    let end = index + 1
    while (end < lines.length && /^\|.*\|$/.test(lines[end])) end += 1
    const block = lines.slice(index, end).join('\n')
    if (/\d{1,3}(?:,\d{3}){1,}\d{1,3}(?:,\d{3}){1,}/.test(block)) {
      start = index
      return { start, end }
    }
  }
  return null
}

if (!fs.existsSync(PDF_TEXT)) {
  console.error(`Missing ${path.relative(ROOT, PDF_TEXT)}. Extract the reference PDF with pdftotext -layout first.`)
  process.exit(1)
}

const pdfLines = fs.readFileSync(PDF_TEXT, 'utf8').split('\n')
let changed = 0

for (const [yearText, [startLine, endLine, mode]] of Object.entries(TABLES)) {
  const year = Number(yearText)
  const filePath = path.join(ROOT, 'content', 'letters', `berkshire_${year}-巴菲特致股东信.md`)
  const original = fs.readFileSync(filePath, 'utf8')
  const lines = original.split(/\r?\n/)
  const table = findBrokenStockTable(lines)
  if (!table) {
    console.log(`SKIP ${year}: no broken stock table found`)
    continue
  }

  const rows = []
  for (const line of pdfLines.slice(startLine - 1, endLine)) {
    const row = parseRow(line, mode)
    if (!row) continue
    rows.push(row)
    if (/^(?:总计|合计|股票投资合计|全部权益)$/.test(row[1])) break
  }
  const expectedColumns = mode === 'five' ? 5 : 4
  const validRows = rows.filter((row) => row.length === expectedColumns && row[1])
  if (validRows.length < 4) {
    console.error(`FAIL ${year}: parsed only ${validRows.length} source rows`)
    process.exitCode = 1
    continue
  }

  const replacement = [lines[table.start], lines[table.start + 1], markdownRows(validRows)]
  const updatedLines = [...lines.slice(0, table.start), ...replacement, ...lines.slice(table.end)]
  const updated = updatedLines.join('\n')
  changed += 1
  if (WRITE) fs.writeFileSync(filePath, updated)
  if (PREVIEW_DIR) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true })
    fs.writeFileSync(path.join(PREVIEW_DIR, path.basename(filePath)), updated)
  }
  console.log(`${WRITE ? 'WRITE' : 'DRY'} ${year}: restored ${validRows.length} rows`)
}

console.log(`${WRITE ? 'Updated' : 'Would update'} ${changed} stock tables.`)
