import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = path.resolve(import.meta.dirname, '..')
const buildDir = path.join(root, 'build_books')
const archiveDir = path.join(buildDir, '_archive')
const workDir = path.join(root, 'tmp', 'pdfs', 'original-compendia')

const books = [
  {
    key: 'buffett',
    output: path.join(buildDir, 'buffett_body.typ'),
    archive: path.join(archiveDir, 'buffett_body_editorial_2026-08-08.typ'),
    sections: [
      { title: '第一编　巴菲特合伙人信', directory: 'content/partnership' },
      { title: '第二编　伯克希尔致股东信', directory: 'content/letters' },
    ],
  },
  {
    key: 'munger',
    output: path.join(buildDir, 'munger_body.typ'),
    archive: path.join(archiveDir, 'munger_body_editorial_2026-08-08.typ'),
    repairPdfText: true,
    sections: [
      { title: '第一编　Wesco Financial 致股东信', directory: 'content/munger-originals' },
    ],
  },
]

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function markdownFiles(directory) {
  const absolute = path.join(root, directory)
  return fs.readdirSync(absolute, { withFileTypes: true })
    .flatMap((entry) => {
      const item = path.join(absolute, entry.name)
      if (entry.isDirectory()) return markdownFiles(path.relative(root, item))
      return entry.name.endsWith('.md') ? [item] : []
    })
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }))
}

function prefixFootnotes(content, prefix) {
  return content.replace(/\[\^([^\]]+)\]/g, (_, id) => `[^${prefix}-${id}]`)
}

function repairPdfExtraction(content) {
  return content
    .replace(/[Ïìí]+/g, ' ')
    .replaceAll('Ñ', 'fi')
    .replaceAll('Å', 'ff')
    .replaceAll('Ö', 'fl')
    .replaceAll('Ç', 'ffi')
    .replaceAll('\u0084', 'fi')
    .replaceAll('\u0082', 'ffi')
    .replaceAll('\u0081', 'ff')
    .replaceAll('\u0085', 'fl')
    .replaceAll('Ì', '-')
    .replaceAll('®', '“')
    .replaceAll('©', '”')
    .replaceAll('""', '“')
    .replaceAll("''", '”')
}

function normalizeSource(content, prefix, repairText = false) {
  const repaired = repairText
    ? repairPdfExtraction(content).replace(/^> Source:.*\n?/gm, '')
    : content
  let firstHeadingRemoved = false
  return prefixFootnotes(repaired, prefix)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^!\[[^\]]*\]\([^\n]+\)\s*$/gm, '')
    .split('\n')
    .map((line) => {
      const heading = line.match(/^(#{1,6})\s+(.+)$/)
      if (!heading) return line
      if (!firstHeadingRemoved && heading[1].length === 1) {
        firstHeadingRemoved = true
        return ''
      }
      const level = Math.min(6, heading[1].length + 2)
      return `${'#'.repeat(level)} ${heading[2]}`
    })
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}

function titleFor(file, data) {
  if (typeof data.title === 'string' && data.title.trim()) return data.title.trim()
  return path.basename(file, '.md')
    .replace(/^(berkshire_|partnership_)/, '')
    .replaceAll('_', ' ')
}

function buildMarkdown(book) {
  const parts = []
  const sources = []
  for (const section of book.sections) {
    parts.push(`# ${section.title}`)
    for (const file of markdownFiles(section.directory)) {
      const raw = fs.readFileSync(file, 'utf8')
      const parsed = matter(raw)
      const prefix = `${book.key}-${sources.length + 1}`
      const body = normalizeSource(parsed.content, prefix, book.repairPdfText)
      parts.push(`## ${titleFor(file, parsed.data)}`)
      if (body) parts.push(body)
      sources.push({
        order: sources.length + 1,
        file: path.relative(root, file),
        sha256: sha256(raw),
        bytes: Buffer.byteLength(raw),
      })
    }
  }
  return { markdown: `${parts.join('\n\n')}\n`, sources }
}

function archiveExisting(book) {
  fs.mkdirSync(archiveDir, { recursive: true })
  if (!fs.existsSync(book.archive)) fs.copyFileSync(book.output, book.archive)
}

function assertPureBody(file) {
  const body = fs.readFileSync(file, 'utf8')
  const banned = ['part_lead', 'endnote_mark', 'endnote_entries']
  const found = banned.filter((token) => body.includes(token))
  if (found.length) throw new Error(`${file} 仍含编者框架：${found.join(', ')}`)
}

fs.mkdirSync(workDir, { recursive: true })
const manifest = { generatedAt: new Date().toISOString(), books: {} }

for (const book of books) {
  archiveExisting(book)
  const { markdown, sources } = buildMarkdown(book)
  const markdownFile = path.join(workDir, `${book.key}.md`)
  fs.writeFileSync(markdownFile, markdown)
  execFileSync('pandoc', [markdownFile, '-f', 'gfm', '-t', 'typst', '-o', book.output], { stdio: 'inherit' })
  assertPureBody(book.output)
  manifest.books[book.key] = {
    output: path.relative(root, book.output),
    outputSha256: sha256(fs.readFileSync(book.output)),
    sourceCount: sources.length,
    sources,
  }
  console.log(`${book.key}: ${sources.length} 份原始材料 -> ${path.relative(root, book.output)}`)
}

fs.writeFileSync(path.join(buildDir, 'originals_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
