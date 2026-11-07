// Serve dist/ the way the site is actually served.
//
// `astro preview` cannot work here: the Netlify adapter has no preview server —
// it prints "The @astrojs/netlify adapter does not support the preview command"
// and exits. So this reads the built output and answers requests itself.
//
// The cache headers come from netlify.toml rather than being copied, so a local
// preview cannot disagree with production about what is cacheable. A rule this
// parser fails to understand is skipped, which is safe: the file is served with
// no Cache-Control, and that is the behaviour being previewed.
//
// Usage: node scripts/preview.mjs [port] [--root dist]
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const args = process.argv.slice(2)
const portArg = args.find(arg => /^\d+$/.test(arg))
const rootArg = args.indexOf('--root')
const root = path.resolve(rootArg === -1 ? 'dist' : (args[rootArg + 1] ?? 'dist'))
const port = Number(portArg ?? process.env.PORT ?? 4321)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
}

/** [[headers]] blocks from netlify.toml: `for = "…"` plus its Cache-Control. */
function cacheRules() {
  let toml = ''
  try {
    toml = fs.readFileSync('netlify.toml', 'utf8')
  } catch {
    return []
  }
  return toml
    .split('[[headers]]')
    .slice(1)
    .map(block => {
      const pattern = block.match(/^\s*for\s*=\s*"([^"]+)"/m)?.[1]
      const value = block.match(/^\s*Cache-Control\s*=\s*"([^"]+)"/m)?.[1]
      return pattern && value ? { pattern, value } : null
    })
    .filter(Boolean)
}

const rules = cacheRules()

/** Netlify applies every rule whose pattern matches; the longest one wins here. */
function cacheControlFor(pathname) {
  let best = null
  for (const rule of rules) {
    const matches = rule.pattern.endsWith('*')
      ? pathname.startsWith(rule.pattern.slice(0, -1))
      : pathname === rule.pattern
    if (matches && (!best || rule.pattern.length > best.pattern.length)) best = rule
  }
  return best?.value
}

function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname.split('?')[0])
  const base = path.join(root, path.normalize(clean))
  if (!base.startsWith(root)) return null
  const candidates = [base, `${base}.html`, path.join(base, 'index.html')]
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate
    } catch {
      /* try the next shape */
    }
  }
  return null
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname
  const file = resolveFile(pathname)
  if (!file) {
    const notFound = path.join(root, '404.html')
    const body = fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found'
    res.writeHead(404, { 'content-type': TYPES['.html'] })
    res.end(body)
    return
  }
  const headers = {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'content-length': fs.statSync(file).size,
  }
  const cache = cacheControlFor(pathname)
  if (cache) headers['cache-control'] = cache
  res.writeHead(200, headers)
  if (req.method === 'HEAD') return res.end()
  fs.createReadStream(file).pipe(res)
})

if (!fs.existsSync(root)) {
  console.error(`No ${path.relative(process.cwd(), root)}/ — run "npm run build" first.`)
  process.exit(1)
}

server.listen(port, () => {
  console.log(`previewing ${path.relative(process.cwd(), root)}/ on http://localhost:${port}`)
})
