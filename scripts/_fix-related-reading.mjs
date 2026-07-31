import fs from 'node:fs'
import path from 'node:path'

const dir = 'content/munger-archive/recordings'
const summary = []

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
  const file = path.join(dir, f)
  const raw = fs.readFileSync(file, 'utf-8')
  let changed = false

  // 1) 修「链接后直接紧接粗略自动转录」：补换行
  let s = raw.replace(/\)(粗略自动转录（机器生成）)/g, (_m, a) => {
    changed = true
    return ')\n\n' + a
  })

  // 2) 删除独立的「粗略自动转录（机器生成）」行
  s = s.replace(/^粗略自动转录（机器生成）\s*$\n?/gm, () => {
    changed = true
    return ''
  })

  // 3) 免责声明斜体化，保留来源链接
  s = s.replace(
    /^由(YouTube|Youtube) (.+?所有。?) \[来源 ↗\]\(([^)]*)\)$/gm,
    (_m, a, b, c) => {
      changed = true
      return '*由' + a + ' ' + b + '* [来源 ↗](' + c + ')'
    }
  )

  // 4) 若「对照阅读」后无链接（下一非空行不是 [链接），删除空标题行
  const lines = s.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t === '对照阅读') {
      let j = i + 1
      let next = ''
      while (j < lines.length && lines[j].trim() === '') j++
      if (j < lines.length) next = lines[j].trim()
      if (next.startsWith('[') && next.includes('](')) {
        out.push(lines[i])
        continue
      }
      changed = true
      continue
    }
    out.push(lines[i])
  }
  s = out.join('\n')

  // 5) 清理 3+ 连续空行
  s = s.replace(/\n{3,}/g, '\n\n')

  if (s !== raw) {
    fs.writeFileSync(file, s)
    summary.push(f)
  }
}

console.log(summary.length ? summary.join('\n') : '无修改')
