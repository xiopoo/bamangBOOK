import { execFileSync } from 'node:child_process'
import path from 'node:path'

export interface RadarItem {
  score: number
  kind?: string
  company_name?: string
  company_code?: string
  source_name?: string
  title: string
  url?: string
  summary_cn?: string
  reason?: string
  published_at?: string
  item_key?: string
}

export interface RadarListDate {
  report_date: string
  session: string
  generated_at?: string
  engine?: string
  overview: string
}

export interface RadarList {
  ok: boolean
  dates: RadarListDate[]
  by_date: Record<string, RadarListDate[]>
}

export interface RadarDetail {
  ok: boolean
  found: boolean
  report_date: string
  session: string | null
  session_label?: string
  engine?: string
  generated_at?: string
  overview: string
  stats: { total?: number; kept?: number }
  sections: Record<string, RadarItem[]>
}

const REPO_ROOT = path.resolve(process.cwd())
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'read_radar.py')

function runReadRadar(args: string[]): any {
  try {
    const out = execFileSync('python3', [SCRIPT, ...args], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
    return JSON.parse(out)
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}

export function listReports(limit = 90): RadarList {
  const result = runReadRadar(['list', String(limit)])
  return (result.ok ? result : { ok: false, dates: [], by_date: {} }) as RadarList
}

export function getReport(date: string, session?: string): RadarDetail {
  const args = session ? ['detail', date, session] : ['detail', date]
  const result = runReadRadar(args)
  return (result.ok ? result : { ok: false, found: false, report_date: date, session: session ?? null, overview: '', stats: {}, sections: {} }) as RadarDetail
}

export const RADAR_SECTION_META: { key: string; label: string; hint: string }[] = [
  { key: 'highlights', label: '重点信号', hint: '跨系统共振，值得重点关注' },
  { key: 'opportunities', label: '机会线索', hint: '潜在买入与价值重估' },
  { key: 'risks', label: '风险预警', hint: '下行与利空因素' },
  { key: 'others', label: '其他值得关注', hint: '补充观察项' },
]
