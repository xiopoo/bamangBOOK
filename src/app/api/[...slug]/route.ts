import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { searchContent, type SearchItemType } from '@/lib/content-search'
import { getLetterByYear } from '@/lib/letters'

export const dynamic = 'force-dynamic'

/* ------------------------------------------------------------------ */
/* Shared helpers                                                     */
/* ------------------------------------------------------------------ */

const CONTENT_DIR = path.join(process.cwd(), 'content')
const CONCEPTS_DIR = path.join(CONTENT_DIR, 'concepts')
const COMPANIES_DIR = path.join(CONTENT_DIR, 'companies')
const PEOPLE_DIR = path.join(CONTENT_DIR, 'people')

function readIndex() {
  const indexPath = path.join(CONTENT_DIR, 'index.json')
  if (!existsSync(indexPath)) return null
  try {
    return JSON.parse(readFileSync(indexPath, 'utf-8'))
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* /api/search                                                        */
/* ------------------------------------------------------------------ */

const MAX_QUERY_LENGTH = 100

interface SearchResult {
  id: string
  title: string
  type: SearchItemType
  category?: string
  excerpt?: string
  path: string
  year?: string
  person?: string
}

const SEARCH_WEIGHTS: Record<SearchItemType, number> = {
  letter: 10,
  partnership: 10,
  qa: 9,
  concept: 8,
  company: 7,
  person: 7,
  book: 6,
  model: 6,
  blogger: 5,
  column: 5,
  article: 5,
  talk: 4,
  interview: 4,
}

function sortResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => {
    const wA = SEARCH_WEIGHTS[a.type] ?? 1
    const wB = SEARCH_WEIGHTS[b.type] ?? 1
    if (wB !== wA) return wB - wA
    return (a.title || '').localeCompare(b.title || '', 'zh')
  })
}

async function handleSearch(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = (searchParams.get('q') || '').trim()
  const typeFilter = searchParams.get('type')
  const limitParam = parseInt(searchParams.get('limit') || '100', 10)
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 100

  if (!query) {
    return NextResponse.json({ query: '', results: [], total: 0 })
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `查询长度不能超过 ${MAX_QUERY_LENGTH} 个字符` },
      { status: 400 }
    )
  }

  const raw = searchContent(query, limit)
  let results: SearchResult[] = raw.map((r) => ({
    id: r.item.id,
    title: r.item.name,
    type: r.item.type,
    category: r.item.type,
    excerpt: r.item.description,
    path: r.item.url,
    year: r.item.years?.[0]?.toString(),
    person: undefined,
  }))

  if (typeFilter && typeFilter !== 'all') {
    results = results.filter((r) => r.type === (typeFilter as SearchItemType))
  }

  results = sortResults(results)

  return NextResponse.json({
    query,
    results,
    total: results.length,
  })
}

/* ------------------------------------------------------------------ */
/* /api/chat                                                          */
/* ------------------------------------------------------------------ */

const MAX_QUESTION_LENGTH = 200

function normalizeQuestion(q: string): string {
  return (q || '').trim().replace(/\s+/g, ' ')
}

function usefulExcerpt(text: string, maxLen = 240): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  return clean.slice(0, maxLen) + '…'
}

async function handleChat(request: NextRequest) {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const question = normalizeQuestion(body?.question || '')
  if (!question) {
    return NextResponse.json({ error: '问题不能为空' }, { status: 400 })
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `问题长度不能超过 ${MAX_QUESTION_LENGTH} 个字符` },
      { status: 400 }
    )
  }

  const docs = searchContent(question, 12)

  const context = docs
    .map((d) => {
      const excerpt = d.item.description ? usefulExcerpt(d.item.description) : ''
      return `【${d.item.name}】（${d.item.type}）\n${excerpt}`
    })
    .join('\n\n')

  const reply =
    `（巴芒知识助手 · 本地检索模式）\n\n` +
    `根据站内资料，与「${question}」最相关的内容如下：\n\n` +
    (context || '未找到相关资料，建议调整关键词或在左侧导航浏览原著。') +
    `\n\n> 说明：当前为本地离线助手，仅基于本站内容做检索与摘录，不连接外部大模型。`

  return NextResponse.json({
    question,
    answer: reply,
    sources: docs.map((d) => ({
      title: d.item.name,
      type: d.item.type,
      url: d.item.url,
    })),
  })
}

