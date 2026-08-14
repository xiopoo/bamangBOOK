import type { ReadingCompleteness, ReadingContentStatus, ReadingContentType } from '@/lib/reading-content'

export interface ReadingMetadataProps {
  person?: string
  year?: number | string
  contentType: ReadingContentType
  sourceLabel?: string
  sourceUrl?: string
  status?: ReadingContentStatus
  completeness?: ReadingCompleteness
  reviewedAt?: string
  readMinutes?: number
}

/**
 * 阅读元数据：主行只显示必要信息（人物/年份/类型/时长），
 * 来源、内容状态、完整度、修订时间等编辑性信息默认折叠，
 * 需要查证时点击展开，不打断阅读。
 */
export default function ReadingMetadata({ person, year, contentType, sourceLabel, sourceUrl, status = '编辑整理', completeness, reviewedAt, readMinutes }: ReadingMetadataProps) {
  const secondary = [
    sourceLabel ? (sourceUrl ? <a href={sourceUrl} key="source" target="_blank" rel="noopener noreferrer">{sourceLabel} ↗</a> : <span key="source">{sourceLabel}</span>) : null,
    status && status !== '编辑整理' ? <span className="reading-status" key="status">内容状态 · {status}</span> : null,
    completeness && completeness !== '未知' ? <span key="completeness">完整度 · {completeness}</span> : null,
    reviewedAt ? <span key="reviewed">最近修订 · {reviewedAt}</span> : null,
  ].filter(Boolean)

  return (
    <div className="reading-metadata" aria-label="阅读资料信息">
      <div className="reading-metadata__primary">
        {[person, year, contentType, readMinutes ? `${readMinutes} 分钟` : null].filter(Boolean).map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
      {secondary.length > 0 && (
        <details className="reading-metadata__details">
          <summary>来源与版本说明</summary>
          <div className="reading-metadata__secondary">{secondary}</div>
        </details>
      )}
    </div>
  )
}
