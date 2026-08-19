'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * 滚动显现容器 —— 区块进入视口时淡入 + 轻微上移。
 *
 * 设计意图：本站是长页面的阅读档案，逐块显现能建立"翻页/展卷"的节奏感，
 * 让长首页不再像一张平铺的静态表格。
 *
 * 三条纪律：
 *  1) 只做一次（once: true）。反复触发的动画在来回滚动时会非常烦人。
 *  2) 位移幅度 ≤ 16px、时长 ≤ 0.5s。超过这个量级就从"精致"变成"卡顿"。
 *  3) prefers-reduced-motion 时完全不动（直接显示），不是"动得慢一点"。
 *
 * 注意：不要用它包裹含 position:fixed 子元素的区块——动画期间的 transform
 * 会成为 fixed 子元素的包含块，导致悬浮控件被钉在文档而非视口。
 */
export default function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
  as = 'div',
}: {
  children: ReactNode
  /** 错落出场用的延迟（秒）。同组元素建议 0.06 递增，最多累计到 0.24 */
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const reduceMotion = useReducedMotion()
  const MotionTag = motion[as]

  if (reduceMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px 0px -64px 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  )
}