/* ------------------------------------------------------------------ */
/* /api/index , /api/letters                                          */
/* ------------------------------------------------------------------ */

function handleIndex() {
  const index = readIndex()
  if (!index) {
    return NextResponse.json({ error: 'Index not found' }, { status: 404 })
  }
  return NextResponse.json({
    concepts: (index.concepts || []).map((concept: any) => ({
      id: concept.id,
      name: concept.name,
      description: concept.description,
      count: concept.count,
      years: concept.years,
      qaCount: concept.qaCount,
      relatedConcepts: concept.relatedConcepts || [],
      relatedPeople: concept.relatedPeople || [],
    })),
    total: (index.concepts || []).length,
  })
}

function handleLetters() {
  const index = readIndex()
  if (!index) {
    return NextResponse.json({ error: 'Index not found' }, { status: 404 })
  }
  return NextResponse.json({
    letters: index.letters || [],
    total: (index.letters || []).length,
  })
}

/* ------------------------------------------------------------------ */
/* /api/graph/nodes , /api/graph/concepts , /api/graph/entities ,    */
/* /api/graph/matrix , /api/graph/letter/[year]                       */
/* ------------------------------------------------------------------ */

const GRAPH_CACHE_TTL = 1000 * 60 * 60
let graphCache: { data: unknown; timestamp: number } | null = null
const graphLetterCache = new Map<string, { data: any; timestamp: number }>()
let graphIndexCache: { data: any; timestamp: number } | null = null

interface IndexItem {
  id: string
  count: number
  years: number[]
}
interface CooccurrenceItem {
  concepts: [string, string]
  count: number
  years: number[]
}
interface GraphNode {
  id: string
  name: string
  type: 'concept' | 'company' | 'person'
  count: number
  years: number[]
  category: string
  description: string
}
interface GraphLink {
  source: string
  target: string
  type: 'cooccurrence' | 'mention'
  weight: number
  label: string
}

function extractGraphDescription(filePath: string): string {
  try {
    if (!existsSync(filePath)) return ''
    const content = readFileSync(filePath, 'utf-8')
    try {
      const { data } = matter(content)
      if (data.description) return data.description
    } catch {}
    const lines = content
      .split('\n')
      .filter((l) => l.trim() && !l.startsWith('#'))
    return lines[0]?.trim()?.replace(/^[-*]\s*/, '')?.slice(0, 200) || ''
  } catch {
    return ''
  }
}

function getGraphFileIds(dir: string): string[] {
  try {
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  } catch {
    return []
  }
}

function getGraphIndexData(): any {
  const now = Date.now()
  if (graphIndexCache && now - graphIndexCache.timestamp < GRAPH_CACHE_TTL) {
    return graphIndexCache.data
  }
  const data = readIndex()
  graphIndexCache = { data, timestamp: now }
  return data
}

