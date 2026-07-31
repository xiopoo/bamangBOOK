import { AlertCircle, BookOpenCheck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface ContentTrustPanelProps {
  source: string
  method?: string
  note?: string
}

export default function ContentTrustPanel({
  source,
  method = '依据本站已收录资料整理，关键观点建议回到正文标注及相关原文核对。',
  note = '内容仅用于学习与研究，不构成证券推荐、估值结论或投资建议。',
}: ContentTrustPanelProps) {
  return (
    <aside className="mb-8 border-y border-gray-200 dark:border-gray-700 py-4" aria-label="内容说明">
      <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-3">
        <div className="flex items-start gap-2">
          <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div><span className="font-medium text-gray-800 dark:text-gray-200">资料性质</span><br />{source}</div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div><span className="font-medium text-gray-800 dark:text-gray-200">整理说明</span><br />{method}</div>
        </div>
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div><span className="font-medium text-gray-800 dark:text-gray-200">使用边界</span><br />{note}</div>
        </div>
      </div>
      <div className="mt-3 text-right text-xs">
        <Link href="/references" className="text-primary underline decoration-primary/30 underline-offset-4 hover:text-primary-light">
          查看引用与参考总表 →
        </Link>
      </div>
    </aside>
  )
}
