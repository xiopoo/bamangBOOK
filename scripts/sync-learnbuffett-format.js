#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const BASE = 'https://learnbuffett.com'
const WRITE = process.argv.includes('--write')
const OUT_DIR = path.join(ROOT, 'tmp', 'learnbuffett')
const RAW_DIR = path.join(OUT_DIR, 'raw-html')
const REPORT = path.join(ROOT, 'reports', 'learnbuffett-sync-report.json')

const PEOPLE_ALIASES = new Map([
  ['芒格', '查理·芒格'],
  ['格雷厄姆', '本杰明·格雷厄姆'],
])

const COMPANY_ALIASES = new Map([
  ['盖可保险', 'GEICO'],
  ['森林河公司', '森林河'],
  ['精密铸件', '精密机件'],
  ['所罗门', '所罗门兄弟'],
  ['大都会通信', '大都会ABC'],
  ['中美能源', '伯克希尔哈撒韦能源'],
  ['费希海默制服', '菲希海默制服'],
  ['科比吸尘器', '柯比吸尘器'],
])

const CONCEPT_ALIASES = new Map([
  ['保险浮存金', '浮存金'],
])

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function textFromHtml(value) {
  return decodeHtml(value
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim())
}

function canonical(value) {
  return value
    .normalize('NFKC')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

function markdownTable(tableHtml) {
  const rows = [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map(match => [...match[1].matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)]
      .map(cell => textFromHtml(cell[1])))
    .filter(row => row.length > 0)
  if (!rows.length) return ''

  const width = Math.max(...rows.map(row => row.length))
  const normalize = row => {
    const cells = [...row]
    while (cells.length < width) cells.push('')
    return `| ${cells.slice(0, width).join(' | ')} |`
  }
  return [
    normalize(rows[0]),
    normalize(Array(width).fill('---')),
    ...rows.slice(1).map(normalize),
  ].join('\n')
}

function convertBlocks(html) {
  let seenH1 = false
  let current = html
    .replace(/<section\b[^>]*class="[^"]*geo-faq[^"]*"[\s\S]*?<\/section>/gi, '')
    .replace(/<a\b[^>]*class="[^"]*kb-edition[^"]*"[\s\S]*?<\/a>/gi, '')
    .replace(/<section\b[^>]*class="[^"]*support-section[^"]*"[\s\S]*?<\/section>/gi, '')
    .replace(/<nav\b[^>]*class="[^"]*page-nav[^"]*"[\s\S]*?<\/nav>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')

  current = current.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, match => `\n\n${markdownTable(match)}\n\n`)

  current = current.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, inner) => {
    const body = convertBlocks(inner)
      .split('\n')
      .map(line => line.trim() ? `> ${line}` : '>')
      .join('\n')
    return `\n\n${body}\n\n`
  })

  current = current.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level, inner) => {
    let depth = Number(level)
    if (depth === 1) {
      if (seenH1) depth = 2
      seenH1 = true
    }
    return `\n\n${'#'.repeat(depth)} ${textFromHtml(inner)}\n\n`
  })

  current = current.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_match, inner) => `\n\n${textFromHtml(inner)}\n\n`)
  current = current.replace(/<hr\b[^>]*>/gi, '\n\n---\n\n')
  current = current.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_match, inner) => `\n- ${textFromHtml(inner)}`)
  current = current.replace(/<\/?(?:ul|ol)\b[^>]*>/gi, '\n')
  current = current.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**')
  current = current.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
  current = current.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1')

  return decodeHtml(current)
    .replace(/<[^>]+>/g, '')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function cleanupMarkdown(markdown) {
  return markdown
    .replace(/^\s*(?:股东信|合伙人信|特别信件|概念|公司|人物)\s*$/gm, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/cite[^]*/g, '')
    .replace(/†/g, '')
    .replace(/^## 常见问题[\s\S]*$/m, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .concat('\n')
}

function extractArticle(html) {
  const match = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)
  return match ? match[1] : ''
}

