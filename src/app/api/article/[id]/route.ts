import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = decodeURIComponent(params.id)
    const articlesDir = path.join(process.cwd(), 'content/articles')
    
    // 查找文件
    const files = [
      path.join(articlesDir, `${id}.md`),
      path.join(articlesDir, `${decodeURIComponent(id)}.md`)
    ]

    let filePath = ''
    for (const fp of files) {
      if (existsSync(fp)) {
        filePath = fp
        break
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const content = readFileSync(filePath, 'utf-8')
    const title = id.replace('.md', '')

    return NextResponse.json({
      id,
      title,
      content
    })
  } catch (error) {
    console.error('Error reading article:', error)
    return NextResponse.json({ error: 'Failed to load article' }, { status: 500 })
  }
}
