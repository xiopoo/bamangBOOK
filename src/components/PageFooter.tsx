import Image from 'next/image'
import Link from 'next/link'

const footerLinks = [
  { href: '/letters', label: '股东信' },
  { href: '/articles', label: '深度文章' },
  { href: '/companies', label: '公司档案' },
  { href: '/concepts', label: '投资概念' },
  { href: '/people', label: '人物' },
  { href: '/bloggers', label: '博主' },
]

export default function PageFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 mt-12 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 品牌信息 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              复利书房
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              一个人把巴菲特70年的股东信变成了一张知识图谱。
            </p>
            <a
              href="https://xhslink.com/m/6OPiGk9H7w7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#AB1942] hover:opacity-80 transition-opacity"
            >
              BY金融街小胖
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* 导航链接 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              探索内容
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {footerLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#AB1942] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 二维码 */}
          <div className="flex flex-col items-center md:items-end">
            <Image
              src="/qrcode.jpeg"
              alt="微信公众号二维码"
              width={80}
              height={80}
              className="rounded-lg"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              关注公众号
            </span>
          </div>
        </div>

        {/* 版权 */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} 灰金重组
          </p>
        </div>
      </div>
    </footer>
  )
}
