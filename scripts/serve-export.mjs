import http from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.cwd(), 'out')
const port = Number(process.env.STATIC_PREVIEW_PORT || process.argv[2] || 3000)

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
}

function resolveRequestPath(requestUrl = '/') {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname)
  } catch {
    return null
  }

  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const candidates = path.extname(relative)
    ? [relative]
    : [`${relative}.html`, path.join(relative, 'index.html')]

  for (const candidate of candidates) {
    const filePath = path.resolve(root, candidate)
    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) continue
    if (existsSync(filePath) && statSync(filePath).isFile()) return filePath
  }
  return null
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url)
  if (!filePath) {
    const notFoundPath = path.join(root, '404.html')
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    createReadStream(notFoundPath).pipe(response)
    return
  }

  const extension = path.extname(filePath).toLowerCase()
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
  })
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(filePath).pipe(response)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Static preview: http://localhost:${port}`)
})
