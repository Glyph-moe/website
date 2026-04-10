---
title: Debugging
order: 9
---

# Debugging Extensions

When your extension doesn't work as expected, Glyph provides several tools to help you figure out what's going on.

## Network Inspector

The app has a built-in network inspector that captures every HTTP request made by extensions.

**Settings > Developer Tools > Network Inspector**

For each request you can see:

- Method, URL, status code
- Request and response headers
- Response body (first 10 KB)
- Duration in milliseconds
- Errors (timeouts, TLS failures, etc.)

> **Tip:** If a request shows status `nil`, it means the request failed before reaching the server (DNS failure, TLS error, timeout, or domain blocked by the extension's restriction policy).

## App Logs

Extension errors, warnings, and lifecycle events are logged in the app.

**Settings > Developer Tools > App Logs**

You can filter by level (Info, Warn, Error) and search by keyword. Look for entries with the `Extensions` category.

Common log patterns:

- `[Extensions] callMethod START: fetchNovelDetails` — an extension method was called
- `[Extensions] callMethod END: fetchNovelDetails` — the method returned
- `[Extensions] Section 'popular' failed: JS error: ...` — a discover section failed to load
- `[Extensions] BUNDLE LOAD ERROR: ...` — the extension bundle couldn't be parsed

## Diagnostic Report

**Settings > Share Diagnostic Report**

Generates a full report with device info, all app logs, and all network logs. Share it via AirDrop or email when reporting bugs.

## Console Logging

Your extension's `console.log`, `console.warn`, and `console.error` calls are forwarded to the app's log system. Use them freely during development.

```typescript
async searchNovels(query, page) {
  console.log('Searching for:', query, 'page:', page)
  const html = await get(`${BASE}/search?q=${query}`)
  console.log('Got HTML, length:', html.length)
  // ...
}
```

These appear in **App Logs** with the `Extension` category and the corresponding level (log = info, warn = warn, error = error).

> **Note:** `console.log` calls are visible in the app's Developer Tools but NOT in Xcode's console. The extension runs in a WKWebView, not in the app's main process.

## Common Errors

### "Timeout calling fetchNovelDetails after 90s"

The extension method took too long. This usually means:

- The site is slow or down
- The extension is making too many sequential requests
- A `Promise` is hanging (never resolves or rejects)

Check the Network Inspector to see which requests completed and which are pending.

### "Request to example.com blocked by domain policy"

The extension tried to make a request to a domain not declared in `baseUrl`. Each extension can only fetch from its base domain and subdomains.

If you need to fetch from a CDN or API on a different domain, make sure the `baseUrl` in your `createSource()` covers it, or use the main domain that redirects to it.

### "Extension has no valid baseUrl"

The `source.info.baseUrl` is missing or invalid. Make sure your `createSource()` has a valid `baseUrl`:

```typescript
export default createSource({
  baseUrl: 'https://example.com', // must be a valid HTTPS URL
  // ...
})
```

### "Bridge version mismatch"

The extension was built with an older version of the runtime. Clear the extension cache (**Settings > Storage > Clear Extension Cache**) and refresh the extension.

### "fetchChapterContent did not return a string"

Your `fetchChapterContent` method returned something other than an HTML string (null, undefined, an object, etc.). Make sure you return the raw HTML:

```typescript
async fetchChapterContent(chapterUrl) {
  const html = await get(chapterUrl)
  const $ = load(html)
  const content = $('div.chapter-content').html()
  if (!content) {
    console.error('No content found at', chapterUrl)
    return '<p>Content not available.</p>'
  }
  return content
}
```

### "undefined is not an object" or similar JS errors

Usually a selector that returns nothing. Always check that your cheerio selectors match the actual HTML:

```typescript
const title = $('h1.title').text().trim()
console.log('Title selector result:', title || '(empty)')

const href = $('a.chapter-link').attr('href')
if (!href) {
  console.warn('No href found for chapter link')
  return
}
```

## Dev Server Tips

### Starting the dev server

```bash
npm run dev                        # default port 8888
npm run dev -- --open              # opens browser automatically
npm run dev -- --port 3000         # custom port
```

The terminal output shows your LAN IP, deep link, and rebuild status. The screen clears between rebuilds to keep output readable.

### Testing on a real device

The dev server binds to `0.0.0.0` and prints your LAN IP. Add the URL in Glyph on your iPhone (same Wi-Fi network):

```
Settings > Extensions > + > http://192.168.1.xxx:8888
```

Or use `glyph dev --open` to open the landing page in your browser, which has a one-tap "Add to Glyph" deep link.

### Hot reload

The dev server watches for file changes and rebuilds automatically. After saving a file:

1. Go back to the source's discover page in Glyph
2. Pull to refresh
3. The new code is loaded

You don't need to remove and re-add the extension. Just refresh.

### Port already in use

The dev server automatically tries the next port if 8888 is taken. Check the terminal output for the actual port.

## Testing Without the App

### Playground

The dev server includes a built-in playground for testing your extension methods in the browser. Start the dev server and scroll below the sources list:

```bash
npm run dev -- --open
```

You can call `searchNovels`, `fetchNovelDetails`, `fetchChapterContent`, and discover methods interactively. Results are displayed as visual previews (novel cards, chapter reader) and raw JSON. Click through results to navigate the same way users do in the app.

The playground runs your code on the server with real HTTP — no mocks, no CORS issues, same behavior as the app.

### Unit Tests

Use the mock test site at [glyph.moe/template/example](https://glyph.moe/template/example) and write unit tests with mocked HTTP:

```typescript
import { mockRequest, clearMocks } from '@glyph/sdk/testing'

beforeEach(() => clearMocks())

it('parses novel details', async () => {
  mockRequest('https://example.com/novel/test', {
    body: '<html><h1 class="title">Test Novel</h1>...</html>',
  })

  const result = await source.fetchNovelDetails('https://example.com/novel/test')
  expect(result.title).toBe('Test Novel')
})
```

This lets you iterate fast without needing the app or a network connection.
