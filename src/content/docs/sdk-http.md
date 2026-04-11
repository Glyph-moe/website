---
title: HTTP & Requests
order: 6
---

# HTTP & Requests

All HTTP requests in extensions go through the Glyph bridge. The SDK provides helpers that handle headers, rate limiting, retries, and error handling.

## Basic Requests

### `get(url, headers?)`

Fetch a URL and return the body as a string.

```typescript
import { get } from '@glyphmoe/sdk'

const html = await get('https://example.com/page')
```

### `post(url, body?, headers?)`

Send a POST request.

```typescript
import { post } from '@glyphmoe/sdk'

const result = await post('https://example.com/api', 'key=value', {
  'Content-Type': 'application/x-www-form-urlencoded',
})
```

### `json<T>(url, headers?)`

GET a URL and parse the response as JSON. Throws `ParseError` if the response isn't valid JSON.

```typescript
import { json } from '@glyphmoe/sdk'

interface SearchResult {
  id: string
  title: string
}
const data = await json<SearchResult[]>('https://api.example.com/search?q=test')
```

### `postJSON<T>(url, data, headers?)`

POST JSON data and parse the response. Automatically sets `Content-Type: application/json`.

```typescript
import { postJSON } from '@glyphmoe/sdk'

const result = await postJSON<{ token: string }>('https://api.example.com/login', {
  username: 'user',
  password: 'pass',
})
```

## Full Control

### `request(req)`

Make a request with full control over method, headers, and body. Returns the response body.

```typescript
import { request } from '@glyphmoe/sdk'

const body = await request({
  url: 'https://example.com/api',
  method: 'POST',
  headers: { Authorization: 'Bearer token123' },
  body: JSON.stringify({ query: 'test' }),
})
```

### `requestFull(req)`

Like `request()` but returns both the response metadata and body.

```typescript
import { requestFull } from '@glyphmoe/sdk'

const { response, body } = await requestFull({
  url: 'https://example.com/api',
  method: 'GET',
})

console.log(response.status) // 200
console.log(response.headers) // { 'content-type': 'text/html', ... }
```

## Rate Limiting

> **Tip:** Always set a rate limit. Sites will block your extension if it sends too many requests too fast.

Prevent getting blocked by setting a rate limit. The SDK uses a **token bucket** algorithm: the first N requests go through instantly (burst), then throttled to maintain the rate.

```typescript
import { createSource, RateLimit } from '@glyphmoe/sdk'

export default createSource({
  rateLimit: RateLimit.balanced,
  // ...
})
```

### Presets

| Preset               | Rate       | Best for                       |
| -------------------- | ---------- | ------------------------------ |
| `RateLimit.strict`   | 1 req/sec  | Aggressive rate limiting sites |
| `RateLimit.balanced` | 3 req/sec  | Most sites (recommended)       |
| `RateLimit.loose`    | 10 req/sec | Fast/permissive sites          |

### Custom Rate Limit

```typescript
rateLimit: { requests: 5, perSeconds: 2 } // 5 requests per 2 seconds
```

## Auto-Retry

Enable automatic retry for transient failures. Only GET requests are retried. POST is never retried.

```typescript
export default createSource({
  retry: {
    maxRetries: 3, // default: 3
    delayMs: 1000, // default: 1000ms
    backoff: 'exponential', // 'fixed' or 'exponential' (default)
  },
  // ...
})
```

**Retried status codes:** 408 (timeout), 429 (rate limit), 500, 502, 503, 504

**Not retried:** 401, 403, 404, and all other client errors. These fail immediately.

**429 special handling:** If the server returns a `Retry-After` header, the SDK respects it (minimum 5 seconds).

### Manual Retry

You can also use `withRetry()` directly:

```typescript
import { withRetry, get } from '@glyphmoe/sdk'

const html = await withRetry(() => get('https://flaky-site.com/page'), {
  maxRetries: 5,
  backoff: 'exponential',
})
```

## Error Handling

### `HttpError`

Thrown when a request returns a 4xx or 5xx status code.

```typescript
import { get, HttpError } from '@glyphmoe/sdk'

try {
  const html = await get('https://example.com/missing-page')
} catch (error) {
  if (error instanceof HttpError) {
    console.log(error.status) // 404
    console.log(error.url) // 'https://example.com/missing-page'
  }
}
```

### `ParseError`

Thrown by `json()` and `postJSON()` when the response body isn't valid JSON.

```typescript
import { json, ParseError } from '@glyphmoe/sdk'

try {
  const data = await json('https://example.com/not-json')
} catch (error) {
  if (error instanceof ParseError) {
    console.log(error.rawBody) // First 500 chars of the response
  }
}
```

### Timeouts

All requests have a 30-second timeout. If exceeded, an `Error` is thrown:

```
Error: Request timeout after 30000ms: https://example.com/slow-page
```

## Interceptors

Interceptors let you modify requests before they're sent and responses after they arrive.

```typescript
import { registerInterceptor } from '@glyphmoe/sdk'

registerInterceptor({
  async interceptRequest(request) {
    // Add a custom header to every request
    request.headers = {
      ...request.headers,
      'X-Custom-Token': 'abc123',
    }
    return request
  },

  async interceptResponse(request, response, body) {
    // Log all responses
    console.log(`${response.status} ${request.url}`)
    return body
  },
})
```

**Note:** `createSource()` automatically registers interceptors for default headers. If you need custom interceptors, register them in your `initialise()` method.

## URL Builder

Build URLs with query parameters safely:

```typescript
import { buildUrl } from '@glyphmoe/sdk'

buildUrl('https://site.com', '/search', { keyword: 'hello world', page: 2 })
// → 'https://site.com/search?keyword=hello%20world&page=2'

// Undefined values are skipped
buildUrl('https://site.com', '/novels', { status: undefined, page: 1 })
// → 'https://site.com/novels?page=1'

// Existing query params are preserved
buildUrl('https://site.com/api?token=abc', '/search', { q: 'test' })
// → 'https://site.com/api/search?token=abc&q=test'
```
