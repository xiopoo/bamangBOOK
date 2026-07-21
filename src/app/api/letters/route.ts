import { NextResponse } from 'next/server'
import { readdirSync, existsSync } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const lettersDir = path.join(process.cwd(), 'content/letters')

    if (!existsSync(lettersDir)) {
      return NextResponse.json([])
    }

    const files = readdirSync(lettersDir).filter(f => f.endsWith('.md'))

    const letters = files.map(file => {
      // Extract year from filename like "berkshire_2024-巴菲特致股东信.md"
      const yearMatch = file.match(/(\d{4})/)
      const year = yearMatch ? yearMatch[1] : null

      return {
        year: year,
        title: file.replace('.md', '').replace(/^\d{4}-/, '').replace(/berkshire_\d{4}-/, ''),
        filename: file
      }
    }).filter((l): l is typeof l & { year: string } => l.year !== null).sort((a, b) => parseInt(b.year) - parseInt(a.year))

    return NextResponse.json(letters)
  } catch (error) {
    console.error('Error reading letters:', error)
    return NextResponse.json([], { status: 500 })
  }
}