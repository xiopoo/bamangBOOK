import Image from 'next/image'

export default function PageFooter() {
  return (
    <footer className="border-t border-primary/10 py-4 mt-12">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {/* 左侧：文字 + 小红书链接 */}
        <div>
          <div className="text-sm text-text-muted dark:text-dark-muted">
            价值投资知识宝库
          </div>
          <a
            href="https://xhslink.com/m/6OPiGk9H7w7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors mt-1"
          >
            BY金融街小胖
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        {/* 右侧：二维码 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted dark:text-dark-muted">关注公众号</span>
          <Image
            src="/qrcode.jpeg"
            alt="微信公众号二维码"
            width={64}
            height={64}
            className="rounded"
          />
        </div>
      </div>
    </footer>
  )
}
