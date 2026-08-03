const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const root = process.cwd()
const archiveDir = path.join(root, 'content/munger-archive/mental-models')
const modelsDir = path.join(root, 'content/models')
const marker = '<!-- munger-archive-merged -->'

const archiveToCanonical = {
  'authority-misinfluence': 'authority-misinfluence-tendency',
  'availability-misweighing': 'availability-misweighing-tendency',
  'circle-of-competence': 'circle-of-competence',
  'contrast-misreaction': 'contrast-misreaction-tendency',
  curiosity: 'curiosity-tendency',
  'deprival-superreaction': 'deprival-superreaction-tendency',
  'disliking-hating': 'disliking-hating-tendency',
  'doubt-avoidance': 'doubt-avoidance-tendency',
  'drug-misinfluence': 'drug-misinfluence-tendency',
  'envy-jealousy': 'envy-jealousy-tendency',
  'excessive-self-regard': 'excessive-self-regard-tendency',
  'incentive-superresponse': 'reward-and-punishment-superresponse-tendency',
  'inconsistency-avoidance': 'inconsistency-avoidance-tendency',
  inversion: 'inversion',
  'kantian-fairness': 'kantian-fairness-tendency',
  'latticework-of-mental-models': 'latticework-of-mental-models',
  'liking-loving': 'liking-loving-tendency',
  lollapalooza: 'lollapalooza-tendency',
  'man-with-a-hammer': 'man-with-a-hammer-syndrome',
  'margin-of-safety': 'margin-of-safety',
  'mere-association': 'influence-from-mere-association-tendency',
  'moats-and-durable-advantage': 'moat',
  'opportunity-cost': 'opportunity-cost',
  overoptimism: 'overoptimism-tendency',
  'psychological-denial': 'simple-pain-avoiding-psychological-denial',
  'psychology-of-human-misjudgment': 'psychology-of-human-misjudgment',
  'reason-respecting': 'reason-respecting-tendency',
  reciprocation: 'reciprocation-tendency',
  'senescence-misinfluence': 'senescence-misinfluence-tendency',
  'sit-on-your-ass-investing': 'sit-on-your-ass-investing',
  'social-proof': 'social-proof-tendency',
  'stress-influence': 'stress-influence-tendency',
  twaddle: 'twaddle-tendency',
  'two-track-analysis': 'two-track-analysis',
  'use-it-or-lose-it': 'use-it-or-lose-it-tendency',
}

const newModelMeta = {
  'curiosity-tendency': {
    title: '好奇心倾向',
    english: 'Curiosity Tendency',
    importance: 4,
    description: '好奇心是一种持续追问、跨学科学习并抵抗认知封闭的正向倾向，也是芒格终身学习观的重要基础。',
    scenarios: ['学习、复盘与认知提升', '跨学科研究', '个人重大决策与人生规划'],
  },
  'psychology-of-human-misjudgment': {
    title: '人类误判心理学',
    english: 'The Psychology of Human Misjudgment',
    importance: 5,
    description: '查理·芒格对25种人类误判倾向的系统总览，解释单一偏差及多种倾向共同作用时如何造成非理性结果。',
    scenarios: ['投资决策与资产评估', '团队管理与组织决策', '谈判与博弈', '学习、复盘与认知提升'],
  },
}

function cleanArchiveContent(content) {
  let result = content.trim()
  result = result
    .replace(/^(?:思维模型|误判成因第\s*\d+\s*条|他最重要的一次演讲)\s*\n+/u, '')
    .replace(/^#\s+[^\n]+\n+/m, '')
    .replace(/\n\[←\s*Prev[\s\S]*$/u, '')

  result = result.replace(
    /https:\/\/mungerarchive\.com\/zh\/mental-models\/([a-z0-9-]+)\/?/g,
    (_, archiveSlug) => `/model/${archiveToCanonical[archiveSlug] || archiveSlug}`
  )

  return result.trim()
}

function quoteYaml(value) {
  return JSON.stringify(value)
}

function buildNewModel(slug, sourceUrl, content) {
  const meta = newModelMeta[slug]
  const scenarios = meta.scenarios.map(item => `  - ${quoteYaml(item)}`).join('\n')
  return `---
title: ${quoteYaml(meta.title)}
english: ${quoteYaml(meta.english)}
slug: ${quoteYaml(slug)}
discipline: "psych"
disciplineName: "心理学"
importance: ${meta.importance}
scenarios:
${scenarios}
description: ${quoteYaml(meta.description)}
source: "Munger Archive"
sourceUrl: ${quoteYaml(sourceUrl)}
---

# ${meta.title}

${content}

---

## 资料来源

本文整理自 [Munger Archive](${sourceUrl})，并已纳入复利书房统一的多元思维模型索引。

${marker}
`
}

const archiveFiles = fs.readdirSync(archiveDir).filter(name => name.endsWith('.md'))
let enriched = 0
let created = 0
let skipped = 0

for (const fileName of archiveFiles) {
  const archiveSlug = fileName.replace(/\.md$/, '')
  const canonicalSlug = archiveToCanonical[archiveSlug]
  if (!canonicalSlug) throw new Error(`Missing canonical mapping for ${archiveSlug}`)

  const archiveRaw = fs.readFileSync(path.join(archiveDir, fileName), 'utf8')
  const archiveDoc = matter(archiveRaw)
  const sourceUrl = String(archiveDoc.data.source || `https://mungerarchive.com/zh/mental-models/${archiveSlug}/`)
  const cleaned = cleanArchiveContent(archiveDoc.content)
  const targetPath = path.join(modelsDir, `${canonicalSlug}.md`)

  if (!fs.existsSync(targetPath)) {
    const next = buildNewModel(canonicalSlug, sourceUrl, cleaned)
    fs.writeFileSync(targetPath, next, 'utf8')
    created += 1
    continue
  }

  const current = fs.readFileSync(targetPath, 'utf8')
  if (current.includes(marker)) {
    skipped += 1
    continue
  }

  const supplement = `

---

## 档案摘要与原始出处

以下内容补充自 Munger Archive，侧重芒格本人对这一模型的简明表述及相关演讲线索。

${cleaned}

> 资料来源：[Munger Archive](${sourceUrl})。本节已与原有模型正文合并，不再作为独立模型页面维护。

${marker}
`
  fs.writeFileSync(targetPath, `${current.trimEnd()}${supplement}`, 'utf8')
  enriched += 1
}

console.log(JSON.stringify({
  archive: archiveFiles.length,
  enriched,
  created,
  skipped,
  totalModels: fs.readdirSync(modelsDir).filter(name => name.endsWith('.md')).length,
}, null, 2))
