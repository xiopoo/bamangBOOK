/**
 * 《穷查理宝典》有声书音频下载脚本
 *
 * 背景：音频文件共 365M（单文件最大 91M），不适合直接进 git 仓库
 * （GitHub 对 >100M 文件拒绝推送、>50M 警告）。
 *
 * 方案：public/audio/ 已加入 .gitignore，本脚本根据
 * content/poor-charlies-almanack-audio.json 的 sourceUrl 在构建前补齐音频。
 * - 本地已有文件则跳过（幂等，不会重复下载）
 * - 构建集成：scripts/prebuild.js 中调用
 *
 * 版权：音频来自 Stripe Press 公开版，仅做本地副本以便与正文同步阅读。
 */

import fs from 'node:fs'
import path from 'node:path'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const MANIFEST_PATH = path.join(ROOT, 'content', 'poor-charlies-almanack-audio.json')

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  const tasks = manifest.filter(track => track.sourceUrl && track.localPath)

  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const track of tasks) {
    const dest = path.join(ROOT, 'public', track.localPath.replace(/^\//, ''))
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      skipped++
      continue
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    try {
      process.stdout.write(`⏬ ${track.id} ... `)
      await download(track.sourceUrl, dest)
      const size = fs.statSync(dest).size
      if (size === 0) {
        throw new Error('downloaded file is empty')
      }
      console.log(`${(size / 1024 / 1024).toFixed(1)} MB`)
      downloaded++
    } catch (err) {
      failed++
      console.log(`失败: ${err.message}`)
      fs.rmSync(dest, { force: true })
    }
  }

  console.log(`\n✅ 音频同步完成：下载 ${downloaded}，跳过 ${skipped}，失败 ${failed}`)
  if (failed > 0) process.exitCode = 1
}

main()
