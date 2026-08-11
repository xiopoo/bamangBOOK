import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import MarkdownContent from '@/components/MarkdownContent'
import ReadingArticleShell from '@/components/ReadingArticleShell'
import {
  getMungerLocalArchiveBySlug,
  getMungerLocalArchiveItems,
  getMungerLocalArchiveNavigation,
  getMungerArchiveRecordingBySlug,
} from '@/lib/munger-archive'
import { getCanonicalModelSlugForArchiveSlug, getModelBySlug } from '@/lib/models'

interface PageProps {
  params: { slug: string[] }
}

export function generateStaticParams() {
  return getMungerLocalArchiveItems().map(item => ({
    slug: item.slug.split('/'),
  }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const slugParts = params.slug.map(part => decodeURIComponent(part))
  if (slugParts[0] === 'mental-models' && slugParts[1]) {
    const canonicalSlug = getCanonicalModelSlugForArchiveSlug(slugParts[1])
    const model = canonicalSlug ? getModelBySlug(canonicalSlug) : null
    if (model) {
      return {
        title: `${model.title} · 多元思维模型`,
        description: model.description,
        alternates: { canonical: `/model/${model.slug}` },
      }
    }
  }
  const doc = getMungerLocalArchiveBySlug(slugParts)
  if (!doc) return {}
  return {
    title: `${doc.title} · 芒格资料`,
    description: `查理·芒格相关资料：${doc.title}`,
    alternates: { canonical: `/munger/archive/${doc.slug}` },
  }
}

export default function MungerArchiveDetailPage({ params }: PageProps) {
  const slugParts = params.slug.map(part => decodeURIComponent(part))
  if (slugParts[0] === 'mental-models' && slugParts[1]) {
    const canonicalSlug = getCanonicalModelSlugForArchiveSlug(slugParts[1])
    if (canonicalSlug) redirect(`/model/${canonicalSlug}`)
  }

  const doc = getMungerLocalArchiveBySlug(slugParts)
  if (!doc) notFound()
  const navigation = getMungerLocalArchiveNavigation(doc.slug)
  const recording = slugParts[0] === 'recordings' && slugParts[1]
    ? getMungerArchiveRecordingBySlug(slugParts[1])
    : null

  const rawSource = recording?.sourceLabel || doc.source || '查理·芒格公开资料'
  const sourceIsUrl = /^https?:\/\//i.test(rawSource)
  const sourceLabel = sourceIsUrl ? 'Munger Archive 原始资料' : rawSource
  const sourceUrl = recording?.sourceUrl || (sourceIsUrl ? rawSource : undefined)
  const year = recording?.year || Number(doc.title.match(/(?:19|20)\d{2}/)?.[0]) || undefined

  return <ReadingArticleShell
      title={doc.title}
      subtitle={navigation ? `${navigation.sectionLabel} · 第 ${navigation.position} / ${navigation.total} 篇` : '查理·芒格资料'}
      backHref="/munger/archive"
      backLabel="返回芒格资料"
      metadata={{ person: '查理·芒格', year, contentType: slugParts[0] === 'recordings' ? '演讲' : '文章', sourceLabel, sourceUrl, status: '编辑整理', completeness: recording?.localStatus === 'partial' ? '部分' : undefined, readMinutes: Math.max(1, Math.round(doc.content.length / 900)) }}
      previous={navigation?.previous ? { href: `/munger/archive/${navigation.previous.slug}`, title: navigation.previous.title, meta: navigation.sectionLabel } : null}
      next={navigation?.next ? { href: `/munger/archive/${navigation.next.slug}`, title: navigation.next.title, meta: navigation.sectionLabel } : null}
      navigationLabel="同类芒格资料相邻导航"
      related={<div className="archive-document__return"><Link href="/munger">返回芒格专题</Link><Link href="/munger/archive">查看全部芒格资料</Link></div>}
    >
        {recording?.embedUrl && (
          <div className="archive-document__media">
            <iframe
              src={recording.embedUrl}
              title={recording.titleZh}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <p>视频嵌入自 <a href={recording.sourceUrl} target="_blank" rel="noreferrer">{recording.sourceLabel} 原始公开页面</a>，本站不存储视频文件。</p>
          </div>
        )}
        <MarkdownContent content={doc.content} />
    </ReadingArticleShell>
}