async function handleGraphNodes() {
  try {
    if (graphCache && Date.now() - graphCache.timestamp < GRAPH_CACHE_TTL) {
      return NextResponse.json(graphCache.data, { headers: { 'X-Cache': 'HIT' } })
    }

    const index = readIndex()
    if (!index) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 })
    }

    const concepts: IndexItem[] = index.concepts || []
    const people: IndexItem[] = index.people || []
    const companies: IndexItem[] = index.companies || []
    const cooccurrence: CooccurrenceItem[] = index.cooccurrence || []

    const conceptFileIds = getGraphFileIds(CONCEPTS_DIR)
    const companyFileIds = getGraphFileIds(COMPANIES_DIR)
    const peopleFileIds = getGraphFileIds(PEOPLE_DIR)

    const nodes: GraphNode[] = []
    const nodeIds = new Set<string>()

    concepts.forEach((c) => {
      const descPath = path.join(CONCEPTS_DIR, `${c.id}.md`)
      nodes.push({
        id: `concept_${c.id}`,
        name: c.id,
        type: 'concept',
        count: c.count,
        years: c.years || [],
        category: '投资概念',
        description: extractGraphDescription(descPath),
      })
      nodeIds.add(`concept_${c.id}`)
    })
    conceptFileIds.forEach((id) => {
      const nodeId = `concept_${id}`
      if (!nodeIds.has(nodeId)) {
        nodes.push({
          id: nodeId,
          name: id,
          type: 'concept',
          count: 0,
          years: [],
          category: '投资概念',
          description: extractGraphDescription(path.join(CONCEPTS_DIR, `${id}.md`)),
        })
        nodeIds.add(nodeId)
      }
    })

    people.forEach((p) => {
      const descPath = path.join(PEOPLE_DIR, `${p.id}.md`)
      nodes.push({
        id: `person_${p.id}`,
        name: p.id,
        type: 'person',
        count: p.count,
        years: p.years || [],
        category: '人物',
        description: extractGraphDescription(descPath),
      })
      nodeIds.add(`person_${p.id}`)
    })
    peopleFileIds.forEach((id) => {
      const nodeId = `person_${id}`
      if (!nodeIds.has(nodeId)) {
        nodes.push({
          id: nodeId,
          name: id,
          type: 'person',
          count: 0,
          years: [],
          category: '人物',
          description: extractGraphDescription(path.join(PEOPLE_DIR, `${id}.md`)),
        })
        nodeIds.add(nodeId)
      }
    })

    companies.forEach((c) => {
      const descPath = path.join(COMPANIES_DIR, `${c.id}.md`)
      nodes.push({
        id: `company_${c.id}`,
        name: c.id,
        type: 'company',
        count: c.count,
        years: c.years || [],
        category: '公司',
        description: extractGraphDescription(descPath),
      })
      nodeIds.add(`company_${c.id}`)
    })
    companyFileIds.forEach((id) => {
      const nodeId = `company_${id}`
      if (!nodeIds.has(nodeId)) {
        nodes.push({
          id: nodeId,
          name: id,
          type: 'company',
          count: 0,
          years: [],
          category: '公司',
          description: extractGraphDescription(path.join(COMPANIES_DIR, `${id}.md`)),
        })
        nodeIds.add(nodeId)
      }
    })

    const linkMap = new Map<string, GraphLink>()
    const addLink = (
      source: string,
      target: string,
      type: GraphLink['type'],
      count: number
    ) => {
      const key = [source, target].sort().join('::')
      const existing = linkMap.get(key)
      if (existing) {
        existing.weight += count
      } else {
        const label = type === 'cooccurrence' ? '共现' : '提及'
        linkMap.set(key, { source, target, type, weight: count, label })
      }
    }

    cooccurrence.forEach((co) => {
      const [c1, c2] = co.concepts
      addLink(`concept_${c1}`, `concept_${c2}`, 'cooccurrence', co.count)
    })

    const peopleByYear = new Map<number, string[]>()
    people.forEach((p) => {
      ;(p.years || []).forEach((year) => {
        if (!peopleByYear.has(year)) peopleByYear.set(year, [])
        peopleByYear.get(year)!.push(p.id)
      })
    })
    const companiesByYear = new Map<number, string[]>()
    companies.forEach((c) => {
      ;(c.years || []).forEach((year) => {
        if (!companiesByYear.has(year)) companiesByYear.set(year, [])
        companiesByYear.get(year)!.push(c.id)
      })
    })
    const conceptsByYear = new Map<number, string[]>()
    concepts.forEach((c) => {
      ;(c.years || []).forEach((year) => {
        if (!conceptsByYear.has(year)) conceptsByYear.set(year, [])
        conceptsByYear.get(year)!.push(c.id)
      })
    })

    conceptsByYear.forEach((conceptIds, year) => {
      const yearPeople = peopleByYear.get(year) || []
      const yearCompanies = companiesByYear.get(year) || []
      conceptIds.forEach((cId) => {
        yearPeople.forEach((pId) => addLink(`concept_${cId}`, `person_${pId}`, 'mention', 1))
        yearCompanies.forEach((coId) =>
          addLink(`concept_${cId}`, `company_${coId}`, 'mention', 1)
        )
      })
      yearPeople.forEach((pId) => {
        yearCompanies.forEach((coId) => addLink(`person_${pId}`, `company_${coId}`, 'mention', 1))
      })
    })

    const links = Array.from(linkMap.values())
    const responseData = {
      nodes,
      links,
      stats: {
        totalNodes: nodes.length,
        totalConcepts: nodes.filter((n) => n.type === 'concept').length,
        totalPeople: nodes.filter((n) => n.type === 'person').length,
        totalCompanies: nodes.filter((n) => n.type === 'company').length,
        totalLinks: links.length,
      },
    }
    graphCache = { data: responseData, timestamp: Date.now() }
    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' } })
  } catch (error) {
    console.error('Error building graph:', error)
    return NextResponse.json({ error: 'Failed to build graph' }, { status: 500 })
  }
}

