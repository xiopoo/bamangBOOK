'use client'

import Link from 'next/link'

interface LogoProps {
  href?: string
  showSubtitle?: boolean
}

export default function Logo({ href = '/', showSubtitle = true }: LogoProps) {
  const content = (
    <div className="archive-logo select-none">
      <div lang="zh-CN" className="whitespace-nowrap">
        <div className="archive-logo__title">
          复利书房
        </div>
        {showSubtitle && (
          <div className="archive-logo__subtitle">
            巴菲特、芒格与公司研究
          </div>
        )}
      </div>
    </div>
  )

  return <Link href={href}>{content}</Link>
}
