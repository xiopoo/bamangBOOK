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

export default function ReadingMetadata({ person, year, contentType, sourceLabel, sourceUrl, status = '编辑整理', completeness, reviewedAt, readMinutes }: ReadingMetadataProps) {
  return <div className="reading-metadata" aria-label="阅读资料信息">
    <div className="reading-metadata__primary">{[person, year, contentType, readMinutes ? `${readMinutes} 分钟` : null].filter(Boolean).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
    <div className="reading-metadata__secondary">{sourceLabel && <span>来源 · {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{sourceLabel} ↗</a> : sourceLabel}</span>}{status && status !== '编辑整理' && <span className="reading-status">内容状态 · {status}</span>}{completeness && completeness !== '未知' && <span>完整度 · {completeness}</span>}{reviewedAt && <span>最近修订 · {reviewedAt}</span>}</div>
  </div>
}