function handleGraphConcepts() {
  const index = readIndex()
  if (!index) {
    return NextResponse.json({ error: 'Index not found' }, { status: 404 })
  }
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
      relatedPeople: concept.relatedPeople || [],
    })),
    total: concepts.length,
  })
}

function handleGraphEntities() {
  const index = readIndex()
  if (!index) {
    return NextResponse.json({ error: 'Index not found' }, { status: 404 })
  }
  const concepts = index.concepts || []
  const letters = index.letters || []

  const peopleMap = new Map<string, any>()
  const companiesMap = new Map<string, any>()

  concepts.forEach((concept: any) => {
    ;(concept.relatedPeople || []).forEach((person: any) => {
      if (!peopleMap.has(person.id)) {
        peopleMap.set(person.id, {
          id: person.id,
          name: person.name,
          count: person.count,
          relatedConcepts: [],
          relatedCompanies: [],
        })
      }
      const personData = peopleMap.get(person.id)
      personData.relatedConcepts.push({ id: concept.id, name: concept.name, count: person.count })
    })
    ;(concept.relatedCompanies || []).forEach((company: any) => {
      if (!companiesMap.has(company.id)) {
        companiesMap.set(company.id, {
          id: company.id,
          name: company.name,
          count: company.count,
          relatedConcepts: [],
          relatedPeople: [],
        })
      }
      const companyData = companiesMap.get(company.id)
      companyData.relatedConcepts.push({ id: concept.id, name: concept.name, count: company.count })
    })
  })

  letters.forEach((letter: any) => {
    ;(letter.people || []).forEach((person: any) => {
      if (peopleMap.has(person.id)) {
        const personData = peopleMap.get(person.id)
        if (!personData.years) personData.years = []
        personData.years.push(letter.year)
      }
    })
    ;(letter.companies || []).forEach((company: any) => {
      if (companiesMap.has(company.id)) {
        const companyData = companiesMap.get(company.id)
        if (!companyData.years) companyData.years = []
        companyData.years.push(letter.year)
      }
    })
  })

  concepts.forEach((concept: any) => {
    const conceptPeople = concept.relatedPeople || []
    const conceptCompanies = concept.relatedCompanies || []
    conceptPeople.forEach((person: any) => {
      conceptCompanies.forEach((company: any) => {
        const personData = peopleMap.get(person.id)
        const companyData = companiesMap.get(company.id)
        if (personData && companyData) {
          const existingCompany = personData.relatedCompanies.find(
            (c: any) => c.id === company.id
          )
          if (existingCompany) existingCompany.count += 1
          else
            personData.relatedCompanies.push({ id: company.id, name: company.name, count: 1 })
          const existingPerson = companyData.relatedPeople.find((p: any) => p.id === person.id)
          if (existingPerson) existingPerson.count += 1
          else companyData.relatedPeople.push({ id: person.id, name: person.name, count: 1 })
        }
      })
    })
  })

  const people = Array.from(peopleMap.values())
    .map((person: any) => ({
      id: person.id,
      name: person.name,
      count: person.count,
      years: person.years || [],
      relatedConcepts: person.relatedConcepts,
      relatedCompanies: person.relatedCompanies,
    }))
    .sort((a, b) => b.count - a.count)

  const companies = Array.from(companiesMap.values())
    .map((company: any) => ({
      id: company.id,
      name: company.name,
      count: company.count,
      years: company.years || [],
      relatedConcepts: company.relatedConcepts,
      relatedPeople: company.relatedPeople,
    }))
    .sort((a, b) => b.count - a.count)

  const nodes = [
    ...people.map((p: any) => ({ id: p.id, name: p.name, type: 'person', count: p.count })),
    ...companies.map((c: any) => ({ id: c.id, name: c.name, type: 'company', count: c.count })),
  ]
  const links: Array<{ source: string; target: string; count: number }> = []
  people.forEach((person: any) => {
    person.relatedCompanies.forEach((company: any) => {
      links.push({ source: person.id, target: company.id, count: company.count })
    })
  })

  return NextResponse.json({
    people,
    companies,
    network: { nodes, links },
    stats: {
      totalPeople: people.length,
      totalCompanies: companies.length,
      totalLinks: links.length,
    },
  })
}

