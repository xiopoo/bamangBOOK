import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const filePath = path.join(process.cwd(), 'content/qa', `${id}.md`)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'QA not found' }, { status: 404 })
    }

    const content = readFileSync(filePath, 'utf-8')
    
    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : id

    // 移除标题行，只保留内容
    const contentWithoutTitle = content.replace(/^#\s+.+\n\n?/, '')

    return NextResponse.json({
      title,
      content: contentWithoutTitle
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load QA' }, { status: 500 })
  }
}