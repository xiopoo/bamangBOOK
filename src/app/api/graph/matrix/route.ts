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
    
    // 创建概念ID到索引的映射
    const conceptIndexMap = new Map<string, number>()
    concepts.forEach((concept: any, index: number) => {
      conceptIndexMap.set(concept.id, index)
    })
    
    const conceptCount = concepts.length
    
    // 初始化共现矩阵
    const matrix: number[][] = Array(conceptCount).fill(null)
      .map(() => Array(conceptCount).fill(0))
    
    // 统计概念共现
    letters.forEach((letter: any) => {
      const letterConcepts = letter.concepts || []
      
      // 对于每封信件中的概念对，增加共现计数
      for (let i = 0; i < letterConcepts.length; i++) {
        for (let j = i; j < letterConcepts.length; j++) {
          const concept1Index = conceptIndexMap.get(letterConcepts[i].id)
          const concept2Index = conceptIndexMap.get(letterConcepts[j].id)
          
          if (concept1Index !== undefined && concept2Index !== undefined) {
            matrix[concept1Index][concept2Index]++
            if (concept1Index !== concept2Index) {
              matrix[concept2Index][concept1Index]++
            }
          }
        }
      }
    })
    
    // 构建返回数据
    const conceptLabels = concepts.map((c: any) => ({
      id: c.id,
      name: c.name,
      count: c.count
    }))
    
    // 找出共现次数最多的概念对（用于前端展示）
    const topCoOccurrences: Array<{ concept1: string; concept2: string; count: number }> = []
    for (let i = 0; i < conceptCount; i++) {
      for (let j = i + 1; j < conceptCount; j++) {
        if (matrix[i][j] > 0) {
          topCoOccurrences.push({
            concept1: concepts[i].id,
            concept2: concepts[j].id,
            count: matrix[i][j]
          })
        }
      }
    }
    
    // 按共现次数排序，取前100个
    topCoOccurrences.sort((a, b) => b.count - a.count)
    const topPairs = topCoOccurrences.slice(0, 100)
    
    return NextResponse.json({
      labels: conceptLabels,
      matrix,
      topCoOccurrences: topPairs,
      stats: {
        totalConcepts: conceptCount,
        totalLetters: letters.length,
        totalCoOccurrences: topCoOccurrences.length
      }
    })
  } catch (error) {
    console.error('Error reading matrix:', error)
    return NextResponse.json({ error: 'Failed to load matrix' }, { status: 500 })
  }
}