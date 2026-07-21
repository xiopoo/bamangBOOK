import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const indexPath = path.join(process.cwd(), 'content/index.json')
    
    if (!existsSync(indexPath)) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 })
    }
    
    const indexData = readFileSync(indexPath, 'utf-8')
    const index = JSON.parse(indexData)
    
    return NextResponse.json(index)
  } catch (error) {
    console.error('Error reading index:', error)
    return NextResponse.json({ error: 'Failed to load index' }, { status: 500 })
  }
}
