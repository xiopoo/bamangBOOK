import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import path from 'path'

export interface LetterItem {
  title: string
  content: string
}

export interface LetterData {
  year: string
  type: 'letter' | 'partnership'
  content?: string
  letters?: LetterItem[]
}

function isPdfOrBinary(content: string): boolean {
  const first200 = content.substring(0, 200)
  return first200.includes('%PDF') || first200.includes('endobj') ||
         first200.includes('xref') || first200.includes('%%EOF')
}

function cleanTitle(file: string, year: string): string {
  return file
    .replace(/\.md$/, '')
    .replace(/^(berkshire_|partnership_)/, '')
    .replace(year, '')
    .replace(/^[\-_\s]+|[\-_\s]+$/g, '')
}

export function getLetterByYear(year: string): LetterData | null {
  const yearNum = parseInt(year)
  const baseDir = process.cwd()

  const lettersDir = path.join(baseDir, 'content/letters')
  const lettersFiles = existsSync(lettersDir)
    ? readdirSync(lettersDir).filter(f => f.includes(year) && f.endsWith('.md'))
    : []

  if (lettersFiles.length === 0) {
    return null
  }

  const contentDir = path.join(baseDir, 'content/letters')

  if (lettersFiles.length > 1) {
    const letters = lettersFiles.map(file => {
      const filePath = path.join(contentDir, file)
      let content = readFileSync(filePath, 'utf-8')
      if (isPdfOrBinary(content)) {
        content = `# ${year} annual shareholder letter`
      }
      return {
        title: cleanTitle(file, year) || `${year}年信件`,
        content,
      }
    })

    return {
      year,
      type: 'letter',
      letters,
    }
  }

  const singleFile = lettersFiles[0]
  const filePath = path.join(contentDir, singleFile)

  if (!existsSync(filePath)) {
    return null
  }

  let content = readFileSync(filePath, 'utf-8')
  if (isPdfOrBinary(content)) {
    content = `# ${year} annual shareholder letter`
  }

  return {
    year,
    type: 'letter',
    content,
  }
}

function getLetterFileSize(year: string): number {
  const data = getLetterByYear(year)
  if (!data) return 0
  if (data.content) return data.content.length
  if (data.letters) {
    return data.letters.reduce((sum, l) => sum + l.content.length, 0)
  }
  return 0
}
