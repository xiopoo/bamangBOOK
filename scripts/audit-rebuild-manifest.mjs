import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/rebuild/migration-manifest.json'), 'utf8'))
const ids = new Set()
const targets = new Set()
const legacyPaths = new Set()
const issues = []

for (const item of manifest.items) {
  if (ids.has(item.id)) issues.push(`重复 ID：${item.id}`)
  ids.add(item.id)
  if (targets.has(item.targetPath)) issues.push(`重复新站路径：${item.targetPath}`)
  targets.add(item.targetPath)
  if (!item.targetPath.startsWith('/read/') || !item.sourcePath.startsWith('content/')) issues.push(`路径格式错误：${item.id}`)
  if (!fs.existsSync(path.join(root, item.sourcePath))) issues.push(`源文件缺失：${item.sourcePath}`)
  for (const legacyPath of item.legacyPaths || []) legacyPaths.add(legacyPath)
}

console.log(JSON.stringify({ total: manifest.items.length, uniqueIds: ids.size, uniqueTargetPaths: targets.size, legacyPaths: legacyPaths.size, issues }, null, 2))
if (issues.length) process.exitCode = 1
