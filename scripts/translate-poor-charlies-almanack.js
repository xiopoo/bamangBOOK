const fs = require('fs')
const path = require('path')
const https = require('https')

const root = path.join(process.cwd(), 'poor-charlies-almanack')
const sourceDir = path.join(root, '_english-source')
const targets = [
  'poor-charlies-almanack-forewords.md',
  'poor-charlies-almanack-chapter-one.md',
  'poor-charlies-almanack-chapter-two.md',
  'poor-charlies-almanack-chapter-three.md',
  'poor-charlies-almanack-talk-eleven.md',
  'poor-charlies-almanack-recommended-reading.md',
]

const headingMap = new Map([
  ["Poor Charlie's Almanack — Forewords", '《穷查理宝典》——序言'],
  ['A Portrait of Charles T. Munger', '查理·芒格肖像'],
  ["Poor Charlie's Almanack — Chapter Two", '《穷查理宝典》——第二章'],
  ["Poor Charlie's Almanack — Chapter Three", '《穷查理宝典》——第三章'],
  ['Talk Eleven: The Psychology of Human Misjudgment', '第十一讲：人类误判心理学'],
  ["Poor Charlie's Almanack — Recommended Reading", '《穷查理宝典》——推荐阅读'],
])

function requestTranslation(text, attempt = 0) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'en',
      tl: 'zh-CN',
      dt: 't',
      q: text,
    })
    const req = https.get(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
      (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', chunk => { body += chunk })
        res.on('end', async () => {
          if (res.statusCode !== 200) {
            if (attempt < 4) {
              await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
              return resolve(requestTranslation(text, attempt + 1))
            }
            return reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 160)}`))
          }
          try {
            const data = JSON.parse(body)
            resolve((data[0] || []).map(item => item[0] || '').join(''))
          } catch (error) {
            reject(error)
          }
        })
      }
    )
    req.on('error', async (error) => {
      if (attempt < 4) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
        return resolve(requestTranslation(text, attempt + 1))
      }
      reject(error)
    })
  })
}

function splitLong(text, max = 3200) {
  if (text.length <= max) return [text]
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks = []
  let current = ''
  for (const sentence of sentences) {
    if (current && current.length + sentence.length + 1 > max) {
      chunks.push(current)
      current = sentence
    } else {
      current += `${current ? ' ' : ''}${sentence}`
    }
  }
  if (current) chunks.push(current)
  return chunks
}

function protect(text) {
  const values = []
  const protectedText = text.replace(
    /https?:\/\/[^\s)]+|`[^`]+`|\[[^\]]+\]\([^)]+\)/g,
    (value) => {
      const token = `ZXQ${values.length}QXZ`
      values.push(value)
      return token
    }
  )
  return { protectedText, values }
}

function restore(text, values) {
  let result = text
  values.forEach((value, index) => {
    const token = `ZXQ${index}QXZ`
    result = result
      .replaceAll(token, value)
      .replaceAll(token.toLowerCase(), value)
      .replace(new RegExp(`ZXQ\\s*${index}\\s*QXZ`, 'gi'), value)
  })
  return result
}

function normalizeChinese(text) {
  return text
    .replaceAll('《穷查理年鉴》', '《穷查理宝典》')
    .replaceAll('穷查理年鉴', '穷查理宝典')
    .replaceAll('“可怜的查理”', '《穷查理宝典》')
    .replaceAll('可怜的查理', '穷查理')
    .replaceAll('查理·芒格', '查理·芒格')
    .replaceAll('查理芒格', '查理·芒格')
    .replaceAll('沃伦巴菲特', '沃伦·巴菲特')
    .replaceAll('伯克希尔哈撒韦公司', '伯克希尔·哈撒韦')
    .replaceAll('伯克希尔哈撒韦', '伯克希尔·哈撒韦')
    .replaceAll('心理误判', '心理误判')
    .replaceAll('普世智慧', '普世智慧')
    .replaceAll('心智模型', '思维模型')
    .replaceAll('多重思维模型', '多元思维模型')
    .replaceAll('多种思维模型', '多元思维模型')
    .replaceAll('多种心理模型', '多元思维模型')
    .replaceAll('倒置', '逆向思考')
    .replaceAll('逆转', '逆向思考')
    .replaceAll('能力圈子', '能力圈')
    .replaceAll('十一次谈话', '十一场演讲')
    .replaceAll('lollapalooza 级别', '叠加效应级别')
    .replaceAll('lollapalooza级别', '叠加效应级别')
    .replaceAll('查理号上的孩子们', '孩子们记忆中的查理')
    .replaceAll('当你借一辆男人的车时', '借用别人的车时')
    .replaceAll('扭动了他的手臂', '从中说项')
    .replaceAll('总统随后说道', '公司总裁随后说道')
    .replaceAll('厚颜无耻', '胆识与率性')
    .replaceAll('在踢屁股比赛中的独腿人', '参加踢屁股比赛的独腿人')
    .replaceAll('CH。 0 // 前言', '')
    .replaceAll('章。 1 // 查尔斯·T·芒格的肖像', '第一章｜查理·芒格肖像')
    .replaceAll('可口可乐公司', '可口可乐')
    .replaceAll('芒格方法', '芒格方法')
}

async function translateBlock(block) {
  if (!/[A-Za-z]{3}/.test(block)) return block
  if (/^\s*[-*_]{3,}\s*$/.test(block)) return block
  if (/^\s*>\s*来源[:：]\s*https?:\/\//.test(block)) return block.replace('来源：', '来源：')

  const heading = block.match(/^(#{1,6})\s+(.+)$/s)
  if (heading && headingMap.has(heading[2].trim())) {
    return `${heading[1]} ${headingMap.get(heading[2].trim())}`
  }

  const { protectedText, values } = protect(block)
  const chunks = splitLong(protectedText)
  const translated = []
  for (const chunk of chunks) {
    translated.push(await requestTranslation(chunk))
  }
  return normalizeChinese(restore(translated.join(''), values))
}

async function translateFile(name) {
  const source = fs.readFileSync(path.join(sourceDir, name), 'utf8')
  const blocks = source.split(/\n{2,}/)
  const output = []
  for (let index = 0; index < blocks.length; index += 1) {
    output.push(await translateBlock(blocks[index]))
    if ((index + 1) % 20 === 0) {
      console.log(`${name}: ${index + 1}/${blocks.length}`)
    }
  }
  fs.writeFileSync(path.join(root, name), `${output.join('\n\n').trim()}\n`, 'utf8')
  console.log(`${name}: done`)
}

async function main() {
  if (process.argv.includes('--postedit')) {
    for (const name of targets) {
      const filePath = path.join(root, name)
      const current = fs.readFileSync(filePath, 'utf8')
      fs.writeFileSync(filePath, normalizeChinese(current), 'utf8')
      console.log(`${name}: post-edited`)
    }
    return
  }
  for (const name of targets) {
    await translateFile(name)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
