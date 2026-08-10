import fs from 'node:fs'
import postcss from 'postcss'

const files = process.argv.slice(2).length ? process.argv.slice(2) : ['src/app/globals.css', 'src/app/reading.css']
let hasErrors = false

for (const file of files) {
  const root = postcss.parse(fs.readFileSync(file, 'utf8'), { from: file })
  const selectorLocations = new Map()
  const duplicateDeclarations = []

  root.walkRules(rule => {
    const context = []
    for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
      if (parent.type === 'atrule') context.unshift(`@${parent.name} ${parent.params}`)
    }
    const key = `${context.join(' > ')} :: ${rule.selector}`
    selectorLocations.set(key, [...(selectorLocations.get(key) || []), rule.source.start.line])

    const declarations = new Map()
    rule.walkDecls(declaration => {
      const declarationKey = declaration.prop
      declarations.set(declarationKey, [...(declarations.get(declarationKey) || []), declaration.source.start.line])
    })
    for (const [property, lines] of declarations) {
      if (lines.length > 1) duplicateDeclarations.push({ selector: rule.selector, property, lines })
    }
  })

  const duplicateSelectors = [...selectorLocations.entries()]
    .filter(([, lines]) => lines.length > 1)
    .map(([selector, lines]) => ({ selector, lines }))

  console.log(JSON.stringify({ file, duplicateSelectors, duplicateDeclarations }, null, 2))
  if (duplicateSelectors.length || duplicateDeclarations.length) hasErrors = true
}

if (hasErrors) process.exitCode = 1