function hrefToSitePath(href) {
  let url
  try {
    url = new URL(href, BASE)
  } catch {
    return null
  }
  const parts = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '').split('/')
  if (parts.length < 2) return null
  const [section, rawSlug] = parts
  const slug = rawSlug.replace(/\.html$/, '')

  let match = slug.match(/^(\d{4})-巴菲特致股东信$/)
  if (section === 'berkshire' && match) {
    return path.join(ROOT, 'content', 'letters', `berkshire_${match[1]}-巴菲特致股东信.md`)
  }

  if (section === 'partnership') {
    if (slug === '1956-有限合伙协议') return path.join(ROOT, 'content', 'partnership', 'partnership_1956-有限合伙协议.md')
    match = slug.match(/^(\d{4})(年中|年\d+月(?:\d+日)?|)-巴菲特致合伙人信$/)
    if (match) {
      const [, year, suffix] = match
      let localSuffix = ''
      if (suffix === '年中') localSuffix = '-interim'
      else if (suffix) localSuffix = suffix.replace(/^年/, '-')
      else {
        const annual = path.join(ROOT, 'content', 'partnership', `partnership_${year}-annual-巴菲特致合伙人信.md`)
        if (fs.existsSync(annual)) return annual
      }
      if (year === '1970' && suffix === '年2月') localSuffix = '-bond'
      return path.join(ROOT, 'content', 'partnership', `partnership_${year}${localSuffix}-巴菲特致合伙人信.md`)
    }
  }

  if (section === 'special') {
    const direct = path.join(ROOT, 'content', 'special', `${slug}.md`)
    if (fs.existsSync(direct)) return direct
    const specialDir = path.dirname(direct)
    const candidates = fs.existsSync(specialDir)
      ? fs.readdirSync(specialDir).filter(file => file.startsWith(slug) && file.endsWith('.md'))
      : []
    return candidates.length === 1 ? path.join(specialDir, candidates[0]) : direct
  }

  if (section === 'concepts') return path.join(ROOT, 'content', 'concepts', `${CONCEPT_ALIASES.get(slug) || slug}.md`)
  if (section === 'companies') return path.join(ROOT, 'content', 'companies', `${COMPANY_ALIASES.get(slug) || slug}.md`)
  if (section === 'people') return path.join(ROOT, 'content', 'people', `${PEOPLE_ALIASES.get(slug) || slug}.md`)

  return null
}

function wantedHref(href) {
  return /^(?:\.\.\/)?(?:berkshire|partnership|special|concepts|companies|people)\//.test(href) ||
    /^\/(?:berkshire|partnership|special|concepts|companies|people)\//.test(href)
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 content-format-audit' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true })
  const home = await fetchText(BASE)
  const hrefs = [...new Set([...home.matchAll(/href="([^"]+)"/g)].map(match => match[1]).filter(wantedHref))]
  const report = []
  let changed = 0
  let skipped = 0
  let failed = 0

  for (let index = 0; index < hrefs.length; index += 1) {
    const href = hrefs[index]
    const url = new URL(href, BASE).href
    const sitePath = hrefToSitePath(href)
    if (!sitePath) {
      skipped += 1
      report.push({ href, url, action: 'skip-unmapped' })
      continue
    }
    const exists = fs.existsSync(sitePath)
    if (!exists && !/\/special\//.test(new URL(url).pathname)) {
      skipped += 1
      report.push({ href, url, site: path.relative(ROOT, sitePath), action: 'skip-missing-local' })
      continue
    }

    try {
      const html = await fetchText(url)
      fs.writeFileSync(path.join(RAW_DIR, encodeURIComponent(new URL(url).pathname) + '.html'), html)
      const article = extractArticle(html)
      if (!article) throw new Error('article not found')
      const markdown = cleanupMarkdown(convertBlocks(article))
      const before = exists ? fs.readFileSync(sitePath, 'utf8') : ''
      const beforeCanonical = canonical(before)
      const afterCanonical = canonical(markdown)
      const safeToWrite = !exists || afterCanonical.length >= beforeCanonical.length * 0.86 || afterCanonical.includes(beforeCanonical.slice(0, Math.min(800, beforeCanonical.length)))

      const item = {
        href,
        url,
        site: path.relative(ROOT, sitePath),
        action: safeToWrite && before !== markdown ? 'replace-with-reference-format' : 'skip',
        beforeChars: beforeCanonical.length,
        afterChars: afterCanonical.length,
      }

      if (item.action === 'replace-with-reference-format') {
        if (WRITE) {
          fs.mkdirSync(path.dirname(sitePath), { recursive: true })
          fs.writeFileSync(sitePath, markdown)
        }
        changed += 1
      } else {
        skipped += 1
      }
      report.push(item)
      console.log(`[${index + 1}/${hrefs.length}] ${WRITE ? 'WRITE' : 'DRY'} ${item.action}: ${item.site}`)
    } catch (error) {
      failed += 1
      report.push({ href, url, site: path.relative(ROOT, sitePath), action: 'error', error: error.message })
      console.error(`[${index + 1}/${hrefs.length}] ERROR ${href}: ${error.message}`)
    }
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`${WRITE ? 'Updated' : 'Would update'} ${changed}; skipped ${skipped}; failed ${failed}. Report: ${path.relative(ROOT, REPORT)}`)
}

main().catch(error => {
  console.error(error.stack || error.message)
  process.exitCode = 1
})
