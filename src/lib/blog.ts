import { getCollection, type CollectionEntry } from 'astro:content'

/** The categories a post can carry. The order is the order of the tabs. */
export const BLOG_CATEGORIES = ['Release', 'Sources', 'Privacy', 'Roadmap', 'Guide'] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]
export type BlogPost = CollectionEntry<'blog'>

/** One line per category, used as the lede on /blog/category/<slug>. */
export const CATEGORY_COPY: Record<BlogCategory, string> = {
  Release: 'What shipped, what changed, and what to expect in the next build of the app.',
  Sources: 'New sources, source news, and how the repository model keeps the catalogue yours.',
  Privacy: 'What Glyph stores, what it never sees, and the choices behind both.',
  Roadmap: 'What is being built next, written down while it is still being built.',
  Guide: 'Short walkthroughs for reading, adding a source, and getting unstuck.',
}

/** Release -> release. One function, so a tab, a page and a filter agree. */
export function categorySlug(category: string): string {
  return category.toLowerCase()
}

/** Every published post, newest first. Drafts never leave the build. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft)
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** Posts of one category, newest first. */
export function postsInCategory(posts: BlogPost[], category: string): BlogPost[] {
  return posts.filter(post => post.data.category === category)
}

export function categoryCounts(posts: BlogPost[]): { category: BlogCategory; count: number }[] {
  return BLOG_CATEGORIES.map(category => ({
    category,
    count: postsInCategory(posts, category).length,
  }))
}

/**
 * Reading time from the markdown body: 220 words a minute, never "0 min".
 * The post pages only ever render the placeholder bodies, so this is a rough
 * number and it is meant to read like one.
 */
export function readingTime(body: string | undefined): number {
  const words = (body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

/** "Nov 4, 2026" — the same date in a pill, a meta line and an RSS feed. */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** The date a machine reads. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function postHref(post: BlogPost): string {
  return `/blog/${post.id}`
}

export function categoryHref(category: string): string {
  return `/blog/category/${categorySlug(category)}`
}
