---
title: Helpers & Utilities
order: 6
---

# Helpers & Utilities

Additional SDK tools for common tasks: HTML parsing, pagination, cookies, and content rating.

## HTML Parsing

The SDK re-exports [cheerio](https://cheerio.js.org/) for jQuery-style HTML parsing:

```typescript
import { load } from '@glyph/sdk'

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

### Tips

- Always call `.trim()` on text content, since HTML often has whitespace
- Use `.attr('href')` not `.prop('href')`, as cheerio doesn't resolve relative URLs
- Check for `data-src` or `data-lazy` attributes for lazy-loaded images
- Use `.html()` to get inner HTML (for chapter content), `.text()` for plain text

## Pagination

Automatically fetch all pages of a paginated endpoint:

```typescript
import { fetchAllPages, get, load } from '@glyph/sdk'

const allChapters = await fetchAllPages(async (page, accumulated) => {
  const html = await get(`${BASE}/chapters?page=${page}`)
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

Read and write cookies for the current source. Cookies are **isolated per source**, so one extension can't access another's cookies.

```typescript
import { getCookies, setCookie } from '@glyph/sdk'

// Read all cookies for a URL
const cookies = await getCookies('https://example.com')
console.log(cookies['session_id']) // 'abc123'

// Set a cookie
await setCookie('https://example.com', 'auth_token', 'xyz789')
```

**Note:** Cookies are stored in memory and lost when the app restarts. This is by design for privacy. If a site requires login, the user will need to re-authenticate each session.

## Content Rating

Check the user's content rating preference to filter content server-side:

```typescript
import { getMaxContentRating, isRatingAllowed } from '@glyph/sdk'

// Get the raw rating level
const rating = await getMaxContentRating()
// Returns: 'everyone' | 'teen' | 'mature' | 'adult'

// Check if a specific rating is allowed
if (await isRatingAllowed('mature')) {
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
import { featured, carousel, updates, genres } from '@glyph/sdk'

async getDiscoverSections() {
  return [
    featured('hot', 'Hot Right Now'),           // Large hero cards
    carousel('popular', 'Popular'),             // Horizontal cover scroll
    updates('latest', 'Latest Updates', 'Subtitle text'),  // Novel + chapter rows
    genres('genres', 'Genres'),                  // Tag grid
  ]
}
```

Each function takes `(id, title, subtitle?)` and returns a `DiscoverSection` object with the appropriate type.
