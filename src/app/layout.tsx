import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import ThemeProvider from '@/components/ThemeProvider'
import { ProgressProvider } from '@/hooks/useProgress'
import BackToTop from '@/components/BackToTop'
import PageFooter from '@/components/PageFooter'
import JsonLd from '@/components/JsonLd'
import './globals.css'
// CSS 分层：tokens → reset → utilities → components/* → reading（阅读层规范，须在 reader.css 之后）
import '@/styles/tokens.css'
import '@/styles/reset.css'
import '@/styles/utilities.css'
import '@/styles/components/header.css'
import '@/styles/components/footer.css'
import '@/styles/components/page-header.css'
import '@/styles/components/cards.css'
import '@/styles/components/media.css'
import '@/styles/components/catalog.css'
import '@/styles/components/model.css'
import '@/styles/components/reader.css'
import '@/styles/components/edition.css'
import './reading.css'
import { siteConfig } from '@/lib/site'

const baseUrl = siteConfig.url.replace(/\/$/, '')
const siteJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    alternateName: 'bamangBOOK',
    url: baseUrl,
    inLanguage: 'zh-CN',
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.svg`,
    },
    description: siteConfig.description,
  },
]

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: '/',
    images: [{ url: '/og-v2.jpg', width: 1200, height: 630, alt: '复利书房｜巴菲特、芒格与公司研究' }],
  },
  twitter: {
    card: 'summary',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: siteConfig.hasProductionUrl
    ? { index: true, follow: true }
    : { index: false, follow: false },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '64x64' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <JsonLd data={siteJsonLd} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // ====== 1. 主题先于渲染生效（避免白/黑闪烁）======
                  var theme = localStorage.getItem('reading-theme-v2');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }

                  // ====== 2. 正文字号先于渲染生效（避免 16→19px 的 FOUC 抖动）======
                  var STORAGE_KEY = 'reader-font-size';
                  var MIN_SIZE = 17, DEFAULT_SIZE = 19, MAX_SIZE = 26;
                  var stored = Number(localStorage.getItem(STORAGE_KEY));
                  var size = Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_SIZE;
                  size = Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));
                  document.documentElement.style.setProperty('--text-size-base', size + 'px');
                  document.documentElement.dataset.readerFontSize = String(size);
                  document.documentElement.classList.add('reading-no-fouc');
                } catch (e) {
                  // 隐私模式等 localStorage 不可用时静默降级
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-bg dark:bg-dark-bg text-text dark:text-dark-text min-h-screen transition-colors duration-300 overflow-x-hidden">
        <ThemeProvider>
          <ProgressProvider>
            <SiteHeader />
            <main className="min-w-0 min-h-screen">
              {children}
            </main>
            <PageFooter />
            <BackToTop />
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
