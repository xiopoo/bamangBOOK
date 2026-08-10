'use client'

import Link from 'next/link'
import { ExternalLink, Play, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { MungerArchiveRecording } from '@/lib/munger-archive'

interface Props {
  recordings: MungerArchiveRecording[]
}

const TYPE_LABELS: Record<string, string> = {
  Interview: '访谈',
  Podcast: '播客',
  'Daily Journal': '每日期刊',
  'Berkshire Meeting': '伯克希尔年会',
  Lecture: '讲座',
  Speech: '演讲',
}

function Player({ recording }: { recording: MungerArchiveRecording }) {
  return (
    <article className="recording-player" aria-live="polite">
      <div className="recording-player__screen">
        {recording.embedUrl ? (
          <iframe
            key={recording.embedUrl}
            src={recording.embedUrl}
            title={recording.titleZh}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="recording-player__empty">
            <Play size={34} aria-hidden="true" />
            <strong>播放器正在整理</strong>
            <p>目前先保留完整索引和文字稿；取得稳定的公开播放地址后，会直接出现在这个窗口。</p>
            <a href={recording.archiveUrl} target="_blank" rel="noreferrer">查看原始档案 <ExternalLink size={15} /></a>
          </div>
        )}
      </div>
      <div className="recording-player__caption">
        <div>
          <p>{recording.year} · {TYPE_LABELS[recording.type] ?? recording.type} · {recording.duration}</p>
          <h2>{recording.titleZh}</h2>
          <span>{recording.title}</span>
        </div>
        <div className="recording-player__links">
          {recording.transcriptUrl && <Link href={recording.transcriptUrl}>边看边读中文整理稿</Link>}
          {recording.sourceUrl && <a href={recording.sourceUrl} target="_blank" rel="noreferrer">来源：{recording.sourceLabel} <ExternalLink size={14} /></a>}
        </div>
      </div>
      <p className="recording-player__notice">视频嵌入自原始公开来源，版权归来源方所有；复利书房不存储视频文件。</p>
    </article>
  )
}

export default function MungerRecordingBrowser({ recordings }: Props) {
  const firstPlayable = (recordings.find(recording => recording.embedUrl) ?? recordings[0])!
  const [selectedId, setSelectedId] = useState(firstPlayable.id)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('全部')
  const [visibleCount, setVisibleCount] = useState(12)
  const selected = recordings.find(recording => recording.id === selectedId) ?? firstPlayable
  const types = ['全部', ...Array.from(new Set(recordings.map(recording => recording.type)))]
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return recordings.filter(recording => {
      const matchesType = type === '全部' || recording.type === type
      const haystack = `${recording.title} ${recording.titleZh} ${recording.year}`.toLowerCase()
      return matchesType && (!keyword || haystack.includes(keyword))
    })
  }, [query, recordings, type])

  const visibleRecordings = filtered.slice(0, visibleCount)

  return (
    <section className="recording-browser" id="recordings">
      <Player recording={selected} />
      <div className="recording-browser__bar">
        <div>
          <p>RECORDING ARCHIVE · 影音档案</p>
          <strong>{filtered.length} / {recordings.length}</strong>
        </div>
        <label>
          <Search size={16} aria-hidden="true" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索标题或年份" aria-label="搜索录像" />
        </label>
      </div>
      <div className="recording-browser__filters" aria-label="按类型筛选">
        {types.map(item => (
          <button key={item} type="button" className={type === item ? 'is-active' : ''} onClick={() => setType(item)}>
            {item === '全部' ? item : (TYPE_LABELS[item] ?? item)}
          </button>
        ))}
      </div>
      <div className="recording-browser__grid">
        {visibleRecordings.map(recording => (
          <button
            key={recording.id}
            type="button"
            className={selected.id === recording.id ? 'is-selected' : ''}
            onClick={() => {
              setSelectedId(recording.id)
              document.querySelector('.recording-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          >
            <span>{recording.year}</span>
            <small>{TYPE_LABELS[recording.type] ?? recording.type} · {recording.medium} {recording.duration && `· ${recording.duration}`}</small>
            <h3>{recording.titleZh}</h3>
            <p>{recording.title}</p>
            <b>{recording.embedUrl ? <><Play size={14} />页内播放</> : recording.transcriptUrl ? '阅读整理稿 →' : '查看档案 →'}</b>
          </button>
        ))}
      </div>
      {visibleCount < filtered.length && (
        <button type="button" className="archive-button recording-browser__more" onClick={() => setVisibleCount(value => value + 12)}>
          加载更多（还剩 {filtered.length - visibleCount} 条）
        </button>
      )}
      {filtered.length === 0 && <p className="recording-browser__none">没有找到对应的录像。</p>}
    </section>
  )
}
