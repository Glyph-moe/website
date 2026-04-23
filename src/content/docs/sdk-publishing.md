---
title: Publishing
order: 5
section: 'Building Extensions'
---

# Publishing Your Extension

Once your extension works locally, publish it so others can install it in Glyph.

## Build

```bash
npm run build
```

This creates optimized, minified bundles in `dist/`:

```
dist/
├── my-source.js       # Minified ESM extension bundle (~15KB without cheerio)
├── index.json          # Repository metadata
```

> HTML parsing is handled by the host runtime, so bundles no longer include cheerio. This makes extensions significantly smaller.

### Build Validation

The build script automatically validates each extension:

- `info` object has all required fields (id, name, version, baseUrl, icon, language)
- Required methods exist (searchNovels, fetchNovelDetails, fetchChapterContent)
- Bundle evaluates without runtime errors

If validation fails, the build shows which checks didn't pass.

## Hosting

Host the `dist/` folder on any static HTTPS host. The app fetches `index.json` to discover available sources.

### GitHub Pages (recommended)

1. Push your repo to GitHub
2. Go to Settings → Pages → Deploy from branch (select `main`, folder `/dist`)
3. Your URL: `https://username.github.io/repo-name/dist/index.json`

### Other Hosts

Netlify, Vercel, Cloudflare Pages, or any static file server.

> **Important:** HTTPS is required. HTTP is only allowed for `localhost` during development.

## Installing in Glyph

Users install your extension by:

1. **Settings → Extensions → +**
2. Enter your repo URL (e.g. `https://username.github.io/repo-name`)
3. Tap **Fetch** → **Install**

The app auto-appends `/dist/index.json` if the URL doesn't end in `.json`.

### Deep Links

Share a one-tap install link:

```
glyph://add-repo?url=https://username.github.io/repo-name/dist/index.json
```

The dev server prints this link automatically when you start it.

## Versioning

Bump the `version` field in your `createSource()` call:

```typescript
export const source = createSource({
  id: 'my-source',
  version: '1.0.1', // ← bump this
  // ...
})
```

When users refresh their extensions in Glyph (Settings → Extensions → Refresh), the app detects the version change and downloads the new bundle.

## index.json Format

The build generates an `index.json` with this structure:

```json
{
  "name": "My Extensions",
  "author": "your-name",
  "sources": [
    {
      "id": "my-source",
      "name": "My Source",
      "version": "1.0.1",
      "language": "en",
      "icon": "https://example.com/icon.png",
      "bundleUrl": "https://username.github.io/repo/dist/my-source.js"
    }
  ]
}
```

## Development Workflow

### Dev Server

```bash
npm run dev                        # start dev server
npm run dev -- --open              # opens browser automatically
npm run dev -- --port 3000         # custom port
```

Starts a local server that:

- Watches for file changes and rebuilds automatically
- Clears the terminal between rebuilds (like Vite)
- Validates extensions on every build
- Serves at `http://localhost:PORT` and your LAN IP
- Prints a deep link for easy testing in Glyph
- Includes a [Playground](/docs/cli#playground) for testing methods in the browser

### Validation

```bash
npm run validate                   # basic validation
npm run validate -- --typecheck    # + TypeScript check
npm run validate -- --with-tests   # + run tests
npm run validate -- --fix          # auto-fix missing fields
npm run validate -- --ci           # JSON output for CI
```

### Testing

```bash
npm test              # Unit tests (fast, mocked HTTP)
```

The CLI automatically injects the runtime test setup, no manual `test-setup.js` needed.

Unit tests use mocked HTTP responses:

```typescript
import { mockRequest, clearMocks } from '@glyphmoe/sdk/testing'

beforeEach(() => clearMocks())

it('searches novels', async () => {
  mockRequest('https://example.com/search?q=test&page=1', {
    body: '<html>...</html>',
  })

  const result = await source.searchNovels('test', 1)
  expect(result.items).toHaveLength(3)
})
```

### Mock Options

```typescript
mockRequest(
  url,
  {
    status: 200, // HTTP status (default: 200)
    body: '<html>...</html>', // Response body (required)
    headers: {}, // Response headers (optional)
  },
  {
    pattern: false, // Enable wildcard matching (default: false)
  },
)
```

With wildcard matching (`*` matches any substring):

```typescript
mockRequest(
  'https://example.com/book/*',
  {
    body: '<html>...</html>',
  },
  { pattern: true },
)
```
