const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const sourcePath = path.join(root, 'src/lib/normalize-letter-markdown.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const moduleShim = { exports: {} }
new Function('module', 'exports', compiled)(moduleShim, moduleShim.exports)
const { normalizeImportedMarkdown } = moduleShim.exports

const write = process.argv.includes('--write')
const fromHead = process.argv.includes('--from-head')
const handCorrected = new Set([
  'partnership_1956-有限合伙协议.md',
  'berkshire_2002-巴菲特致股东信.md',
])
const directories = ['content/letters', 'content/partnership']
let changed = 0

for (const directory of directories) {
  const absoluteDirectory = path.join(root, directory)
  for (const name of fs.readdirSync(absoluteDirectory).filter(name => name.endsWith('.md'))) {
    const filePath = path.join(absoluteDirectory, name)
    const relativePath = path.relative(root, filePath)
    const original = fromHead && !handCorrected.has(name)
      ? execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: root, encoding: 'utf8' })
      : fs.readFileSync(filePath, 'utf8')
    let normalized = original
    for (let pass = 0; pass < 6; pass += 1) {
      const next = `${normalizeImportedMarkdown(normalized)}\n`
      if (next === normalized) break
      normalized = next
    }
    if (normalized === original) continue
    changed += 1
    if (write) fs.writeFileSync(filePath, normalized)
  }
}

console.log(`${write ? 'normalized' : 'would normalize'} ${changed} Markdown files`)