function handleGraphMatrix() {
  const index = readIndex()
  if (!index) {
    return NextResponse.json({ error: 'Index not found' }, { status: 404 })
  }
  const concepts = index.concepts || []
  const letters = index.letters || []

  const conceptIndexMap = new Map<string, number>()
  concepts.forEach((concept: any, indexPos: number) => {
    conceptIndexMap.set(concept.id, indexPos)
  })

  const conceptCount = concepts.length
  const matrix: number[][] = Array(conceptCount)
    .fill(null)
    .map(() => Array(conceptCount).fill(0))

  letters.forEach((letter: any) => {
    const letterConcepts = letter.concepts || []
    for (let i = 0; i < letterConcepts.length; i++) {
      for (let j = i; j < letterConcepts.length; j++) {
        const ci = conceptIndexMap.get(letterConcepts[i].id)
        const cj = conceptIndexMap.get(letterConcepts[j].id)
        if (ci !== undefined && cj !== undefined) {
          matrix[ci][cj]++
          if (ci !== cj) matrix[cj][ci]++
        }
      }
    }
  })

  const conceptLabels = concepts.map((c: any) => ({ id: c.id, name: c.name, count: c.count }))
  const topCoOccurrences: Array<{ concept1: string; concept2: string; count: number }> = []
  for (let i = 0; i < conceptCount; i++) {
    for (let j = i + 1; j < conceptCount; j++) {
      if (matrix[i][j] > 0) {
        topCoOccurrences.push({
          concept1: concepts[i].id,
          concept2: concepts[j].id,
          count: matrix[i][j],
        })
      }
    }
  }
  topCoOccurrences.sort((a, b) => b.count - a.count)
  const topPairs = topCoOccurrences.slice(0, 100)

  return NextResponse.json({
    labels: conceptLabels,
    matrix,
    topCoOccurrences: topPairs,
    stats: {
      totalConcepts: conceptCount,
      totalLetters: letters.length,
      totalCoOccurrences: topCoOccurrences.length,
    },
  })
}

function handleGraphLetter(year: string) {
  if (!/^\d{4}$/.test(year)) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
  }
  const cached = graphLetterCache.get(year)
  if (cached && Date.now() - cached.timestamp < GRAPH_CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600', 'X-Cache': 'HIT' },
    })
  }

  const index = getGraphIndexData()
  const defaultData = {
    year,
    concepts: [],
    people: [],
    companies: [],
    summary: { conceptCount: 0, peopleCount: 0, companyCount: 0 },
  }
  if (!index) {
    return NextResponse.json(defaultData)
  }

  const letter =
    (index.years || []).find((y: any) => y.year === parseInt(year)) ||
    (index.letters || []).find((l: any) => l.year === year)

  if (!letter) {
    graphLetterCache.set(year, { data: defaultData, timestamp: Date.now() })
    return NextResponse.json(defaultData, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600', 'X-Cache': 'MISS' },
    })
  }

  const conceptsMap = new Map()
  ;(index.concepts || []).forEach((concept: any) => conceptsMap.set(concept.id, concept))

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
      relatedPeople: fullConcept?.relatedPeople || [],
    }
  })

  const responseData = {
    year,
    filename: letter.filename,
    concepts: conceptCards,
    people: letter.people || [],
    companies: letter.companies || [],
    summary: {
      conceptCount: conceptCards.length,
      peopleCount: (letter.people || []).length,
      companyCount: (letter.companies || []).length,
    },
  }
  graphLetterCache.set(year, { data: responseData, timestamp: Date.now() })
  return NextResponse.json(responseData, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600', 'X-Cache': 'MISS' },
  })
}

/* ------------------------------------------------------------------ */
/* /api/letter/[year]                                                 */
/* ------------------------------------------------------------------ */

const letterCache = new Map<string, { data: any; timestamp: number; fileSize: number }>()
const LETTER_CACHE_TTL = 1000 * 60 * 60

function handleLetter(year: string) {
  const cached = letterCache.get(year)
  if (cached && Date.now() - cached.timestamp < LETTER_CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Cache': 'HIT',
      },
    })
  }

  const data = getLetterByYear(year)
  if (!data) {
    return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
  }
  const fileSize = data.content
    ? data.content.length
    : data.letters?.reduce((sum: number, l: any) => sum + (l.content?.length ?? 0), 0) ?? 0
  letterCache.set(year, { data, timestamp: Date.now(), fileSize })
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Cache': 'MISS',
    },
  })
}

