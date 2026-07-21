import { readFileSync, existsSync } from 'fs'
import path from 'path'

export interface Recommendation {
  id: string
  type: 'concept' | 'company' | 'person' | 'letter'
  name: string
  count?: number
  years?: number[]
  relevance: number
}

export interface ConceptCooccurrence {
  concepts: string[]
  count: number
  years: number[]
}

interface IndexItem {
  id: string
  count: number
  years: number[]
}

interface IndexData {
  concepts: IndexItem[]
  people: IndexItem[]
  companies: IndexItem[]
  cooccurrence: ConceptCooccurrence[]
}

function getIndexData(): IndexData {
  const indexPath = path.join(process.cwd(), 'content/index.json')
  if (existsSync(indexPath)) {
    return JSON.parse(readFileSync(indexPath, 'utf-8'))
  }
  return { concepts: [], people: [], companies: [], cooccurrence: [] }
}

const indexData = getIndexData()
const concepts = indexData.concepts
const people = indexData.people
const companies = indexData.companies
const cooccurrence = indexData.cooccurrence

export function getRelatedConcepts(targetConcept: string, limit: number = 5): Recommendation[] {
  const related: Recommendation[] = []
  
  cooccurrence.forEach((item: ConceptCooccurrence) => {
    const idx = item.concepts.indexOf(targetConcept)
    if (idx !== -1) {
      const otherConcept = item.concepts[1 - idx]
      const conceptData = concepts.find((c: IndexItem) => c.id === otherConcept)
      if (conceptData) {
        related.push({
          id: otherConcept,
          type: 'concept',
          name: otherConcept,
          count: item.count,
          years: item.years,
          relevance: item.count / conceptData.count
        })
      }
    }
  })
  
  return related.sort((a: Recommendation, b: Recommendation) => b.relevance - a.relevance).slice(0, limit)
}

export function getRecommendedConceptsByYear(year: number, limit: number = 6): Recommendation[] {
  const yearConcepts = concepts.map((concept: IndexItem) => {
    const yearCount = concept.years.filter((y: number) => y === year).length
    return {
      id: concept.id,
      type: 'concept' as const,
      name: concept.id,
      count: concept.count,
      years: concept.years,
      relevance: yearCount > 0 ? concept.count / 100 : 0
    }
  }).filter((c: Recommendation) => c.relevance > 0)
  
  return yearConcepts.sort((a: Recommendation, b: Recommendation) => (b.count || 0) - (a.count || 0)).slice(0, limit)
}

export function getTopConcepts(limit: number = 10): Recommendation[] {
  return concepts
    .map((c: IndexItem) => ({
      id: c.id,
      type: 'concept' as const,
      name: c.id,
      count: c.count,
      years: c.years,
      relevance: c.count
    }))
    .sort((a: Recommendation, b: Recommendation) => (b.count || 0) - (a.count || 0))
    .slice(0, limit)
}

export function getTopPeople(limit: number = 5): Recommendation[] {
  const uniquePeople: Record<string, number> = {}
  
  people.forEach((person: IndexItem) => {
    const normalizedName = normalizeName(person.id)
    if (!uniquePeople[normalizedName] || person.count > uniquePeople[normalizedName]) {
      uniquePeople[normalizedName] = person.count
    }
  })
  
  return Object.entries(uniquePeople)
    .map(([name, count]) => ({
      id: name,
      type: 'person' as const,
      name,
      count,
      relevance: count
    }))
    .sort((a: Recommendation, b: Recommendation) => (b.count || 0) - (a.count || 0))
    .slice(0, limit)
}

export function getTopCompanies(limit: number = 5): Recommendation[] {
  const uniqueCompanies: Record<string, number> = {}
  
  companies.forEach((company: IndexItem) => {
    const normalizedName = normalizeName(company.id)
    if (!uniqueCompanies[normalizedName] || company.count > uniqueCompanies[normalizedName]) {
      uniqueCompanies[normalizedName] = company.count
    }
  })
  
  return Object.entries(uniqueCompanies)
    .map(([name, count]) => ({
      id: name,
      type: 'company' as const,
      name,
      count,
      relevance: count
    }))
    .sort((a: Recommendation, b: Recommendation) => (b.count || 0) - (a.count || 0))
    .slice(0, limit)
}

function normalizeName(name: string): string {
  const nameMap: Record<string, string> = {
    '巴菲特': '巴菲特',
    '沃伦·巴菲特': '巴菲特',
    'Warren Buffett': '巴菲特',
    'Buffett': '巴菲特',
    '芒格': '芒格',
    '查理·芒格': '芒格',
    'Charlie Munger': '芒格',
    'Munger': '芒格',
    '格雷格·阿贝尔': '格雷格·阿贝尔',
    'Greg Abel': '格雷格·阿贝尔',
    'Abel': '格雷格·阿贝尔',
    '盖可保险': 'GEICO',
    '伯克希尔': '伯克希尔哈撒韦',
    'Berkshire Hathaway': '伯克希尔哈撒韦',
    '可口可乐': '可口可乐',
    'Coca-Cola': '可口可乐',
    '美国运通': '美国运通',
    'American Express': '美国运通',
    '富国银行': '富国银行',
    'Wells Fargo': '富国银行',
    '美国银行': '美国银行',
    'Bank of America': '美国银行',
    '苹果': '苹果',
    'Apple': '苹果'
  }
  return nameMap[name] || name
}

function getRecommendationsForConcept(conceptName: string): {
  relatedConcepts: Recommendation[]
  mentionedInYears: number[]
} {
  const concept = concepts.find((c: IndexItem) => c.id === conceptName)
  const relatedConcepts = getRelatedConcepts(conceptName, 6)
  
  return {
    relatedConcepts,
    mentionedInYears: concept?.years || []
  }
}

export function getRecommendationsForLetter(year: number): {
  topConcepts: Recommendation[]
  topPeople: Recommendation[]
  topCompanies: Recommendation[]
} {
  return {
    topConcepts: getRecommendedConceptsByYear(year, 6),
    topPeople: getTopPeople(4),
    topCompanies: getTopCompanies(4)
  }
}
