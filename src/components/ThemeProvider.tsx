'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 优先级：用户手动设置(localStorage) > 跟随系统深色模式 > 默认浅色。
    // 未手动设置时跟随系统偏好，并监听系统切换实时生效（如系统按固定时间/日落自动进入深色）。
    const stored = localStorage.getItem('reading-theme-v2') as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
      document.documentElement.classList.toggle('dark', stored === 'dark')
      return
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applySystem = () => {
      const next: Theme = media.matches ? 'dark' : 'light'
      setTheme(next)
      document.documentElement.classList.toggle('dark', media.matches)
    }
    applySystem()
    media.addEventListener('change', applySystem)
    return () => media.removeEventListener('change', applySystem)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('reading-theme-v2', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}
