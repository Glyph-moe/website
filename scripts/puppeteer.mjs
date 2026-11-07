// The two browser checks (check-perf, check-blog) drive a real browser. Puppeteer
// is deliberately not a dependency: it downloads a browser, which is far too
// heavy for `npm ci` on a machine that only wants to build the site.
//
// Loaded on demand instead, so a fresh clone can still build, and the checks
// explain themselves when the browser is missing:
//
//   npm install --no-save puppeteer
//   node scripts/check-perf.mjs
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

function fromGlobalRoot() {
  // Falls back to a globally installed Puppeteer, which is how the author's
  // machine carries it. No absolute path is baked into the repository.
  const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()
  return createRequire(`${root}/`)('puppeteer')
}

export function loadPuppeteer() {
  const require = createRequire(import.meta.url)
  try {
    return require('puppeteer')
  } catch {
    try {
      return fromGlobalRoot()
    } catch {
      console.error(
        'This check needs Puppeteer.\n\n' +
          '  npm install --no-save puppeteer\n\n' +
          'then run it again. The site itself does not need Puppeteer.',
      )
      process.exit(1)
    }
  }
}
