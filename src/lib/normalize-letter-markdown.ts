const BLOCK_LINE = /^(?:#{1,6}\s|>|[-*+]\s|\d+[.)]\s|```|~~~|\||(?:-{3,}|\*{3,}|_{3,})\s*$|\[\^[^\]]+\]:)/
const TABLE_SEPARATOR = /^(---(?:\|---)+)/
const NUMBER_CELL = /^\s*((?:\*\*)?\$?\s*(?:\(?-?[\d,.]+\)?(?:\(\d+\))?%?\s*(?:美元|元)?|--+)(?:\*\*)?)(.*)$/
const TEXT_VALUE_CELL = /^\s*(低于零|承保盈利|盈利|N\/A)(.*)$/i
const HEADER_TOKEN = /(?:年份|年度|五年期|BNSF|公司名称|公司|项目|科目|分类|股数|股份数量|持股数量|保险业务|资产|业务|\（百万美元\）|\（千美元\）|\(百万美元\)|\(千美元\))/g

function splitTrailingCell(value: string): [string, string] {
  const yearBoundary = value.match(/^\s*((?:\*\*)?\$?\s*\(?-?[\d,.]+?%?\)?)(?=(?:19|20)\d{2})(.*)$/)
  if (yearBoundary) return [yearBoundary[1].trim(), yearBoundary[2].trim()]

  const numeric = value.match(NUMBER_CELL)
  if (numeric) return [numeric[1].trim(), numeric[2].trim()]

  const textual = value.match(TEXT_VALUE_CELL)
  if (textual) return [textual[1].trim(), textual[2].trim()]

  if (!value.trim()) return ['', '']
  return ['', value.trim()]
}

function row(cells: string[], columnCount: number): string {
  const padded = [...cells]
  while (padded.length < columnCount) padded.push('')
  return `| ${padded.slice(0, columnCount).map(cell => cell.trim()).join(' | ')} |`
}

/**
 * Earlier imports flattened some financial tables into one very long line.
 * Their pipe delimiters remain intact, so the fixed column count lets us
 * restore row boundaries without changing the table values.
 */
function splitTablePrefix(header: string, columnCount: number): [string, string[]] | null {
  const pipePositions: number[] = []
  for (let index = 0; index < header.length; index += 1) {
    if (header[index] === '|') pipePositions.push(index)
  }
  if (pipePositions.length < columnCount - 1) return null

  const firstHeaderPipe = pipePositions[pipePositions.length - (columnCount - 1)]
  const firstCellWithPrefix = header.slice(0, firstHeaderPipe)
  let tableStart = 0
  let emptyFirstCell = false
  let hasTableStart = false

  if (firstHeaderPipe === 0 && header.startsWith('|')) {
    tableStart = 0
    emptyFirstCell = true
    hasTableStart = true
  } else {
    const tokenMatches = [...firstCellWithPrefix.matchAll(HEADER_TOKEN)]
    const lastToken = tokenMatches.at(-1)
    if (lastToken?.index != null) {
      tableStart = lastToken.index
      hasTableStart = true
    }
  }

  if (!hasTableStart && firstHeaderPipe > 0) {
    const boldEnd = firstCellWithPrefix.lastIndexOf('**')
    const colon = Math.max(firstCellWithPrefix.lastIndexOf('：'), firstCellWithPrefix.lastIndexOf(':'))
    if (boldEnd >= 0 && firstCellWithPrefix.slice(boldEnd + 2).trim()) {
      tableStart = boldEnd + 2
      hasTableStart = true
    } else if (colon >= 0 && firstCellWithPrefix.length - colon < 80) {
      tableStart = colon + 1
      hasTableStart = true
    } else if (/[。！？；)]$/.test(firstCellWithPrefix.trim())) {
      tableStart = firstHeaderPipe
      emptyFirstCell = true
      hasTableStart = true
    } else {
      return null
    }
  }

  const prefix = header.slice(0, tableStart).trim()
  const cells = header.slice(tableStart + (emptyFirstCell ? 1 : 0)).split('|')
  if (emptyFirstCell) cells.unshift('')
  while (cells.length < columnCount) cells.unshift('')
  return [prefix, cells]
}

