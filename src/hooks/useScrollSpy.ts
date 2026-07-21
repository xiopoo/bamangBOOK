'use client'

import { useState, useEffect, useRef } from 'react'

interface ScrollSpyOptions {
  rootMargin?: string
  threshold?: number
}

export function useScrollSpy(
  sectionIds: string[],
  options: ScrollSpyOptions = {}
): { activeId: string | null; scrollToSection: (id: string) => void } {
  const { rootMargin = '-80px 0px -60% 0px', threshold = 0 } = options
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // 清理旧 observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }, { rootMargin, threshold })

    // 观察所有具有 id 的标题元素
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) {
        observerRef.current?.observe(el)
      }
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [sectionIds, rootMargin, threshold])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return { activeId, scrollToSection }
}
