import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = decodeURIComponent(params.id)

    // 允许子目录路径（如 "buffett/xxx"）；仍拒绝上跳序列与空字节，防止目录遍历。
    if (!id || id.includes('\\') || id.includes('\0') || id.includes('..')) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const articlesDir = path.join(process.cwd(), 'content/articles')
    const filePath = path.resolve(articlesDir, `${id}.md`)

    // 二次防线：解析后的绝对路径必须仍位于文章目录内。
    if (filePath !== path.join(articlesDir, `${id}.md`) ||
        !filePath.startsWith(articlesDir + path.sep)) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const content = readFileSync(filePath, 'utf-8')

    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : id

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
