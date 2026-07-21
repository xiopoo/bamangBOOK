import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface MDContent {
  content: string
  data: Record<string, unknown>
}

function readMDFile(filePath: string): MDContent {
  const fullPath = path.join(process.cwd(), 'content', filePath)
  
  if (!fs.existsSync(fullPath)) {
    return { content: '', data: {} }
  }
  
  const fileContent = fs.readFileSync(fullPath, 'utf-8')
  const { content, data } = matter(fileContent)
  
  return { content, data }
}

function listMDFiles(dirPath: string): string[] {
  const fullPath = path.join(process.cwd(), 'content', dirPath)
  
  if (!fs.existsSync(fullPath)) {
    return []
  }
  
  return fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(dirPath, file))
}