/* ------------------------------------------------------------------ */
/* /api/qa/[id] , /api/qa/year/[year]                                 */
/* ------------------------------------------------------------------ */

function readQaById(id: string) {
  if (
    !id ||
    id.includes('/') ||
    id.includes('\\') ||
    id.includes('\0') ||
    id.includes('..')
  ) {
    return null
  }
  const qaDir = path.join(CONTENT_DIR, 'qa')
  const filePath = path.resolve(qaDir, `${id}.md`)
  if (filePath !== path.join(qaDir, `${id}.md`) || !filePath.startsWith(qaDir + path.sep)) {
    return null
  }
  if (!existsSync(filePath)) return null
  const content = readFileSync(filePath, 'utf-8')
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : id
  const contentWithoutTitle = content.replace(/^#\s+.+\n\n?/, '')
  return { title, content: contentWithoutTitle }
}

function handleQaById(id: string) {
  const decoded = decodeURIComponent(id)
  const data = readQaById(decoded)
  if (!data) {
    return NextResponse.json({ error: 'QA not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}

function handleQaByYear(year: string) {
  if (!/^\d{4}$/.test(year)) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
  }
  const qaDir = path.join(CONTENT_DIR, 'qa')
  let files: string[]
  try {
    files = readdirSync(qaDir)
  } catch {
    return NextResponse.json({ error: 'Failed to load QA files' }, { status: 500 })
  }
  const yearPrefix = `${year}年伯克希尔股东大会`
  const yearQAFiles = files.filter(
    (file) => file.startsWith(yearPrefix) || file.startsWith(`${year}-`)
  )
  const qaList = yearQAFiles.map((file) => {
    const content = readFileSync(path.join(qaDir, file), 'utf-8')
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : file.replace('.md', '')
    return { id: file.replace('.md', ''), title, filename: file }
  })
  return NextResponse.json({ year, qaList, count: qaList.length })
}

/* ------------------------------------------------------------------ */
/* /api/article/[id]                                                  */
/* ------------------------------------------------------------------ */

function handleArticleById(id: string) {
  const decoded = decodeURIComponent(id)
  if (!decoded || decoded.includes('\\') || decoded.includes('\0') || decoded.includes('..')) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }
  const articlesDir = path.join(CONTENT_DIR, 'articles')
  const filePath = path.resolve(articlesDir, `${decoded}.md`)
  if (
    filePath !== path.join(articlesDir, `${decoded}.md`) ||
    !filePath.startsWith(articlesDir + path.sep)
  ) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }
  const content = readFileSync(filePath, 'utf-8')
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : decoded
  return NextResponse.json({ id: decoded, title, content })
}

/* ------------------------------------------------------------------ */
/* Dispatch                                                           */
/* ------------------------------------------------------------------ */

function dispatch(
  slug: string[],
  request: NextRequest
): NextResponse | Promise<NextResponse> {
  const [a, b, c] = slug

  // /api/search
  if (a === 'search') return handleSearch(request)

  // /api/index
  if (a === 'index') return handleIndex()

  // /api/letters
  if (a === 'letters') return handleLetters()

  // /api/graph/...
  if (a === 'graph') {
    if (b === 'nodes') return handleGraphNodes()
    if (b === 'concepts') return handleGraphConcepts()
    if (b === 'entities') return handleGraphEntities()
    if (b === 'matrix') return handleGraphMatrix()
    if (b === 'letter' && c) return handleGraphLetter(c)
    return NextResponse.json({ error: 'Unknown graph endpoint' }, { status: 404 })
  }

  // /api/letter/[year]
  if (a === 'letter' && b) return handleLetter(b)

  // /api/qa/year/[year]
  if (a === 'qa' && b === 'year' && c) return handleQaByYear(c)
  // /api/qa/[id]
  if (a === 'qa' && b) return handleQaById(b)

  // /api/article/[id]
  if (a === 'article' && b) return handleArticleById(b)

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return dispatch(params.slug, request)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  // Only /api/chat currently uses POST
  const slug = params.slug
  if (slug[0] === 'chat') return handleChat(request)
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
