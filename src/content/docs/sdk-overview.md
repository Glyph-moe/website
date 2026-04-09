---
title: SDK Overview
order: 3
---

# SDK Overview

The `@glyph/sdk` is the TypeScript toolkit for building Glyph extensions. It handles HTTP requests, rate limiting, retries, HTML parsing, and cookie management so you can focus on parsing novel content.

## Architecture

```
Your Extension (TypeScript)
    ↓ calls get(), post(), json()
@glyph/sdk (request layer, rate limiter, interceptors)
    ↓ calls Application.scheduleRequest()
Glyph iOS App (WKWebView bridge)
    ↓ makes real HTTP request
Novel Website
```

Extensions run inside a WKWebView in the iOS app. All HTTP requests go through the app's bridge, which allows per-source cookie isolation, domain restrictions, and network logging.

## Quick Start

```bash
git clone https://github.com/thinkaz/glyph-extension-template
cd glyph-extension-template
npm install
npm run dev
```

The dev server builds your extension on-the-fly and serves it at a local URL. Add that URL in Glyph (Settings → Extensions → +) to test live.

## Project Structure

```
glyph-extension-template/
├── packages/sdk/src/       # @glyph/sdk source
├── sources/
│   └── my-source/
│       └── src/
│           ├── main.ts     # Entry point — export default createSource({...})
│           └── parser.ts   # HTML parsing logic
├── scripts/
│   ├── build-all.js        # Production build (minified IIFE bundles)
│   └── dev-server.js       # Dev server with validation
└── dist/                   # Built bundles + index.json
```

## Creating a Source

Every extension exports a source object:

```typescript
import { createSource, get, RateLimit } from '@glyph/sdk'

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
  async searchNovels(query, page) { /* ... */ },
  async fetchNovelDetails(novelUrl) { /* ... */ },
  async fetchChapterContent(chapterUrl) { /* ... */ },
})
```

`createSource()` handles all the boilerplate:
- Sets User-Agent and Accept headers
- Configures the rate limiter
- Provides a clean `Source` object to the app

See the [Source Interface](/docs/sdk-source-interface) for all required and optional methods.
