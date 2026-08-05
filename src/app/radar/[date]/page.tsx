import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { getReport, listReports, RADAR_SECTION_META, type RadarItem } from '@/lib/radar'

// 静态导出（output: export）模式下，动态段必须有 generateStaticParams。
// 构建环境（Vercel/CI）不保证存在雷达数据库，也不保证 python3 可用，
// 此时返回空列表避免外部进程调用失败导致 Next 判定其为缺失而中断构建。
// 本地构建/预览时读取真实数据生成对应日期的静态页。
export const dynamicParams = false

export function generateStaticParams() {
  if (process.env.VERCEL || process.env.CI) return []
  try {
    const data = listReports(120)
    return Object.keys(data.by_date).map(date => ({ date }))
  } catch {
    return []
  }
}

export function generateMetadata({ params }: { params: { date: string } }) {
  return {
    title: `信息日报 ${params.date} · 股市雷达 · fulilab 复利书房`,
    description: `股市雷达 ${params.date} 信息日报：重点信号、机会线索与风险预警。`,
  }
}

const SESSION_LABEL: Record<string, string> = {
  morning: '晨报',
  noon: '午报',
  night: '夜报',
}

function sessionName(session: string | null) {
  return session ? (SESSION_LABEL[session] ?? session) : ''
}

function ItemCard({ item, i }: { item: RadarItem; i: number }) {
  return (
    <li key={item.item_key ?? `${item.title}-${i}`} className="radar-item">
      <div className="radar-item__meta">
        {typeof item.score === 'number' && <span className="radar-score">{item.score}</span>}
        {item.company_name && <span className="radar-tag radar-tag--company">{item.company_name}</span>}
        {item.source_name && <span className="radar-tag">{item.source_name}</span>}
        {item.published_at && <span className="radar-item__time">{item.published_at.slice(0, 16)}</span>}
      </div>
      <h3 className="radar-item__title">
        {item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
        ) : (
          item.title
        )}
      </h3>
      {item.summary_cn && <p className="radar-item__summary">{item.summary_cn}</p>}
      {item.reason && <p className="radar-item__reason">{item.reason}</p>}
    </li>
  )
}

function SectionBlock({ label, hint, items }: { label: string; hint: string; items: RadarItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <section className="radar-section">
      <div className="radar-section__head">
        <h2>{label}</h2>
        <span className="radar-section__hint">{hint}</span>
        <span className="radar-section__count">{items.length}</span>
      </div>
      <ul className="radar-items">
        {items.map((item, i) => <ItemCard key={item.item_key ?? `${item.title}-${i}`} item={item} i={i} />)}
      </ul>
    </section>
  )
}

export default function RadarDetailPage({ params }: { params: { date: string } }) {
  const date = params.date
  const all = listReports(120)
  const sessions = all.by_date[date] ?? []

  return (
    <PageContainer>
      <PageHeader
        title={`信息日报 ${date}`}
        subtitle={`股市雷达 · 共 ${sessions.length} 场`}
      />

      {sessions.length === 0 && (
        <div className="radar-empty">
          <p>未找到 {date} 的日报。</p>
          <Link href="/radar" className="radar-back">← 返回信息日报列表</Link>
        </div>
      )}

      {sessions.length > 1 && (
        <div className="radar-sessions">
          {sessions.map(s => (
            <a key={s.session} href={`#s-${s.session}`} className="radar-chip">{sessionName(s.session)}</a>
          ))}
          <Link href="/radar" className="radar-back">← 列表</Link>
        </div>
      )}

      {sessions.map(s => {
        const report = getReport(date, s.session)
        if (!report.found) return null
        return (
          <article key={s.session} id={`s-${s.session}`} className="radar-session-block">
            <div className="radar-session-title">
              <h2>{sessionName(report.session)}</h2>
              {report.engine && <span className="radar-section__hint">引擎 {report.engine}</span>}
            </div>
            {report.overview && <p className="radar-intro">{report.overview}</p>}
            {report.stats && (report.stats.total || report.stats.kept) && (
              <p className="radar-stats">
                本场共处理 <strong>{report.stats.total ?? 0}</strong> 条，保留 <strong>{report.stats.kept ?? 0}</strong> 条进入日报
              </p>
            )}
            <div className="radar-sections">
              {RADAR_SECTION_META.map(sec => (
                <SectionBlock key={sec.key} label={sec.label} hint={sec.hint} items={report.sections[sec.key] ?? []} />
              ))}
            </div>
          </article>
        )
      })}
    </PageContainer>
  )
}
