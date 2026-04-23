---
title: Helpers & Utilities
order: 8
section: 'SDK Reference'
---

# Helpers & Utilities

Additional SDK tools for common tasks: HTML parsing, pagination, cookies, and content rating. All functions are **synchronous** — no `async`/`await` needed.

## HTML Parsing

The SDK provides a jQuery-style HTML parsing API backed by the host's native HTML parser (SwiftSoup on iOS) via the WIT `glyph:extension/html@0.1.0` interface. No JS HTML parser is bundled — parsing happens natively on the device, which is faster and keeps bundle sizes small. In tests and dev mode, a cheerio-based shim is used instead; the API is identical, so you don't need to think about the difference.

```typescript
import { load } from '@glyphmoe/sdk'

const $ = load(html)
const title = $('h1.title').text().trim()
const cover = $('img.cover').attr('src')
const chapters = $('ul li a')
  .map((_, el) => ({
    title: $(el).text().trim(),
    url: $(el).attr('href'),
  }))
  .get()
```

### Querying within elements

Use `$(el).find(selector)` or the `find()` method to query within a matched element:

```typescript
$('.novel-card').each((_, el) => {
  const title = $(el).find('.title').text().trim()
  const cover = $(el).find('img').attr('src')
  const url = $(el).attr('href')
})
```

### Tips

- Always call `.trim()` on text content, since HTML often has whitespace
- Use `.attr('href')` for attributes — the API doesn't resolve relative URLs
- Check for `data-src` or `data-lazy` attributes for lazy-loaded images
- Use `.html()` to get inner HTML (for chapter content), `.text()` for plain text
- Use `.find()` to query within a matched element's subtree
- `.map()` uses `(index, element)` callback order and returns `.get()` for a plain array

## Pagination

Automatically fetch all pages of a paginated endpoint:

```typescript
import { fetchAllPages, get, load } from '@glyphmoe/sdk'

const allChapters = fetchAllPages((page, accumulated) => {
  const html = get(`${BASE}/chapters?page=${page}`)
  const $ = load(html)

  const items = $('li.chapter')
    .map((i, el) => ({
      id: $(el).find('a').attr('href')!,
      title: $(el).find('a').text().trim(),
      number: accumulated + i + 1,
      url: $(el).find('a').attr('href')!,
    }))
    .get()

  const hasNextPage = $('a.next').length > 0
  return { items, hasNextPage }
})
```

**Parameters:**

- `fetcher(page, accumulated)`: Called for each page. `accumulated` is the total items collected so far (useful for numbering).
- `startPage`: First page number (default: `1`)
- `maxPages`: Safety limit (default: `200`)

**Returns:** Flattened array of all items from all pages.

## Cookies

Read and write cookies for the current source via the WIT `glyph:extension/host@0.1.0` interface. Per-source cookie isolation is enforced by the host — one extension can't access another's cookies. Both `getCookies()` and `setCookie()` are synchronous.

```typescript
import { getCookies, setCookie } from '@glyphmoe/sdk'

// Read all cookies for a URL
const cookies = getCookies('https://example.com')
console.log(cookies['session_id']) // 'abc123'

// Set a cookie
setCookie('https://example.com', 'auth_token', 'xyz789')
```

> **Note:** Cookies are stored in memory and lost when the app restarts. This is by design for privacy. If a site requires login, the user will need to re-authenticate each session.

## Content Rating

Check the user's content rating preference to filter content server-side. These also go through the WIT `glyph:extension/host@0.1.0` interface and are synchronous.

```typescript
import { getMaxContentRating, isRatingAllowed } from '@glyphmoe/sdk'

// Get the raw rating level
const rating = getMaxContentRating()
// Returns: 'everyone' | 'teen' | 'mature' | 'adult'

// Check if a specific rating is allowed
if (isRatingAllowed('mature')) {
  // Show mature content
}
```

**Rating levels** (from least to most restrictive):

| Level      | Value | Allowed content         |
| ---------- | ----- | ----------------------- |
| `adult`    | 3     | Everything              |
| `mature`   | 2     | Everything except adult |
| `teen`     | 1     | Everyone + teen only    |
| `everyone` | 0     | Everyone-rated only     |

### Automatic Rating Detection

The app automatically detects content rating from novel tags. Extensions should include `tags` in their novels and discover items:

**Tags that trigger `adult`:** adult, smut, hentai, erotica, r-18, r18, pornographic

**Tags that trigger `mature`:** mature, gore, sexual content, ecchi, lemon, explicit

**Tags that trigger `teen`:** teen, shounen, shoujo, violence, suggestive

If none match, the novel is rated `everyone`.

## Discover Section Helpers

Shorthand functions to define discover page sections:

```typescript
import { featured, carousel, updates, genres } from '@glyphmoe/sdk'

getDiscoverSections() {
  return [
    featured('hot', 'Hot Right Now'),           // Large hero cards
    carousel('popular', 'Popular'),             // Horizontal cover scroll
    updates('latest', 'Latest Updates', 'Subtitle text'),  // Novel + chapter rows
    genres('genres', 'Genres'),                  // Tag grid
  ]
}
```

Each function takes `(id, title, subtitle?)` and returns a `DiscoverSection` object with the appropriate type.
