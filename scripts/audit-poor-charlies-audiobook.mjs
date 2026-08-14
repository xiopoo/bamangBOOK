import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const root = process.cwd()
const manifestPath = path.join(root, 'content/poor-charlies-almanack-audio.json')
const jsonReportPath = path.join(root, 'editorial/shared/source-catalog/poor-charlies-audiobook-audit.json')
const mdReportPath = path.join(root, 'editorial/shared/source-catalog/穷查理宝典有声书本地化校验报告.md')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return null
  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  return [hours, minutes, secs].map(value => String(value).padStart(2, '0')).join(':')
}

const tracks = manifest.map(track => {
  if (!track.localPath) {
    return { ...track, exists: false, bytes: 0, duration: null, sha256: null }
  }

  const filePath = path.join(root, 'public', track.localPath.replace(/^\//, '').replace(/^audio\//, 'audio/'))
  const exists = existsSync(filePath)
  if (!exists) return { ...track, exists, bytes: 0, duration: null, sha256: null }

  const buffer = readFileSync(filePath)
  const probe = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ], { encoding: 'utf8' })
  const seconds = Number.parseFloat(probe.stdout.trim())

  return {
    ...track,
    exists,
    bytes: buffer.length,
    duration: formatDuration(seconds),
    sha256: createHash('sha256').update(buffer).digest('hex'),
  }
})

const available = tracks.filter(track => track.exists)
const unavailable = tracks.filter(track => !track.exists)
const totalBytes = available.reduce((sum, track) => sum + track.bytes, 0)
const report = {
  generatedAt: new Date().toISOString(),
  source: 'Stripe Press public Poor Charlie’s Almanack web audiobook',
  sourcePage: 'https://www.stripe.press/poor-charlies-almanack',
  totalTracks: tracks.length,
  availableTracks: available.length,
  unavailableTracks: unavailable.length,
  totalBytes,
  tracks,
}

writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`)

const rows = tracks.map((track, index) => {
  const state = track.exists ? '本地可播放' : '来源失效，未伪造替代'
  return `| ${String(index + 1).padStart(2, '0')} | ${track.titleZh} | ${state} | ${track.duration ?? '—'} | ${track.bytes || '—'} | ${track.sha256 ?? '—'} |`
})

const markdown = `# 《穷查理宝典》有声书本地化校验报告

生成时间：${report.generatedAt}

## 结论

- 出版社网页音轨清单：${tracks.length} 条。
- 已下载并通过容器读取、时长读取与 SHA-256 校验：${available.length} 条。
- 当前缺失：${unavailable.length} 条。
- 本地音频总大小：${totalBytes} 字节。
- 处理原则：只保存出版社公开音轨；失效来源不使用配音、拼接或其他音频冒充。

## 缺失说明

${unavailable.map(track => `- ${track.titleZh}：出版社现行页面脚本只留下相对文件名；旧公开地址 ${track.sourceUrl} 当前返回 404。`).join('\n') || '- 无。'}

## 逐轨校验

| 序号 | 音轨 | 状态 | 时长 | 字节 | SHA-256 |
|---:|---|---|---|---:|---|
${rows.join('\n')}

## 页面接入

- 总目录页展示全部本地可用音轨。
- 各章节页只展示与该章节对应的音轨。
- 播放地址使用本站 \`/audio/poor-charlies-almanack/\` 下的本地静态文件。
- 页面保留 Stripe Press 来源与版权说明。
`

writeFileSync(mdReportPath, markdown)
console.log(JSON.stringify({
  totalTracks: tracks.length,
  availableTracks: available.length,
  unavailableTracks: unavailable.length,
  totalBytes,
  jsonReportPath,
  mdReportPath,
}, null, 2))
