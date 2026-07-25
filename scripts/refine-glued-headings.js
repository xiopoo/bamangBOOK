#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'content')
const WRITE = process.argv.includes('--write')
const TARGET_SECTIONS = new Set(['articles', 'interviews', 'qa', 'talks'])
const SPEAKER_PATTERN = /(?:股东问|股东|听众|学生|提问者|提问|主持人|观众|记者|巴菲特|芒格|李录|Becky|BECKY|Carol\s*Loomis)[：:]/u
const CONCATENATED_SPEAKER_PATTERN = /(?:Becky|BECKY|Carol\s*Loomis|Jonathan\s*Brandt)(?=[\p{L}“"：:])/u

function isRefinedAnnualMeeting(filePath) {
  const match = path.basename(filePath).match(/^伯克希尔股东大会实录_(\d{4})\.md$/)
  if (!match) return false
  const year = Number(match[1])
  return year >= 1994 && year <= 2006
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(filePath) : [filePath]
  })
}

function isBodyLike(text) {
  const containsSpeaker = SPEAKER_PATTERN.test(text) || CONCATENATED_SPEAKER_PATTERN.test(text)
  const sentenceMarks = text.match(/[。！？!?]/g)?.length || 0
  const containsAnotherNumber = /[。！？!?；;]\s*\d{1,3}[，、]/u.test(text)
  if (text.length >= 35 && (containsSpeaker || sentenceMarks >= 1)) return true
  if (text.length < 45) return false

  return containsSpeaker ||
    containsAnotherNumber || sentenceMarks >= 2 || text.length >= 65
}

function splitHeadingBody(number, text, section) {
  const topicPrefix = text.match(
    /^(关于.{2,20}?)(?=(?:股东问|股东|听众|学生|提问者|提问|主持人|观众|记者|巴菲特|芒格|伯克希尔|我们|我|您|沃伦|会计|有人|这是|当下|等待|总的来说|嗯|找不到|\d{1,2}:))/u
  )
  if (topicPrefix) {
    return {
      heading: `${number}、${topicPrefix[1]}`,
      body: text.slice(topicPrefix[1].length).trim(),
      mode: 'topic-prefix',
    }
  }

  const speaker = text.match(SPEAKER_PATTERN) || text.match(CONCATENATED_SPEAKER_PATTERN)
  if (speaker && speaker.index > 1 && speaker.index <= 42) {
    const topic = text.slice(0, speaker.index).trim().replace(/[：:，,。；;]+$/u, '')
    if (topic && !/[。！？!?]/u.test(topic)) {
      return {
        heading: `${number}、${topic}`,
        body: text.slice(speaker.index).trim(),
        mode: 'topic',
      }
    }
  }

  const firstSentence = text.match(/^(.{4,32}?[！？?。])(.{15,})$/u)
  if (firstSentence && !/^(?:股东问|股东|听众|学生|提问者|主持人|观众|记者)[：:]/u.test(text)) {
    return {
      heading: `${number}、${firstSentence[1].trim()}`,
      body: firstSentence[2].trim(),
      mode: 'sentence',
    }
  }

  const questionLike = section === 'qa' || section === 'interviews' ||
    /[？?]|^(?:股东问|股东|听众|学生|提问者|主持人|观众|记者)[：:]/u.test(text)
  return {
    heading: questionLike ? `${number}、问题` : `第 ${number} 条`,
    body: text,
    mode: 'generic',
  }
}

function refineFile(filePath, section) {
  const before = fs.readFileSync(filePath, 'utf8')
  const lines = before.split(/\r?\n/)
  const output = []
  const changes = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const generatedQuestion = line.match(/^(#{2,6})\s+问题\s+(\d{1,3})$/u)
    if (generatedQuestion) {
      output.push(`${generatedQuestion[1]} ${generatedQuestion[2]}、问题`)
      changes.push({
        line: index + 1,
        mode: 'question-label',
        before: line,
        after: `${generatedQuestion[2]}、问题`,
      })
      continue
    }

    const match = line.match(/^(#{2,6})\s+(\d{1,3})\s*[，、.:：]\s*(.+)$/u)

    if (!match) {
      output.push(line)
      continue
    }

    const [, hashes, number, rawText] = match
    const text = rawText.trim()
    if (!isBodyLike(text)) {
      output.push(line)
      continue
    }

    const split = splitHeadingBody(number, text, section)
    output.push(`${hashes} ${split.heading}`, '', split.body)
    changes.push({
      line: index + 1,
      mode: split.mode,
      before: `${number}、${text}`,
      after: split.heading,
    })
  }

  const after = output.join('\n')
  if (WRITE && changes.length) fs.writeFileSync(filePath, after)
  return { before, after, changes }
}

const results = []
for (const section of TARGET_SECTIONS) {
  const directory = path.join(CONTENT_DIR, section)
  for (const filePath of walk(directory)) {
    if (!filePath.endsWith('.md') || isRefinedAnnualMeeting(filePath)) continue
    const result = refineFile(filePath, section)
    if (result.changes.length) results.push({ filePath, ...result })
  }
}

const total = results.reduce((sum, result) => sum + result.changes.length, 0)
for (const result of results) {
  console.log(`${WRITE ? 'WRITE' : 'DRY'} ${path.relative(ROOT, result.filePath)}: ${result.changes.length}`)
  for (const change of result.changes) {
    console.log(`  L${change.line} [${change.mode}] ${change.after}`)
  }
}

console.log(`${WRITE ? 'Updated' : 'Would update'} ${total} headings in ${results.length} files.`)

const invalidHeadings = []
for (const filePath of walk(CONTENT_DIR)) {
  if (!filePath.endsWith('.md')) continue
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const heading = line.match(/^#{1,6}\s+(.+)$/u)
    const title = index < 12 ? line.match(/^title:\s*["']?(.*?)["']?\s*$/u) : null
    if (/^#{1,6}\s*$/u.test(line)) {
      invalidHeadings.push(`${path.relative(ROOT, filePath)}:${index + 1} empty heading`)
    }
    if (heading && heading[1].replace(/\*\*/gu, '').trim().length > 45) {
      invalidHeadings.push(`${path.relative(ROOT, filePath)}:${index + 1} heading exceeds 45 characters`)
    }
    if (title && title[1].length > 45) {
      invalidHeadings.push(`${path.relative(ROOT, filePath)}:${index + 1} title exceeds 45 characters`)
    }
  }
}

if (invalidHeadings.length) {
  for (const issue of invalidHeadings) console.error(`FAIL ${issue}`)
  process.exitCode = 1
} else {
  console.log('PASS heading limits: no empty headings or titles over 45 characters.')
}
