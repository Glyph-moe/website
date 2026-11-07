import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getPublishedPosts, postHref } from '../../lib/blog'

/**
 * Notes as a feed. Descriptions only: the body of a post is one click away,
 * and a feed that carries six full articles is a feed nobody finishes.
 */
export async function GET(context: APIContext) {
  const posts = await getPublishedPosts()

  return rss({
    title: 'Glyph — Notes',
    description:
      'Release notes, source news and guides from Glyph, the free iOS reader for web novels.',
    site: context.site ?? 'https://glyph.moe',
    trailingSlash: false,
    customData: '<language>en-us</language>',
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      link: postHref(post),
      pubDate: post.data.date,
      categories: [post.data.category],
    })),
  })
}
