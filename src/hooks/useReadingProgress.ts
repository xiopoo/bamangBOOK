'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { ReadingProgress, saveProgress, getProgress } from '@/lib/reading-progress'

export function useReadingProgress(
  letterId: string,
  letterType: 'letter' | 'partnership' | 'concept' | 'company' | 'people',
  title: string,
  year?: string
) {
  const [currentProgress, setCurrentProgress] = useState(0)
  const [hasSavedProgress, setHasSavedProgress] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const savedProgress = useRef<ReadingProgress | null>(null)
  const lastSaveTime = useRef(0)
  const currentSectionRef = useRef<{ index: number; title: string } | null>(null)

  useEffect(() => {
    const saved = getProgress(letterId)
    savedProgress.current = saved
    setHasSavedProgress(saved !== null && saved.progress > 0)
    if (saved) {
      setCurrentProgress(saved.progress)
    }
  }, [letterId])

  // Section detection via IntersectionObserver for h2/h3
  useEffect(() => {
    if (!contentRef.current) return

    const article = contentRef.current
    const sections = article.querySelectorAll('h2, h3')
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const index = Array.from(sections).indexOf(el)
            currentSectionRef.current = {
              index,
              title: el.textContent || '',
            }
          }
        }
      },
      { threshold: 0.3 }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const THROTTLE_MS = 2000

    const saveCurrentProgress = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const maxScroll = docHeight - windowHeight

      if (maxScroll <= 0) return

      const progress = Math.min(100, Math.round((scrollTop / maxScroll) * 100))

      let paragraphIndex = 0
      let totalParagraphs = 0

      if (contentRef.current) {
        const article = contentRef.current
        const paragraphs = article.querySelectorAll('p, h2, h3, h4')
        totalParagraphs = paragraphs.length

        paragraphs.forEach((p, index) => {
          const rect = p.getBoundingClientRect()
          if (rect.top < windowHeight / 2) {
            paragraphIndex = index + 1
          }
        })
      }

      setCurrentProgress(progress)

      const progressData: ReadingProgress = {
        letterId,
        letterType,
        scrollPosition: scrollTop,
        totalHeight: docHeight,
        paragraphIndex,
        totalParagraphs,
        progress,
        lastReadAt: new Date().toISOString(),
        title,
        year,
        sectionIndex: currentSectionRef.current?.index,
        sectionTitle: currentSectionRef.current?.title,
      }

      saveProgress(progressData)
    }

    const handleScroll = () => {
      const now = Date.now()
      if (now - lastSaveTime.current < THROTTLE_MS) return
      lastSaveTime.current = now
      saveCurrentProgress()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Save on page unload
    const handleBeforeUnload = () => {
      saveCurrentProgress()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [letterId, letterType, title, year])

  const scrollToPosition = useCallback(() => {
    const saved = savedProgress.current
    if (saved && saved.scrollPosition > 0) {
      window.scrollTo({
        top: saved.scrollPosition,
        behavior: 'smooth',
      })
    }
  }, [])

  return {
    contentRef,
    currentProgress,
    savedProgress: savedProgress.current,
    hasSavedProgress,
    scrollToPosition,
  }
}
