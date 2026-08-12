'use client'

import { Headphones, Play } from 'lucide-react'
import { useState } from 'react'
import type { AlmanackAudioTrack } from '@/lib/poor-charlies-audio'

interface Props {
  tracks: AlmanackAudioTrack[]
  compact?: boolean
}

export default function AlmanackAudioPlayer({ tracks, compact = false }: Props) {
  const [selectedId, setSelectedId] = useState(tracks[0]?.id ?? '')
  const selected = tracks.find(track => track.id === selectedId) ?? tracks[0]

  if (!selected) return null

  return (
    <section className={`rounded-2xl border border-primary/15 bg-primary/[0.04] ${compact ? 'p-4' : 'p-5 md:p-6'}`}>
      <div className="flex items-start gap-3">
        <Headphones className="mt-0.5 shrink-0 text-primary" size={20} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-widest text-primary">英文有声原版</p>
          <h2 className="mt-1 font-serif text-lg font-bold text-text dark:text-dark-text">{selected.titleZh}</h2>
          <p className="mt-1 text-xs text-text-muted dark:text-dark-muted">{selected.title}</p>
        </div>
      </div>

      <audio key={selected.localPath ?? selected.id} className="mt-4 w-full" controls preload="metadata">
        <source src={selected.localPath ?? undefined} type="audio/mp4" />
        当前浏览器不支持音频播放。
      </audio>

      {tracks.length > 1 && (
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {tracks.map((track, index) => (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => setSelectedId(track.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  track.id === selected.id
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-gray-100 bg-white text-text hover:border-primary/25 dark:border-dark-border dark:bg-dark-card dark:text-dark-text'
                }`}
              >
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 truncate">{track.titleZh}</span>
                <Play size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-3 text-xs leading-5 text-text-muted dark:text-dark-muted">
        音频来自 Stripe Press 公开版，本站保存本地副本以便与正文同步阅读；版权归原权利人所有。
      </p>
    </section>
  )
}
