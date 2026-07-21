import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import ThemeProvider from '@/components/ThemeProvider'
import { ProgressProvider } from '@/hooks/useProgress'
import './globals.css'

export const metadata: Metadata = {
  title: '巴芒书房 - 价值投资知识库',
  description: '系统梳理巴菲特股东信、合伙人信、股东大会问答、演讲访谈及芒格思想体系，构建中文世界最完整的价值投资知识图谱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className="bg-bg dark:bg-dark-bg text-text dark:text-dark-text min-h-screen transition-colors duration-300 overflow-x-hidden">
        <ThemeProvider>
          <ProgressProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 min-h-screen md:ml-60">
                {children}
              </main>
            </div>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
