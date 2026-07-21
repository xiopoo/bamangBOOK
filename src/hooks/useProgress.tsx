'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

// Key used in localStorage
const STORAGE_KEY = 'fuli-study-progress'

// Structure: { [pathId]: { completedItems: string[], lastUpdated: number } }
interface PathProgress {
  completedItems: string[]
  lastUpdated: number
}

interface ProgressState {
  [pathId: string]: PathProgress
}

interface ProgressContextType {
  progress: ProgressState
  isCompleted: (pathId: string, itemKey: string) => boolean
  toggleItem: (pathId: string, itemKey: string) => void
  getPathProgress: (pathId: string) => { completed: number; total: number; percent: number }
  getTotalProgress: () => { completed: number; total: number; percent: number }
}

const ProgressContext = createContext<ProgressContextType>({
  progress: {},
  isCompleted: () => false,
  toggleItem: () => {},
  getPathProgress: () => ({ completed: 0, total: 0, percent: 0 }),
  getTotalProgress: () => ({ completed: 0, total: 0, percent: 0 }),
})

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>({})
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setProgress(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    }
    setIsHydrated(true)
  }, [])

  // Persist to localStorage on change (skip during hydration)
  const persist = useCallback((newProgress: ProgressState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress))
    } catch {
      // storage full or unavailable
    }
  }, [])

  const isCompleted = useCallback((pathId: string, itemKey: string) => {
    return !!progress[pathId]?.completedItems.includes(itemKey)
  }, [progress])

  const toggleItem = useCallback((pathId: string, itemKey: string) => {
    setProgress(prev => {
      const current = prev[pathId] || { completedItems: [], lastUpdated: 0 }
      const isDone = current.completedItems.includes(itemKey)
      const newCompleted = isDone
        ? current.completedItems.filter(i => i !== itemKey)
        : [...current.completedItems, itemKey]
      
      const newState = {
        ...prev,
        [pathId]: {
          completedItems: newCompleted,
          lastUpdated: Date.now(),
        }
      }
      persist(newState)
      return newState
    })
  }, [persist])

  const getPathProgress = useCallback((pathId: string) => {
    const completed = progress[pathId]?.completedItems?.length || 0
    const completedItems = progress[pathId]?.completedItems || []
    return { completed, total: completedItems.length || 0, percent: 0 }
  }, [progress])

  const getTotalProgress = useCallback(() => {
    let completed = 0, total = 0
    for (const [, p] of Object.entries(progress)) {
      completed += p.completedItems.length
    }
    // Total is dynamic, count all registered items
    for (const [, p] of Object.entries(progress)) {
      total += p.completedItems.length
    }
    return {
      completed: Object.values(progress).reduce((s, p) => s + p.completedItems.length, 0),
      total: Object.keys(progress).length,
      percent: 0
    }
  }, [progress])

  if (!isHydrated) {
    // Return a minimal provider during SSR/hydration
    return <ProgressContext.Provider value={{ progress: {}, isCompleted: () => false, toggleItem: () => {}, getPathProgress: () => ({ completed: 0, total: 0, percent: 0 }), getTotalProgress: () => ({ completed: 0, total: 0, percent: 0 }) }}>{children}</ProgressContext.Provider>
  }

  return (
    <ProgressContext.Provider value={{ progress, isCompleted, toggleItem, getPathProgress, getTotalProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  return useContext(ProgressContext)
}