function restoreCollapsedTable(line: string): string {
  if (!line.includes('---|')) return line

  const separatorStart = line.indexOf('---|')
  const headerPart = line.slice(0, separatorStart)
  const separatorAndBody = line.slice(separatorStart)
  const separator = separatorAndBody.match(TABLE_SEPARATOR)?.[1]
  if (!separator) return line

  const columnCount = separator.split('|').length
  const prefixAndHeader = splitTablePrefix(headerPart, columnCount)
  if (!prefixAndHeader) return line
  const [prefix, headerCells] = prefixAndHeader

  const output = [
    ...(prefix ? [prefix, ''] : []),
    row(headerCells, columnCount),
    row(Array(columnCount).fill('---'), columnCount),
  ]

  const body = separatorAndBody.slice(separator.length)
  const tokens = body.split('|')
  if (tokens.length < columnCount) {
    return body.trim() ? line : output.join('\n')
  }

  let label = tokens[0].trim()
  let cursor = 1

  while (label && cursor + columnCount - 2 < tokens.length) {
    const values = tokens.slice(cursor, cursor + columnCount - 1)
    const lastIndex = values.length - 1
    const [lastValue, nextLabel] = splitTrailingCell(values[lastIndex])
    values[lastIndex] = lastValue
    output.push(row([label, ...values], columnCount))
    label = nextLabel
    cursor += columnCount - 1
  }

  if (label) output.push('', label)
  return output.join('\n')
}

function tableCellCount(line: string): number {
  const cells = line.trim().split('|')
  if (!cells[0].trim()) cells.shift()
  if (!cells.at(-1)?.trim()) cells.pop()
  return cells.length
}

function expandCollapsedTableBodies(markdown: string): string {
  const lines = markdown.split('\n')
  const output: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const header = lines[index]
    const separator = lines[index + 1]
    if (!header.includes('|') || !separator || !/^\s*\|?\s*:?-{3,}/.test(separator)) {
      output.push(header)
      continue
    }

    const columnCount = tableCellCount(separator)
    output.push(header, separator)
    index += 1

    while (index + 1 < lines.length && lines[index + 1].trim() && lines[index + 1].includes('|')) {
      const bodyLine = lines[index + 1]
      const cells = bodyLine.trim().split('|')
      if (!cells[0].trim()) cells.shift()
      if (!cells.at(-1)?.trim()) cells.pop()

      if (cells.length <= columnCount) {
        output.push(bodyLine)
        index += 1
        continue
      }

      const rows: string[] = []
      let label = cells[0].trim()
      let cursor = 1
      while (label && cursor + columnCount - 2 < cells.length) {
        const values = cells.slice(cursor, cursor + columnCount - 1)
        const lastIndex = values.length - 1
        const [lastValue, nextLabel] = splitTrailingCell(values[lastIndex])
        if (!lastValue) break
        values[lastIndex] = lastValue
        rows.push(row([label, ...values], columnCount))
        label = nextLabel
        cursor += columnCount - 1
      }

      if (rows.length < 2) {
        output.push(bodyLine)
      } else {
        output.push(...rows)
        if (label) output.push('', label)
      }
      index += 1
    }
  }

  return output.join('\n')
}

function tableCells(line: string): string[] {
  const cells = line.trim().split('|')
  if (!cells[0].trim()) cells.shift()
  if (!cells.at(-1)?.trim()) cells.pop()
  return cells.map(cell => cell.trim())
}

function isSeparatorRow(line: string): boolean {
  const cells = tableCells(line)
  return cells.length > 0 && cells.every(cell => !cell || /^:?-{3,}:?$/.test(cell))
}

function normalizeTableShapes(markdown: string): string {
  const lines = markdown.split('\n')
  const output: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes('|') || !isSeparatorRow(lines[index + 1] ?? '')) {
      output.push(lines[index])
      continue
    }

    const headerCells = tableCells(lines[index])
    let separatorEnd = index + 1
    while (isSeparatorRow(lines[separatorEnd + 1] ?? '')) separatorEnd += 1
    const firstBody = tableCells(lines[separatorEnd + 1] ?? '')
    const columnCount = Math.max(headerCells.length, firstBody.length)
    const paddedHeader = headerCells.length === columnCount - 1
      ? ['', ...headerCells]
      : headerCells

    output.push(row(paddedHeader, columnCount), row(Array(columnCount).fill('---'), columnCount))
    index = separatorEnd

    while (index + 1 < lines.length && lines[index + 1].trim() && lines[index + 1].includes('|')) {
      const bodyCells = tableCells(lines[index + 1])
      output.push(bodyCells.length === columnCount - 1
        ? row(['', ...bodyCells], columnCount)
        : row(bodyCells, columnCount))
      index += 1
    }
  }

  return output.join('\n')
}

function isTableLine(line: string): boolean {
  return /^\s*\|/.test(line) || /^\s*:?-{3,}\s*(?:\||$)/.test(line)
}

function isProseLine(line: string): boolean {
  const trimmed = line.trim()
  return Boolean(trimmed) &&
    !BLOCK_LINE.test(trimmed) &&
    !/^\*\*[^*]+\*\*$/.test(trimmed) &&
    !isTableLine(trimmed)
}

