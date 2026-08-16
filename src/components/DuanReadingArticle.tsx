import type { ReactNode } from 'react'
import ReadingArticleShell from './ReadingArticleShell'
import MarkdownContent from './MarkdownContent'
import { getDYNeighbors, rewriteRelativeMdLinks, stripTalkSourceNote, type DYDoc, type DYSection } from '@/lib/duanyongping'

interface DuanReadingArticleProps {
  doc: DYDoc
  section: DYSection
  backLabel: string
  contentType: string
  intro?: string
  beforeBody?: ReactNode
  isQA?: boolean
}

const SECTION_LABEL: Record<DYSection, string> = {
  blog: '网易博客',
  qa: '雪球问答',
  talks: '演讲与访谈',
  milestones: '公司与里程碑',
}

export default function DuanReadingArticle({ doc, section, backLabel, contentType, intro, beforeBody, isQA }: DuanReadingArticleProps) {
  const { previous, next } = getDYNeighbors(section, doc.slug)
  const body = section === 'talks' ? stripTalkSourceNote(doc.content) : rewriteRelativeMdLinks(section, doc.content)
  const year = doc.year ? Number(doc.year) : doc.date?.slice(0, 4)
  const hrefFor = (slug: string) => `/duanyongping/${section}/${slug}`

  return <ReadingArticleShell
    title={doc.title}
    subtitle={intro || `段永平${SECTION_LABEL[section]}资料`}
    backHref={`/duanyongping/${section}`}
    backLabel={backLabel}
    metadata={{ person: '段永平', year, contentType, readMinutes: Math.max(1, Math.round(body.length / 900)) }}
    previous={previous ? { href: hrefFor(previous.slug), title: previous.title, meta: previous.date?.slice(0, 10) || previous.year } : null}
    next={next ? { href: hrefFor(next.slug), title: next.title, meta: next.date?.slice(0, 10) || next.year } : null}
    navigationLabel={`相邻${SECTION_LABEL[section]}`}
  >
    {beforeBody}
    <MarkdownContent content={body} isQA={isQA} />
  </ReadingArticleShell>
}
