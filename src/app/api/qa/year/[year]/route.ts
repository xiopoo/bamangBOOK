import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    const year = params.year

    // 年份必须为 4 位数字：既防止用户输入被直接拼进 RegExp 造成正则注入 / ReDoS，
    // 也避免非法参数触发无意义的目录扫描。
    if (!/^\d{4}$/.test(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const qaDir = path.join(process.cwd(), 'content/qa')
    
    // 读取QA目录下的所有文件
    const files = readdirSync(qaDir)
    
    // 筛选出该年份的QA文件（用字符串前缀匹配替代动态正则）
    const yearPrefix = `${year}年伯克希尔股东大会`
    const yearQAFiles = files.filter(file => {
      // 匹配格式：YYYY年伯克希尔股东大会Q&A... 或 YYYY-...
      return file.startsWith(yearPrefix) || file.startsWith(`${year}-`)
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