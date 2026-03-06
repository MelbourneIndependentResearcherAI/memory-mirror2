// Simple static file server for Azure App Service
// Serves the Vite production build from the 'dist' folder.
import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, 'dist')
const PORT = process.env.PORT || 8080

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const server = createServer((req, res) => {
  let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url)

  // Strip query strings
  filePath = filePath.split('?')[0]

  if (!existsSync(filePath) || !extname(filePath)) {
    // SPA fallback — serve index.html for all unmatched routes
    filePath = join(DIST_DIR, 'index.html')
  }

  const ext = extname(filePath)
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  try {
    const content = readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  } catch {
    res.writeHead(500)
    res.end('Internal server error')
  }
})

server.listen(PORT, () => {
  console.log(`Little Ones AI running on port ${PORT}`)
})
