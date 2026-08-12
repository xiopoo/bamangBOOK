import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] || 'out')
const htmlFiles = []

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(absolute)
    else if (entry.name.endsWith('.html')) htmlFiles.push(absolute)
  }
}

function outputCandidates(pathname) {
  let decoded = pathname
  try { decoded = decodeURIComponent(pathname) } catch {}
  const encoded = encodeURI(decoded).replace(/#/g, '%23').replace(/\?/g, '%3F')
  const relatives = [...new Set([decoded, encoded].map(value => value.replace(/^\/+/, '').replace(/\/$/, '')))]
  if (relatives.includes('')) return [path.join(root, 'index.html')]
  return relatives.flatMap(relative => [
      path.join(root, `${relative}.html`),
      path.join(root, relative, 'index.html'),
      path.join(root, relative),
    ])
}

function existsForPath(pathname) {
  return outputCandidates(pathname).some(candidate => fs.existsSync(candidate))
}

function pagePath(file) {
  const relative = path.relative(root, file).split(path.sep).join('/')
  if (relative === 'index.html') return '/'
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -11)}`
  return `/${relative.slice(0, -5)}`
}

function normalizedPathname(value) {
  let pathname = value
  try { pathname = new URL(value, 'https://example.test').pathname } catch {}
  try { pathname = decodeURIComponent(pathname) } catch {}
  return pathname.replace(/\/$/, '') || '/'
}

if (!fs.existsSync(root)) {
  console.error(`Static output not found: ${root}`)
  process.exit(1)
}

walk(root)

const broken = new Map()
const undefinedLinks = []
const missingTitle = []
const missingDescription = []
const missingCanonical = []
const missingImageAlt = []
const editorialBoilerplate = []
const inlineBlackContent = []
const legacyThemeBoot = []
const titles = new Map()
const canonicals = new Map()

const forbiddenEditorialPhrases = [
  '资料性质',
  '整理说明',
  '来源与编辑说明',
  '持续修订中',
  '内容仅用于学习与研究，不构成证券推荐',
]

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  const current = pagePath(file)
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim()
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim()
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1]?.trim()
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]?.trim()
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1]?.trim()

  if (!title) missingTitle.push(current)
  else titles.set(title, [...(titles.get(title) || []), current])
  if (!description) missingDescription.push(current)
  if (!canonical) missingCanonical.push(current)
  else canonicals.set(canonical, [...(canonicals.get(canonical) || []), current])

  const matchedBoilerplate = forbiddenEditorialPhrases.filter(phrase => html.includes(phrase))
  if (matchedBoilerplate.length) editorialBoilerplate.push([current, matchedBoilerplate])
  if (/<(?:main|article|section|div)\b[^>]*(?:style=["'][^"']*(?:background\s*:\s*(?:black|#000)|background-color\s*:\s*(?:black|#000))|bgcolor=["']?(?:black|#000))/i.test(html)) inlineBlackContent.push(current)
  if (html.includes("localStorage.getItem('theme')") || html.includes("localStorage.getItem('reading-theme-v2')")) legacyThemeBoot.push(current)

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    if (!/\balt=["'][^"']+["']/i.test(tag)) missingImageAlt.push(current)
  }

  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = match[1]
    if (/undefined/i.test(href)) undefinedLinks.push([current, href])
    if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/_next/') || href.startsWith('/images/') || href.startsWith('/fonts/') || href.startsWith('/api/')) continue
    let pathname
    try { pathname = new URL(href, 'https://example.test').pathname } catch { continue }
    if (!existsForPath(pathname)) broken.set(`${current} → ${pathname}`, true)
  }
}

const duplicateTitles = [...titles.entries()].filter(([, pages]) => pages.length > 1)
const duplicateCanonicals = [...canonicals.entries()].filter(([, pages]) => pages.length > 1)
const canonicalAliasGroups = []
const canonicalConflicts = []
for (const [canonical, pages] of duplicateCanonicals) {
  const primaryPath = normalizedPathname(canonical)
  const primaryPages = pages.filter(page => normalizedPathname(page) === primaryPath)
  if (primaryPages.length === 1) canonicalAliasGroups.push([canonical, pages])
  else canonicalConflicts.push([canonical, pages])
}
const unexpectedMissingCanonical = missingCanonical.filter(page => page !== '/404')
const pagesMissingImageAlt = [...new Set(missingImageAlt)]
const report = {
  htmlPages: htmlFiles.length,
  brokenInternalLinks: broken.size,
  undefinedLinks: undefinedLinks.length,
  missingTitle: missingTitle.length,
  missingDescription: missingDescription.length,
  missingCanonical: unexpectedMissingCanonical.length,
  missingImageAlt: pagesMissingImageAlt.length,
  duplicateTitles: duplicateTitles.length,
  canonicalAliasGroups: canonicalAliasGroups.length,
  canonicalConflicts: canonicalConflicts.length,
  editorialBoilerplate: editorialBoilerplate.length,
  inlineBlackContent: inlineBlackContent.length,
  legacyThemeBoot: legacyThemeBoot.length,
}

console.log(JSON.stringify(report, null, 2))
if (broken.size) console.log('\nBroken links:\n' + [...broken.keys()].slice(0, 100).join('\n'))
if (undefinedLinks.length) console.log('\nUndefined links:\n' + undefinedLinks.slice(0, 100).map(item => item.join(' → ')).join('\n'))
if (unexpectedMissingCanonical.length) console.log('\nMissing canonical (first 30):\n' + unexpectedMissingCanonical.slice(0, 30).join('\n'))
if (pagesMissingImageAlt.length) console.log('\nMissing image alt (first 30):\n' + pagesMissingImageAlt.slice(0, 30).join('\n'))
if (duplicateTitles.length) console.log('\nDuplicate titles (first 20):\n' + duplicateTitles.slice(0, 20).map(([value, pages]) => `${value}: ${pages.join(', ')}`).join('\n'))
if (canonicalConflicts.length) console.log('\nCanonical conflicts (first 20):\n' + canonicalConflicts.slice(0, 20).map(([value, pages]) => `${value}: ${pages.join(', ')}`).join('\n'))
if (editorialBoilerplate.length) console.log('\nEditorial boilerplate (first 30):\n' + editorialBoilerplate.slice(0, 30).map(([page, phrases]) => `${page}: ${phrases.join(', ')}`).join('\n'))
if (inlineBlackContent.length) console.log('\nInline black content surfaces (first 30):\n' + inlineBlackContent.slice(0, 30).join('\n'))
if (legacyThemeBoot.length) console.log('\nLegacy automatic theme boot (first 30):\n' + legacyThemeBoot.slice(0, 30).join('\n'))

if (
  broken.size
  || undefinedLinks.length
  || missingTitle.length
  || missingDescription.length
  || unexpectedMissingCanonical.length
  || pagesMissingImageAlt.length
  || duplicateTitles.length
  || canonicalConflicts.length
  || editorialBoilerplate.length
  || inlineBlackContent.length
  || legacyThemeBoot.length
) process.exitCode = 1
