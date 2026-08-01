import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import MarkdownContent from '@/components/MarkdownContent'
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
  if (params.slug[0] === 'mental-models' && params.slug[1]) {
    const canonicalSlug = getCanonicalModelSlugForArchiveSlug(params.slug[1])
    const model = canonicalSlug ? getModelBySlug(canonicalSlug) : null
    if (model) {
      return {
        title: `${model.title} · 多元思维模型`,
        description: model.description,
        alternates: { canonical: `/model/${model.slug}` },
      }
    }
  }
  const doc = getMungerLocalArchiveBySlug(params.slug)
  if (!doc) return {}
  return {
    title: `${doc.title} · 芒格资料`,
    description: `查理·芒格相关资料：${doc.title}`,
    alternates: { canonical: `/munger/archive/${doc.slug}` },
  }
}

export default function MungerArchiveDetailPage({ params }: PageProps) {
  if (params.slug[0] === 'mental-models' && params.slug[1]) {
    const canonicalSlug = getCanonicalModelSlugForArchiveSlug(params.slug[1])
    if (canonicalSlug) redirect(`/model/${canonicalSlug}`)
  }

  const doc = getMungerLocalArchiveBySlug(params.slug)
  if (!doc) notFound()
  const navigation = getMungerLocalArchiveNavigation(doc.slug)
  const recording = params.slug[0] === 'recordings' && params.slug[1]
    ? getMungerArchiveRecordingBySlug(params.slug[1])
    : null

  return (
    <PageContainer maxWidth="4xl">
      <nav className="archive-document__breadcrumb" aria-label="当前位置">
        <Link href="/munger">芒格</Link>
        <span>/</span>
        <Link href="/munger/archive">芒格资料</Link>
        {navigation && (
          <>
            <span>/</span>
            <span>{navigation.sectionLabel}</span>
          </>
        )}
      </nav>
      <PageHeader
        title={doc.title}
        subtitle={navigation
          ? `${navigation.sectionLabel} · 第 ${navigation.position} / ${navigation.total} 篇`
          : '查理·芒格资料'}
        backHref="/munger/archive"
        backLabel="返回芒格资料"
        showFontSize
      />

      <article className="archive-document">
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
      </article>

      {navigation && (
        <nav className="archive-document__pagination" aria-label="同类内容上下篇">
          {navigation.previous ? (
            <Link href={`/munger/archive/${navigation.previous.slug}`}>
              <span>上一篇</span>
              <strong>{navigation.previous.title}</strong>
            </Link>
          ) : <span />}
          {navigation.next ? (
            <Link href={`/munger/archive/${navigation.next.slug}`}>
              <span>下一篇</span>
              <strong>{navigation.next.title}</strong>
            </Link>
          ) : <span />}
        </nav>
      )}

      <div className="archive-document__return">
        <Link href="/munger">返回芒格</Link>
        <Link href="/munger/archive">查看全部芒格资料</Link>
      </div>

    </PageContainer>
  )
}
