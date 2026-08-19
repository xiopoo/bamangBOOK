'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw, Search } from 'lucide-react'

/**
 * 路由级错误边界 —— 改造前全站没有 error.tsx，任何客户端渲染异常
 * 都会直接呈现 Next 的默认错误页（英文、无品牌、无恢复路径）。
 *
 * 这里给出三件事：说明发生了什么、提供重试、提供两条离开死胡同的出路。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 生产环境静态导出没有服务端日志通道，至少在控制台留下可排查的痕迹
    console.error('[route-error]', error)
  }, [error])

  return (
    <div className="archive-page mx-auto max-w-2xl px-4 py-16">
      <div className="ui-empty">
        <span className="ui-empty__icon">
          <AlertTriangle size={22} aria-hidden="true" />
        </span>
        <h1 className="ui-empty__title">这一页没能正常打开</h1>
        <p className="ui-empty__desc">
          页面在渲染过程中遇到了问题。你可以先重试；如果仍然失败，可以回到首页或用搜索直接找目标资料。
        </p>
        {error.digest && (
          <p className="ui-field__help">
            错误编号：<code>{error.digest}</code>
          </p>
        )}
        <div className="ui-empty__actions">
          <button type="button" className="ui-btn ui-btn--solid ui-btn--keep-width" onClick={reset}>
            <RotateCcw size={16} aria-hidden="true" />
            重新加载这一页
          </button>
          <Link href="/" className="ui-btn ui-btn--outline">
            <Home size={16} aria-hidden="true" />
            回到首页
          </Link>
          <Link href="/search" className="ui-btn ui-btn--ghost">
            <Search size={16} aria-hidden="true" />
            全站搜索
          </Link>
        </div>
      </div>
    </div>
  )
}
