import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, List } from 'lucide-react'
import ReadingProgress from '@/components/ReadingProgress'
import MarkdownContent from '@/components/MarkdownContent'
import ArticleTableOfContents from '@/components/ArticleTableOfContents'
import FontSizeControlFixed from '@/components/FontSizeControlFixed'
import AlmanackAudioPlayer from '@/components/AlmanackAudioPlayer'
import JsonLd from '@/components/JsonLd'
import { siteConfig } from '@/lib/site'
import { getAlmanackAudioTracks } from '@/lib/poor-charlies-audio'
import {
  almanackSectionParams,
  almanackSections,
  getAlmanackSection,
} from '@/lib/poor-charlies-almanack'

export function generateStaticParams() {
  return almanackSectionParams()
}

export const dynamicParams = false

interface PageProps {
  params: { slug: string }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const section = getAlmanackSection(params.slug)
  if (!section) return { title: '章节未找到' }
  return {
    title: `${section.title} · 穷查理宝典`,
    description: section.subtitle || section.sourceNote,
    alternates: { canonical: `/poor-charlies-almanack/${section.slug}` },
    openGraph: {
      title: `${section.title} · 穷查理宝典`,
      description: section.subtitle || section.sourceNote,
      type: 'article',
    },
  }
}

export default function AlmanackSectionPage({ params }: PageProps) {
  const section = getAlmanackSection(params.slug)
  if (!section) notFound()

  const progress = Math.round(
    ((almanackSections.findIndex(item => item.slug === section.slug) + 1) / almanackSections.length) * 100
  )
  const audioTracks = getAlmanackAudioTracks(section.slug)

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg">
      {audioTracks.length > 0 && (
        <JsonLd
          data={audioTracks.map(track => ({
            '@context': 'https://schema.org',
            '@type': 'AudioObject',
            name: `${track.titleZh} · 《穷查理宝典》`,
            description: `${section.title}：英文有声原版，与中文译文同步阅读。`,
            contentUrl: `${siteConfig.url}${track.localPath}`,
            encodingFormat: 'audio/mp4',
            inLanguage: 'en',
          }))}
        />
      )}
      <ReadingProgress />

      <header className="border-b border-primary/10 bg-bg-card dark:bg-dark-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href="/poor-charlies-almanack"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light"
            >
              <List size={17} />
              全书目录
            </Link>
            <FontSizeControlFixed />
          </div>

          <div className="max-w-4xl">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono tracking-widest text-primary">{section.number}</span>
              <span className="text-text-muted dark:text-dark-muted">/</span>
              <span className="text-text-muted dark:text-dark-muted">{section.part}</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">{section.kind}</span>
              {section.year && <span className="text-text-muted dark:text-dark-muted">{section.year}</span>}
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight text-primary dark:text-primary-light sm:text-4xl">
              {section.title}
            </h1>
            {section.subtitle && (
              <p className="mt-3 text-base leading-7 text-text-muted dark:text-dark-muted">{section.subtitle}</p>
            )}
          </div>

          <div className="mt-5 h-1 overflow-hidden rounded-full bg-primary/10">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-right text-[11px] text-text-muted dark:text-dark-muted">
            阅读路线 {progress}%
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:px-8 md:py-10">
        <div className="reading-content-layout">
          <main className="reading-content-layout__main min-w-0">
            <aside className="mb-6 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 text-sm leading-6 text-gray-700 dark:bg-primary/10 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 shrink-0 text-primary" size={18} />
                <div className="flex-1">
                  <p>{section.sourceNote}</p>
                  <a
                    href={section.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-light"
                  >
                    对照 Stripe Press 官方英文页面
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </aside>

            {audioTracks.length > 0 && (
              <div className="mb-6">
                <AlmanackAudioPlayer tracks={audioTracks} compact />
              </div>
            )}

            <article data-toc-content className="rounded-card bg-bg-card p-5 shadow-card dark:bg-dark-card sm:p-7 md:p-10">
              <MarkdownContent content={section.content} />
            </article>

            <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="章节翻页">
              {section.previous ? (
                <Link
                  href={`/poor-charlies-almanack/${section.previous.slug}`}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-primary/30 hover:shadow-card dark:border-dark-border dark:bg-dark-card"
                >
                  <span className="mb-2 flex items-center gap-1 text-xs text-text-muted dark:text-dark-muted">
                    <ChevronLeft size={14} />
                    上一篇
                  </span>
                  <strong className="font-serif text-text group-hover:text-primary dark:text-dark-text">
                    {section.previous.title}
                  </strong>
                </Link>
              ) : <span />}
              {section.next ? (
                <Link
                  href={`/poor-charlies-almanack/${section.next.slug}`}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 text-right transition hover:border-primary/30 hover:shadow-card dark:border-dark-border dark:bg-dark-card"
                >
                  <span className="mb-2 flex items-center justify-end gap-1 text-xs text-text-muted dark:text-dark-muted">
                    下一篇
                    <ChevronRight size={14} />
                  </span>
                  <strong className="font-serif text-text group-hover:text-primary dark:text-dark-text">
                    {section.next.title}
                  </strong>
                </Link>
              ) : <span />}
            </nav>
          </main>

          <ArticleTableOfContents />
        </div>
      </div>
    </div>
  )
}
