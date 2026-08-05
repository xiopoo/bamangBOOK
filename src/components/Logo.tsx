'use client'

import Link from 'next/link'

interface LogoProps {
  href?: string
  showSubtitle?: boolean
}

// 复利书房 图形标志：一枚「书脊 + 复利曲线」的印章式徽标
function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="archive-logo__mark"
    >
      {/* 外框：圆角方印 */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="9"
        stroke="var(--archive-oxblood)"
        strokeWidth="2.4"
      />
      {/* 书脊中缝 */}
      <line
        x1="24"
        y1="11"
        x2="24"
        y2="37"
        stroke="var(--archive-oxblood)"
        strokeWidth="1.6"
        opacity="0.35"
      />
      {/* 左页：复利曲线（螺旋上升） */}
      <path
        d="M11 33 C13 33 13 28 16 28 C19 28 19 23 21 23"
        stroke="var(--archive-oxblood)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* 右页：上扬曲线 */}
      <path
        d="M27 27 C29 27 29 22 31 22 C33 22 33 17 35 17"
        stroke="var(--archive-oxblood)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* 中心圆点：起点 */}
      <circle cx="11" cy="33" r="2.1" fill="var(--archive-oxblood)" />
      <circle cx="35" cy="17" r="2.1" fill="var(--archive-oxblood)" />
    </svg>
  )
}

export default function Logo({ href = '/', showSubtitle = true }: LogoProps) {
  const content = (
    <div className="archive-logo select-none">
      <div className="archive-logo__inner">
        <LogoMark />
        <div lang="zh-CN" className="archive-logo__text">
          <div className="archive-logo__title">复利书房</div>
          {showSubtitle && (
            <div className="archive-logo__subtitle">巴菲特、芒格与公司研究</div>
          )}
        </div>
      </div>
    </div>
  )

  return <Link href={href}>{content}</Link>
}
