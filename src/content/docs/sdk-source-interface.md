---
title: Source Interface
order: 5
section: 'SDK Reference'
---

# Source Interface

A source is the core of every extension. It tells Glyph how to search, fetch novel details, and load chapter content from a website.

## Required Methods

### `searchNovels(query, page)`

Search for novels on the source website.

```typescript
searchNovels(query: string, page: number): PagedResults<Novel>
```

**Parameters:**

- `query`: The search term, or a full URL for genre-based searches
- `page`: Page number (1-indexed)

**Returns:** `{ items: Novel[], hasNextPage: boolean, nextPage?: number }`

**Example:**

```typescript
searchNovels(query, page) {
  const html = get(`${BASE}/search?q=${encodeURIComponent(query)}&page=${page}`)
  const $ = load(html)
  const items: Novel[] = []

  $('div.search-result').each((_, el) => {
    const title = $(el).find('h3').text().trim()
    const url = $(el).find('a').attr('href') ?? ''
    const cover = $(el).find('img').attr('src')
    if (url) items.push({ id: url, title, url, cover })
  })

  const hasNextPage = $('a.next-page').length > 0
  return { items, hasNextPage }
}
```

### `fetchNovelDetails(novelUrl)`

Fetch full novel metadata and chapter list.

```typescript
fetchNovelDetails(novelUrl: string): Novel & { chapters: Chapter[] }
```

**Returns:** A `Novel` object with an additional `chapters` array. Chapters should be in chronological order (oldest first).

**Example:**

```typescript
fetchNovelDetails(novelUrl) {
  const html = get(novelUrl)
  const $ = load(html)

  const title = $('h1.title').text().trim()
  const author = $('span.author').text().trim()
  const cover = $('img.cover').attr('src')
  const description = $('div.description').text().trim()
  const tags = $('span.tag').map((_, el) => $(el).text().trim()).get()

  const chapters: Chapter[] = []
  $('ul.chapters li').each((i, el) => {
    const a = $(el).find('a')
    chapters.push({
      id: a.attr('href') ?? '',
      title: a.text().trim() || `Chapter ${i + 1}`,
      number: i + 1,
      url: a.attr('href') ?? '',
      releaseDate: $(el).find('.date').text().trim() || undefined,
    })
  })

  return { id: novelUrl, title, author, cover, description, url: novelUrl, tags, chapters }
}
```

### `fetchChapterContent(chapterUrl)`

Fetch the HTML content of a chapter.

```typescript
fetchChapterContent(chapterUrl: string): string
```

**Returns:** HTML string of the chapter content.

> **Note:** The app automatically sanitizes chapter HTML before displaying it. Scripts, event handlers, iframes, and inline styles are stripped for security.

**Example:**

```typescript
fetchChapterContent(chapterUrl) {
  const html = get(chapterUrl)
  const $ = load(html)
  return $('div.chapter-content').html() ?? ''
}
```

## Optional Methods

### `getDiscoverSections()`

Define the layout of the source's discover page (what users see when they tap the source in Browse).

```typescript
getDiscoverSections?(): DiscoverSection[]
```

Use the helper functions to create sections:

```typescript
import { featured, carousel, updates, genres } from '@glyphmoe/sdk'

getDiscoverSections() {
  return [
    featured('hot', 'Hot Right Now'),
    carousel('popular', 'Popular'),
    updates('latest', 'Latest Updates', 'Recently updated novels'),
    carousel('completed', 'Completed'),
    genres('genres', 'Genres'),
  ]
}
```

### `getDiscoverSectionItems(sectionId, page)`

Load items for a discover section.

```typescript
getDiscoverSectionItems?(sectionId: string, page: number): DiscoverSectionResults
```

**Returns:** `{ items: DiscoverSectionItem[], hasNextPage: boolean }`

Items can be:

- `FeaturedItem`: Large hero card (type: `'featured'`)
- `SimpleCarouselItem`: Cover + title (type: `'simpleCarousel'`)
- `ChapterUpdateItem`: Cover + title + latest chapter (type: `'chapterUpdate'`)
- `GenreItem`: Genre tag (type: `'genre'`)

> **Important:** Include `tags` in your items so the app can filter by content rating. Without tags, the app cannot detect adult/mature content.

```typescript
items.push({
  type: 'simpleCarousel',
  novelId: novel.id,
  novelUrl: novel.url,
  imageUrl: novel.cover ?? '',
  title: novel.title,
  tags: novel.tags, // ['Fantasy', 'Adult', 'Action']
})
```

### `fetchChaptersList(novelUrl, page)`

Paginated chapter list for novels with many chapters (1000+). If implemented, the app uses this instead of fetching all chapters at once.

```typescript
fetchChaptersList?(novelUrl: string, page: number): {
  chapters: Chapter[]
  hasNextPage: boolean
  totalPages?: number
}
```

### `getDiscoverItems(page)`

Legacy discover method. Returns a simple paginated list of novels. Used as fallback if `getDiscoverSections` is not implemented.

```typescript
getDiscoverItems?(page: number): PagedResults<Novel>
```

## Types Reference

### Novel

```typescript
interface Novel {
  id: string // Unique identifier (usually the URL slug)
  title: string
  url: string // Full URL to the novel page
  cover?: string // Cover image URL
  author?: string
  description?: string
  tags?: string[] // Genre tags (used for content rating)
  status?: 'ongoing' | 'completed' | 'hiatus' | 'dropped' | 'unknown'
  contentRating?: 'everyone' | 'teen' | 'mature' | 'adult'
}
```

### Chapter

```typescript
interface Chapter {
  id: string // Unique identifier
  title: string // Display title
  number: number // Chapter number (for sorting)
  url: string // Full URL to the chapter page
  releaseDate?: string // Date string (ISO, relative, or formatted)
}
```

### PagedResults\<T\>

```typescript
interface PagedResults<T> {
  items: T[]
  hasNextPage: boolean
  nextPage?: number // Explicit next page number (optional)
}
```
