/**
 * 凭据扫描（SEC-01）
 *
 * 检查 git staged 文件是否包含疑似真实凭据（API Key / Secret / Token），
 * 防止把 .env.local 或硬编码密钥提交进仓库。
 *
 * 用法：
 *   node scripts/scan-staged-secrets.mjs      # 扫描 git staged 文件
 *   node scripts/scan-staged-secrets.mjs --all # 扫描整个工作区
 *
 * 退出码：0 = 未发现凭据；1 = 发现疑似凭据
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// 疑似凭据模式：键名 + 非空值（排除示例/占位值）
const SECRET_PATTERNS = [
  { name: 'IMA_API_KEY', pattern: /(?:IMA_API_KEY|IMA_SECRET)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/ },
  { name: 'IMA_CLIENT_SECRET', pattern: /IMA_CLIENT_SECRET\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/ },
  { name: 'WECHAT_APP_SECRET', pattern: /WECHAT_APP_SECRET\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/ },
  { name: 'STRIPE_SECRET', pattern: /(?:STRIPE_SECRET(?:_KEY)?|sk_live_[A-Za-z0-9]{16,})/ },
  { name: 'AWS_SECRET', pattern: /(?:AWS_SECRET_ACCESS_KEY|AKIA[A-Z0-9]{16})/ },
  { name: 'OPENAI_KEY', pattern: /(?:sk-[A-Za-z0-9]{20,}|OPENAI_API_KEY\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,})/ },
  { name: 'GITHUB_TOKEN', pattern: /(?:gh[pousr]_[A-Za-z0-9]{20,}|GITHUB_TOKEN\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,})/ },
  { name: 'GENERIC_API_KEY', pattern: /(?:API_KEY|API_SECRET|ACCESS_TOKEN|SECRET_KEY|PRIVATE_KEY)\s*[:=]\s*["']?[A-Za-z0-9_\-/+=]{24,}/ },
]

// 排除的文件/目录：凭据类文件本身只允许出现在 gitignore 覆盖范围内
const IGNORED_PATHS = [
  'package-lock.json', 'package.json', '.git/', 'node_modules/', '.next/', 'out/',
  '.env.example', 'docs/', '.trae/', '.codebuddy/', 'tmp/', '_debug/', 'reports/',
  'cookies.json',
  // 扫描器自身包含模式定义（正则中的键名），属于工具代码而非真实凭据
  'scripts/scan-staged-secrets.mjs',
]

function isIgnored(filePath) {
  const rel = filePath.replace(/^\.\//, '')
  return IGNORED_PATHS.some((p) => rel === p || rel.startsWith(p.replace(/\/$/, '') + '/') || (p.endsWith('/') && rel.startsWith(p)))
}

function listStagedFiles() {
  try {
    const out = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], { cwd: ROOT, encoding: 'utf-8' })
    return out.split('\n').map((s) => s.trim()).filter(Boolean)
  } catch {
    return []
  }
}

function listAllFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.next', 'out', '.venv'].includes(entry.name)) continue
      listAllFiles(full, out)
    } else {
      // 全量模式跳过 .env.* 本地配置文件：它们由 .gitignore 保护、按设计只放本机，
      // staged 模式（默认）才会对强制 add 的 .env.* 做拦截。
      if (entry.name.startsWith('.env.')) continue
      out.push(path.relative(ROOT, full))
    }
  }
  return out
}

function scanFile(relPath, found) {
  if (isIgnored(relPath)) return
  const baseName = path.basename(relPath)
  const isEnvLike = baseName.startsWith('.env') || /\.env$/.test(baseName)
  if (!isEnvLike && !/\.(ts|js|mjs|json|py|sh|yaml|yml|md|txt|toml)$/.test(relPath)) return
  let content = ''
  try {
    content = fs.readFileSync(path.join(ROOT, relPath), 'utf-8')
  } catch {
    return
  }
  // 跳过明显是文档示例的行（"例如/示例/xxx 替换为"等）
  for (const { name, pattern } of SECRET_PATTERNS) {
    for (const match of content.matchAll(new RegExp(pattern.source, 'gi'))) {
      const lineStart = content.lastIndexOf('\n', match.index) + 1
      const lineEnd = content.indexOf('\n', match.index)
      const line = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim()
      if (/^(#|<!--|\/\/|\*)/.test(line.trim())) continue
      found.push({ file: relPath, secret: name, line: line.slice(0, 160) })
    }
  }
}

const useAll = process.argv.includes('--all')
const files = useAll ? listAllFiles(ROOT) : listStagedFiles()
const found = []

if (files.length === 0) {
  console.log(useAll ? '📭 工作区无可扫描文件' : '📭 当前没有 staged 文件')
} else {
  for (const file of files) scanFile(file, found)
}

if (found.length > 0) {
  console.error('❌ [SEC-01] 发现疑似凭据，禁止提交！')
  for (const item of found) {
    console.error(`   ${item.file}  [${item.secret}]`)
    console.error(`     → ${item.line}`)
  }
  console.error('\n请移除真实凭据，改用环境变量；如确属误报，请调整扫描模式或将该文件加入忽略清单。')
  process.exit(1)
}

console.log(`✅ [SEC-01] 凭据扫描通过（${files.length} 个文件，${useAll ? '全量' : 'staged'}）`)
