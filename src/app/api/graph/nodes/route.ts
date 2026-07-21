import { NextResponse } from 'next/server'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'

// 内容文件路径
const CONTENT_DIR = path.join(process.cwd(), 'content')
const CONCEPTS_DIR = path.join(CONTENT_DIR, 'concepts')
const COMPANIES_DIR = path.join(CONTENT_DIR, 'companies')
const PEOPLE_DIR = path.join(CONTENT_DIR, 'people')

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

// 读取md文件获取描述信息
function extractDescription(filePath: string): string {
  try {
    if (!existsSync(filePath)) return ''
    const content = readFileSync(filePath, 'utf-8')
    // 尝试提取front matter中的description
    try {
      const { data } = matter(content)
      if (data.description) return data.description
    } catch {}
    // 提取第一段非标题文本作为描述
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'))
    return lines[0]?.trim()?.replace(/^[-*]\s*/, '')?.slice(0, 200) || ''
  } catch {
    return ''
  }
}

// 获取目录下所有文件的文件名（不含扩展名）作为id列表
function getFileIds(dir: string): string[] {
  try {
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const indexPath = path.join(CONTENT_DIR, 'index.json')
    if (!existsSync(indexPath)) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 })
    }

    const indexData = readFileSync(indexPath, 'utf-8')
    const index = JSON.parse(indexData)

    const concepts: IndexItem[] = index.concepts || []
    const people: IndexItem[] = index.people || []
    const companies: IndexItem[] = index.companies || []
    const cooccurrence: CooccurrenceItem[] = index.cooccurrence || []

    // 获取所有content文件中的实体id
    const conceptFileIds = getFileIds(CONCEPTS_DIR)
    const companyFileIds = getFileIds(COMPANIES_DIR)
    const peopleFileIds = getFileIds(PEOPLE_DIR)

    // 构建节点
    const nodes: GraphNode[] = []
    const nodeIds = new Set<string>()

    // 概念节点
    concepts.forEach(c => {
      const descPath = path.join(CONCEPTS_DIR, `${c.id}.md`)
      const description = extractDescription(descPath)
      nodes.push({
        id: `concept_${c.id}`,
        name: c.id,
        type: 'concept',
        count: c.count,
        years: c.years || [],
        category: '投资概念',
        description
      })
      nodeIds.add(`concept_${c.id}`)
    })

    // 补充仅在文件系统中出现但不在index.json中的概念
    conceptFileIds.forEach(id => {
      const nodeId = `concept_${id}`
      if (!nodeIds.has(nodeId)) {
        const descPath = path.join(CONCEPTS_DIR, `${id}.md`)
        nodes.push({
          id: nodeId,
          name: id,
          type: 'concept',
          count: 0,
          years: [],
          category: '投资概念',
          description: extractDescription(descPath)
        })
        nodeIds.add(nodeId)
      }
    })

    // 人物节点
    people.forEach(p => {
      const descPath = path.join(PEOPLE_DIR, `${p.id}.md`)
      const description = extractDescription(descPath)
      nodes.push({
        id: `person_${p.id}`,
        name: p.id,
        type: 'person',
        count: p.count,
        years: p.years || [],
        category: '人物',
        description
      })
      nodeIds.add(`person_${p.id}`)
    })

    // 补充仅在文件系统中出现的人物
    peopleFileIds.forEach(id => {
      const nodeId = `person_${id}`
      if (!nodeIds.has(nodeId)) {
        const descPath = path.join(PEOPLE_DIR, `${id}.md`)
        nodes.push({
          id: nodeId,
          name: id,
          type: 'person',
          count: 0,
          years: [],
          category: '人物',
          description: extractDescription(descPath)
        })
        nodeIds.add(nodeId)
      }
    })

    // 公司节点
    companies.forEach(c => {
      const descPath = path.join(COMPANIES_DIR, `${c.id}.md`)
      const description = extractDescription(descPath)
      nodes.push({
        id: `company_${c.id}`,
        name: c.id,
        type: 'company',
        count: c.count,
        years: c.years || [],
        category: '公司',
        description
      })
      nodeIds.add(`company_${c.id}`)
    })

    // 补充仅在文件系统中出现的公司
    companyFileIds.forEach(id => {
      const nodeId = `company_${id}`
      if (!nodeIds.has(nodeId)) {
        const descPath = path.join(COMPANIES_DIR, `${id}.md`)
        nodes.push({
          id: nodeId,
          name: id,
          type: 'company',
          count: 0,
          years: [],
          category: '公司',
          description: extractDescription(descPath)
        })
        nodeIds.add(nodeId)
      }
    })

    // 构建关系
    const linkMap = new Map<string, GraphLink>()
    
    const addLink = (source: string, target: string, type: GraphLink['type'], count: number) => {
      const key = [source, target].sort().join('::')
      const existing = linkMap.get(key)
      if (existing) {
        existing.weight += count
      } else {
        const label = type === 'cooccurrence' ? '共现' : '提及'
        linkMap.set(key, { source, target, type, weight: count, label })
      }
    }

    // 1. 基于共现数据建立概念间关系（共现）
    cooccurrence.forEach(co => {
      const [c1, c2] = co.concepts
      addLink(`concept_${c1}`, `concept_${c2}`, 'cooccurrence', co.count)
    })

    // 2. 基于年份共现建立概念-人物、概念-公司、人物-公司关系（提及）
    // 将people/companies展开为按年份的索引
    const peopleByYear = new Map<number, string[]>()
    people.forEach(p => {
      p.years.forEach(year => {
        if (!peopleByYear.has(year)) peopleByYear.set(year, [])
        peopleByYear.get(year)!.push(p.id)
      })
    })

    const companiesByYear = new Map<number, string[]>()
    companies.forEach(c => {
      c.years.forEach(year => {
        if (!companiesByYear.has(year)) companiesByYear.set(year, [])
        companiesByYear.get(year)!.push(c.id)
      })
    })

    const conceptsByYear = new Map<number, string[]>()
    concepts.forEach(c => {
      c.years.forEach(year => {
        if (!conceptsByYear.has(year)) conceptsByYear.set(year, [])
        conceptsByYear.get(year)!.push(c.id)
      })
    })

    // 如果两个实体在同一年出现，建立关联（提及关系）
    conceptsByYear.forEach((conceptIds, year) => {
      const yearPeople = peopleByYear.get(year) || []
      const yearCompanies = companiesByYear.get(year) || []

      conceptIds.forEach(cId => {
        yearPeople.forEach(pId => {
          addLink(`concept_${cId}`, `person_${pId}`, 'mention', 1)
        })
        yearCompanies.forEach(coId => {
          addLink(`concept_${cId}`, `company_${coId}`, 'mention', 1)
        })
      })

      yearPeople.forEach(pId => {
        yearCompanies.forEach(coId => {
          addLink(`person_${pId}`, `company_${coId}`, 'mention', 1)
        })
      })
    })

    const links = Array.from(linkMap.values())

    return NextResponse.json({
      nodes,
      links,
      stats: {
        totalNodes: nodes.length,
        totalConcepts: nodes.filter(n => n.type === 'concept').length,
        totalPeople: nodes.filter(n => n.type === 'person').length,
        totalCompanies: nodes.filter(n => n.type === 'company').length,
        totalLinks: links.length
      }
    })
  } catch (error) {
    console.error('Error building graph:', error)
    return NextResponse.json({ error: 'Failed to build graph' }, { status: 500 })
  }
}
