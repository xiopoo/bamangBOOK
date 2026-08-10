interface SourceNoteProps { source: string; sourceUrl?: string; method: string; completeness?: '完整' | '部分' | '未知'; reviewedAt?: string }

export default function SourceNote({ source, sourceUrl, method, completeness = '未知', reviewedAt = '持续修订中' }: SourceNoteProps) {
  return <aside className="source-note" aria-label="来源与编辑说明"><p className="archive-kicker">来源与编辑说明</p><p><strong>原始来源：</strong>{source}{sourceUrl && <> · <a href={sourceUrl} target="_blank" rel="noopener noreferrer">查看原始资料 ↗</a></>}</p><p><strong>整理方式：</strong>{method}</p><p><strong>完整性：</strong>{completeness}　<strong>最近修订：</strong>{reviewedAt}</p><p>发现错漏，欢迎通过关于页面反馈；本站内容用于学习、研究和资料检索，不构成投资建议。</p></aside>
}
