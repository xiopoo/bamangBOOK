'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * 页面过渡层 —— template.tsx 在每次导航时重新挂载，因此这里的入场动画
 * 会在每个页面切换时播放一次，把"整页闪现"变成"淡入接续"。
 *
 * ⚠️ 关键取舍：只做不透明度过渡，**绝不在这一层用 transform**。
 * 原因：transform 会让该元素成为 position:fixed 子元素的包含块。本站页面内部
 * 有多个悬浮控件（ReadingFloatingNav、FontSizeControlFixed、目录抽屉），
 * 一旦外层带 transform，它们会以文档而非视口为基准定位，直接钉到页面底部。
 * "上移淡入"的节奏感改由区块级 <Reveal> 提供（它包裹的区块不含 fixed 元素）。
 *
 * 时长压到 180ms：页面级过渡一旦超过 250ms，连续浏览多篇文章时就会觉得"拖沓"。
 * 退场动画在 App Router 里需要保留旧树，代价与复杂度都不值得，故只做入场。
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
