import { NextRequest, NextResponse } from 'next/server'
import { getLetterByYear } from '@/lib/letters'

const cache = new Map<string, {
  data: any
  timestamp: number
  fileSize: number
}>()

const MAX_CACHE_SIZE = 100
const CACHE_TTL = 1000 * 60 * 60

function getFromCache(key: string): any | null {
  const cached = cache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return cached.data
}

function setToCache(key: string, data: any, fileSize: number): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) {
      cache.delete(oldestKey)
    }
  }
  cache.set(key, { data, timestamp: Date.now(), fileSize })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  const cacheKey = params.year

  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    return NextResponse.json(cachedData, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Cache': 'HIT'
      }
    })
  }

  try {
    const year = params.year
    const data = getLetterByYear(year)

    if (!data) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
    }

    const fileSize = data.content
      ? data.content.length
      : (data.letters?.reduce((sum, l) => sum + l.content.length, 0) ?? 0)

    setToCache(cacheKey, data, fileSize)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Cache': 'MISS'
      }
    })
  } catch (error) {
    console.error('Error reading letter:', error)
    return NextResponse.json({ error: 'Failed to load letter' }, { status: 500 })
  }
}
