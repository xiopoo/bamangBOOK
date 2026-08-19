'use client'

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * 全站动效基线。
 *
 * reducedMotion="user"：让 framer-motion 自动读取系统「减少动态效果」偏好，
 * 对所有 motion 组件的位移/缩放类属性统一降级（仅保留不适感低的透明度变化）。
 * 这样各组件不必逐个手写 useReducedMotion 判断，也就不会有人漏写。
 *
 * transition 默认值统一为与 tokens.css --mo-base / --ease-out 同一条曲线，
 * 保证 CSS 过渡与 JS 动画的节奏是同一种"手感"，而不是两套时间感。
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </MotionConfig>
  )
}
