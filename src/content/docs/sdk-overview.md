---
title: SDK Overview
order: 3
---

# SDK Overview

The `@glyphmoe/sdk` is the TypeScript toolkit for building Glyph extensions. It handles HTTP requests, rate limiting, retries, HTML parsing, and cookie management so you can focus on parsing novel content.

## Architecture

```
Your Extension (TypeScript)
    ↓ calls get(), post(), json()
@glyphmoe/sdk (request layer, rate limiter, interceptors)
    ↓ calls Application.scheduleRequest()
Glyph iOS App (WKWebView bridge)
    ↓ makes real HTTP request
Novel Website
```

Extensions run inside a WKWebView in the iOS app. All HTTP requests go through the app's bridge, which allows per-source cookie isolation, domain restrictions, and network logging.

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
│           ├── main.ts     # Entry point -> export default createSource({...})
│           ├── parser.ts   # HTML parsing logic
│           └── my-source.test.ts
├── repo.json               # Repository metadata
├── package.json            # Uses @glyphmoe/cli commands
└── dist/                   # Built bundles + index.json
```

## CLI Commands

The `@glyphmoe/cli` package provides all development commands:

| Command              | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `npm run dev`        | Development server with hot reload                          |
| `npm run build`      | Production build with validation                            |
| `npm run test`       | Run tests                                                   |
| `npm run validate`   | Validate extensions (flags: `--typecheck`, `--fix`, `--ci`) |
| `npx glyph add <id>` | Add a new source to your project                            |

See the [CLI Reference](/docs/cli) for full details.

## Creating a Source

Every extension exports a source object:

```typescript
import { createSource, get, RateLimit } from '@glyphmoe/sdk'

const BASE = 'https://example-novels.com'

export default createSource({
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
  async searchNovels(query, page) {
    /* ... */
  },
  async fetchNovelDetails(novelUrl) {
    /* ... */
  },
  async fetchChapterContent(chapterUrl) {
    /* ... */
  },
})
```

`createSource()` handles all the boilerplate:

- Sets User-Agent and Accept headers
- Configures the rate limiter
- Provides a clean `Source` object to the app

See the [Source Interface](/docs/sdk-source-interface) for all required and optional methods.
