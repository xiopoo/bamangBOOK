'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { ReadingNavigationItem } from './ReadingNavigation'
import styles from './ReadingFloatingNav.module.css'

interface ReadingFloatingNavProps {
  previous?: ReadingNavigationItem | null
  next?: ReadingNavigationItem | null
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 常驻阅读导航：上一篇 / 评论 / 下一篇。
 * - 桌面端（≥1180px）落在左侧竖向 rail，利用正文栅格左留白，避开右侧目录与右下返回顶部。
 * - 移动端为底部居中胶囊，避开右下角全局返回顶部。
 * - 空闲（停止滚动 1.5s）后自动降透明度，hover/focus 恢复，轻量无侵入。 */
export default function ReadingFloatingNav({ previous, next }: ReadingFloatingNavProps) {
  const [idle, setIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => {
      setIdle(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setIdle(true), 1500)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const scrollToComments = () => {
    const el = document.getElementById('comments')
    const target = el ?? document.body
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: el ? 'start' : 'end',
    })
  }

  return (
    <nav
      className={`${styles.floatingNav}${idle ? ` ${styles.isIdle}` : ''}`}
      aria-label="阅读导航"
    >
      {previous ? (
        <Link
          href={previous.href}
          rel="prev"
          className={styles.navBtn}
          title={`上一篇：${previous.title}`}
          aria-label={`上一篇：${previous.title}`}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.icon}>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>上一篇</span>
        </Link>
      ) : (
        <span className={`${styles.navBtn} ${styles.disabled}`} aria-disabled="true" title="已是最早一篇">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.icon}>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>上一篇</span>
        </span>
      )}

      <button
        type="button"
        className={styles.navBtn}
        onClick={scrollToComments}
        title="跳转到评论区"
        aria-label="跳转到评论区"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.icon}>
          <path
            d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.label}>评论</span>
      </button>

      {next ? (
        <Link
          href={next.href}
          rel="next"
          className={styles.navBtn}
          title={`下一篇：${next.title}`}
          aria-label={`下一篇：${next.title}`}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.icon}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>下一篇</span>
        </Link>
      ) : (
        <span className={`${styles.navBtn} ${styles.disabled}`} aria-disabled="true" title="已是最后一篇">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.icon}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>下一篇</span>
        </span>
      )}
    </nav>
  )
}
