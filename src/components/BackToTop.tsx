'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 全站悬浮返回顶部按钮：
 * - 滚动超过 420px 后以淡入上浮方式出现
 * - 滚动过程中完全不透明；停止滚动 220ms 后降为半透明（P3-03），
 *   减少 52×52 悬浮圆钮对正文右下角的持续遮挡
 * - 点击平滑滚动到 <main> 顶部（默认 0）
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [scrolling, setScrolling] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420)
      setScrolling(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setScrolling(false), 220)
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

  return (
    <button
      type="button"
      onClick={() => {
        // 平滑滚动到顶部，考虑 sticky header
        const target = 0
        window.scrollTo({ top: target, behavior: 'smooth' })
      }}
      className={`back-to-top${visible ? ' is-visible' : ''}${visible && scrolling ? ' is-scrolling' : ''}`}
      aria-label="返回页首"
      title="返回页首"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M12 19V5m0 0l-6 6m6-6l6 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
