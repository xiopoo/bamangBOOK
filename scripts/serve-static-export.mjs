import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] || 'out')
const port = Number(process.argv[3] || 3002)
const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'],
])

function safePath(pathname) {
  let decoded
  try { decoded = decodeURIComponent(pathname) } catch { return null }
  const relative = decoded.replace(/^\/+/, '').replace(/\/$/, '')
  if (relative.split('/').some(part => part === '..')) return null
  const candidates = relative
    ? [path.join(root, relative), path.join(root, `${relative}.html`), path.join(root, relative, 'index.html')]
    : [path.join(root, 'index.html')]
  return candidates.find(candidate => candidate.startsWith(root + path.sep) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null
}

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname
  const file = safePath(pathname)
  if (!file) {
    const notFound = path.join(root, '404.html')
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    fs.createReadStream(notFound).pipe(response)
    return
  }
  response.writeHead(200, { 'Content-Type': types.get(path.extname(file).toLowerCase()) || 'application/octet-stream' })
  if (request.method === 'HEAD') response.end()
  else fs.createReadStream(file).pipe(response)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`)
})