function needsSpace(left: string, right: string): boolean {
  return /[A-Za-z0-9]$/.test(left) && /^[A-Za-z0-9]/.test(right)
}

/** Join page-wrap fragments while preserving PDF paragraph endings. */
function coalesceWrappedProse(markdown: string): string {
  const output: string[] = []

  for (const line of markdown.split('\n')) {
    const previous = output.at(-1)
    if (
      previous != null &&
      isProseLine(previous) &&
      isProseLine(line) &&
      !/[。！？；：.!?…][”’）)】》」』]?\s*$/.test(previous)
    ) {
      const left = previous.trimEnd()
      const right = line.trimStart()
      output[output.length - 1] = `${left}${needsSpace(left, right) ? ' ' : ''}${right}`
      continue
    }

    output.push(line)
  }

  return output.join('\n')
}

function splitLeadingLabels(markdown: string): string {
  return markdown
    .split('\n')
    .flatMap(line => {
      const match = line.match(/^(\*\*([^*]+)\*\*)(\S.*)$/)
      if (!match || match[2].length > 32 || /^[，。；：、,.!?）)]/.test(match[3])) return [line]
      return [match[1], '', match[3]]
    })
    .join('\n')
}

interface BrokenHeadingRepair {
  broken: string
  title: string
  prefix?: string
  consume?: string
  inline?: boolean
}

const BROKEN_HEADINGS: BrokenHeadingRepair[] = [
  { broken: '关于保守从', title: '关于保守', prefix: '从', inline: true },
  { broken: '关于规模除了', title: '关于规模', prefix: '除了' },
  { broken: '关于保守看到', title: '关于保守', prefix: '看到' },
  { broken: '我们的目标大', title: '我们的目标', prefix: '大' },
  { broken: '我们的投资方', title: '我们的投资方法', consume: '法' },
  { broken: '税项今年不少', title: '税项', prefix: '今年不少' },
  { broken: '登普', title: '登普斯特农具机械制造公司', consume: '斯特农具机械制造公司' },
  { broken: '税项进入', title: '税项', prefix: '进入' },
  { broken: '其他事项在去', title: '其他事项', prefix: '在去' },
  { broken: '税项今年有一', title: '税项', prefix: '今年有一' },
  { broken: '资产价值上述', title: '资产价值', prefix: '上述' },
  { broken: '金融和金融产', title: '金融和金融产品业务', consume: '品业务' },
  { broken: '金融衍生品两', title: '金融衍生品', prefix: '两' },
  { broken: '生活与债务赛车的基本法则是', title: '生活与债务', prefix: '赛车的基本法则是' },
  { broken: '致经理人备', title: '致经理人备忘录', consume: '忘录' },
  { broken: '欧内斯特', title: '欧内斯特·巴菲特1939年的一封信', consume: '1939 年的一封信' },
  { broken: '债务与风险随', title: '债务与风险', prefix: '随' },
  { broken: '管理继任作为', title: '管理继任', prefix: '作为' },
  { broken: '投资现在来聊', title: '投资', prefix: '现在来聊' },
  { broken: '美国国库券伯', title: '美国国库券', prefix: '伯' },
  { broken: '年度股东大会把日历空出来', title: '年度股东大会', prefix: '把日历空出来' },
  { broken: '普通股投资下', title: '普通股投资', prefix: '下' },
  { broken: '其他事项经过', title: '其他事项', prefix: '经过' },
  { broken: '有价证券——', title: '有价证券——其他', consume: '其他' },
  { broken: '大卫', title: '大卫·多德', consume: '·多德' },
]

function repairBrokenHeadings(markdown: string): string {
  const output: string[] = []
  let pending: { prefix?: string; consume?: string } | undefined

  for (const line of markdown.split('\n')) {
    if (pending && line.trim()) {
      const indentation = line.match(/^\s*/)?.[0] ?? ''
      let body = line.trimStart()
      if (pending.consume && body.startsWith(pending.consume)) body = body.slice(pending.consume.length)
      output.push(`${indentation}${pending.prefix ?? ''}${body}`)
      pending = undefined
      continue
    }

    const heading = line.match(/^##\s+(.+)$/)?.[1]
    const repair = heading && BROKEN_HEADINGS.find(item =>
      'inline' in item ? heading.startsWith(item.broken) : heading === item.broken
    )
    if (!heading || !repair) {
      output.push(line)
      continue
    }

    output.push(`## ${repair.title}`)
    const remainder = heading.slice(repair.broken.length)
    if (remainder) {
      output.push('', `${repair.prefix ?? ''}${remainder}`)
    } else {
      pending = repair
    }
  }

  return output.join('\n')
}

function removeDuplicateHeadingFragments(markdown: string): string {
  const fragments = new Map([
    ['## 我们的投资方法', '法'],
    ['## 金融和金融产品业务', '品业务'],
    ['## 大卫·多德', '·多德'],
  ])
  const lines = markdown.split('\n')
  const output: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const fragment = fragments.get(lines[index])
    output.push(lines[index])
    if (!fragment) continue

    let cursor = index + 1
    while (cursor < lines.length && !lines[cursor].trim()) {
      output.push(lines[cursor])
      cursor += 1
    }
    if (lines[cursor]?.trim() === fragment) index = cursor
  }

  return output.join('\n')
}

