import { getDocumentByFileName, getDocuments } from './documents'

const WESCO_PREFIX = 'Wesco_股东大会_'

const meetingSources: Record<number, string> = {
  1999: 'https://worldlypartners.com/wp-content/uploads/2024/01/1999-wesco-annual-meeting-notes-of-charlie-mungers-remarks-simpleinvestor.pdf',
  2000: 'https://worldlypartners.com/wp-content/uploads/2024/01/2000-wesco-annual-meeting-notes-of-charlie-mungers-remarks-whitney-tilson.pdf',
  2003: 'https://worldlypartners.com/wp-content/uploads/2024/01/2003-wesco-annual-meeting-notes-of-charlie-mungers-remarks-whitney-tilson.pdf',
  2007: 'https://worldlypartners.com/wp-content/uploads/2024/01/2007-wesco-annual-meeting-notes-of-charlie-mungers-remarks-whitney-tilson.pdf',
  2010: 'https://worldlypartners.com/wp-content/uploads/2024/01/2010-wesco-annual-meeting-notes-of-charlie-mungers-remarks.pdf',
}

const editorialYears = new Set(Object.keys(meetingSources).map(Number))

export interface WescoMeetingItem {
  title: string
  year: number
  wordCount: number
  fileName: string
  edition: '中文实录' | '中文整理'
  meetingSourceUrl?: string
  officialLetterUrl?: string
}

export interface WescoMeetingDetail extends WescoMeetingItem {
  content: string
}

export function isWescoMeetingFile(fileName: string): boolean {
  return fileName.startsWith(WESCO_PREFIX)
}

export function getWescoMeetings(): WescoMeetingItem[] {
  return getDocuments('qa', 'munger')
    .filter((item) => isWescoMeetingFile(item.fileName) && typeof item.year === 'number')
    .map((item) => {
      const year = item.year as number
      return {
        title: item.title,
        year,
        wordCount: item.wordCount,
        fileName: item.fileName,
        edition: editorialYears.has(year) ? '中文整理' as const : '中文实录' as const,
        meetingSourceUrl: meetingSources[year],
        officialLetterUrl: year >= 1997 && year <= 2009
          ? `https://www.berkshirehathaway.com/wesco/cm${year}.pdf`
          : undefined,
      }
    })
    .sort((a, b) => b.year - a.year)
}

export function getWescoMeetingByYear(year: number): WescoMeetingDetail | null {
  const item = getWescoMeetings().find((meeting) => meeting.year === year)
  if (!item) return null
  const document = getDocumentByFileName('qa', item.fileName)
  if (!document) return null
  return { ...item, content: document.content }
}
