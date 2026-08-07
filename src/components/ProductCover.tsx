import Image from 'next/image'

type ProductCoverProps = {
  variant: 'buffett' | 'munger'
  title: string
  yearRange: string
  compact?: boolean
}

/* 与终稿 PDF 第一页（正面封面）逐页渲染一致的封面图 */
const coverImages: Record<ProductCoverProps['variant'], string> = {
  buffett: '/ebook-covers/buffett-cover.png',
  munger: '/ebook-covers/munger-cover.png',
}

export default function ProductCover({ variant, title, yearRange, compact = false }: ProductCoverProps) {
  const person = variant === 'buffett' ? 'WARREN E. BUFFETT' : 'CHARLES T. MUNGER'

  return (
    <div
      className={`product-cover product-cover--${variant}${compact ? ' product-cover--compact' : ''}`}
      role="img"
      aria-label={`${title}，${yearRange}，复利书房巴芒文集封面`}
    >
      <Image
        src={coverImages[variant]}
        alt={`${title.replace(/[《》]/g, '')}封面 · ${person}`}
        width={1241}
        height={1755}
        priority={!compact}
        className="product-cover__img"
      />
    </div>
  )
}
