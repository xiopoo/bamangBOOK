import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    const year = params.year
    const qaDir = path.join(process.cwd(), 'content/qa')
    
    // 读取QA目录下的所有文件
    const files = readdirSync(qaDir)
    
    // 筛选出该年份的QA文件
    const yearQAFiles = files.filter(file => {
      // 匹配格式：YYYY年伯克希尔股东大会Q&A...
      const yearPattern = new RegExp(`^${year}年伯克希尔股东大会`)
      return yearPattern.test(file) || file.startsWith(`${year}-`)
    })
    
    // 读取每个文件的标题
    const qaList = yearQAFiles.map(file => {
      const filePath = path.join(qaDir, file)
      const content = readFileSync(filePath, 'utf-8')
      
      // 提取标题
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '')
      
      // 提取ID（文件名去掉.md后缀）
      const id = file.replace('.md', '')
      
      return {
        id,
        title,
        filename: file
      }
    })
    
    return NextResponse.json({
      year,
      qaList,
      count: qaList.length
    })
  } catch (error) {
    console.error('Error reading QA files:', error)
    return NextResponse.json({ error: 'Failed to load QA files' }, { status: 500 })
  }
}