import { getCollection, render } from 'astro:content'

// Build-time, module-scoped cache so the enriched search index is computed
// once per build instead of once per docs page render.
type SearchEntry = {
  title: string
  slug: string
  section: string
  description: string
  headings: string
}

let cache: SearchEntry[] | null = null

export async function getSearchIndex(): Promise<SearchEntry[]> {
  if (cache) return cache
  const docs = await getCollection('docs')
  const out: SearchEntry[] = []
  for (const d of docs) {
    const { headings } = await render(d)
    const headingText = headings
      .filter(h => h.depth >= 2 && h.depth <= 3)
      .map(h => h.text)
      .join(' · ')
    out.push({
      title: d.data.title,
      slug: d.id,
      section: d.data.section,
      description: d.data.description || '',
      headings: headingText,
    })
  }
  // Stable order matches the sidebar.
  out.sort((a, b) => {
    const order: Record<string, number> = {
      'Using Glyph': 0,
      'Building Extensions': 1,
      'SDK Reference': 2,
    }
    const sa = order[a.section] ?? 99
    const sb = order[b.section] ?? 99
    return sa - sb
  })
  cache = out
  return out
}
