'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * 顶部路由进度条 —— 跨页导航的"系统正在响应"信号。
 *
 * 为什么需要：本站生产环境是静态导出（output: 'export'），跨页跳转需要拉取
 * 目标页面的 HTML/RSC 载荷。改造前点击导航后**没有任何反馈**，弱网下用户
 * 会以为没点中而反复点击。
 *
 * 为什么用点击拦截而不是 router 事件：App Router 没有暴露 routeChangeStart
 * 事件（Pages Router 的 router.events 已移除）。因此在 document 上捕获阶段
 * 监听链接点击，判定为站内跳转即起进度；usePathname() 变化即收尾。
 *
 * 刻意不使用 useSearchParams()：在静态导出下，客户端组件读取 search params
 * 会要求外层 Suspense 边界，且会让整棵子树退化为动态渲染。仅凭 pathname
 * 已足够覆盖导航反馈场景。
 */
export default function RouteProgress() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  // 用 ref 保存"当前正在前往的路径"，避免同页锚点点击误触发进度条
  const navigatingRef = useRef(false)

  // —— 1. 捕获站内链接点击，开始进度 ——
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // 忽略非左键、组合键（新标签页打开不产生本页导航）
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (event.defaultPrevented) return

      const anchor = (event.target as HTMLElement | null)?.closest?.('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return
      // 外链 / 新窗口 / 下载 / 协议链接 / 显式跳过
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
      if (/^(https?:)?\/\//.test(href) && !href.startsWith(window.location.origin)) return
      if (/^(mailto:|tel:|#)/.test(href)) return
      if (anchor.dataset.noProgress === 'true') return

      const target = new URL(anchor.href, window.location.href)
      if (target.origin !== window.location.origin) return
      // 纯锚点跳转（同路径不同 hash）不是导航，不该显示进度
      if (target.pathname === window.location.pathname && target.search === window.location.search) return

      navigatingRef.current = true
      setPhase('loading')
    }

    // 浏览器前进/后退也算导航
    const onPopState = () => {
      navigatingRef.current = true
      setPhase('loading')
    }

    document.addEventListener('click', onClick, { capture: true })
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  // —— 2. 路径变化即为导航完成：补满进度并淡出 ——
  useEffect(() => {
    if (!navigatingRef.current) return
    navigatingRef.current = false
    setPhase('done')
    const timer = setTimeout(() => setPhase('idle'), 420)
    return () => clearTimeout(timer)
  }, [pathname])

  // —— 3. 兜底：若 8s 仍未完成（目标页加载失败），主动收起，避免进度条长期悬挂 ——
  useEffect(() => {
    if (phase !== 'loading') return
    const bail = setTimeout(() => {
      navigatingRef.current = false
      setPhase('idle')
    }, 8000)
    return () => clearTimeout(bail)
  }, [phase])

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          className="ui-route-progress"
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 1 }}
          // loading 阶段爬到 88% 并停住（真实进度不可知，制造"正在推进"的确定感）
          // done 阶段补满到 100% 再淡出
          animate={
            phase === 'loading'
              ? { scaleX: 0.88, opacity: 1 }
              : { scaleX: 1, opacity: 0 }
          }
          transition={
            phase === 'loading'
              ? { duration: 1.6, ease: [0.16, 1, 0.3, 1] }
              : { scaleX: { duration: 0.18 }, opacity: { duration: 0.3, delay: 0.14 } }
          }
        />
      )}
    </AnimatePresence>
  )
}
