type ProductCoverProps = {
  variant: 'buffett' | 'munger'
  title: string
  yearRange: string
  compact?: boolean
}

export default function ProductCover({ variant, title, yearRange, compact = false }: ProductCoverProps) {
  const person = variant === 'buffett' ? 'WARREN E. BUFFETT' : 'CHARLES T. MUNGER'

  return (
    <div
      className={`product-cover product-cover--${variant}${compact ? ' product-cover--compact' : ''}`}
      role="img"
      aria-label={`${title}，${yearRange}，小胖书房合订本封面`}
    >
      <div className="product-cover__topline">
        <span>小胖书房</span>
        <span>BOUND EDITION</span>
      </div>
      <div className="product-cover__index" aria-hidden="true">
        <span>01</span><i />
        <span>02</span><i />
        <span>03</span><i />
      </div>
      <div className="product-cover__title">
        <small>{person}</small>
        <strong>{title.replace(/[《》]/g, '')}</strong>
        <span>{yearRange}</span>
      </div>
      <div className="product-cover__seal" aria-hidden="true">藏</div>
      <p>阅读原典，形成自己的判断</p>
    </div>
  )
}
