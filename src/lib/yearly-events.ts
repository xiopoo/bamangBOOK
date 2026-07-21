import { readFileSync, existsSync } from 'fs'
import path from 'path'

export interface EventItem {
  text: string
  isImportant: boolean
}

export interface YearlyEvent {
  year: string
  events: EventItem[]
}

export function getYearlyEvents(): YearlyEvent[] {
  const filePath = path.join(process.cwd(), 'content/yearly-events.md')
  
  if (!existsSync(filePath)) {
    return []
  }
  
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  
  const result: YearlyEvent[] = []
  let currentYear: string | null = null
  let currentEvents: EventItem[] = []
  
  lines.forEach(line => {
    const yearMatch = line.match(/^## (\d{4})年$/)
    if (yearMatch) {
      if (currentYear && currentEvents.length > 0) {
        result.push({ year: currentYear, events: [...currentEvents] })
      }
      currentYear = yearMatch[1]
      currentEvents = []
    } else if (line.startsWith('- ') && currentYear) {
      const eventText = line.replace(/^-\s*\[heading\]?/, '').trim()
      if (eventText) {
        const isImportant = eventText.startsWith('***')
        const text = isImportant ? eventText.replace(/^\*\*\*/, '').trim() : eventText
        currentEvents.push({ text, isImportant })
      }
    }
  })
  
  if (currentYear && currentEvents.length > 0) {
    result.push({ year: currentYear, events: currentEvents })
  }
  
  return result.sort((a, b) => parseInt(b.year) - parseInt(a.year))
}

export function getEventsByYear(year: string): EventItem[] {
  const allEvents = getYearlyEvents()
  const yearEvents = allEvents.find(e => e.year === year)
  return yearEvents?.events || []
}