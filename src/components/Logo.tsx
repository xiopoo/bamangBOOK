'use client'

import Link from 'next/link'

interface LogoProps {
  href?: string
  showSubtitle?: boolean
}

export default function Logo({ href = '/', showSubtitle = true }: LogoProps) {
  const content = (
    <div className="flex items-center gap-3 select-none">
      {/* SVG Icon - 书本+铜钱组合 */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        className="text-primary shrink-0"
        aria-hidden="true"
      >
        <circle
          cx="18"
          cy="18"
          r="16"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <rect
          x="12"
          y="12"
          width="12"
          height="12"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path d="M9 18h18" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 9v18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="2" fill="currentColor" />
      </svg>

      {/* Text - 使用强健的中文字体回退栈，避免乱码 */}
      <div lang="zh-CN" className="whitespace-nowrap">
        <div
          className="font-serif text-lg font-semibold text-text dark:text-gray-100 leading-tight"
          style={{
            fontFamily:
              "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', SimSun, STSong, 'PingFang SC', 'Microsoft YaHei', serif",
            fontVariantLigatures: 'normal',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          巴芒书房
        </div>
        {showSubtitle && (
          <div
            className="text-xs text-text-muted dark:text-gray-400 leading-tight mt-0.5"
            style={{
              fontFamily:
                "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', SimSun, STSong, 'PingFang SC', 'Microsoft YaHei', serif",
              letterSpacing: '0.02em',
            }}
          >
            价值投资知识宝库
          </div>
        )}
      </div>
    </div>
  )

  return <Link href={href}>{content}</Link>
}
