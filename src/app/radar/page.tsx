import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { listReports } from '@/lib/radar'

export const metadata = {
  title: '信息日报 · 股市雷达 · fulilab 复利书房',
  description: '由股市雷达聚合的每日市场信息日报：跨来源信号、机会线索与风险预警。',
}

const SESSION_LABEL: Record<string, string> = {
  morning: '晨报',
  noon: '午报',
  night: '夜报',
}

export default function RadarPage() {
  const data = listReports(120)
  const dates = Object.keys(data.by_date).sort((a, b) => (a < b ? 1 : -1))

  return (
    <PageContainer>
      <PageHeader
        title="信息日报"
        subtitle="股市雷达"
      />
      <p className="radar-intro">
        股市雷达自动聚合多个信息来源，按每日晨、午、夜三场生成信息日报：跨来源共振的重点信号、机会线索与风险预警。下方按日期排列，点击进入当日完整日报。
      </p>

      <div className="radar-list">
        {dates.length === 0 && (
          <div className="radar-empty">
            <p>还没有生成任何日报。</p>
            <p className="radar-empty__hint">
              在 <code>stock-radar</code> 目录运行采集与生成流程后，日报会出现在这里。
            </p>
          </div>
        )}

        {dates.map(date => {
          const sessions = data.by_date[date]
          const primary = sessions[0]
          return (
            <article key={date} className="radar-day">
              <div className="radar-day__head">
                <Link href={`/radar/${date}`} className="radar-day__date">
                  {date}
                </Link>
                <div className="radar-day__sessions">
                  {sessions.map(s => (
                    <Link
                      key={s.session}
                      href={`/radar/${date}#s-${s.session}`}
                      className="radar-chip"
                    >
                      {SESSION_LABEL[s.session] ?? s.session}
                    </Link>
                  ))}
                </div>
              </div>
              <p className="radar-day__overview">{primary.overview || '（无概览）'}</p>
            </article>
          )
        })}
      </div>
    </PageContainer>
  )
}
