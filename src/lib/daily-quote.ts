import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type DailyQuoteSpeaker = 'buffett' | 'munger'

export interface DailyQuote {
  /** 稳定唯一 id：speaker + 来源文件 + 序号 */
  id: string
  speaker: DailyQuoteSpeaker
  quote: string
  /** 主题标签（中文），如“能力圈”“护城河” */
  topic: string
  /** 出处描述，如 “1996 annual letter” */
  source: string
  year: number | null
  /** 核实状态：as recalled / attributed / verification */
  status: string | null
  /** 跳转原文的站内链接 */
  href: string
}

const MUNGER_QUOTES_DIR = path.join(process.cwd(), 'content/munger-archive/quotes')
const BUFFETT_QUOTES_DIR = path.join(process.cwd(), 'content/buffett-quotes')

const SPEAKER_NAMES: Record<DailyQuoteSpeaker, string> = {
  buffett: '沃伦·巴菲特',
  munger: '查理·芒格',
}

const STATUS_LABELS: Record<string, string> = {
  'as recalled': '据回忆整理',
  attributed: '归属待核实',
  verification: '待核实',
}

const QUOTE_OPENERS = ['“', '"', '”']
const QUOTE_CLOSERS = ['”', '"', '“']

/** 按空行切块；返回去空行后的块数组 */
function splitBlocks(content: string): string[] {
  return content
    .split(/\n\s*\n+/)
    .map(block => block.trim())
    .filter(Boolean)
}

function isQuoteBlock(block: string): boolean {
  const text = block.trim()
  if (!QUOTE_OPENERS.some(open => text.startsWith(open))) return false
  return QUOTE_CLOSERS.some(close => text.endsWith(close))
}

function stripQuotes(text: string): string {
  let t = text.trim()
  for (const open of QUOTE_OPENERS) {
    if (t.startsWith(open)) {
      t = t.slice(open.length)
      break
    }
  }
  for (const close of QUOTE_CLOSERS) {
    if (t.endsWith(close)) {
      t = t.slice(0, -close.length)
      break
    }
  }
  return t.trim()
}

interface ParsedSourceLine {
  source: string
  year: number | null
  status: string | null
}

/** 解析出处行：`来源 · 年份 · 状态[ · 说明 ↗](链接)` 的各种变体 */
function parseSourceLine(line: string): ParsedSourceLine {
  const text = line.replace(/\[[^\]]*\]\(https?:\/\/[^\s)]+\)/g, '').trim()
  const yearMatch = text.match(/(?:19|20)\d{2}/)
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null

  const lower = text.toLowerCase()
  let status: string | null = null
  if (lower.includes('as recalled')) status = 'as recalled'
  else if (lower.includes('attributed')) status = 'attributed'
  else if (lower.includes('verification')) status = 'verification'

  const source = text
    .replace(/\s*·\s*(?:19|20)\d{2}\s*/g, ' · ')
    .replace(/\s*·\s*as recalled/gi, '')
    .replace(/\s*·\s*attributed/gi, '')
    .replace(/\s*·\s*verification/gi, '')
    .replace(/\s*·\s*$/, '')
    .replace(/^\s*·\s*/, '')
    .trim()

  return { source, year, status }
}

/** 从 frontmatter title 提取主题词：去掉“芒格谈/论”“巴菲特谈/论”前缀 */
function topicFromTitle(title: string, speaker: DailyQuoteSpeaker): string {
  const prefix = speaker === 'munger' ? /^芒格[谈论]\s*/ : /^巴菲特[谈论]\s*/
  return title.replace(prefix, '').trim() || title.trim()
}

/** 解析一个语录块对：引文块（第一行引文），紧随其后的非引文块为出处行 */
function parseQuotePair(
  quoteBlock: string,
  sourceBlock: string,
  speaker: DailyQuoteSpeaker,
  fileSlug: string,
  index: number,
): DailyQuote | null {
  const quote = stripQuotes(quoteBlock)
  if (!quote) return null

  const parsed = parseSourceLine(sourceBlock)
  const year = parsed.year
  const href = speaker === 'buffett'
    ? (year ? `/letters/${year}` : '/letters')
    : `/munger/archive/quotes/${fileSlug}`

  return {
    id: `${speaker}-${fileSlug}-${index}`,
    speaker,
    quote,
    topic: '',
    source: parsed.source || '出处不详',
    year,
    status: parsed.status,
    href,
  }
}

function readQuoteFiles(dir: string, speaker: DailyQuoteSpeaker): DailyQuote[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .sort()
    .flatMap(file => {
      const raw = readFileSync(path.join(dir, file), 'utf-8')
      const { data, content } = matter(raw)
      const fileSlug = file.replace(/\.md$/, '')
      const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : fileSlug
      const topic = topicFromTitle(title, speaker)

      const blocks = splitBlocks(content)
      const quotes: DailyQuote[] = []
      let quoteIndex = 0
      for (let i = 0; i < blocks.length; i++) {
        if (!isQuoteBlock(blocks[i])) continue
        const sourceBlock = i + 1 < blocks.length && !isQuoteBlock(blocks[i + 1]) ? blocks[i + 1] : ''
        const quote = parseQuotePair(blocks[i], sourceBlock, speaker, fileSlug, quoteIndex)
        if (quote) {
          quotes.push({ ...quote, topic })
          quoteIndex++
        }
      }
      return quotes
    })
}

/** 全部每日一读语录：芒格主题库 + 巴菲特精选库 */
export function getAllDailyQuotes(): DailyQuote[] {
  return [
    ...readQuoteFiles(MUNGER_QUOTES_DIR, 'munger'),
    ...readQuoteFiles(BUFFETT_QUOTES_DIR, 'buffett'),
  ]
}

/** 以日期为 seed 的确定性索引：每天固定一条，次日顺移一位 */
export function dailyQuoteIndexForDate(quotes: DailyQuote[], date: Date): number {
  if (quotes.length === 0) return 0
  const days = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  return ((days % quotes.length) + quotes.length) % quotes.length
}

export function formatSpeaker(speaker: DailyQuoteSpeaker): string {
  return SPEAKER_NAMES[speaker]
}

export function formatStatus(status: string | null): string | null {
  return status ? STATUS_LABELS[status] ?? null : null
}
