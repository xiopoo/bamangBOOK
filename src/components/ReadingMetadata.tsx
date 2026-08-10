export type ReadingContentType = '信件' | '股东大会' | '演讲' | '访谈' | '公司研究' | '文章' | '书籍'

export interface ReadingMetadataProps {
  person?: string
  year?: number | string
  contentType: ReadingContentType
  sourceLabel?: string
  status?: '原文' | '译文' | '编辑整理' | '已校对' | '部分内容缺失' | '待核对'
  reviewedAt?: string
  readMinutes?: number
}

export default function ReadingMetadata({ person, year, contentType, sourceLabel, status = '编辑整理', reviewedAt, readMinutes }: ReadingMetadataProps) {
  return <div className="reading-metadata" aria-label="阅读资料信息">
    <div className="reading-metadata__primary">{[person, year, contentType, readMinutes ? `${readMinutes} 分钟` : null].filter(Boolean).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
    <div className="reading-metadata__secondary">{sourceLabel && <span>来源 · {sourceLabel}</span>}<span className="reading-status">内容状态 · {status}</span>{reviewedAt && <span>最近修订 · {reviewedAt}</span>}</div>
  </div>
}
