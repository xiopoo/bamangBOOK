#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const QA_DIR = path.join(ROOT, 'content', 'qa')
const WRITE = process.argv.includes('--write')
const previewArgument = process.argv.find((arg) => arg.startsWith('--preview-dir='))
const PREVIEW_DIR = previewArgument
  ? path.resolve(ROOT, previewArgument.slice('--preview-dir='.length))
  : null
const requestedYears = process.argv
  .filter((arg) => /^\d{4}$/.test(arg))
  .map(Number)
const years = requestedYears.length
  ? requestedYears
  : Array.from({ length: 13 }, (_, index) => 1994 + index)

const SPEAKER = '(?:巴菲特|芒格|股东|提问者|主持人|观众|记者|女股东|男股东|克里斯汀·什拉姆|戈特斯曼)'

function canonical(value) {
  return value
    .normalize('NFKC')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

function countMatches(value, expression) {
  return [...value.matchAll(expression)].length
}

function repairExistingHeadings(value) {
  const lines = value.split('\n')
  const output = []

  for (let index = 0; index < lines.length; index += 1) {
    let line = lines[index]
    const heading = line.match(/^(#{2,4})\s+(\d{1,3}[、，])(.*)$/)
    if (!heading) {
      output.push(line)
      continue
    }

    const [, , number, rawTitle] = heading
    let title = rawTitle.trim()

    // Some imported files put all or part of the title in the next paragraph.
    let continuationIndex = index + 1
    while (continuationIndex < lines.length && !lines[continuationIndex].trim()) {
      continuationIndex += 1
    }
    const continuation = lines[continuationIndex]?.trim() || ''
    const titleContinues = continuation &&
      !continuation.startsWith('#') &&
      !new RegExp(`^${SPEAKER}[：:]`).test(continuation) &&
      ((!title && canonical(continuation).length < 60) ||
        (canonical(title).length < 25 && new RegExp(`${SPEAKER}[：:]`).test(continuation)) ||
        (/(?:股东|提问者)$/.test(continuation) &&
          (/[·、，：:（(]$/.test(title) || canonical(title).length < 25)))
    if (titleContinues) {
      title = `${title}${continuation}`
      index = continuationIndex
    }

    let trailing = ''
    const speakerLabels = [...title.matchAll(new RegExp(`${SPEAKER}[：:]`, 'gu'))]
      .filter((match) => match.index > 4 && title.length - match.index - match[0].length > 15)
    const lastSpeaker = speakerLabels.at(-1)
    if (lastSpeaker) {
      const splitAt = lastSpeaker.index
      trailing = title.slice(splitAt).trim()
      title = title.slice(0, splitAt).trim()
    } else {
      const fusedQuestion = title.match(/^(.*?)(股东|提问者)(?=(?:大家好|考虑到|我叫|早上好|下午好|你好|您好|嗨|首先|我的))(.+)$/)
      if (fusedQuestion && fusedQuestion[1].trim()) {
        title = fusedQuestion[1].trim()
        trailing = `${fusedQuestion[2]}：${fusedQuestion[3].trim()}`
      }

      // A common conversion artifact is "标题股东" followed by the question body.
      const bareShareholder = !trailing && title.match(/^(.*\S)(股东|提问者)$/)
      if (bareShareholder && bareShareholder[1].trim() && !/^(?:股东|提问者)[：:]/.test(continuation)) {
        title = bareShareholder[1].trim()
        trailing = `${bareShareholder[2]}：`
      }
    }

    line = `## ${number.replace('，', '、')}${title}`
    output.push(line)
    if (trailing) output.push('', trailing)
  }

  return output.join('\n')
}

function promoteInlineQuestions(value) {
  // Only promote a number when a speaker label follows shortly afterwards. This
  // avoids turning ordinary numbered examples and financial figures into headings.
  const expression = /(^|[。！？!?）)](?:…)?\s*)(?:问题\s*)?(\d{1,3})[、，：]\s*([^\n]{2,100}?)(?=[\p{L}·. ]{1,24}[：:])/gmu

  let result = value.replace(expression, (match, boundary, number, title) => {
    const cleanTitle = title.trim().replace(/[：:]$/, '').trim()
    if (!cleanTitle) return match
    return `${boundary.trimEnd()}\n\n## ${number}、${cleanTitle}\n\n`
  })

  // A few question titles end at a line break and have no named speaker below.
  result = result.replace(
    /([。！？!?）)])\s*(\d{1,3})[、，]\s*([^\n]{3,80}[？?])$/gmu,
    (_match, boundary, number, title) => `${boundary}\n\n## ${number}、${title.trim()}`
  )

  return result
}

function splitSpeakerTurns(value) {
  const expression = new RegExp(`([^\\n])\\s*(?=(${SPEAKER})[：:])`, 'gu')
  return value.replace(expression, (match, previous, _speaker, offset, source) => {
    const before = source.slice(Math.max(0, offset - 12), offset + 1)
    // Do not split prose such as “他问巴菲特：” unless the preceding text closes
    // a sentence, stage direction, quotation, or another complete speaker turn.
    if (!/[。！？!?）)””’…]$/.test(previous) && !/\(笑声[^)]*\)$/.test(before)) {
      return match
    }
    return `${previous}\n\n`
  })
}

function normalizeSpacing(value) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()
    .concat('\n')
}

function refine(value) {
  let result = normalizeSpacing(value)
  result = repairExistingHeadings(result)
  result = promoteInlineQuestions(result)
  result = splitSpeakerTurns(result)
  return normalizeSpacing(result)
}

let changed = 0
let failed = 0

for (const year of years) {
  const filePath = path.join(QA_DIR, `伯克希尔股东大会实录_${year}.md`)
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP ${year}: file not found`)
    continue
  }

  const before = fs.readFileSync(filePath, 'utf8')
  const after = refine(before)
  const beforeText = canonical(before)
  const afterText = canonical(after)
  const beforeHeadings = countMatches(before, /^#{2,4}\s+\S/gm)
  const afterHeadings = countMatches(after, /^#{2,4}\s+\S/gm)
  const beforeParagraphs = before.split(/\n\s*\n+/).filter(Boolean).length
  const afterParagraphs = after.split(/\n\s*\n+/).filter(Boolean).length

  if (beforeText !== afterText) {
    failed += 1
    console.error(`FAIL ${year}: normalized text changed`)
    continue
  }

  if (before !== after) {
    changed += 1
    if (WRITE) fs.writeFileSync(filePath, after)
    if (PREVIEW_DIR) {
      fs.mkdirSync(PREVIEW_DIR, { recursive: true })
      fs.writeFileSync(path.join(PREVIEW_DIR, path.basename(filePath)), after)
    }
  }

  console.log(
    `${WRITE ? 'WRITE' : 'DRY'} ${year}: headings ${beforeHeadings}->${afterHeadings}, ` +
    `paragraphs ${beforeParagraphs}->${afterParagraphs}`
  )
}

if (failed) process.exitCode = 1
console.log(`${WRITE ? 'Updated' : 'Would update'} ${changed} file(s); ${failed} failed text-integrity checks.`)
