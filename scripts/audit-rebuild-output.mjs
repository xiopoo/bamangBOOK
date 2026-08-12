import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/rebuild/migration-manifest.json'), 'utf8'))
const missing = []

for (const item of manifest.items) {
  const slug = item.targetPath.split('/').pop()
  const outputPath = path.join(root, 'out/archive', item.person, item.collection, `${slug}.html`)
  if (!fs.existsSync(outputPath)) missing.push(outputPath)
}

const required = ['out/index.html', 'out/archive.html', 'out/research.html', 'out/writers.html', 'out/books.html']
for (const relativePath of required) if (!fs.existsSync(path.join(root, relativePath))) missing.push(relativePath)

console.log(JSON.stringify({ expectedReaderPages: manifest.items.length, missing: missing.length, samples: missing.slice(0, 20) }, null, 2))
if (missing.length) process.exitCode = 1