function repairOrphanParagraphs(markdown: string): string {
  const lines = markdown.split('\n')
  const output: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const left = lines[index].trim()
    let cursor = index + 1
    while (cursor < lines.length && !lines[cursor].trim()) cursor += 1
    const right = lines[cursor]?.trim() ?? ''
    const canJoin =
      left.length > 0 &&
      left.length <= 12 &&
      right.length > 0 &&
      !BLOCK_LINE.test(left) &&
      !BLOCK_LINE.test(right) &&
      !isTableLine(left) &&
      !isTableLine(right) &&
      !/[。！？；：.!?…][”’）)】》」』]?\s*$/.test(left) &&
      !/^(?:沃伦|此致|诚挚|签署|见证|董事长|WEB|来源|年初规模|BRK|附录|[12]\d{3}\s*年)/.test(left) &&
      !/^[-_] ?\*?\*?注/.test(left)

    if (left === '股票投资' && right.startsWith('下表')) {
      output.push('## 股票投资')
      continue
    }

    if (!canJoin) {
      output.push(lines[index])
      continue
    }

    output.push(`${left}${needsSpace(left, right) ? ' ' : ''}${right}`)
    index = cursor
  }

  return output.join('\n')
}

function splitInlineFootnoteDefinitions(markdown: string): string {
  let output = markdown.replace(/([^\n])(?=\[\^[^\]]+\]:\s*)/g, '$1\n\n')
  const followingParagraphs = [
    '在这37年间',
    '然而，真正重要的是',
    '我们能取得这一出色成绩',
    '总体而言，去年',
    '2010 年的亮点',
    '在我们任期内',
    '在前半段时期',
  ]

  for (const paragraphStart of followingParagraphs) {
    const escaped = paragraphStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    output = output.replace(
      new RegExp(`(\\[\\^[^\\]]+\\]:[^\\n]*?)(?=${escaped})`, 'g'),
      '$1\n\n'
    )
  }

  return output
}

function removeDanglingFootnoteReferences(markdown: string): string {
  const definitions = new Set(
    [...markdown.matchAll(/^\[\^([^\]]+)\]:/gm)].map(match => match[1])
  )

  return markdown.replace(/\[\^([^\]]+)\](?!:)/g, (reference, id: string) =>
    definitions.has(id) ? reference : ''
  )
}

/** Normalize imported PDF text to the paragraph and table semantics used by the site. */
export function normalizeImportedMarkdown(markdown: string): string {
  let restored = markdown
    .replace(/\r\n?/g, '\n')
    .replace(/^(\*{3,})(?=\S)/gm, '$1\n\n')
    .replace(/(?:__\s*){3,}/g, '\n\n')
    .replace(/(---\|---\|---\*\*资产\*\*)\n\n/g, '$1| | |')

  restored = coalesceWrappedProse(
    repairBrokenHeadings(
      removeDuplicateHeadingFragments(splitLeadingLabels(splitInlineFootnoteDefinitions(restored)))
    )
  )

  // A source line can contain more than one collapsed table.
  for (let pass = 0; pass < 6 && restored.includes('---|'); pass += 1) {
    const next = restored
      .split('\n')
      .flatMap(line => restoreCollapsedTable(line).split('\n'))
      .join('\n')
    if (next === restored) break
    restored = next
  }

  restored = normalizeTableShapes(expandCollapsedTableBodies(restored))

  const output: string[] = []
  let inFence = false

  for (const line of restored.split('\n')) {
    const trimmed = line.trim()
    if (/^(?:```|~~~)/.test(trimmed)) inFence = !inFence

    const previous = output.at(-1)?.trim() ?? ''
    const proseFollowsProse =
      !inFence &&
      trimmed.length > 0 &&
      previous.length > 0 &&
      !BLOCK_LINE.test(trimmed) &&
      !BLOCK_LINE.test(previous) &&
      !isTableLine(trimmed) &&
      !isTableLine(previous)

    if (proseFollowsProse) output.push('')
    output.push(line)
  }

  return removeDanglingFootnoteReferences(
    repairOrphanParagraphs(output.join('\n').replace(/\n{3,}/g, '\n\n'))
  ).trim()
}

export const normalizeLetterMarkdown = normalizeImportedMarkdown
