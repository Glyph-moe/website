---
title: SDK Overview
order: 3
section: 'Building Extensions'
---

# SDK Overview

The `@glyphmoe/sdk` is the TypeScript toolkit for building Glyph extensions. It handles HTTP requests, rate limiting, retries, HTML parsing, and cookie management so you can focus on parsing novel content.

## Architecture

```
Your Extension (TypeScript)
    ↓ calls get(), post(), load()
@glyphmoe/sdk (request layer, rate limiter, HTML parsing)
    ↓ resolved to window.__wit.* globals at build time
WKWebView bridge (window.prompt() → Native)
    ↓ synchronous JS→Native communication
Glyph Native Runtime (URLSession, SwiftSoup, cookie store)
    ↓ handles HTTP fetches, HTML parsing, host functions
Novel Website
```

Extensions run inside a **WKWebView**. The bridge uses `window.prompt()` for synchronous JS-to-Native communication — there are no async message handlers or XHR involved. The native side handles HTTP fetches (via URLSession), HTML parsing (via SwiftSoup), and host functions (cookies, content rating, user agent). The SDK handles all the plumbing — your code just calls `get()`, `load()`, etc. All HTTP requests go through the native runtime, which provides per-source cookie isolation, domain restrictions, and network logging.

All SDK functions are **synchronous** — no `async`/`await` needed in extension code. For example, `get(url)` returns a string directly, not a Promise.

Extensions are compiled to **IIFE** format (not ESM). esbuild bundles everything with `globalName: 'GlyphExtension'`. WIT imports (`glyph:extension/http@0.1.0`, `glyph:extension/html@0.1.0`, `glyph:extension/host@0.1.0`) are resolved to `window.__wit.*` globals at build time.

## Quick Start

```bash
npx create-glyph-extension my-extensions
cd my-extensions
npm run dev
```

The CLI scaffolds a complete project with an example source. The dev server builds your extension on-the-fly and serves it at a local URL. Add that URL in Glyph (Settings → Extensions → +) to test live.

## Project Structure

```
my-extensions/
├── sources/
│   └── my-source/
│       └── src/
│           ├── main.ts     # Entry point -> export const source = createSource({...})
│           ├── parser.ts   # HTML parsing logic
│           └── my-source.test.ts
├── repo.json               # Repository metadata
├── package.json            # Uses @glyphmoe/cli commands
└── dist/                   # Built bundles + index.json
```

## CLI Commands

The `@glyphmoe/cli` package provides all development commands:

| Command              | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `npm run dev`        | Development server with hot reload                                    |
| `npm run build`      | Production build with validation                                      |
| `npm run test`       | Run tests                                                             |
| `npm run validate`   | Validate extensions (flags: `--typecheck`, `--fix`, `--ci`)           |
| `npx glyph add <id>` | Add a new source to your project                                      |
| `npx glyph logcat`   | Start a standalone log receiver on port 9999 for remote log streaming |

See the [CLI Reference](/docs/cli) for full details.

## Creating a Source

Every extension exports a source object:

```typescript
import { createSource, get, load, RateLimit } from '@glyphmoe/sdk'

const BASE = 'https://example-novels.com'

export const source = createSource({
  // Identity
  id: 'example-novels',
  name: 'Example Novels',
  baseUrl: BASE,
  icon: 'https://example-novels.com/favicon.ico',
  language: 'en',
  dev: 'your-name',

  // Rate limiting (recommended)
  rateLimit: RateLimit.balanced, // 3 req/sec

  // Required methods
  searchNovels(query, page) {
    const html = get(`${BASE}/search?q=${encodeURIComponent(query)}&page=${page}`)
    const $ = load(html)
    // ... parse and return { items, hasNextPage }
  },
  fetchNovelDetails(novelUrl) {
    const html = get(novelUrl)
    const $ = load(html)
    // ... parse and return { id, title, url, chapters, ... }
  },
  fetchChapterContent(chapterUrl) {
    const html = get(chapterUrl)
    const $ = load(html)
    return $('div.chapter-content').html() ?? ''
  },
})
```

`createSource()` handles all the boilerplate:

- Sets User-Agent and Accept headers automatically
- Configures the rate limiter
- Runs setup at module load time (no async `initialise()` needed)

See the [Source Interface](/docs/sdk-source-interface) for all required and optional methods.
