import fs from 'node:fs'
import path from 'node:path'

const root = path.join(process.cwd(), 'content', 'buffettfaq_cnbc')
const normalize = (value) => value.replace(/\r/g, '').replace(/[ \t]+$/gm, '').trim()
let changed = 0
let skipped = 0

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (entry.name.endsWith('.md')) {
      const source = fs.readFileSync(file, 'utf8')
      const headings = [...source.matchAll(/^## .+$/gm)]
      if (headings.length < 10) continue

      const firstHeading = headings[0][0]
      const firstStart = headings[0].index
      const secondStart = source.indexOf(firstHeading, firstStart + firstHeading.length)
      if (secondStart <= firstStart) continue

      const firstCopy = source.slice(firstStart, secondStart)
      const secondCopy = source.slice(secondStart)
      if (normalize(firstCopy) !== normalize(secondCopy)) {
        skipped++
        continue
      }

      fs.writeFileSync(file, source.slice(0, secondStart).trimEnd() + '\n')
      changed++
    }
  }
}

walk(root)
console.log(JSON.stringify({ changed, skipped }))
