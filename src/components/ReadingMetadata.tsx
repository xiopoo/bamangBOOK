import type { ReadingContentType } from '@/lib/reading-content'

export interface ReadingMetadataProps {
  person?: string
  year?: number | string
  contentType: ReadingContentType
  readMinutes?: number
}

/**
 * 阅读元数据：只保留必要信息（人物/年份/类型/时长）。
 * 来源、状态、完整度、修订时间等编辑性信息已移除，正文保持干净。
 */
export default function ReadingMetadata({ person, year, contentType, readMinutes }: ReadingMetadataProps) {
  return (
    <div className="reading-metadata" aria-label="阅读资料信息">
      <div className="reading-metadata__primary">
        {[person, year, contentType, readMinutes ? `${readMinutes} 分钟` : null].filter(Boolean).map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  )
}
