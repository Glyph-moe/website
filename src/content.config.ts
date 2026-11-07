import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    section: z.string(),
    description: z.string().optional(),
  }),
})

/* Notes: release news, source news and guides.
 *
 * A post does not own a cover image. It owns a mood, which picks one of the
 * three paintings the blog is built on, and a crop focus, so two posts in the
 * same mood do not look like the same card. See Blog/PostCover.astro.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      category: z.enum(['Release', 'Sources', 'Privacy', 'Roadmap', 'Guide']),
      mood: z.enum(['dawn', 'dusk', 'night']),
      /** Horizontal focus of the painting, 0 = left edge, 1 = right edge. */
      cx: z.number().min(0).max(1).default(0.68),
      draft: z.boolean().default(false),
      /** Rare exception: a real image instead of the painted template. */
      cover: image().optional(),
    }),
})

export const collections = { docs, blog }
