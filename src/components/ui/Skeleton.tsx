/**
 * 骨架屏原语 —— 替代"转圈 + 加载中…"。
 *
 * 为什么用骨架屏：转圈只告诉用户"在等"，骨架屏还告诉用户"等来的是什么形状"，
 * 感知等待时间更短；并且骨架尺寸与真实内容一致，内容到位时不发生布局位移（CLS ≈ 0）。
 *
 * 纯展示组件，无客户端状态，可直接在服务端组件与 loading.tsx 中使用。
 */

export function Skeleton({
  className = '',
  width,
  height,
  radius,
}: {
  className?: string
  width?: string | number
  height?: string | number
  radius?: string
}) {
  return (
    <span
      className={`ui-skeleton ${className}`}
      style={{ width, height, borderRadius: radius, display: 'block' }}
      aria-hidden="true"
    />
  )
}

/** 多行文本骨架：模拟标题 + 正文若干行，行宽递减更接近真实段落 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ['100%', '92%', '78%', '85%', '64%']
  return (
    <span style={{ display: 'grid', gap: '0.55rem' }} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={index}
          className="ui-skeleton ui-skeleton--text"
          style={{ width: widths[index % widths.length], display: 'block' }}
        />
      ))}
    </span>
  )
}

/**
 * 列表页骨架：年份 + 标题 + 副标题的三段式，与 .archive-list__row 的真实版式对齐。
 * 外层带 role="status" + aria-label，让屏幕阅读器知道"正在加载"而不是"空列表"。
 */
export function SkeletonList({ rows = 6, label = '内容加载中' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} aria-busy="true">
      <span className="ui-sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div className="ui-skeleton-row" key={index}>
          <span className="ui-skeleton ui-skeleton--text" style={{ width: '3.5rem', display: 'block' }} />
          <span className="ui-skeleton ui-skeleton--title" style={{ display: 'block' }} />
          <span
            className="ui-skeleton ui-skeleton--text ui-skeleton--line-short"
            style={{ display: 'block' }}
          />
        </div>
      ))}
    </div>
  )
}

/** 卡片网格骨架：用于人物页/类别页的卡片区 */
export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="ui-card-grid" role="status" aria-label="内容加载中" aria-busy="true">
      <span className="ui-sr-only">内容加载中</span>
      {Array.from({ length: count }).map((_, index) => (
        <div className="ui-card" key={index}>
          <span className="ui-skeleton ui-skeleton--text" style={{ width: '4.5rem', display: 'block' }} />
          <span className="ui-skeleton ui-skeleton--title" style={{ width: '80%', display: 'block' }} />
          <SkeletonText lines={2} />
        </div>
      ))}
    </div>
  )
}
