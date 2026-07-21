import Image from 'next/image'

export default function PageFooter() {
  return (
    <footer className="border-t border-primary/10 py-6 mt-12">
      <div className="text-center text-sm text-text-muted dark:text-dark-muted">
        价值投资知识宝库
      </div>
      <div className="mt-3 text-center">
        <a
          href="https://xhslink.com/m/6OPiGk9H7w7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark transition-colors"
        >
          BY金融街小胖
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-text-muted dark:text-dark-muted mb-2">关注微信公众号</p>
        <Image
          src="/qrcode.jpeg"
          alt="微信公众号二维码"
          width={120}
          height={120}
          className="mx-auto rounded-lg"
        />
      </div>
    </footer>
  )
}
