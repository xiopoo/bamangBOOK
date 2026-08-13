import { readdirSync, readFileSync, existsSync } from 'fs'
import path from 'path'

export interface BuffettFaqTopic {
  slug: string
  title: string
  label: string
  questionCount: number
  yearRange: string
  wordCount: number
  summary: string
}

const FAQ_DIR = path.join(process.cwd(), 'content/buffettfaq')

/** 主题中文名（buffettfaq.com 目录顺序），用于归档页与详情页副标题 */
const TOPIC_LABELS: Record<string, string> = {
  investing: '投资方法',
  valuation: '估值',
  businesses: '如何思考生意',
  alternatives: '普通股之外的选择',
  accounting: '会计、公司金融与投资',
  foreign: '海外投资',
  invindustry: '投资行业',
  industries: '行业',
  specific: '具体企业',
  berkshire: '伯克希尔',
  market: '市场',
  management: '管理层',
  technology: '科技',
  education: '教育',
  personal: '个人',
  advice: '建议',
  picture: '宏观图景',
  buffettfaq: '全部问答（总目录）',
}

let cache: BuffettFaqTopic[] | null = null

function loadTopics(): BuffettFaqTopic[] {
  if (cache) return cache
  const files = existsSync(FAQ_DIR) ? readdirSync(FAQ_DIR).filter(f => f.endsWith('.md')) : []
  cache = files
    .map(file => {
      const raw = readFileSync(path.join(FAQ_DIR, file), 'utf8')
      const slug = file.replace(/\.md$/, '')
      const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() || slug
      const body = raw.replace(/^#\s+.+\n+/, '').trim()
      const years = [...raw.matchAll(/Time:\s*(\d{4})/g)]
        .map(m => Number(m[1]))
        .filter(y => y >= 1950)
      const uniqueYears = [...new Set(years)].sort((a, b) => a - b)
      // 各主题以 ## 分节；总目录页（buffettfaq.md）内嵌全部问答，以 ### 分条
      const questionCount = (body.match(slug === 'buffettfaq' ? /^###\s+/gm : /^##\s+/gm) || []).length
      const wordCount = body.split(/\s+/).filter(Boolean).length
      const firstProse = body
        .split(/\n+/)
        .map(l => l.trim())
        .find(l => l.length > 40 && !l.startsWith('>'))
      return {
        slug,
        title,
        label: TOPIC_LABELS[slug] || '主题问答',
        questionCount,
        yearRange: uniqueYears.length ? `${uniqueYears[0]}–${uniqueYears[uniqueYears.length - 1]}` : '',
        wordCount,
        summary: firstProse ? firstProse.slice(0, 140) : '',
      }
    })
    .sort((a, b) => b.questionCount - a.questionCount)
  return cache
}

export function getAllBuffettFaqTopics(): BuffettFaqTopic[] {
  return loadTopics()
}

export function getBuffettFaqTopic(slug: string): { topic: BuffettFaqTopic; content: string } | null {
  const topic = loadTopics().find(t => t.slug === slug)
  if (!topic) return null
  const raw = readFileSync(path.join(FAQ_DIR, `${slug}.md`), 'utf8')
  return { topic, content: stripBuffettFaqMetadata(raw) }
}

/** 去掉 H1 与顶部「来源」注记行，保留各节问答及每条的出处注记 */
export function stripBuffettFaqMetadata(markdown: string): string {
  return markdown
    .replace(/^#\s+.+\n+/, '')
    .replace(/^>\s*来源：https:\/\/buffettfaq\.com\/.*\n+/, '')
    .replace(/^---\s*\n+/m, '')
    .trim()
}
