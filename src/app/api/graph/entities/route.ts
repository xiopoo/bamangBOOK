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
    
    const concepts = index.concepts || []
    const letters = index.letters || []
    
    // 提取所有人物和公司实体
    const peopleMap = new Map<string, any>()
    const companiesMap = new Map<string, any>()
    
    // 从概念中提取关联的人物和公司
    concepts.forEach((concept: any) => {
      // 提取人物
      ;(concept.relatedPeople || []).forEach((person: any) => {
        if (!peopleMap.has(person.id)) {
          peopleMap.set(person.id, {
            id: person.id,
            name: person.name,
            count: person.count,
            relatedConcepts: [],
            relatedCompanies: []
          })
        }
        const personData = peopleMap.get(person.id)
        personData.relatedConcepts.push({
          id: concept.id,
          name: concept.name,
          count: person.count
        })
      })
      
      // 提取公司
      ;(concept.relatedCompanies || []).forEach((company: any) => {
        if (!companiesMap.has(company.id)) {
          companiesMap.set(company.id, {
            id: company.id,
            name: company.name,
            count: company.count,
            relatedConcepts: [],
            relatedPeople: []
          })
        }
        const companyData = companiesMap.get(company.id)
        companyData.relatedConcepts.push({
          id: concept.id,
          name: concept.name,
          count: company.count
        })
      })
    })
    
    // 从信件中提取人物和公司的出现信息
    letters.forEach((letter: any) => {
      ;(letter.people || []).forEach((person: any) => {
        if (peopleMap.has(person.id)) {
          const personData = peopleMap.get(person.id)
          if (!personData.years) {
            personData.years = []
          }
          personData.years.push(letter.year)
        }
      })
      
      ;(letter.companies || []).forEach((company: any) => {
        if (companiesMap.has(company.id)) {
          const companyData = companiesMap.get(company.id)
          if (!companyData.years) {
            companyData.years = []
          }
          companyData.years.push(letter.year)
        }
      })
    })
    
    // 构建人物和公司之间的关系
    // 遍历所有概念，找出同时关联某个人物和某个公司的概念
    concepts.forEach((concept: any) => {
      const conceptPeople = concept.relatedPeople || []
      const conceptCompanies = concept.relatedCompanies || []
      
      // 对于每个关联的人物和公司对，建立关系
      conceptPeople.forEach((person: any) => {
        conceptCompanies.forEach((company: any) => {
          const personData = peopleMap.get(person.id)
          const companyData = companiesMap.get(company.id)
          
          if (personData && companyData) {
            // 为人物添加关联公司
            const existingCompany = personData.relatedCompanies.find(
              (c: any) => c.id === company.id
            )
            if (existingCompany) {
              existingCompany.count += 1
            } else {
              personData.relatedCompanies.push({
                id: company.id,
                name: company.name,
                count: 1
              })
            }
            
            // 为公司添加关联人物
            const existingPerson = companyData.relatedPeople.find(
              (p: any) => p.id === person.id
            )
            if (existingPerson) {
              existingPerson.count += 1
            } else {
              companyData.relatedPeople.push({
                id: person.id,
                name: person.name,
                count: 1
              })
            }
          }
        })
      })
    })
    
    // 转换为数组并排序
    const people = Array.from(peopleMap.values()).map((person: any) => ({
      id: person.id,
      name: person.name,
      count: person.count,
      years: person.years || [],
      relatedConcepts: person.relatedConcepts,
      relatedCompanies: person.relatedCompanies
    })).sort((a, b) => b.count - a.count)
    
    const companies = Array.from(companiesMap.values()).map((company: any) => ({
      id: company.id,
      name: company.name,
      count: company.count,
      years: company.years || [],
      relatedConcepts: company.relatedConcepts,
      relatedPeople: company.relatedPeople
    })).sort((a, b) => b.count - a.count)
    
    // 构建关系网络数据（用于可视化）
    const nodes = [
      ...people.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: 'person',
        count: p.count
      })),
      ...companies.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: 'company',
        count: c.count
      }))
    ]
    
    const links: Array<{ source: string; target: string; count: number }> = []
    
    // 添加人物和公司之间的链接
    people.forEach((person: any) => {
      person.relatedCompanies.forEach((company: any) => {
        links.push({
          source: person.id,
          target: company.id,
          count: company.count
        })
      })
    })
    
    return NextResponse.json({
      people,
      companies,
      network: {
        nodes,
        links
      },
      stats: {
        totalPeople: people.length,
        totalCompanies: companies.length,
        totalLinks: links.length
      }
    })
  } catch (error) {
    console.error('Error reading entities:', error)
    return NextResponse.json({ error: 'Failed to load entities' }, { status: 500 })
  }
}