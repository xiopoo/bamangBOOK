import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = decodeURIComponent(params.id)

    // 校验 id，拒绝路径分隔符与上跳序列，防止目录遍历读取任意 .md 文件。
    if (!id || id.includes('/') || id.includes('\\') || id.includes('\0') || id.includes('..')) {
      return NextResponse.json({ error: 'QA not found' }, { status: 404 })
    }

    const qaDir = path.join(process.cwd(), 'content/qa')
    const filePath = path.resolve(qaDir, `${id}.md`)

    if (filePath !== path.join(qaDir, `${id}.md`) ||
        !filePath.startsWith(qaDir + path.sep)) {
      return NextResponse.json({ error: 'QA not found' }, { status: 404 })
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'QA not found' }, { status: 404 })
    }

    const content = readFileSync(filePath, 'utf-8')

    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : id

    // 移除标题行，只保留内容
    const contentWithoutTitle = content.replace(/^#\s+.+\n\n?/, '')

    return NextResponse.json({
      title,
      content: contentWithoutTitle
    })
  } catch (error) {
    console.error('Error reading QA:', error)
    return NextResponse.json({ error: 'Failed to load QA' }, { status: 500 })
  }
}
