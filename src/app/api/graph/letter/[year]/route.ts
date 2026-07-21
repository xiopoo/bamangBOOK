import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const graphCache = new Map<string, { data: any; timestamp: number }>()
const GRAPH_CACHE_TTL = 1000 * 60 * 60

let indexCache: { data: any; timestamp: number } | null = null

function getIndexData(): any {
  const now = Date.now()
  if (indexCache && now - indexCache.timestamp < GRAPH_CACHE_TTL) {
    return indexCache.data
  }
  const indexPath = path.join(process.cwd(), 'content/index.json')
  if (!fs.existsSync(indexPath)) return null
  const raw = fs.readFileSync(indexPath, 'utf-8')
  const data = JSON.parse(raw)
  indexCache = { data, timestamp: now }
  return data
}

function getGraphFromCache(key: string): any | null {
  const cached = graphCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > GRAPH_CACHE_TTL) {
    graphCache.delete(key)
    return null
  }
  return cached.data
}

function setGraphToCache(key: string, data: any): void {
  graphCache.set(key, { data, timestamp: Date.now() })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  const cacheKey = params.year
  const cachedData = getGraphFromCache(cacheKey)
  if (cachedData) {
    return NextResponse.json(cachedData, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600', 'X-Cache': 'HIT' }
    })
  }

  try {
    const index = getIndexData()
    if (!index) {
      return NextResponse.json({ year: cacheKey, concepts: [], people: [], companies: [], summary: { conceptCount: 0, peopleCount: 0, companyCount: 0 } })
    }
    
    const year = params.year
    const letter = (index.years || []).find((y: any) => y.year === parseInt(year)) || 
                   (index.letters || []).find((l: any) => l.year === year)
    
    if (!letter) {
      const defaultData = { year, concepts: [], people: [], companies: [], summary: { conceptCount: 0, peopleCount: 0, companyCount: 0 } }
      setGraphToCache(cacheKey, defaultData)
      return NextResponse.json(defaultData, { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600', 'X-Cache': 'MISS' } })
    }
    
    const conceptsMap = new Map()
    ;(index.concepts || []).forEach((concept: any) => {
      conceptsMap.set(concept.id, concept)
    })
    
    const conceptCards = (letter.concepts || []).map((letterConcept: any) => {
      const fullConcept = conceptsMap.get(letterConcept.id)
      return {
        id: letterConcept.id,
        name: fullConcept?.name || letterConcept.id,
        description: fullConcept?.description || '',
        count: letterConcept.count,
        totalCount: fullConcept?.count || 0,
        years: fullConcept?.years || [],
        relatedConcepts: fullConcept?.relatedConcepts || [],
        relatedPeople: fullConcept?.relatedPeople || []
      }
    })
    
    const people = letter.people || []
    const companies = letter.companies || []
    
    const responseData = {
      year,
      filename: letter.filename,
      concepts: conceptCards,
      people,
      companies,
      summary: {
        conceptCount: conceptCards.length,
        peopleCount: people.length,
        companyCount: companies.length
      }
    }
    
    setGraphToCache(cacheKey, responseData)

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600', 'X-Cache': 'MISS' }
    })
  } catch (error) {
    console.error('Error reading letter:', error)
    return NextResponse.json({ error: 'Failed to load letter' }, { status: 500 })
  }
}
