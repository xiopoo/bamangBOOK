import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  className?: string
}

const maxWidthMap: Record<NonNullable<PageContainerProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

export default function PageContainer({
  children,
  maxWidth = '6xl',
  className = '',
}: PageContainerProps) {
  return (
    <div
      className={`min-h-screen bg-bg-card dark:bg-dark-bg text-text dark:text-dark-text ${maxWidthMap[maxWidth]} mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10 ${className}`}
    >
      {children}
    </div>
  )
}
