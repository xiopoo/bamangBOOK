import type { Metadata } from 'next'
import Link from 'next/link'
import DocumentArchivePage from '@/components/DocumentArchivePage'

export const metadata: Metadata = { title: '股东大会问答', description: '伯克希尔股东大会现场问答记录，按人物、年份和状态筛选。', alternates: { canonical: '/qa' } }
export default function QAPage() {
  return <>
    <DocumentArchivePage category="qa" title="股东大会问答" subtitle="把观点放回问题、追问和当时的商业环境中理解。" pathname="/qa" exclude={fileName => fileName.startsWith('Wesco_股东大会_')} extraLink={{ href: '/munger/wesco', label: '查看 Wesco 问答 →' }} />
    <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-3">
      <Link href="/meetings" className="inline-flex items-center gap-1 rounded-card border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/30 dark:text-primary-light">
        股东大会英文原档实录（1994–2026）→
      </Link>
      <Link href="/buffett-faq" className="inline-flex items-center gap-1 rounded-card border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary transition-all hover:border-primary hover:bg-primary/10 dark:border-primary/30 dark:text-primary-light">
        巴菲特主题问答 · 英文原档 →
      </Link>
    </div>
  </>
}
