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
    
    // 返回所有概念及其关联概念
    const concepts = index.concepts || []
    
    return NextResponse.json({
      concepts: concepts.map((concept: any) => ({
        id: concept.id,
        name: concept.name,
        description: concept.description,
        count: concept.count,
        years: concept.years,
        qaCount: concept.qaCount,
        relatedConcepts: concept.relatedConcepts || [],
        relatedPeople: concept.relatedPeople || []
      })),
      total: concepts.length
    })
  } catch (error) {
    console.error('Error reading concepts:', error)
    return NextResponse.json({ error: 'Failed to load concepts' }, { status: 500 })
  }
}